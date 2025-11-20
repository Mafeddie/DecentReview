// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/utils/Counters.sol";

/**
 * @title GameFi
 * @notice Gamification system with points, badges, and leaderboards
 * @dev Implements comprehensive reward and achievement system
 */
contract GameFi is AccessControl, ReentrancyGuard, ERC721, ERC721URIStorage {
    using Counters for Counters.Counter;
    
    // ============ Constants ============
    bytes32 public constant GAME_MASTER_ROLE = keccak256("GAME_MASTER_ROLE");
    bytes32 public constant REVIEWER_CONTRACT_ROLE = keccak256("REVIEWER_CONTRACT_ROLE");
    
    uint256 public constant POINTS_PER_REVIEW = 100;
    uint256 public constant POINTS_PER_RATING_STAR = 20;
    uint256 public constant POINTS_PER_UPVOTE = 10;
    uint256 public constant POINTS_PER_PHOTO = 50;
    uint256 public constant STREAK_BONUS_MULTIPLIER = 2;
    uint256 public constant DAILY_CHECK_IN_POINTS = 25;
    uint256 public constant STREAK_THRESHOLD = 1 days;
    
    // ============ Structs ============
    struct UserStats {
        uint256 totalPoints;
        uint256 currentStreak;
        uint256 longestStreak;
        uint256 lastActivityTimestamp;
        uint256 totalReviews;
        uint256 totalUpvotesReceived;
        uint256 totalPhotos;
        uint256 level;
        uint256 experience;
        uint256[] badgeIds;
        uint256 dailyCheckIns;
        bool hasCheckedInToday;
    }
    
    struct Badge {
        string name;
        string description;
        string imageURI;
        uint256 pointsRequired;
        uint256 reviewsRequired;
        uint256 streakRequired;
        BadgeRarity rarity;
        bool isActive;
    }
    
    struct LeaderboardEntry {
        address user;
        uint256 score;
        uint256 timestamp;
    }
    
    struct Season {
        uint256 startTime;
        uint256 endTime;
        mapping(address => uint256) seasonPoints;
        address[] participants;
        bool isActive;
        uint256 totalRewards;
    }
    
    enum BadgeRarity {
        COMMON,
        RARE,
        EPIC,
        LEGENDARY
    }
    
    // ============ State Variables ============
    mapping(address => UserStats) public userStats;
    mapping(uint256 => Badge) public badges;
    mapping(address => mapping(uint256 => bool)) public userBadges;
    mapping(uint256 => mapping(address => uint256)) public seasonPoints; // season => user => points
    mapping(uint256 => Season) public seasons;
    
    LeaderboardEntry[] public globalLeaderboard;
    mapping(uint256 => LeaderboardEntry[]) public weeklyLeaderboards;
    mapping(uint256 => LeaderboardEntry[]) public monthlyLeaderboards;
    
    Counters.Counter private _tokenIdCounter;
    Counters.Counter private _badgeIdCounter;
    
    uint256 public currentSeason;
    uint256 public currentWeek;
    uint256 public currentMonth;
    uint256 public deploymentTime;
    
    address public reviewContract;
    address public rewardTokenContract;
    
    // ============ Events ============
    event PointsAwarded(address indexed user, uint256 points, string reason);
    event BadgeEarned(address indexed user, uint256 badgeId, string badgeName);
    event LevelUp(address indexed user, uint256 newLevel);
    event StreakUpdated(address indexed user, uint256 newStreak);
    event DailyCheckIn(address indexed user, uint256 points);
    event SeasonStarted(uint256 seasonId, uint256 startTime, uint256 endTime);
    event SeasonEnded(uint256 seasonId, address[] winners);
    event LeaderboardUpdated(string leaderboardType, uint256 period);
    
    // ============ Constructor ============
    constructor() ERC721("YelpReviewBadge", "YRB") {
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(GAME_MASTER_ROLE, msg.sender);
        
        deploymentTime = block.timestamp;
        currentWeek = 1;
        currentMonth = 1;
        
        _initializeBadges();
    }
    
    // ============ Main Functions ============
    
    /**
     * @notice Award points for review submission
     * @param _user User address
     * @param _rating Review rating for bonus calculation
     */
    function awardReviewPoints(address _user, uint8 _rating) 
        external 
        onlyRole(REVIEWER_CONTRACT_ROLE)
        nonReentrant
    {
        UserStats storage stats = userStats[_user];
        
        // Calculate points
        uint256 basePoints = POINTS_PER_REVIEW + (_rating * POINTS_PER_RATING_STAR);
        
        // Check and update streak
        uint256 streakMultiplier = 1;
        if (block.timestamp - stats.lastActivityTimestamp <= STREAK_THRESHOLD) {
            stats.currentStreak++;
            if (stats.currentStreak > stats.longestStreak) {
                stats.longestStreak = stats.currentStreak;
            }
            if (stats.currentStreak >= 7) {
                streakMultiplier = STREAK_BONUS_MULTIPLIER;
            }
            emit StreakUpdated(_user, stats.currentStreak);
        } else {
            stats.currentStreak = 1;
        }
        
        uint256 totalPoints = basePoints * streakMultiplier;
        
        // Update stats
        stats.totalPoints += totalPoints;
        stats.totalReviews++;
        stats.lastActivityTimestamp = block.timestamp;
        stats.experience += totalPoints;
        
        // Check for level up
        uint256 newLevel = calculateLevel(stats.experience);
        if (newLevel > stats.level) {
            stats.level = newLevel;
            emit LevelUp(_user, newLevel);
        }
        
        // Update season points
        if (seasons[currentSeason].isActive) {
            seasons[currentSeason].seasonPoints[_user] += totalPoints;
        }
        
        // Check for badge eligibility
        _checkAndAwardBadges(_user);
        
        // Update leaderboards
        _updateLeaderboards(_user, stats.totalPoints);
        
        emit PointsAwarded(_user, totalPoints, "Review Submission");
    }
    
    /**
     * @notice Award points for receiving upvotes
     * @param _user User address
     */
    function awardUpvotePoints(address _user) 
        external 
        onlyRole(REVIEWER_CONTRACT_ROLE)
    {
        userStats[_user].totalPoints += POINTS_PER_UPVOTE;
        userStats[_user].totalUpvotesReceived++;
        userStats[_user].experience += POINTS_PER_UPVOTE;
        
        emit PointsAwarded(_user, POINTS_PER_UPVOTE, "Upvote Received");
    }
    
    /**
     * @notice Award points for adding photos
     * @param _user User address
     * @param _photoCount Number of photos added
     */
    function awardPhotoPoints(address _user, uint256 _photoCount) 
        external 
        onlyRole(REVIEWER_CONTRACT_ROLE)
    {
        uint256 points = POINTS_PER_PHOTO * _photoCount;
        userStats[_user].totalPoints += points;
        userStats[_user].totalPhotos += _photoCount;
        userStats[_user].experience += points;
        
        emit PointsAwarded(_user, points, "Photos Added");
    }
    
    /**
     * @notice Daily check-in for bonus points
     */
    function dailyCheckIn() external nonReentrant {
        UserStats storage stats = userStats[msg.sender];
        
        // Check if already checked in today
        uint256 daysSinceDeployment = (block.timestamp - deploymentTime) / 1 days;
        require(!stats.hasCheckedInToday, "Already checked in today");
        
        // Award points
        stats.totalPoints += DAILY_CHECK_IN_POINTS;
        stats.experience += DAILY_CHECK_IN_POINTS;
        stats.dailyCheckIns++;
        stats.hasCheckedInToday = true;
        
        // Update streak if continuing
        if (block.timestamp - stats.lastActivityTimestamp <= STREAK_THRESHOLD) {
            stats.currentStreak++;
        } else {
            stats.currentStreak = 1;
        }
        stats.lastActivityTimestamp = block.timestamp;
        
        emit DailyCheckIn(msg.sender, DAILY_CHECK_IN_POINTS);
        
        // Reset check-in flag at next day (would need oracle in production)
        // This is simplified for demo purposes
    }
    
    // ============ Badge System ============
    
    /**
     * @notice Initialize default badges
     */
    function _initializeBadges() private {
        _createBadge("First Review", "Complete your first review", "", 100, 1, 0, BadgeRarity.COMMON);
        _createBadge("Consistent Reviewer", "5 reviews posted", "", 500, 5, 0, BadgeRarity.COMMON);
        _createBadge("Photo Expert", "Add 10 photos", "", 500, 0, 0, BadgeRarity.RARE);
        _createBadge("Week Warrior", "7-day streak", "", 1000, 0, 7, BadgeRarity.RARE);
        _createBadge("Popular Critic", "Receive 50 upvotes", "", 500, 0, 0, BadgeRarity.EPIC);
        _createBadge("Elite Reviewer", "Level 10 achieved", "", 5000, 25, 0, BadgeRarity.LEGENDARY);
        _createBadge("Pioneer", "Early adopter", "", 100, 1, 0, BadgeRarity.LEGENDARY);
    }
    
    /**
     * @notice Create a new badge type
     */
    function _createBadge(
        string memory _name,
        string memory _description,
        string memory _imageURI,
        uint256 _pointsRequired,
        uint256 _reviewsRequired,
        uint256 _streakRequired,
        BadgeRarity _rarity
    ) private {
        uint256 badgeId = _badgeIdCounter.current();
        badges[badgeId] = Badge({
            name: _name,
            description: _description,
            imageURI: _imageURI,
            pointsRequired: _pointsRequired,
            reviewsRequired: _reviewsRequired,
            streakRequired: _streakRequired,
            rarity: _rarity,
            isActive: true
        });
        _badgeIdCounter.increment();
    }
    
    /**
     * @notice Check and award eligible badges
     */
    function _checkAndAwardBadges(address _user) private {
        UserStats memory stats = userStats[_user];
        
        for (uint256 i = 0; i < _badgeIdCounter.current(); i++) {
            if (!userBadges[_user][i] && badges[i].isActive) {
                bool eligible = true;
                
                if (badges[i].pointsRequired > 0 && stats.totalPoints < badges[i].pointsRequired) {
                    eligible = false;
                }
                if (badges[i].reviewsRequired > 0 && stats.totalReviews < badges[i].reviewsRequired) {
                    eligible = false;
                }
                if (badges[i].streakRequired > 0 && stats.longestStreak < badges[i].streakRequired) {
                    eligible = false;
                }
                
                if (eligible) {
                    _awardBadge(_user, i);
                }
            }
        }
    }
    
    /**
     * @notice Award a badge as NFT
     */
    function _awardBadge(address _user, uint256 _badgeId) private {
        uint256 tokenId = _tokenIdCounter.current();
        _tokenIdCounter.increment();
        
        _safeMint(_user, tokenId);
        _setTokenURI(tokenId, badges[_badgeId].imageURI);
        
        userBadges[_user][_badgeId] = true;
        userStats[_user].badgeIds.push(_badgeId);
        
        emit BadgeEarned(_user, _badgeId, badges[_badgeId].name);
    }
    
    // ============ Leaderboard Functions ============
    
    /**
     * @notice Update all leaderboards
     */
    function _updateLeaderboards(address _user, uint256 _score) private {
        // Update global leaderboard
        bool found = false;
        for (uint256 i = 0; i < globalLeaderboard.length; i++) {
            if (globalLeaderboard[i].user == _user) {
                globalLeaderboard[i].score = _score;
                globalLeaderboard[i].timestamp = block.timestamp;
                found = true;
                break;
            }
        }
        
        if (!found) {
            globalLeaderboard.push(LeaderboardEntry({
                user: _user,
                score: _score,
                timestamp: block.timestamp
            }));
        }
        
        // Sort leaderboard (simplified bubble sort for demo)
        _sortLeaderboard(globalLeaderboard);
        
        // Update weekly and monthly (simplified)
        _updatePeriodLeaderboard(weeklyLeaderboards[currentWeek], _user, _score);
        _updatePeriodLeaderboard(monthlyLeaderboards[currentMonth], _user, _score);
        
        emit LeaderboardUpdated("global", 0);
    }
    
    /**
     * @notice Update period-specific leaderboard
     */
    function _updatePeriodLeaderboard(
        LeaderboardEntry[] storage leaderboard,
        address _user,
        uint256 _score
    ) private {
        bool found = false;
        for (uint256 i = 0; i < leaderboard.length; i++) {
            if (leaderboard[i].user == _user) {
                leaderboard[i].score = _score;
                leaderboard[i].timestamp = block.timestamp;
                found = true;
                break;
            }
        }
        
        if (!found) {
            leaderboard.push(LeaderboardEntry({
                user: _user,
                score: _score,
                timestamp: block.timestamp
            }));
        }
        
        _sortLeaderboard(leaderboard);
    }
    
    /**
     * @notice Sort leaderboard by score (simple bubble sort for demo)
     */
    function _sortLeaderboard(LeaderboardEntry[] storage leaderboard) private {
        uint256 n = leaderboard.length;
        for (uint256 i = 0; i < n - 1; i++) {
            for (uint256 j = 0; j < n - i - 1; j++) {
                if (leaderboard[j].score < leaderboard[j + 1].score) {
                    LeaderboardEntry memory temp = leaderboard[j];
                    leaderboard[j] = leaderboard[j + 1];
                    leaderboard[j + 1] = temp;
                }
            }
        }
    }
    
    // ============ Season Management ============
    
    /**
     * @notice Start a new season
     * @param _duration Season duration in seconds
     * @param _totalRewards Total rewards for the season
     */
    function startSeason(uint256 _duration, uint256 _totalRewards) 
        external 
        onlyRole(GAME_MASTER_ROLE)
    {
        require(!seasons[currentSeason].isActive, "Season already active");
        
        currentSeason++;
        Season storage newSeason = seasons[currentSeason];
        newSeason.startTime = block.timestamp;
        newSeason.endTime = block.timestamp + _duration;
        newSeason.isActive = true;
        newSeason.totalRewards = _totalRewards;
        
        emit SeasonStarted(currentSeason, newSeason.startTime, newSeason.endTime);
    }
    
    /**
     * @notice End current season and distribute rewards
     */
    function endSeason() external onlyRole(GAME_MASTER_ROLE) {
        Season storage season = seasons[currentSeason];
        require(season.isActive, "No active season");
        require(block.timestamp >= season.endTime, "Season not ended");
        
        season.isActive = false;
        
        // Get top performers (simplified - top 10)
        address[] memory winners = new address[](10);
        uint256 count = 0;
        
        for (uint256 i = 0; i < globalLeaderboard.length && i < 10; i++) {
            winners[i] = globalLeaderboard[i].user;
            count++;
        }
        
        emit SeasonEnded(currentSeason, winners);
        
        // Reward distribution would happen here
    }
    
    // ============ View Functions ============
    
    /**
     * @notice Calculate level from experience
     */
    function calculateLevel(uint256 _experience) public pure returns (uint256) {
        // Simple level calculation: level = sqrt(experience / 100)
        uint256 level = 1;
        uint256 required = 100;
        
        while (_experience >= required) {
            level++;
            required = level * level * 100;
        }
        
        return level - 1;
    }
    
    /**
     * @notice Get user's complete stats
     */
    function getUserStats(address _user) external view returns (UserStats memory) {
        return userStats[_user];
    }
    
    /**
     * @notice Get user's badges
     */
    function getUserBadges(address _user) external view returns (uint256[] memory) {
        return userStats[_user].badgeIds;
    }
    
    /**
     * @notice Get top N from global leaderboard
     */
    function getTopUsers(uint256 _count) external view returns (LeaderboardEntry[] memory) {
        uint256 count = _count;
        if (count > globalLeaderboard.length) {
            count = globalLeaderboard.length;
        }
        
        LeaderboardEntry[] memory topUsers = new LeaderboardEntry[](count);
        for (uint256 i = 0; i < count; i++) {
            topUsers[i] = globalLeaderboard[i];
        }
        
        return topUsers;
    }
    
    /**
     * @notice Get user's rank
     */
    function getUserRank(address _user) external view returns (uint256) {
        for (uint256 i = 0; i < globalLeaderboard.length; i++) {
            if (globalLeaderboard[i].user == _user) {
                return i + 1;
            }
        }
        return 0;
    }
    
    // ============ Admin Functions ============
    
    /**
     * @notice Set review contract address
     */
    function setReviewContract(address _contract) external onlyRole(DEFAULT_ADMIN_ROLE) {
        reviewContract = _contract;
        _grantRole(REVIEWER_CONTRACT_ROLE, _contract);
    }
    
    /**
     * @notice Create custom badge
     */
    function createCustomBadge(
        string memory _name,
        string memory _description,
        string memory _imageURI,
        uint256 _pointsRequired,
        uint256 _reviewsRequired,
        uint256 _streakRequired,
        BadgeRarity _rarity
    ) external onlyRole(GAME_MASTER_ROLE) {
        _createBadge(
            _name,
            _description,
            _imageURI,
            _pointsRequired,
            _reviewsRequired,
            _streakRequired,
            _rarity
        );
    }
    
    /**
     * @notice Manually award badge
     */
    function manuallyAwardBadge(address _user, uint256 _badgeId) 
        external 
        onlyRole(GAME_MASTER_ROLE)
    {
        require(badges[_badgeId].isActive, "Badge not active");
        require(!userBadges[_user][_badgeId], "Already has badge");
        
        _awardBadge(_user, _badgeId);
    }
    
    /**
     * @notice Reset daily check-ins (would be automated with oracle)
     */
    function resetDailyCheckIns() external onlyRole(GAME_MASTER_ROLE) {
        // This would be called daily by an oracle
        // Simplified for demo
    }
    
    // ============ Required Overrides ============
    
    function _burn(uint256 tokenId) internal override(ERC721, ERC721URIStorage) {
        super._burn(tokenId);
    }
    
    function tokenURI(uint256 tokenId) public view override(ERC721, ERC721URIStorage) returns (string memory) {
        return super.tokenURI(tokenId);
    }
    
    function supportsInterface(bytes4 interfaceId) public view override(ERC721, AccessControl, ERC721URIStorage) returns (bool) {
        return super.supportsInterface(interfaceId);
    }
}