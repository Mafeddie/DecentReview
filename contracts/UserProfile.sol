// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/utils/Strings.sol";

/**
 * @title UserProfile
 * @notice Manages user profiles, usernames, and social features
 * @dev Implements username uniqueness and profile management
 */
contract UserProfile is Ownable, ReentrancyGuard {
    using Strings for uint256;
    
    // ============ Constants ============
    uint256 public constant MIN_USERNAME_LENGTH = 3;
    uint256 public constant MAX_USERNAME_LENGTH = 20;
    uint256 public constant MAX_BIO_LENGTH = 500;
    uint256 public constant USERNAME_CHANGE_COOLDOWN = 30 days;
    uint256 public constant USERNAME_REGISTRATION_FEE = 0.001 ether;
    
    // ============ Structs ============
    struct Profile {
        string username;
        string bio;
        string avatarIPFS;
        string coverImageIPFS;
        uint256 joinedAt;
        uint256 lastUsernameChange;
        bool isVerified;
        string[] socialLinks;
        uint256 totalReviews;
        uint256 totalUpvotes;
        uint256 level;
        bool exists;
    }
    
    struct UsernameRequest {
        address requester;
        string newUsername;
        uint256 timestamp;
        bool approved;
    }
    
    // ============ State Variables ============
    mapping(address => Profile) public profiles;
    mapping(string => address) public usernameToAddress;
    mapping(string => bool) public reservedUsernames;
    mapping(uint256 => UsernameRequest) public usernameRequests;
    
    address[] public allUsers;
    uint256 public totalProfiles;
    uint256 public usernameRequestCounter;
    uint256 public accumulatedFees;
    
    // Contracts
    address public reviewContract;
    address public gameFiContract;
    
    // ============ Events ============
    event ProfileCreated(address indexed user, string username);
    event UsernameChanged(address indexed user, string oldUsername, string newUsername);
    event ProfileUpdated(address indexed user);
    event ProfileVerified(address indexed user);
    event SocialLinkAdded(address indexed user, string link);
    event UsernameReserved(string username);
    event UsernameRequestSubmitted(uint256 requestId, address user, string username);
    
    // ============ Modifiers ============
    modifier onlyProfileOwner() {
        require(profiles[msg.sender].exists, "Profile does not exist");
        _;
    }
    
    modifier onlyReviewContract() {
        require(msg.sender == reviewContract, "Only review contract");
        _;
    }
    
    modifier validUsername(string memory _username) {
        require(bytes(_username).length >= MIN_USERNAME_LENGTH, "Username too short");
        require(bytes(_username).length <= MAX_USERNAME_LENGTH, "Username too long");
        require(isAlphanumeric(_username), "Username must be alphanumeric");
        _;
    }
    
    // ============ Constructor ============
    constructor(address initialOwner) Ownable(initialOwner) {
        // Reserve common usernames
        reservedUsernames["admin"] = true;
        reservedUsernames["moderator"] = true;
        reservedUsernames["system"] = true;
        reservedUsernames["support"] = true;
        reservedUsernames["official"] = true;
    }
    
    // ============ Main Functions ============
    
    /**
     * @notice Create a new profile with username
     * @param _username Desired username
     * @param _bio User bio
     * @param _avatarIPFS IPFS hash of avatar
     */
    function createProfile(
        string memory _username,
        string memory _bio,
        string memory _avatarIPFS
    ) external payable nonReentrant validUsername(_username) {
        require(!profiles[msg.sender].exists, "Profile already exists");
        require(msg.value >= USERNAME_REGISTRATION_FEE, "Insufficient fee");
        require(usernameToAddress[_username] == address(0), "Username taken");
        require(!reservedUsernames[_username], "Username reserved");
        require(bytes(_bio).length <= MAX_BIO_LENGTH, "Bio too long");
        
        // Create profile
        profiles[msg.sender] = Profile({
            username: _username,
            bio: _bio,
            avatarIPFS: _avatarIPFS,
            coverImageIPFS: "",
            joinedAt: block.timestamp,
            lastUsernameChange: block.timestamp,
            isVerified: false,
            socialLinks: new string[](0),
            totalReviews: 0,
            totalUpvotes: 0,
            level: 1,
            exists: true
        });
        
        usernameToAddress[_username] = msg.sender;
        allUsers.push(msg.sender);
        totalProfiles++;
        accumulatedFees += msg.value;
        
        emit ProfileCreated(msg.sender, _username);
    }
    
    /**
     * @notice Change username with cooldown
     * @param _newUsername New username
     */
    function changeUsername(string memory _newUsername) 
        external 
        payable 
        nonReentrant
        onlyProfileOwner
        validUsername(_newUsername)
    {
        Profile storage profile = profiles[msg.sender];
        require(
            block.timestamp >= profile.lastUsernameChange + USERNAME_CHANGE_COOLDOWN,
            "Username change on cooldown"
        );
        require(msg.value >= USERNAME_REGISTRATION_FEE, "Insufficient fee");
        require(usernameToAddress[_newUsername] == address(0), "Username taken");
        require(!reservedUsernames[_newUsername], "Username reserved");
        
        string memory oldUsername = profile.username;
        
        // Clear old mapping
        delete usernameToAddress[oldUsername];
        
        // Set new username
        profile.username = _newUsername;
        profile.lastUsernameChange = block.timestamp;
        usernameToAddress[_newUsername] = msg.sender;
        accumulatedFees += msg.value;
        
        emit UsernameChanged(msg.sender, oldUsername, _newUsername);
    }
    
    /**
     * @notice Update profile information
     * @param _bio New bio
     * @param _avatarIPFS New avatar IPFS hash
     * @param _coverImageIPFS New cover image IPFS hash
     */
    function updateProfile(
        string memory _bio,
        string memory _avatarIPFS,
        string memory _coverImageIPFS
    ) external onlyProfileOwner {
        require(bytes(_bio).length <= MAX_BIO_LENGTH, "Bio too long");
        
        Profile storage profile = profiles[msg.sender];
        profile.bio = _bio;
        profile.avatarIPFS = _avatarIPFS;
        profile.coverImageIPFS = _coverImageIPFS;
        
        emit ProfileUpdated(msg.sender);
    }
    
    /**
     * @notice Add social media link
     * @param _link Social media URL
     */
    function addSocialLink(string memory _link) external onlyProfileOwner {
        require(bytes(_link).length > 0, "Invalid link");
        require(profiles[msg.sender].socialLinks.length < 5, "Too many links");
        
        profiles[msg.sender].socialLinks.push(_link);
        emit SocialLinkAdded(msg.sender, _link);
    }
    
    /**
     * @notice Remove social media link
     * @param _index Index of link to remove
     */
    function removeSocialLink(uint256 _index) external onlyProfileOwner {
        Profile storage profile = profiles[msg.sender];
        require(_index < profile.socialLinks.length, "Invalid index");
        
        // Move last element to deleted position and pop
        profile.socialLinks[_index] = profile.socialLinks[profile.socialLinks.length - 1];
        profile.socialLinks.pop();
    }
    
    // ============ External Contract Functions ============
    
    /**
     * @notice Update user stats (called by review contract)
     * @param _user User address
     * @param _reviewIncrement Number of reviews to add
     * @param _upvoteIncrement Number of upvotes to add
     */
    function updateUserStats(
        address _user,
        uint256 _reviewIncrement,
        uint256 _upvoteIncrement
    ) external onlyReviewContract {
        if (profiles[_user].exists) {
            profiles[_user].totalReviews += _reviewIncrement;
            profiles[_user].totalUpvotes += _upvoteIncrement;
            
            // Simple leveling system
            uint256 newLevel = calculateLevel(
                profiles[_user].totalReviews,
                profiles[_user].totalUpvotes
            );
            profiles[_user].level = newLevel;
        }
    }
    
    /**
     * @notice Calculate user level based on activity
     */
    function calculateLevel(uint256 reviews, uint256 upvotes) 
        public 
        pure 
        returns (uint256) 
    {
        uint256 score = reviews * 100 + upvotes * 10;
        
        if (score >= 10000) return 10;
        if (score >= 5000) return 9;
        if (score >= 2500) return 8;
        if (score >= 1000) return 7;
        if (score >= 500) return 6;
        if (score >= 250) return 5;
        if (score >= 100) return 4;
        if (score >= 50) return 3;
        if (score >= 10) return 2;
        return 1;
    }
    
    // ============ View Functions ============
    
    /**
     * @notice Get profile by address
     */
    function getProfile(address _user) external view returns (Profile memory) {
        return profiles[_user];
    }
    
    /**
     * @notice Get address by username
     */
    function getAddressByUsername(string memory _username) 
        external 
        view 
        returns (address) 
    {
        return usernameToAddress[_username];
    }
    
    /**
     * @notice Check if username is available
     */
    function isUsernameAvailable(string memory _username) 
        external 
        view 
        returns (bool) 
    {
        return usernameToAddress[_username] == address(0) && 
               !reservedUsernames[_username];
    }
    
    /**
     * @notice Get all registered users
     */
    function getAllUsers() external view returns (address[] memory) {
        return allUsers;
    }
    
    /**
     * @notice Get user's social links
     */
    function getSocialLinks(address _user) 
        external 
        view 
        returns (string[] memory) 
    {
        return profiles[_user].socialLinks;
    }
    
    // ============ Admin Functions ============
    
    /**
     * @notice Verify a user profile
     */
    function verifyProfile(address _user) external onlyOwner {
        require(profiles[_user].exists, "Profile does not exist");
        profiles[_user].isVerified = true;
        emit ProfileVerified(_user);
    }
    
    /**
     * @notice Reserve a username
     */
    function reserveUsername(string memory _username) 
        external 
        onlyOwner 
        validUsername(_username)
    {
        reservedUsernames[_username] = true;
        emit UsernameReserved(_username);
    }
    
    /**
     * @notice Update contract addresses
     */
    function setContracts(address _reviewContract, address _gameFiContract) 
        external 
        onlyOwner 
    {
        reviewContract = _reviewContract;
        gameFiContract = _gameFiContract;
    }
    
    /**
     * @notice Withdraw accumulated fees
     */
    function withdrawFees() external onlyOwner {
        uint256 amount = accumulatedFees;
        accumulatedFees = 0;
        payable(owner()).transfer(amount);
    }
    
    /**
     * @notice Ban a username and remove profile
     */
    function banProfile(address _user) external onlyOwner {
        require(profiles[_user].exists, "Profile does not exist");
        
        string memory username = profiles[_user].username;
        delete usernameToAddress[username];
        delete profiles[_user];
        
        // Note: Does not remove from allUsers array to maintain indices
    }
    
    // ============ Helper Functions ============
    
    /**
     * @notice Check if string is alphanumeric
     */
    function isAlphanumeric(string memory str) private pure returns (bool) {
        bytes memory b = bytes(str);
        for (uint i = 0; i < b.length; i++) {
            bytes1 char = b[i];
            if (
                !(char >= 0x30 && char <= 0x39) && // 0-9
                !(char >= 0x41 && char <= 0x5A) && // A-Z
                !(char >= 0x61 && char <= 0x7A) && // a-z
                !(char == 0x5F) // underscore
            ) {
                return false;
            }
        }
        return true;
    }
}