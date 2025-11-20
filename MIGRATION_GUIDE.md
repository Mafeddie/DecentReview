# YelpReview V2 Migration Guide

## Overview
This guide walks through migrating from the original YelpReview contract to the comprehensive V2 suite that supports all UI features on-chain.

## Contract Architecture

### V1 (Current - Limited)
- **Single Contract**: `YelpReview.sol` at `0x3035dC76c25aF1dcbD5C0b52Ea1A892d2349a387`
- **Features**: Basic reviews, simple moderation, owner responses
- **Limitations**: No gamification, no usernames, no voting, no rewards

### V2 (New - Comprehensive)
- **Multi-Contract Suite**:
  1. `YelpReviewV2.sol` - Main review logic with security features
  2. `UserProfile.sol` - On-chain usernames and profiles
  3. `GameFi.sol` - Points, badges, leaderboards
  4. `ReputationEngine.sol` - Voting power and trust scores
  5. `RewardToken.sol` - ERC20 token for incentives

## New Features in V2

### 🔐 Security Enhancements
- **Upgradeable contracts** using UUPS pattern
- **Rate limiting** to prevent spam (1 hour cooldown)
- **Account age verification** (1 day minimum)
- **Pausable** for emergency situations
- **Role-based access control** with granular permissions
- **Reentrancy guards** on all sensitive functions

### 👤 User Profiles
- **On-chain usernames** with uniqueness guarantee
- **Profile customization** (bio, avatar, social links)
- **Username change** with 30-day cooldown
- **Verification badges** (ENS, Lens, WorldID)
- **Registration fee** (0.001 ETH) for Sybil resistance

### 🎮 Gamification
- **Points system**:
  - 100 points per review
  - 20 points per rating star
  - 50 points per photo
  - 10 points per upvote received
  - 25 points daily check-in
- **NFT Badges** (7 launch badges):
  - First Review
  - Consistent Reviewer (5 reviews)
  - Photo Expert (10 photos)
  - Week Warrior (7-day streak)
  - Popular Critic (50 upvotes)
  - Elite Reviewer (Level 10)
  - Pioneer (Early adopter)
- **Leaderboards**:
  - Global all-time
  - Weekly competitions
  - Monthly rankings
- **Streaks** with multiplier bonuses
- **Seasons** with reward pools

### ⚡ Enhanced Reviews
- **Multiple images** per review (up to 5)
- **Review editing** with version history
- **Voting system** (upvote/downvote)
- **Owner responses** with timestamps
- **Verified visits** for authenticity
- **Tags** for categorization (up to 10)
- **Review archiving** instead of deletion

### 🏆 Reputation System
- **Trust scores** (0-100 scale)
- **Weighted voting** based on reputation
- **Consensus tracking** for quality
- **Endorsement system** between users
- **Decay mechanism** for inactive users
- **External verification** bonuses

### 💰 Token Economics
- **YRW Token** (YelpReward):
  - 1 billion max supply
  - Review-to-earn rewards
  - Staking with APY (5-20%)
  - Vesting schedules
  - Halving mechanism
- **Reward Distribution**:
  - 40% Community rewards
  - 20% Staking rewards
  - 15% Liquidity
  - 15% Team (vested)
  - 10% Treasury

## Deployment Steps

### Prerequisites
```bash
# Install dependencies
npm install --save-dev @openzeppelin/contracts @openzeppelin/contracts-upgradeable
npm install --save-dev hardhat @nomiclabs/hardhat-ethers ethers

# Set up environment
cp .env.example .env
# Add your PRIVATE_KEY and INFURA_PROJECT_ID to .env
```

### 1. Deploy to Testnet (Sepolia)
```bash
# Compile contracts
npx hardhat compile

# Deploy V2 suite
npx hardhat run scripts/deploy-v2.js --network sepolia

# Output will show all contract addresses
# Save these addresses!
```

### 2. Verify Contracts
```bash
# Automatic verification (if configured)
npx hardhat verify --network sepolia <CONTRACT_ADDRESS>

# Or use the deployment script which auto-verifies
```

### 3. Update Frontend Configuration
Update `src/config/contractsV2.ts` with deployed addresses:
```typescript
export const V2_CONTRACTS = {
  SEPOLIA: {
    YelpReviewV2: {
      address: "0x...", // Your deployed address
      deployBlock: 12345678 // Deployment block
    },
    // ... other contracts
  }
};
```

