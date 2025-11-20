// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts-upgradeable/access/AccessControlUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/security/PausableUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/security/ReentrancyGuardUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/UUPSUpgradeable.sol";

/**
 * @title YelpReviewV2
 * @notice Main contract for decentralized review system with enhanced security
 * @dev Implements comprehensive review management with spam prevention
 */
contract YelpReviewV2 is 
    Initializable,
    AccessControlUpgradeable,
    PausableUpgradeable,
    ReentrancyGuardUpgradeable,
    UUPSUpgradeable
{
    // ============ Constants ============
    bytes32 public constant MODERATOR_ROLE = keccak256("MODERATOR_ROLE");
    bytes32 public constant BUSINESS_OWNER_ROLE = keccak256("BUSINESS_OWNER_ROLE");
    bytes32 public constant UPGRADER_ROLE = keccak256("UPGRADER_ROLE");
    
    uint256 public constant MAX_RATING = 5;
    uint256 public constant MIN_RATING = 1;
    uint256 public constant MAX_COMMENT_LENGTH = 2000;
    uint256 public constant MAX_TAGS = 10;
    uint256 public constant MAX_IMAGES = 5;
    uint256 public constant REVIEW_COOLDOWN = 1 hours; // Anti-spam
    uint256 public constant MIN_ACCOUNT_AGE = 1 days; // Sybil resistance
    
    // ============ Structs ============
    struct Review {
        address reviewer;
        uint256 timestamp;
        uint256 lastEditTimestamp;
        uint8 rating;
        string comment;
        string[] tags;
        string[] imageHashes; // Multiple IPFS hashes
        uint256 upvotes;
        uint256 downvotes;
        bool isFlagged;
        bool isArchived;
        bool isVerified; // Verified visit/purchase
        uint8 version; // Edit history tracking
        string ownerResponse;
        uint256 ownerResponseTimestamp;
    }
    
    struct Business {
        bytes32 id;
        string name;
        string category;
        string location;
        string description;
        address owner;
        bool isVerified;
        uint256 totalReviews;
        uint256 totalRating;
        uint256 createdAt;
        bool exists;
    }
    
    struct ReviewVote {
        bool hasVoted;
        bool isUpvote;
    }
    
    // ============ State Variables ============
    mapping(bytes32 => Business) public businesses;
    mapping(bytes32 => mapping(address => Review)) public reviews;
    mapping(bytes32 => address[]) public reviewers;
    mapping(bytes32 => mapping(address => mapping(address => ReviewVote))) public reviewVotes;
    mapping(address => uint256) public lastReviewTime;
    mapping(address => uint256) public userReviewCount;
    mapping(address => bool) public bannedUsers;
    
    bytes32[] public businessIds;
    uint256 public totalReviewsCount;
    uint256 public minimumStakeAmount; // For business verification
    
    // Interfaces for other contracts
    address public userProfileContract;
    address public gameFiContract;
    address public reputationContract;
    
    // ============ Events ============
    event ReviewAdded(
        bytes32 indexed businessId,
        address indexed reviewer,
        uint8 rating,
        uint256 timestamp
    );
    
    event ReviewUpdated(
        bytes32 indexed businessId,
        address indexed reviewer,
        uint8 newVersion,
        uint256 timestamp
    );
    
    event ReviewVoted(
        bytes32 indexed businessId,
        address indexed reviewer,
        address indexed voter,
        bool isUpvote
    );
    
    event BusinessRegistered(
        bytes32 indexed businessId,
        string name,
        address owner,
        uint256 timestamp
    );
    
    event BusinessVerified(
        bytes32 indexed businessId,
        uint256 stakeAmount
    );
    
    event OwnerResponseAdded(
        bytes32 indexed businessId,
        address indexed reviewer,
        uint256 timestamp
    );
    
    event UserBanned(address indexed user, string reason);
    event UserUnbanned(address indexed user);
    
    // ============ Modifiers ============
    modifier notBanned() {
        require(!bannedUsers[msg.sender], "User is banned");
        _;
    }
    
    modifier validRating(uint8 _rating) {
        require(_rating >= MIN_RATING && _rating <= MAX_RATING, "Invalid rating");
        _;
    }
    
    modifier businessExists(bytes32 _businessId) {
        require(businesses[_businessId].exists, "Business does not exist");
        _;
    }
    
    modifier rateLimited() {
        require(
            block.timestamp >= lastReviewTime[msg.sender] + REVIEW_COOLDOWN,
            "Please wait before reviewing again"
        );
        _;
    }
    
    modifier accountAgeCheck() {
        // Check if account is old enough (would need oracle for real implementation)
        require(userReviewCount[msg.sender] > 0 || msg.sender.balance > 0, "Account too new");
        _;
    }
    
    // ============ Initialization ============
    /// @custom:oz-upgrades-unsafe-allow constructor
    constructor() {
        _disableInitializers();
    }
    
    function initialize(
        address _userProfileContract,
        address _gameFiContract,
        address _reputationContract
    ) public initializer {
        __AccessControl_init();
        __Pausable_init();
        __ReentrancyGuard_init();
        __UUPSUpgradeable_init();
        
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(MODERATOR_ROLE, msg.sender);
        _grantRole(UPGRADER_ROLE, msg.sender);
        
        userProfileContract = _userProfileContract;
        gameFiContract = _gameFiContract;
        reputationContract = _reputationContract;
        
        minimumStakeAmount = 0.01 ether; // For business verification
    }
    
    // ============ Main Functions ============
    
    /**
     * @notice Register a new business
     * @param _name Business name
     * @param _category Business category
     * @param _location Business location
     * @param _description Business description
     */
    function registerBusiness(
        string memory _name,
        string memory _category,
        string memory _location,
        string memory _description
    ) external whenNotPaused notBanned returns (bytes32) {
        require(bytes(_name).length > 0, "Name required");
        require(bytes(_category).length > 0, "Category required");
        
        bytes32 businessId = keccak256(abi.encodePacked(_name, _location, block.timestamp));
        require(!businesses[businessId].exists, "Business already exists");
        
        businesses[businessId] = Business({
            id: businessId,
            name: _name,
            category: _category,
            location: _location,
            description: _description,
            owner: msg.sender,
            isVerified: false,
            totalReviews: 0,
            totalRating: 0,
            createdAt: block.timestamp,
            exists: true
        });
        
        businessIds.push(businessId);
        _grantRole(BUSINESS_OWNER_ROLE, msg.sender);
        
        emit BusinessRegistered(businessId, _name, msg.sender, block.timestamp);
        return businessId;
    }
    
    /**
     * @notice Add a review with comprehensive validation
     * @param _businessId Business identifier
     * @param _rating Rating 1-5
     * @param _comment Review comment
     * @param _tags Review tags
     * @param _imageHashes IPFS hashes of images
     */
    function addReview(
        bytes32 _businessId,
        uint8 _rating,
        string memory _comment,
        string[] memory _tags,
        string[] memory _imageHashes
    ) external 
        whenNotPaused 
        notBanned 
        nonReentrant
        businessExists(_businessId)
        validRating(_rating)
        rateLimited
        accountAgeCheck
    {
        require(bytes(_comment).length <= MAX_COMMENT_LENGTH, "Comment too long");
        require(_tags.length <= MAX_TAGS, "Too many tags");
        require(_imageHashes.length <= MAX_IMAGES, "Too many images");
        require(reviews[_businessId][msg.sender].timestamp == 0, "Already reviewed");
        
        // Input sanitization
        for (uint i = 0; i < _tags.length; i++) {
            require(bytes(_tags[i]).length > 0 && bytes(_tags[i]).length <= 50, "Invalid tag");
        }
        
        reviews[_businessId][msg.sender] = Review({
            reviewer: msg.sender,
            timestamp: block.timestamp,
            lastEditTimestamp: block.timestamp,
            rating: _rating,
            comment: _comment,
            tags: _tags,
            imageHashes: _imageHashes,
            upvotes: 0,
            downvotes: 0,
            isFlagged: false,
            isArchived: false,
            isVerified: false,
            version: 1,
            ownerResponse: "",
            ownerResponseTimestamp: 0
        });
        
        reviewers[_businessId].push(msg.sender);
        businesses[_businessId].totalReviews++;
        businesses[_businessId].totalRating += _rating;
        totalReviewsCount++;
        userReviewCount[msg.sender]++;
        lastReviewTime[msg.sender] = block.timestamp;
        
        // Call GameFi contract to award points
        if (gameFiContract != address(0)) {
            try IGameFi(gameFiContract).awardReviewPoints(msg.sender, _rating) {} catch {}
        }
        
        emit ReviewAdded(_businessId, msg.sender, _rating, block.timestamp);
    }
    
    /**
     * @notice Update an existing review
     * @param _businessId Business identifier
     * @param _rating New rating
     * @param _comment New comment
     * @param _tags New tags
     */
    function updateReview(
        bytes32 _businessId,
        uint8 _rating,
        string memory _comment,
        string[] memory _tags
    ) external 
        whenNotPaused 
        notBanned 
        businessExists(_businessId)
        validRating(_rating)
    {
        Review storage review = reviews[_businessId][msg.sender];
        require(review.timestamp > 0, "Review does not exist");
        require(!review.isArchived, "Review is archived");
        require(bytes(_comment).length <= MAX_COMMENT_LENGTH, "Comment too long");
        
        // Update rating totals
        businesses[_businessId].totalRating = 
            businesses[_businessId].totalRating - review.rating + _rating;
        
        review.rating = _rating;
        review.comment = _comment;
        review.tags = _tags;
        review.lastEditTimestamp = block.timestamp;
        review.version++;
        
        emit ReviewUpdated(_businessId, msg.sender, review.version, block.timestamp);
    }
    
    /**
     * @notice Vote on a review
     * @param _businessId Business identifier
     * @param _reviewer Reviewer address
     * @param _isUpvote True for upvote, false for downvote
     */
    function voteReview(
        bytes32 _businessId,
        address _reviewer,
        bool _isUpvote
    ) external 
        whenNotPaused 
        notBanned 
        businessExists(_businessId)
    {
        require(_reviewer != msg.sender, "Cannot vote own review");
        require(reviews[_businessId][_reviewer].timestamp > 0, "Review does not exist");
        
        ReviewVote storage vote = reviewVotes[_businessId][_reviewer][msg.sender];
        Review storage review = reviews[_businessId][_reviewer];
        
        // Handle vote change
        if (vote.hasVoted) {
            if (vote.isUpvote && !_isUpvote) {
                review.upvotes--;
                review.downvotes++;
            } else if (!vote.isUpvote && _isUpvote) {
                review.downvotes--;
                review.upvotes++;
            }
        } else {
            if (_isUpvote) {
                review.upvotes++;
            } else {
                review.downvotes++;
            }
        }
        
        vote.hasVoted = true;
        vote.isUpvote = _isUpvote;
        
        // Update reputation
        if (reputationContract != address(0)) {
            try IReputation(reputationContract).updateReputation(_reviewer, _isUpvote) {} catch {}
        }
        
        emit ReviewVoted(_businessId, _reviewer, msg.sender, _isUpvote);
    }
    
    /**
     * @notice Add business owner response
     * @param _businessId Business identifier
     * @param _reviewer Reviewer address
     * @param _response Response text
     */
    function addOwnerResponse(
        bytes32 _businessId,
        address _reviewer,
        string memory _response
    ) external 
        whenNotPaused 
        businessExists(_businessId)
    {
        require(businesses[_businessId].owner == msg.sender, "Not business owner");
        require(reviews[_businessId][_reviewer].timestamp > 0, "Review does not exist");
        require(bytes(_response).length <= MAX_COMMENT_LENGTH, "Response too long");
        
        Review storage review = reviews[_businessId][_reviewer];
        review.ownerResponse = _response;
        review.ownerResponseTimestamp = block.timestamp;
        
        emit OwnerResponseAdded(_businessId, _reviewer, block.timestamp);
    }
    
    // ============ Moderation Functions ============
    
    /**
     * @notice Flag a review for moderation
     * @param _businessId Business identifier
     * @param _reviewer Reviewer address
     */
    function flagReview(
        bytes32 _businessId,
        address _reviewer
    ) external onlyRole(MODERATOR_ROLE) {
        reviews[_businessId][_reviewer].isFlagged = true;
    }
    
    /**
     * @notice Archive a review
     * @param _businessId Business identifier
     * @param _reviewer Reviewer address
     */
    function archiveReview(
        bytes32 _businessId,
        address _reviewer
    ) external onlyRole(MODERATOR_ROLE) {
        reviews[_businessId][_reviewer].isArchived = true;
    }
    
    /**
     * @notice Ban a user from the platform
     * @param _user User address
     * @param _reason Ban reason for transparency
     */
    function banUser(address _user, string memory _reason) 
        external 
        onlyRole(MODERATOR_ROLE) 
    {
        bannedUsers[_user] = true;
        emit UserBanned(_user, _reason);
    }
    
    /**
     * @notice Unban a user
     * @param _user User address
     */
    function unbanUser(address _user) external onlyRole(MODERATOR_ROLE) {
        bannedUsers[_user] = false;
        emit UserUnbanned(_user);
    }
    
    // ============ Business Verification ============
    
    /**
     * @notice Verify a business with stake
     * @param _businessId Business identifier
     */
    function verifyBusiness(bytes32 _businessId) 
        external 
        payable 
        businessExists(_businessId)
    {
        require(msg.sender == businesses[_businessId].owner, "Not owner");
        require(msg.value >= minimumStakeAmount, "Insufficient stake");
        require(!businesses[_businessId].isVerified, "Already verified");
        
        businesses[_businessId].isVerified = true;
        
        emit BusinessVerified(_businessId, msg.value);
    }
    
    // ============ View Functions ============
    
    /**
     * @notice Get review details
     */
    function getReview(bytes32 _businessId, address _reviewer) 
        external 
        view 
        returns (Review memory) 
    {
        return reviews[_businessId][_reviewer];
    }
    
    /**
     * @notice Get all reviewers for a business
     */
    function getReviewers(bytes32 _businessId) 
        external 
        view 
        returns (address[] memory) 
    {
        return reviewers[_businessId];
    }
    
    /**
     * @notice Calculate average rating for a business
     */
    function getAverageRating(bytes32 _businessId) 
        external 
        view 
        returns (uint256) 
    {
        Business memory business = businesses[_businessId];
        if (business.totalReviews == 0) return 0;
        return (business.totalRating * 100) / business.totalReviews;
    }
    
    /**
     * @notice Get all business IDs
     */
    function getAllBusinessIds() external view returns (bytes32[] memory) {
        return businessIds;
    }
    
    // ============ Admin Functions ============
    
    /**
     * @notice Update contract addresses
     */
    function updateContracts(
        address _userProfile,
        address _gameFi,
        address _reputation
    ) external onlyRole(DEFAULT_ADMIN_ROLE) {
        userProfileContract = _userProfile;
        gameFiContract = _gameFi;
        reputationContract = _reputation;
    }
    
    /**
     * @notice Update minimum stake amount
     */
    function updateMinimumStake(uint256 _amount) 
        external 
        onlyRole(DEFAULT_ADMIN_ROLE) 
    {
        minimumStakeAmount = _amount;
    }
    
    /**
     * @notice Emergency pause
     */
    function pause() external onlyRole(DEFAULT_ADMIN_ROLE) {
        _pause();
    }
    
    function unpause() external onlyRole(DEFAULT_ADMIN_ROLE) {
        _unpause();
    }
    
    /**
     * @notice Upgrade authorization
     */
    function _authorizeUpgrade(address newImplementation)
        internal
        onlyRole(UPGRADER_ROLE)
        override
    {}
    
    /**
     * @notice Withdraw staked funds (only for emergency)
     */
    function emergencyWithdraw() 
        external 
        onlyRole(DEFAULT_ADMIN_ROLE)
        whenPaused 
    {
        payable(msg.sender).transfer(address(this).balance);
    }
}

// ============ Interfaces ============
interface IGameFi {
    function awardReviewPoints(address user, uint8 rating) external;
}

interface IReputation {
    function updateReputation(address user, bool isPositive) external;
}