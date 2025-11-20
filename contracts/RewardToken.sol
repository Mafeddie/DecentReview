// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Burnable.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Snapshot.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/security/Pausable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";

/**
 * @title RewardToken
 * @notice ERC20 token for platform rewards and incentives
 * @dev Implements review-to-earn tokenomics with vesting and staking
 */
contract RewardToken is 
    ERC20, 
    ERC20Burnable, 
    ERC20Snapshot, 
    AccessControl, 
    Pausable,
    ReentrancyGuard 
{
    // ============ Constants ============
    bytes32 public constant MINTER_ROLE = keccak256("MINTER_ROLE");
    bytes32 public constant SNAPSHOT_ROLE = keccak256("SNAPSHOT_ROLE");
    bytes32 public constant DISTRIBUTOR_ROLE = keccak256("DISTRIBUTOR_ROLE");
    
    uint256 public constant MAX_SUPPLY = 1000000000 * 10**18; // 1 billion tokens
    uint256 public constant INITIAL_SUPPLY = 100000000 * 10**18; // 100 million initial
    
    // Token distribution percentages
    uint256 public constant COMMUNITY_REWARDS_PERCENT = 40; // 40%
    uint256 public constant STAKING_REWARDS_PERCENT = 20; // 20%
    uint256 public constant LIQUIDITY_PERCENT = 15; // 15%
    uint256 public constant TEAM_PERCENT = 15; // 15%
    uint256 public constant TREASURY_PERCENT = 10; // 10%
    
    // Reward rates
    uint256 public constant REVIEW_REWARD = 100 * 10**18; // 100 tokens per review
    uint256 public constant QUALITY_BONUS_MAX = 50 * 10**18; // Up to 50 bonus tokens
    uint256 public constant PHOTO_REWARD = 25 * 10**18; // 25 tokens per photo
    uint256 public constant UPVOTE_REWARD = 5 * 10**18; // 5 tokens per upvote received
    uint256 public constant DAILY_REWARD = 10 * 10**18; // 10 tokens daily login
    
    // ============ Structs ============
    struct VestingSchedule {
        uint256 totalAmount;
        uint256 releasedAmount;
        uint256 startTime;
        uint256 cliffDuration;
        uint256 vestingDuration;
        bool revocable;
        bool revoked;
    }
    
    struct StakeInfo {
        uint256 amount;
        uint256 startTime;
        uint256 lockDuration;
        uint256 rewardRate; // APY in basis points (100 = 1%)
        uint256 lastClaimTime;
        uint256 accumulatedRewards;
    }
    
    struct RewardPool {
        uint256 totalAllocated;
        uint256 distributed;
        uint256 remaining;
        uint256 lastDistributionTime;
    }
    
    // ============ State Variables ============
    mapping(address => VestingSchedule[]) public vestingSchedules;
    mapping(address => StakeInfo) public stakes;
    mapping(address => uint256) public claimableRewards;
    mapping(address => uint256) public lastClaimTime;
    mapping(address => bool) public blacklisted;
    
    RewardPool public communityPool;
    RewardPool public stakingPool;
    
    uint256 public totalStaked;
    uint256 public totalDistributed;
    uint256 public currentSupply;
    
    address public reviewContract;
    address public gameFiContract;
    address public treasuryAddress;
    address public liquidityAddress;
    
    // Tokenomics parameters
    uint256 public halvingInterval = 365 days;
    uint256 public lastHalvingTime;
    uint256 public currentRewardMultiplier = 100; // 100 = 1x, 50 = 0.5x
    
    // ============ Events ============
    event RewardsClaimed(address indexed user, uint256 amount);
    event RewardsDistributed(address indexed recipient, uint256 amount, string reason);
    event TokensStaked(address indexed user, uint256 amount, uint256 duration);
    event TokensUnstaked(address indexed user, uint256 amount, uint256 rewards);
    event VestingScheduleCreated(address indexed beneficiary, uint256 amount, uint256 duration);
    event VestingReleased(address indexed beneficiary, uint256 amount);
    event HalvingOccurred(uint256 newMultiplier);
    event BlacklistUpdated(address indexed user, bool status);
    
    // ============ Constructor ============
    constructor(
        address _treasuryAddress,
        address _liquidityAddress
    ) ERC20("YelpReward", "YRW") {
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(MINTER_ROLE, msg.sender);
        _grantRole(SNAPSHOT_ROLE, msg.sender);
        _grantRole(DISTRIBUTOR_ROLE, msg.sender);
        
        treasuryAddress = _treasuryAddress;
        liquidityAddress = _liquidityAddress;
        lastHalvingTime = block.timestamp;
        
        // Mint initial supply
        _mint(address(this), INITIAL_SUPPLY);
        currentSupply = INITIAL_SUPPLY;
        
        // Initialize reward pools
        uint256 communityAllocation = (MAX_SUPPLY * COMMUNITY_REWARDS_PERCENT) / 100;
        uint256 stakingAllocation = (MAX_SUPPLY * STAKING_REWARDS_PERCENT) / 100;
        
        communityPool = RewardPool({
            totalAllocated: communityAllocation,
            distributed: 0,
            remaining: communityAllocation,
            lastDistributionTime: block.timestamp
        });
        
        stakingPool = RewardPool({
            totalAllocated: stakingAllocation,
            distributed: 0,
            remaining: stakingAllocation,
            lastDistributionTime: block.timestamp
        });
        
        // Distribute initial allocations
        _transfer(address(this), treasuryAddress, (INITIAL_SUPPLY * TREASURY_PERCENT) / 100);
        _transfer(address(this), liquidityAddress, (INITIAL_SUPPLY * LIQUIDITY_PERCENT) / 100);
        
        // Team tokens go to vesting
        uint256 teamAllocation = (INITIAL_SUPPLY * TEAM_PERCENT) / 100;
        _createVestingSchedule(msg.sender, teamAllocation, 90 days, 730 days, true);
    }
    
    // ============ Reward Distribution ============
    
    /**
     * @notice Distribute rewards for review submission
     * @param _reviewer Reviewer address
     * @param _qualityScore Quality score (0-100)
     * @param _photoCount Number of photos
     */
    function distributeReviewRewards(
        address _reviewer,
        uint256 _qualityScore,
        uint256 _photoCount
    ) external onlyRole(DISTRIBUTOR_ROLE) nonReentrant {
        require(!blacklisted[_reviewer], "User blacklisted");
        _checkHalving();
        
        uint256 baseReward = (REVIEW_REWARD * currentRewardMultiplier) / 100;
        uint256 qualityBonus = (QUALITY_BONUS_MAX * _qualityScore * currentRewardMultiplier) / 10000;
        uint256 photoReward = (PHOTO_REWARD * _photoCount * currentRewardMultiplier) / 100;
        
        uint256 totalReward = baseReward + qualityBonus + photoReward;
        
        _distributeFromPool(totalReward, _reviewer, "Review Submission");
        
        emit RewardsDistributed(_reviewer, totalReward, "Review Submission");
    }
    
    /**
     * @notice Distribute rewards for upvotes received
     * @param _reviewer Reviewer address
     * @param _upvotes Number of upvotes
     */
    function distributeUpvoteRewards(address _reviewer, uint256 _upvotes) 
        external 
        onlyRole(DISTRIBUTOR_ROLE) 
    {
        require(!blacklisted[_reviewer], "User blacklisted");
        
        uint256 reward = (UPVOTE_REWARD * _upvotes * currentRewardMultiplier) / 100;
        _distributeFromPool(reward, _reviewer, "Upvotes Received");
        
        emit RewardsDistributed(_reviewer, reward, "Upvotes");
    }
    
    /**
     * @notice Distribute daily check-in rewards
     * @param _user User address
     */
    function distributeDailyReward(address _user) 
        external 
        onlyRole(DISTRIBUTOR_ROLE) 
    {
        require(!blacklisted[_user], "User blacklisted");
        require(block.timestamp >= lastClaimTime[_user] + 1 days, "Already claimed today");
        
        uint256 reward = (DAILY_REWARD * currentRewardMultiplier) / 100;
        _distributeFromPool(reward, _user, "Daily Check-in");
        lastClaimTime[_user] = block.timestamp;
        
        emit RewardsDistributed(_user, reward, "Daily Check-in");
    }
    
    /**
     * @notice Distribute from community pool
     */
    function _distributeFromPool(uint256 _amount, address _recipient, string memory _reason) 
        private 
    {
        require(communityPool.remaining >= _amount, "Insufficient pool balance");
        
        communityPool.distributed += _amount;
        communityPool.remaining -= _amount;
        communityPool.lastDistributionTime = block.timestamp;
        
        claimableRewards[_recipient] += _amount;
        totalDistributed += _amount;
    }
    
    /**
     * @notice Claim accumulated rewards
     */
    function claimRewards() external nonReentrant whenNotPaused {
        require(!blacklisted[msg.sender], "User blacklisted");
        uint256 rewards = claimableRewards[msg.sender];
        require(rewards > 0, "No rewards to claim");
        
        claimableRewards[msg.sender] = 0;
        
        // Mint new tokens if needed
        if (totalSupply() + rewards <= MAX_SUPPLY) {
            _mint(msg.sender, rewards);
        } else {
            // Transfer from contract balance
            _transfer(address(this), msg.sender, rewards);
        }
        
        emit RewardsClaimed(msg.sender, rewards);
    }
    
    // ============ Staking Functions ============
    
    /**
     * @notice Stake tokens for rewards
     * @param _amount Amount to stake
     * @param _lockDuration Lock duration in seconds
     */
    function stake(uint256 _amount, uint256 _lockDuration) 
        external 
        nonReentrant 
        whenNotPaused 
    {
        require(_amount > 0, "Cannot stake 0");
        require(stakes[msg.sender].amount == 0, "Already staking");
        require(_lockDuration >= 30 days, "Minimum 30 days lock");
        require(_lockDuration <= 365 days, "Maximum 365 days lock");
        
        _transfer(msg.sender, address(this), _amount);
        
        // Calculate reward rate based on lock duration
        uint256 rewardRate;
        if (_lockDuration >= 365 days) rewardRate = 2000; // 20% APY
        else if (_lockDuration >= 180 days) rewardRate = 1500; // 15% APY
        else if (_lockDuration >= 90 days) rewardRate = 1000; // 10% APY
        else rewardRate = 500; // 5% APY
        
        stakes[msg.sender] = StakeInfo({
            amount: _amount,
            startTime: block.timestamp,
            lockDuration: _lockDuration,
            rewardRate: rewardRate,
            lastClaimTime: block.timestamp,
            accumulatedRewards: 0
        });
        
        totalStaked += _amount;
        
        emit TokensStaked(msg.sender, _amount, _lockDuration);
    }
    
    /**
     * @notice Unstake tokens and claim rewards
     */
    function unstake() external nonReentrant {
        StakeInfo storage stakeInfo = stakes[msg.sender];
        require(stakeInfo.amount > 0, "No active stake");
        require(
            block.timestamp >= stakeInfo.startTime + stakeInfo.lockDuration,
            "Still locked"
        );
        
        uint256 rewards = calculateStakingRewards(msg.sender);
        uint256 totalAmount = stakeInfo.amount + rewards;
        
        // Reset stake info
        totalStaked -= stakeInfo.amount;
        delete stakes[msg.sender];
        
        // Distribute rewards from staking pool
        if (rewards > 0 && stakingPool.remaining >= rewards) {
            stakingPool.distributed += rewards;
            stakingPool.remaining -= rewards;
        }
        
        _transfer(address(this), msg.sender, stakeInfo.amount);
        
        if (rewards > 0) {
            if (totalSupply() + rewards <= MAX_SUPPLY) {
                _mint(msg.sender, rewards);
            }
        }
        
        emit TokensUnstaked(msg.sender, stakeInfo.amount, rewards);
    }
    
    /**
     * @notice Calculate pending staking rewards
     */
    function calculateStakingRewards(address _user) public view returns (uint256) {
        StakeInfo memory stakeInfo = stakes[_user];
        if (stakeInfo.amount == 0) return 0;
        
        uint256 stakingDuration = block.timestamp - stakeInfo.lastClaimTime;
        uint256 annualReward = (stakeInfo.amount * stakeInfo.rewardRate) / 10000;
        uint256 rewards = (annualReward * stakingDuration) / 365 days;
        
        return rewards + stakeInfo.accumulatedRewards;
    }
    
    // ============ Vesting Functions ============
    
    /**
     * @notice Create vesting schedule
     */
    function _createVestingSchedule(
        address _beneficiary,
        uint256 _amount,
        uint256 _cliff,
        uint256 _duration,
        bool _revocable
    ) private {
        vestingSchedules[_beneficiary].push(VestingSchedule({
            totalAmount: _amount,
            releasedAmount: 0,
            startTime: block.timestamp,
            cliffDuration: _cliff,
            vestingDuration: _duration,
            revocable: _revocable,
            revoked: false
        }));
        
        emit VestingScheduleCreated(_beneficiary, _amount, _duration);
    }
    
    /**
     * @notice Release vested tokens
     */
    function releaseVesting(uint256 _scheduleIndex) external nonReentrant {
        require(_scheduleIndex < vestingSchedules[msg.sender].length, "Invalid index");
        
        VestingSchedule storage schedule = vestingSchedules[msg.sender][_scheduleIndex];
        require(!schedule.revoked, "Schedule revoked");
        
        uint256 releasable = _computeReleasableAmount(schedule);
        require(releasable > 0, "No tokens to release");
        
        schedule.releasedAmount += releasable;
        _transfer(address(this), msg.sender, releasable);
        
        emit VestingReleased(msg.sender, releasable);
    }
    
    /**
     * @notice Compute releasable amount for vesting
     */
    function _computeReleasableAmount(VestingSchedule memory schedule) 
        private 
        view 
        returns (uint256) 
    {
        if (block.timestamp < schedule.startTime + schedule.cliffDuration) {
            return 0;
        }
        
        uint256 elapsedTime = block.timestamp - schedule.startTime;
        uint256 vested;
        
        if (elapsedTime >= schedule.vestingDuration) {
            vested = schedule.totalAmount;
        } else {
            vested = (schedule.totalAmount * elapsedTime) / schedule.vestingDuration;
        }
        
        return vested - schedule.releasedAmount;
    }
    
    // ============ Tokenomics Functions ============
    
    /**
     * @notice Check and apply halving if needed
     */
    function _checkHalving() private {
        if (block.timestamp >= lastHalvingTime + halvingInterval) {
            currentRewardMultiplier = currentRewardMultiplier / 2;
            if (currentRewardMultiplier < 1) currentRewardMultiplier = 1;
            
            lastHalvingTime = block.timestamp;
            emit HalvingOccurred(currentRewardMultiplier);
        }
    }
    
    /**
     * @notice Burn tokens to reduce supply
     */
    function burnFromTreasury(uint256 _amount) external onlyRole(DEFAULT_ADMIN_ROLE) {
        _burn(treasuryAddress, _amount);
    }
    
    // ============ Admin Functions ============
    
    /**
     * @notice Update blacklist status
     */
    function updateBlacklist(address _user, bool _status) 
        external 
        onlyRole(DEFAULT_ADMIN_ROLE) 
    {
        blacklisted[_user] = _status;
        emit BlacklistUpdated(_user, _status);
    }
    
    /**
     * @notice Set contract addresses
     */
    function setContracts(address _reviewContract, address _gameFiContract) 
        external 
        onlyRole(DEFAULT_ADMIN_ROLE) 
    {
        reviewContract = _reviewContract;
        gameFiContract = _gameFiContract;
        
        _grantRole(DISTRIBUTOR_ROLE, _reviewContract);
        _grantRole(DISTRIBUTOR_ROLE, _gameFiContract);
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
     * @notice Create snapshot for governance
     */
    function snapshot() external onlyRole(SNAPSHOT_ROLE) returns (uint256) {
        return _snapshot();
    }
    
    // ============ View Functions ============
    
    /**
     * @notice Get user's total balance (wallet + staked + claimable)
     */
    function getTotalBalance(address _user) external view returns (uint256) {
        return balanceOf(_user) + stakes[_user].amount + claimableRewards[_user];
    }
    
    /**
     * @notice Get vesting schedules for user
     */
    function getVestingSchedules(address _user) 
        external 
        view 
        returns (VestingSchedule[] memory) 
    {
        return vestingSchedules[_user];
    }
    
    /**
     * @notice Get pool statistics
     */
    function getPoolStats() external view returns (
        uint256 communityRemaining,
        uint256 communityDistributed,
        uint256 stakingRemaining,
        uint256 stakingDistributed
    ) {
        return (
            communityPool.remaining,
            communityPool.distributed,
            stakingPool.remaining,
            stakingPool.distributed
        );
    }
    
    // ============ Required Overrides ============
    
    function _beforeTokenTransfer(
        address from,
        address to,
        uint256 amount
    ) internal override(ERC20, ERC20Snapshot) whenNotPaused {
        super._beforeTokenTransfer(from, to, amount);
        require(!blacklisted[from] && !blacklisted[to], "Blacklisted address");
    }
}