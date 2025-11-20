// Deploy script for YelpReview V2 contract suite
const { ethers } = require("hardhat");
const fs = require("fs");

async function main() {
  console.log("Starting deployment of YelpReview V2 contract suite...");
  
  const [deployer] = await ethers.getSigners();
  console.log("Deploying with account:", deployer.address);
  console.log("Account balance:", (await deployer.getBalance()).toString());
  
  // Deploy order matters due to dependencies
  const deploymentOrder = [
    "RewardToken",
    "UserProfile", 
    "ReputationEngine",
    "GameFi",
    "YelpReviewV2"
  ];
  
  const deployedContracts = {};
  
  // 1. Deploy RewardToken
  console.log("\n1. Deploying RewardToken...");
  const RewardToken = await ethers.getContractFactory("RewardToken");
  const treasuryAddress = deployer.address; // Use deployer as treasury for now
  const liquidityAddress = deployer.address; // Use deployer as liquidity for now
  const rewardToken = await RewardToken.deploy(treasuryAddress, liquidityAddress);
  await rewardToken.deployed();
  deployedContracts.RewardToken = rewardToken.address;
  console.log("RewardToken deployed to:", rewardToken.address);
  
  // 2. Deploy UserProfile
  console.log("\n2. Deploying UserProfile...");
  const UserProfile = await ethers.getContractFactory("UserProfile");
  const userProfile = await UserProfile.deploy(deployer.address);
  await userProfile.deployed();
  deployedContracts.UserProfile = userProfile.address;
  console.log("UserProfile deployed to:", userProfile.address);
  
  // 3. Deploy ReputationEngine
  console.log("\n3. Deploying ReputationEngine...");
  const ReputationEngine = await ethers.getContractFactory("ReputationEngine");
  const reputationEngine = await ReputationEngine.deploy();
  await reputationEngine.deployed();
  deployedContracts.ReputationEngine = reputationEngine.address;
  console.log("ReputationEngine deployed to:", reputationEngine.address);
  
  // 4. Deploy GameFi
  console.log("\n4. Deploying GameFi...");
  const GameFi = await ethers.getContractFactory("GameFi");
  const gameFi = await GameFi.deploy();
  await gameFi.deployed();
  deployedContracts.GameFi = gameFi.address;
  console.log("GameFi deployed to:", gameFi.address);
  
  // 5. Deploy YelpReviewV2 (Main Contract)
  console.log("\n5. Deploying YelpReviewV2...");
  const YelpReviewV2 = await ethers.getContractFactory("YelpReviewV2");
  const yelpReviewV2 = await YelpReviewV2.deploy();
  await yelpReviewV2.deployed();
  
  // Initialize the upgradeable contract
  await yelpReviewV2.initialize(
    userProfile.address,
    gameFi.address,
    reputationEngine.address
  );
  
  deployedContracts.YelpReviewV2 = yelpReviewV2.address;
  console.log("YelpReviewV2 deployed to:", yelpReviewV2.address);
  
  // Configure contract interactions
  console.log("\n6. Configuring contract interactions...");
  
  // Set contracts in UserProfile
  await userProfile.setContracts(yelpReviewV2.address, gameFi.address);
  console.log("UserProfile contracts configured");
  
  // Set contracts in ReputationEngine
  await reputationEngine.setContracts(
    yelpReviewV2.address,
    gameFi.address,
    userProfile.address
  );
  console.log("ReputationEngine contracts configured");
  
  // Set contracts in GameFi
  await gameFi.setReviewContract(yelpReviewV2.address);
  console.log("GameFi contracts configured");
  
  // Set contracts in RewardToken
  await rewardToken.setContracts(yelpReviewV2.address, gameFi.address);
  console.log("RewardToken contracts configured");
  
  // Grant necessary roles
  console.log("\n7. Granting roles...");
  
  // Grant DISTRIBUTOR_ROLE to GameFi in RewardToken
  const DISTRIBUTOR_ROLE = await rewardToken.DISTRIBUTOR_ROLE();
  await rewardToken.grantRole(DISTRIBUTOR_ROLE, gameFi.address);
  console.log("Granted DISTRIBUTOR_ROLE to GameFi");
  
  // Grant UPDATER_ROLE to YelpReviewV2 in ReputationEngine
  const UPDATER_ROLE = await reputationEngine.UPDATER_ROLE();
  await reputationEngine.grantRole(UPDATER_ROLE, yelpReviewV2.address);
  console.log("Granted UPDATER_ROLE to YelpReviewV2");
  
  // Grant REVIEWER_CONTRACT_ROLE to YelpReviewV2 in GameFi
  const REVIEWER_CONTRACT_ROLE = await gameFi.REVIEWER_CONTRACT_ROLE();
  await gameFi.grantRole(REVIEWER_CONTRACT_ROLE, yelpReviewV2.address);
  console.log("Granted REVIEWER_CONTRACT_ROLE to YelpReviewV2");
  
  // Save deployment addresses
  const deploymentInfo = {
    network: (await ethers.provider.getNetwork()).name,
    chainId: (await ethers.provider.getNetwork()).chainId,
    deployer: deployer.address,
    timestamp: new Date().toISOString(),
    contracts: deployedContracts,
    configuration: {
      treasury: treasuryAddress,
      liquidity: liquidityAddress,
      minimumStakeAmount: ethers.utils.parseEther("0.01").toString(),
      rewardTokenSymbol: "YRW",
      rewardTokenName: "YelpReward"
    }
  };
  
  // Write to file
  fs.writeFileSync(
    "./deployments/v2-deployment.json",
    JSON.stringify(deploymentInfo, null, 2)
  );
  
  console.log("\n✅ Deployment complete!");
  console.log("Deployment info saved to ./deployments/v2-deployment.json");
  
  // Display summary
  console.log("\n📋 Deployment Summary:");
  console.log("========================");
  for (const [name, address] of Object.entries(deployedContracts)) {
    console.log(`${name}: ${address}`);
  }
  console.log("========================");
  
  // Verify contracts on Etherscan (if not on localhost)
  if (network.name !== "hardhat" && network.name !== "localhost") {
    console.log("\n🔍 Verifying contracts on Etherscan...");
    
    // Wait for block confirmations
    console.log("Waiting for block confirmations...");
    await new Promise(resolve => setTimeout(resolve, 30000)); // Wait 30 seconds
    
    try {
      // Verify each contract
      for (const [name, address] of Object.entries(deployedContracts)) {
        console.log(`Verifying ${name}...`);
        await run("verify:verify", {
          address: address,
          constructorArguments: getConstructorArgs(name, deployedContracts),
        });
      }
      console.log("✅ All contracts verified!");
    } catch (error) {
      console.log("❌ Verification failed:", error.message);
      console.log("You can verify manually using:");
      for (const [name, address] of Object.entries(deployedContracts)) {
        console.log(`npx hardhat verify --network ${network.name} ${address}`);
      }
    }
  }
}

function getConstructorArgs(contractName, deployedContracts) {
  switch (contractName) {
    case "RewardToken":
      return [deployer.address, deployer.address]; // treasury, liquidity
    case "UserProfile":
      return [deployer.address]; // initial owner
    case "ReputationEngine":
      return [];
    case "GameFi":
      return [];
    case "YelpReviewV2":
      return []; // Upgradeable proxy
    default:
      return [];
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });