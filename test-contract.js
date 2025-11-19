const { ethers } = require('ethers');

// Contract configuration
const CONTRACT_ADDRESS = "0x3035dC76c25aF1dcbD5C0b52Ea1A892d2349a387";
const SEPOLIA_RPC = "https://rpc.sepolia.org";

// Minimal ABI for testing
const ABI = [
  "function owner() view returns (address)",
  "function getReviewers(bytes32) view returns (address[])",
  "function getBusinessOwner(bytes32) view returns (address)",
  "event ReviewAdded(bytes32 indexed businessId, address indexed reviewer, uint8 rating, string comment)",
  "event ReviewFlagged(bytes32 businessId, address reviewer)",
  "event ReviewArchived(bytes32 businessId, address reviewer)"
];

async function testContract() {
  console.log("Testing Smart Contract Endpoints...\n");
  
  try {
    // Connect to provider
    const provider = new ethers.JsonRpcProvider(SEPOLIA_RPC);
    console.log("✅ Connected to Sepolia network");
    
    // Get contract instance
    const contract = new ethers.Contract(CONTRACT_ADDRESS, ABI, provider);
    console.log("✅ Contract instance created");
    
    // Test 1: Get contract owner
    const owner = await contract.owner();
    console.log(`✅ Contract owner: ${owner}`);
    
    // Test 2: Generate a business ID
    const businessName = "Pizza Palace";
    const businessId = ethers.keccak256(ethers.toUtf8Bytes(businessName));
    console.log(`✅ Business ID for "${businessName}": ${businessId}`);
    
    // Test 3: Get reviewers for a business
    const reviewers = await contract.getReviewers(businessId);
    console.log(`✅ Number of reviewers for ${businessName}: ${reviewers.length}`);
    
    // Test 4: Get business owner
    const businessOwner = await contract.getBusinessOwner(businessId);
    const isUnset = businessOwner === ethers.ZeroAddress;
    console.log(`✅ Business owner: ${isUnset ? 'Not set' : businessOwner}`);
    
    // Test 5: Check block number
    const blockNumber = await provider.getBlockNumber();
    console.log(`✅ Current block number: ${blockNumber}`);
    
    // Test 6: Get network info
    const network = await provider.getNetwork();
    console.log(`✅ Network: ${network.name} (Chain ID: ${network.chainId})`);
    
    console.log("\n🎉 All contract endpoints are working correctly!");
    
  } catch (error) {
    console.error("❌ Error testing contract:", error.message);
  }
}

// Run the test
testContract();