### 4. Migrate Historical Data (Optional)
```javascript
// Run migration script to copy V1 reviews to V2
npx hardhat run scripts/migrate-reviews.js --network sepolia
```

## Frontend Integration

### 1. Update Contract Hooks
```typescript
// Before (V1)
import { CONTRACT_ADDRESS, CONTRACT_ABI } from './config/contract';

// After (V2)
import { getContractAddresses } from './config/contractsV2';
import YelpReviewV2ABI from './abis/YelpReviewV2.json';

const contracts = getContractAddresses(chainId);
const reviewContract = new ethers.Contract(
  contracts.YelpReviewV2.address,
  YelpReviewV2ABI,
  signer
);
```

### 2. Integrate New Features
```typescript
// Username system
const userProfile = new ethers.Contract(
  contracts.UserProfile.address,
  UserProfileABI,
  signer
);
await userProfile.createProfile(username, bio, avatarHash, {
  value: ethers.utils.parseEther("0.001")
});

// Gamification
const gameFi = new ethers.Contract(
  contracts.GameFi.address,
  GameFiABI,
  signer
);
const stats = await gameFi.getUserStats(address);

// Token rewards
const rewardToken = new ethers.Contract(
  contracts.RewardToken.address,
  RewardTokenABI,
  signer
);
await rewardToken.claimRewards();
```

### 3. Update Review Submission
```typescript
// V2 includes more parameters
await reviewContract.addReview(
  businessId,
  rating,
  comment,
  tags, // New: array of tags
  imageHashes // New: array of IPFS hashes
);
```

## Testing Guide

### Local Testing
```bash
# Start local blockchain
npx hardhat node

# Deploy locally
npx hardhat run scripts/deploy-v2.js --network localhost

# Run tests
npx hardhat test
```

### Testnet Testing Checklist
- [ ] Deploy all contracts
- [ ] Verify contract connections
- [ ] Test review submission
- [ ] Test username registration
- [ ] Test point accumulation
- [ ] Test badge earning
- [ ] Test token claiming
- [ ] Test voting system
- [ ] Test staking mechanism

## Gas Optimization

### Estimated Gas Costs (Sepolia)
- Review submission: ~200,000 gas
- Username registration: ~150,000 gas  
- Vote on review: ~80,000 gas
- Claim rewards: ~60,000 gas
- Stake tokens: ~120,000 gas

### Optimization Tips
1. Batch operations when possible
2. Use events instead of storage for logs
3. Pack struct variables efficiently
4. Minimize external calls

## Security Considerations

### Audit Checklist
- [x] Reentrancy protection
- [x] Integer overflow protection (Solidity 0.8+)
- [x] Access control on admin functions
- [x] Rate limiting mechanisms
- [x] Emergency pause functionality
- [x] Upgradeable proxy pattern
- [ ] External audit (recommended before mainnet)

### Best Practices
1. Never store sensitive data on-chain
2. Use OpenZeppelin's audited contracts
3. Implement timelocks for critical functions
4. Monitor events for suspicious activity
5. Have incident response plan ready

## Rollback Plan

If issues arise with V2:
1. Pause V2 contracts immediately
2. Frontend can switch back to V1 addresses
3. Investigate and fix issues
4. Re-deploy if necessary
5. Migrate again with lessons learned

## Support & Resources

- **Documentation**: `/docs/contracts/`
- **Test Coverage**: `npx hardhat coverage`
- **Gas Report**: `npx hardhat gas-reporter`
- **Contract Sizes**: `npx hardhat size-contracts`
- **Deployment Logs**: `/deployments/`

## FAQ

**Q: Will V1 reviews be migrated?**
A: Optional migration script provided, but V1 can run in parallel.

**Q: What happens to existing users?**
A: They'll need to register usernames in V2 but keep their addresses.

**Q: Can we upgrade V2 contracts later?**
A: Yes, V2 uses UUPS proxy pattern for upgradeability.

**Q: What about gas costs?**
A: V2 is more feature-rich so slightly higher gas, but optimized where possible.

**Q: Is V2 backwards compatible?**
A: No, V2 has different function signatures and data structures.

## Next Steps

1. **Deploy to Sepolia** and get contract addresses
2. **Update frontend** with V2 integration
3. **Test thoroughly** with team
4. **Community testing** phase
5. **Audit** (if planning mainnet)
6. **Mainnet deployment** (future)