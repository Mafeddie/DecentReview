// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";

/**
 * @title ReputationEngine
 * @notice Manages user reputation, voting power, and trust scores
 * @dev Implements weighted voting based on user behavior and history
 */
contract ReputationEngine is AccessControl, ReentrancyGuard {
    // ============ Constants ============
    bytes32 public constant UPDATER_ROLE = keccak256("UPDATER_ROLE");
    
    uint256 public constant BASE_VOTING_POWER = 100;
    uint256 public constant MAX_VOTING_POWER = 1000;
    uint256 public constant REPUTATION_DECAY_PERIOD = 30 days;
    uint256 public constant MIN_REPUTATION = 0;
    uint256 public constant MAX_REPUTATION = 10000;
    uint256 public constant VERIFIED_USER_BONUS = 200;
    
    // Reputation factors
    uint256 public constant REVIEW_QUALITY_WEIGHT = 40; // 40%
    uint256 public constant CONSISTENCY_WEIGHT = 30; // 30%
    uint256 public constant VERIFICATION_WEIGHT = 20; // 20%
    uint256 public constant ACTIVITY_WEIGHT = 10; // 10%
    
    // ============ Structs ============
    struct ReputationScore {
        uint256 totalScore;
        uint256 reviewQualityScore;
        uint256 consistencyScore;
        uint256 verificationScore;
        uint256 activityScore;
        uint256 lastUpdateTimestamp;
        uint256 votingPower;
        bool isVerified;
        uint256 totalReviews;
        uint256 helpfulVotes;
        uint256 unhelpfulVotes;
        uint256 flaggedCount;
        uint256 verifiedPurchases;
    }
    
    struct TrustMetrics {
        uint256 accountAge;
        uint256 consistentRatingPattern;
        uint256 diversityScore; // Reviews across different categories
        uint256 photoContributions;
        uint256 detailedReviews; // Long, detailed reviews
        bool hasENS;
        bool hasLensProfile;
        bool hasWorldID;
    }
    
    struct VotingRecord {
        uint256 totalVotesCast;
        uint256 accurateVotes; // Votes aligned with consensus
        uint256 contraryVotes; // Votes against consensus
        uint256 lastVoteTimestamp;
    }
    
    // ============ State Variables ============
    mapping(address => ReputationScore) public reputationScores;
    mapping(address => TrustMetrics) public trustMetrics;
    mapping(address => VotingRecord) public votingRecords;
    mapping(address => mapping(address => uint256)) public endorsements; // user => endorser => weight
    mapping(address => uint256) public penaltyExpiry;
    
    uint256 public totalActiveUsers;
    uint256 public globalReputationPool;
    
    address public reviewContract;
    address public gameFiContract;
    address public userProfileContract;
    
    // ============ Events ============
    event ReputationUpdated(address indexed user, uint256 newScore, uint256 votingPower);
    event UserVerified(address indexed user, string verificationType);
    event UserPenalized(address indexed user, uint256 penalty, string reason);
    event UserEndorsed(address indexed endorser, address indexed endorsed, uint256 weight);
    event VotingPowerAdjusted(address indexed user, uint256 newPower);
    event TrustMetricUpdated(address indexed user, string metric, uint256 value);
    
    // ============ Constructor ============
    constructor() {
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(UPDATER_ROLE, msg.sender);
    }
    
    // ============ Main Functions ============
    
    /**
     * @notice Update reputation after review submission
     * @param _user User address
     * @param _rating Review rating
     * @param _reviewLength Length of review text
     * @param _hasPhotos Whether review includes photos
     */
    function updateReputationForReview(
        address _user,
        uint8 _rating,
        uint256 _reviewLength,
        bool _hasPhotos
    ) external onlyRole(UPDATER_ROLE) nonReentrant {
        ReputationScore storage score = reputationScores[_user];
        
        // Calculate quality points
        uint256 qualityPoints = 0;
        
        // Longer reviews get more points
        if (_reviewLength > 500) qualityPoints += 50;
        else if (_reviewLength > 200) qualityPoints += 30;
        else if (_reviewLength > 50) qualityPoints += 10;
        
        // Photos add credibility
        if (_hasPhotos) qualityPoints += 30;
        
        // Extreme ratings (1 or 5) get slightly less points to discourage gaming
        if (_rating == 3 || _rating == 4) qualityPoints += 20;
        else if (_rating == 2) qualityPoints += 15;
        else qualityPoints += 10;
        
        score.reviewQualityScore += qualityPoints;
        score.totalReviews++;
        
        // Update activity score
        score.activityScore = calculateActivityScore(_user);
        
        // Recalculate total score
        _recalculateReputation(_user);
        
        emit ReputationUpdated(_user, score.totalScore, score.votingPower);
    }
    
    /**
     * @notice Update reputation based on vote received
     * @param _reviewer Reviewer whose review was voted on
     * @param _isUpvote Whether it was an upvote
     */
    function updateReputationForVote(address _reviewer, bool _isUpvote) 
        external 
        onlyRole(UPDATER_ROLE) 
    {
        ReputationScore storage score = reputationScores[_reviewer];
        
        if (_isUpvote) {
            score.helpfulVotes++;
            score.reviewQualityScore += 5;
        } else {
            score.unhelpfulVotes++;
            // Don't penalize too harshly for downvotes
            if (score.reviewQualityScore >= 2) {
                score.reviewQualityScore -= 2;
            }
        }
        
        _recalculateReputation(_reviewer);
    }
    
    /**
     * @notice Verify user with external proof
     * @param _user User address
     * @param _verificationType Type of verification
     */
    function verifyUser(address _user, string memory _verificationType) 
        external 
        onlyRole(DEFAULT_ADMIN_ROLE) 
    {
        ReputationScore storage score = reputationScores[_user];
        TrustMetrics storage trust = trustMetrics[_user];
        
        score.isVerified = true;
        score.verificationScore += VERIFIED_USER_BONUS;
        
        // Set specific verification flags
        if (keccak256(bytes(_verificationType)) == keccak256("ENS")) {
            trust.hasENS = true;
        } else if (keccak256(bytes(_verificationType)) == keccak256("LENS")) {
            trust.hasLensProfile = true;
        } else if (keccak256(bytes(_verificationType)) == keccak256("WORLDID")) {
            trust.hasWorldID = true;
        }
        
        _recalculateReputation(_user);
        
        emit UserVerified(_user, _verificationType);
    }
    
    /**
     * @notice Penalize user for malicious behavior
     * @param _user User address
     * @param _penalty Penalty amount
     * @param _duration Penalty duration
     * @param _reason Reason for penalty
     */
    function penalizeUser(
        address _user,
        uint256 _penalty,
        uint256 _duration,
        string memory _reason
    ) external onlyRole(DEFAULT_ADMIN_ROLE) {
        ReputationScore storage score = reputationScores[_user];
        
        if (score.totalScore >= _penalty) {
            score.totalScore -= _penalty;
        } else {
            score.totalScore = MIN_REPUTATION;
        }
        
        score.flaggedCount++;
        penaltyExpiry[_user] = block.timestamp + _duration;
        
        // Reduce voting power during penalty
        score.votingPower = score.votingPower / 2;
        
        emit UserPenalized(_user, _penalty, _reason);
    }
    
    /**
     * @notice Endorse another user
     * @param _endorsed User to endorse
     */
    function endorseUser(address _endorsed) external nonReentrant {
        require(_endorsed != msg.sender, "Cannot endorse yourself");
        require(reputationScores[msg.sender].totalScore >= 500, "Insufficient reputation to endorse");
        
        uint256 endorsementWeight = reputationScores[msg.sender].votingPower / 10;
        endorsements[_endorsed][msg.sender] = endorsementWeight;
        
        // Add to verification score
        reputationScores[_endorsed].verificationScore += endorsementWeight;
        _recalculateReputation(_endorsed);
        
        emit UserEndorsed(msg.sender, _endorsed, endorsementWeight);
    }
    
    /**
     * @notice Record voting accuracy for consensus building
     * @param _voter Voter address
     * @param _alignedWithConsensus Whether vote aligned with majority
     */
    function recordVotingAccuracy(address _voter, bool _alignedWithConsensus) 
        external 
        onlyRole(UPDATER_ROLE) 
    {
        VotingRecord storage record = votingRecords[_voter];
        
        record.totalVotesCast++;
        record.lastVoteTimestamp = block.timestamp;
        
        if (_alignedWithConsensus) {
            record.accurateVotes++;
            // Boost consistency score for accurate voting
            reputationScores[_voter].consistencyScore += 2;
        } else {
            record.contraryVotes++;
        }
        
        // Adjust voting power based on accuracy
        uint256 accuracy = (record.accurateVotes * 100) / record.totalVotesCast;
        if (accuracy > 80) {
            reputationScores[_voter].votingPower = 
                (reputationScores[_voter].votingPower * 110) / 100; // 10% boost
        } else if (accuracy < 40) {
            reputationScores[_voter].votingPower = 
                (reputationScores[_voter].votingPower * 90) / 100; // 10% reduction
        }
        
        // Cap voting power
        if (reputationScores[_voter].votingPower > MAX_VOTING_POWER) {
            reputationScores[_voter].votingPower = MAX_VOTING_POWER;
        }
    }
    
    // ============ Calculation Functions ============
    
    /**
     * @notice Recalculate total reputation score
     */
    function _recalculateReputation(address _user) private {
        ReputationScore storage score = reputationScores[_user];
        
        // Apply decay if needed
        if (block.timestamp > score.lastUpdateTimestamp + REPUTATION_DECAY_PERIOD) {
            uint256 decayPeriods = (block.timestamp - score.lastUpdateTimestamp) / REPUTATION_DECAY_PERIOD;
            uint256 decayFactor = 95 ** decayPeriods / 100 ** decayPeriods; // 5% decay per period
            
            score.reviewQualityScore = (score.reviewQualityScore * decayFactor) / 100;
            score.consistencyScore = (score.consistencyScore * decayFactor) / 100;
            score.activityScore = (score.activityScore * decayFactor) / 100;
        }
        
        // Calculate weighted score
        uint256 weightedScore = 
            (score.reviewQualityScore * REVIEW_QUALITY_WEIGHT) / 100 +
            (score.consistencyScore * CONSISTENCY_WEIGHT) / 100 +
            (score.verificationScore * VERIFICATION_WEIGHT) / 100 +
            (score.activityScore * ACTIVITY_WEIGHT) / 100;
        
        // Apply penalties
        if (score.flaggedCount > 0) {
            weightedScore = (weightedScore * (100 - score.flaggedCount * 10)) / 100;
        }
        
        // Apply verification bonus
        if (score.isVerified) {
            weightedScore = (weightedScore * 120) / 100; // 20% bonus
        }
        
        score.totalScore = weightedScore;
        
        // Cap at maximum
        if (score.totalScore > MAX_REPUTATION) {
            score.totalScore = MAX_REPUTATION;
        }
        
        // Calculate voting power
        score.votingPower = calculateVotingPower(_user);
        
        score.lastUpdateTimestamp = block.timestamp;
        
        // Update global metrics
        if (score.totalScore > 0 && score.totalReviews > 0) {
            totalActiveUsers++;
            globalReputationPool += score.totalScore;
        }
    }
    
    /**
     * @notice Calculate activity score based on recent activity
     */
    function calculateActivityScore(address _user) public view returns (uint256) {
        VotingRecord memory record = votingRecords[_user];
        ReputationScore memory score = reputationScores[_user];
        
        uint256 activityPoints = 0;
        
        // Recent activity bonus
        if (block.timestamp - record.lastVoteTimestamp < 7 days) {
            activityPoints += 50;
        } else if (block.timestamp - record.lastVoteTimestamp < 30 days) {
            activityPoints += 20;
        }
        
        // Review frequency bonus
        if (score.totalReviews >= 50) activityPoints += 100;
        else if (score.totalReviews >= 20) activityPoints += 50;
        else if (score.totalReviews >= 10) activityPoints += 25;
        else if (score.totalReviews >= 5) activityPoints += 10;
        
        return activityPoints;
    }
    
    /**
     * @notice Calculate voting power based on reputation
     */
    function calculateVotingPower(address _user) public view returns (uint256) {
        ReputationScore memory score = reputationScores[_user];
        TrustMetrics memory trust = trustMetrics[_user];
        
        // Base voting power
        uint256 power = BASE_VOTING_POWER;
        
        // Reputation-based multiplier
        if (score.totalScore >= 5000) power *= 5;
        else if (score.totalScore >= 2000) power *= 3;
        else if (score.totalScore >= 1000) power *= 2;
        else if (score.totalScore >= 500) power = (power * 15) / 10;
        
        // Verification multipliers
        if (trust.hasWorldID) power = (power * 150) / 100; // 50% boost
        if (trust.hasENS) power = (power * 120) / 100; // 20% boost
        if (trust.hasLensProfile) power = (power * 110) / 100; // 10% boost
        
        // Quality multiplier
        if (score.totalReviews > 0) {
            uint256 qualityRatio = (score.helpfulVotes * 100) / 
                (score.helpfulVotes + score.unhelpfulVotes + 1);
            if (qualityRatio > 75) power = (power * 130) / 100;
            else if (qualityRatio < 25) power = (power * 70) / 100;
        }
        
        // Apply penalty if active
        if (penaltyExpiry[_user] > block.timestamp) {
            power = power / 2;
        }
        
        // Cap at maximum
        if (power > MAX_VOTING_POWER) power = MAX_VOTING_POWER;
        
        return power;
    }
    
    // ============ View Functions ============
    
    /**
     * @notice Get user's complete reputation data
     */
    function getUserReputation(address _user) 
        external 
        view 
        returns (ReputationScore memory, TrustMetrics memory) 
    {
        return (reputationScores[_user], trustMetrics[_user]);
    }
    
    /**
     * @notice Get user's voting history
     */
    function getUserVotingRecord(address _user) 
        external 
        view 
        returns (VotingRecord memory) 
    {
        return votingRecords[_user];
    }
    
    /**
     * @notice Check if user is penalized
     */
    function isUserPenalized(address _user) external view returns (bool) {
        return penaltyExpiry[_user] > block.timestamp;
    }
    
    /**
     * @notice Get global reputation statistics
     */
    function getGlobalStats() external view returns (
        uint256 totalUsers,
        uint256 totalReputation,
        uint256 averageReputation
    ) {
        totalUsers = totalActiveUsers;
        totalReputation = globalReputationPool;
        averageReputation = totalActiveUsers > 0 ? 
            globalReputationPool / totalActiveUsers : 0;
    }
    
    /**
     * @notice Calculate trust score (0-100)
     */
    function getTrustScore(address _user) external view returns (uint256) {
        ReputationScore memory score = reputationScores[_user];
        TrustMetrics memory trust = trustMetrics[_user];
        
        uint256 trustScore = 0;
        
        // Reputation component (40%)
        trustScore += (score.totalScore * 40) / MAX_REPUTATION;
        
        // Verification component (30%)
        uint256 verificationPoints = 0;
        if (trust.hasWorldID) verificationPoints += 10;
        if (trust.hasENS) verificationPoints += 10;
        if (trust.hasLensProfile) verificationPoints += 10;
        trustScore += verificationPoints;
        
        // Activity component (20%)
        if (score.totalReviews >= 10) trustScore += 20;
        else trustScore += (score.totalReviews * 2);
        
        // Quality component (10%)
        if (score.helpfulVotes + score.unhelpfulVotes > 0) {
            uint256 qualityRatio = (score.helpfulVotes * 10) / 
                (score.helpfulVotes + score.unhelpfulVotes);
            trustScore += qualityRatio;
        }
        
        // Cap at 100
        if (trustScore > 100) trustScore = 100;
        
        return trustScore;
    }
    
    // ============ Admin Functions ============
    
    /**
     * @notice Set contract addresses
     */
    function setContracts(
        address _reviewContract,
        address _gameFiContract,
        address _userProfileContract
    ) external onlyRole(DEFAULT_ADMIN_ROLE) {
        reviewContract = _reviewContract;
        gameFiContract = _gameFiContract;
        userProfileContract = _userProfileContract;
        
        // Grant updater role to contracts
        _grantRole(UPDATER_ROLE, _reviewContract);
        _grantRole(UPDATER_ROLE, _gameFiContract);
    }
    
    /**
     * @notice Update trust metrics manually (for testing/migration)
     */
    function updateTrustMetrics(
        address _user,
        uint256 _accountAge,
        uint256 _diversityScore,
        uint256 _photoContributions
    ) external onlyRole(DEFAULT_ADMIN_ROLE) {
        TrustMetrics storage trust = trustMetrics[_user];
        trust.accountAge = _accountAge;
        trust.diversityScore = _diversityScore;
        trust.photoContributions = _photoContributions;
        
        emit TrustMetricUpdated(_user, "accountAge", _accountAge);
        emit TrustMetricUpdated(_user, "diversityScore", _diversityScore);
        emit TrustMetricUpdated(_user, "photoContributions", _photoContributions);
    }
    
    /**
     * @notice Reset user reputation (emergency)
     */
    function resetReputation(address _user) external onlyRole(DEFAULT_ADMIN_ROLE) {
        delete reputationScores[_user];
        delete trustMetrics[_user];
        delete votingRecords[_user];
        delete penaltyExpiry[_user];
    }
}