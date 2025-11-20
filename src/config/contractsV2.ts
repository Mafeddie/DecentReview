// Configuration for V2 Smart Contract Suite
// These addresses will be updated after deployment

export const V2_CONTRACTS = {
  // Sepolia Testnet Configuration
  SEPOLIA: {
    YelpReviewV2: {
      address: "", // To be deployed
      deployBlock: 0
    },
    UserProfile: {
      address: "", // To be deployed
      deployBlock: 0
    },
    GameFi: {
      address: "", // To be deployed
      deployBlock: 0
    },
    ReputationEngine: {
      address: "", // To be deployed
      deployBlock: 0
    },
    RewardToken: {
      address: "", // To be deployed
      deployBlock: 0,
      symbol: "YRW",
      decimals: 18
    }
  },
  
  // Local Development
  LOCALHOST: {
    YelpReviewV2: {
      address: "", // Updated on local deployment
      deployBlock: 0
    },
    UserProfile: {
      address: "",
      deployBlock: 0
    },
    GameFi: {
      address: "",
      deployBlock: 0
    },
    ReputationEngine: {
      address: "",
      deployBlock: 0
    },
    RewardToken: {
      address: "",
      deployBlock: 0,
      symbol: "YRW",
      decimals: 18
    }
  }
};

// Chain configuration
export const SUPPORTED_CHAINS = {
  SEPOLIA: {
    id: 11155111,
    name: "Sepolia Testnet",
    rpcUrl: "https://sepolia.infura.io/v3/YOUR_INFURA_KEY",
    blockExplorer: "https://sepolia.etherscan.io",
    nativeCurrency: {
      name: "SepoliaETH",
      symbol: "ETH",
      decimals: 18
    }
  },
  LOCALHOST: {
    id: 31337,
    name: "Localhost",
    rpcUrl: "http://localhost:8545",
    blockExplorer: "",
    nativeCurrency: {
      name: "ETH",
      symbol: "ETH",
      decimals: 18
    }
  }
};

// Contract Features Configuration
export const CONTRACT_FEATURES = {
  // Review System
  review: {
    maxRating: 5,
    minRating: 1,
    maxCommentLength: 2000,
    maxTags: 10,
    maxImages: 5,
    cooldownPeriod: 3600, // 1 hour in seconds
    minAccountAge: 86400 // 1 day in seconds
  },
  
  // Gamification
  gamification: {
    pointsPerReview: 100,
    pointsPerRatingStar: 20,
    pointsPerUpvote: 10,
    pointsPerPhoto: 50,
    streakBonusMultiplier: 2,
    dailyCheckInPoints: 25,
    streakThreshold: 86400 // 1 day in seconds
  },
  
  // User Profile
  profile: {
    minUsernameLength: 3,
    maxUsernameLength: 20,
    maxBioLength: 500,
    usernameChangeCooldown: 2592000, // 30 days in seconds
    registrationFee: "0.001" // in ETH
  },
  
  // Reputation
  reputation: {
    baseVotingPower: 100,
    maxVotingPower: 1000,
    minReputation: 0,
    maxReputation: 10000,
    decayPeriod: 2592000, // 30 days in seconds
    verifiedUserBonus: 200
  },
  
  // Token Economics
  tokenomics: {
    maxSupply: "1000000000", // 1 billion tokens
    reviewReward: "100", // tokens
    qualityBonusMax: "50", // tokens
    photoReward: "25", // tokens
    upvoteReward: "5", // tokens
    dailyReward: "10", // tokens
    halvingInterval: 31536000 // 365 days in seconds
  },
  
  // Staking
  staking: {
    minLockDuration: 2592000, // 30 days
    maxLockDuration: 31536000, // 365 days
    minStakeAmount: "100", // tokens
    apy: {
      "30": 5, // 30 days: 5% APY
      "90": 10, // 90 days: 10% APY
      "180": 15, // 180 days: 15% APY
      "365": 20 // 365 days: 20% APY
    }
  }
};

// Badge Configuration
export const BADGES = [
  {
    id: 0,
    name: "First Review",
    description: "Complete your first review",
    imageUrl: "/badges/first-review.svg",
    pointsRequired: 100,
    reviewsRequired: 1,
    rarity: "COMMON"
  },
  {
    id: 1,
    name: "Consistent Reviewer",
    description: "5 reviews posted",
    imageUrl: "/badges/consistent-reviewer.svg",
    pointsRequired: 500,
    reviewsRequired: 5,
    rarity: "COMMON"
  },
  {
    id: 2,
    name: "Photo Expert",
    description: "Add 10 photos",
    imageUrl: "/badges/photo-expert.svg",
    pointsRequired: 500,
    reviewsRequired: 0,
    rarity: "RARE"
  },
  {
    id: 3,
    name: "Week Warrior",
    description: "7-day streak",
    imageUrl: "/badges/week-warrior.svg",
    pointsRequired: 1000,
    streakRequired: 7,
    rarity: "RARE"
  },
  {
    id: 4,
    name: "Popular Critic",
    description: "Receive 50 upvotes",
    imageUrl: "/badges/popular-critic.svg",
    pointsRequired: 500,
    rarity: "EPIC"
  },
  {
    id: 5,
    name: "Elite Reviewer",
    description: "Level 10 achieved",
    imageUrl: "/badges/elite-reviewer.svg",
    pointsRequired: 5000,
    reviewsRequired: 25,
    rarity: "LEGENDARY"
  },
  {
    id: 6,
    name: "Pioneer",
    description: "Early adopter",
    imageUrl: "/badges/pioneer.svg",
    pointsRequired: 100,
    reviewsRequired: 1,
    rarity: "LEGENDARY"
  }
];

// Helper function to get current network contracts
export const getContractAddresses = (chainId: number) => {
  switch (chainId) {
    case 11155111: // Sepolia
      return V2_CONTRACTS.SEPOLIA;
    case 31337: // Localhost
      return V2_CONTRACTS.LOCALHOST;
    default:
      throw new Error(`Unsupported chain ID: ${chainId}`);
  }
};

// Helper function to get chain config
export const getChainConfig = (chainId: number) => {
  switch (chainId) {
    case 11155111:
      return SUPPORTED_CHAINS.SEPOLIA;
    case 31337:
      return SUPPORTED_CHAINS.LOCALHOST;
    default:
      throw new Error(`Unsupported chain ID: ${chainId}`);
  }
};

// Export types for TypeScript
export interface ContractConfig {
  address: string;
  deployBlock: number;
}

export interface TokenConfig extends ContractConfig {
  symbol: string;
  decimals: number;
}

export interface ChainConfig {
  id: number;
  name: string;
  rpcUrl: string;
  blockExplorer: string;
  nativeCurrency: {
    name: string;
    symbol: string;
    decimals: number;
  };
}

export interface Badge {
  id: number;
  name: string;
  description: string;
  imageUrl: string;
  pointsRequired: number;
  reviewsRequired?: number;
  streakRequired?: number;
  rarity: "COMMON" | "RARE" | "EPIC" | "LEGENDARY";
}