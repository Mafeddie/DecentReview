export const CONTRACT_ADDRESS = "0x3035dC76c25aF1dcbD5C0b52Ea1A892d2349a387"; // Sepolia Testnet
export const SEPOLIA_CHAIN_ID = 11155111;
export const IPFS_GATEWAY = "https://ipfs.io/ipfs/";

export const CONTRACT_ABI = [
  {
    "inputs": [],
    "name": "ReviewArchived",
    "type": "error"
  },
  {
    "inputs": [],
    "name": "ReviewFlagged",
    "type": "error"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": false,
        "internalType": "bytes32",
        "name": "businessId",
        "type": "bytes32"
      },
      {
        "indexed": false,
        "internalType": "address",
        "name": "owner",
        "type": "address"
      }
    ],
    "name": "BusinessOwnerSet",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": false,
        "internalType": "bytes32",
        "name": "businessId",
        "type": "bytes32"
      },
      {
        "indexed": false,
        "internalType": "address",
        "name": "reviewer",
        "type": "address"
      },
      {
        "indexed": false,
        "internalType": "string",
        "name": "response",
        "type": "string"
      }
    ],
    "name": "OwnerResponseAdded",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "internalType": "bytes32",
        "name": "businessId",
        "type": "bytes32"
      },
      {
        "indexed": true,
        "internalType": "address",
        "name": "reviewer",
        "type": "address"
      },
      {
        "indexed": false,
        "internalType": "uint8",
        "name": "rating",
        "type": "uint8"
      },
      {
        "indexed": false,
        "internalType": "string",
        "name": "comment",
        "type": "string"
      }
    ],
    "name": "ReviewAdded",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": false,
        "internalType": "bytes32",
        "name": "businessId",
        "type": "bytes32"
      },
      {
        "indexed": false,
        "internalType": "address",
        "name": "reviewer",
        "type": "address"
      }
    ],
    "name": "ReviewArchived",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": false,
        "internalType": "bytes32",
        "name": "businessId",
        "type": "bytes32"
      },
      {
        "indexed": false,
        "internalType": "address",
        "name": "reviewer",
        "type": "address"
      }
    ],
    "name": "ReviewFlagged",
    "type": "event"
  },
  {
    "inputs": [
      {
        "internalType": "bytes32",
        "name": "businessId",
        "type": "bytes32"
      },
      {
        "internalType": "uint8",
        "name": "rating",
        "type": "uint8"
      },
      {
        "internalType": "string",
        "name": "comment",
        "type": "string"
      },
      {
        "internalType": "string[]",
        "name": "tags",
        "type": "string[]"
      },
      {
        "internalType": "string",
        "name": "imageHash",
        "type": "string"
      }
    ],
    "name": "addReview",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "bytes32",
        "name": "businessId",
        "type": "bytes32"
      },
      {
        "internalType": "address",
        "name": "reviewer",
        "type": "address"
      },
      {
        "internalType": "string",
        "name": "response",
        "type": "string"
      }
    ],
    "name": "addOwnerResponse",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "bytes32",
        "name": "businessId",
        "type": "bytes32"
      },
      {
        "internalType": "address",
        "name": "reviewer",
        "type": "address"
      }
    ],
    "name": "archiveReview",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "bytes32",
        "name": "businessId",
        "type": "bytes32"
      },
      {
        "internalType": "address",
        "name": "reviewer",
        "type": "address"
      }
    ],
    "name": "flagReview",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "bytes32",
        "name": "businessId",
        "type": "bytes32"
      }
    ],
    "name": "getBusinessOwner",
    "outputs": [
      {
        "internalType": "address",
        "name": "",
        "type": "address"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "bytes32",
        "name": "businessId",
        "type": "bytes32"
      },
      {
        "internalType": "address",
        "name": "reviewer",
        "type": "address"
      }
    ],
    "name": "getReview",
    "outputs": [
      {
        "components": [
          {
            "internalType": "address",
            "name": "reviewer",
            "type": "address"
          },
          {
            "internalType": "uint256",
            "name": "timestamp",
            "type": "uint256"
          },
          {
            "internalType": "uint8",
            "name": "rating",
            "type": "uint8"
          },
          {
            "internalType": "string",
            "name": "comment",
            "type": "string"
          },
          {
            "internalType": "string[]",
            "name": "tags",
            "type": "string[]"
          },
          {
            "internalType": "string",
            "name": "imageHash",
            "type": "string"
          },
          {
            "internalType": "bool",
            "name": "isFlagged",
            "type": "bool"
          },
          {
            "internalType": "bool",
            "name": "isArchived",
            "type": "bool"
          },
          {
            "internalType": "string",
            "name": "ownerResponse",
            "type": "string"
          },
          {
            "internalType": "bool",
            "name": "hasOwnerResponse",
            "type": "bool"
          }
        ],
        "internalType": "struct YelpReview.Review",
        "name": "",
        "type": "tuple"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "bytes32",
        "name": "businessId",
        "type": "bytes32"
      }
    ],
    "name": "getReviewers",
    "outputs": [
      {
        "internalType": "address[]",
        "name": "",
        "type": "address[]"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "account",
        "type": "address"
      }
    ],
    "name": "getUserRole",
    "outputs": [
      {
        "internalType": "string",
        "name": "",
        "type": "string"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "account",
        "type": "address"
      }
    ],
    "name": "isModerator",
    "outputs": [
      {
        "internalType": "bool",
        "name": "",
        "type": "bool"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "owner",
    "outputs": [
      {
        "internalType": "address",
        "name": "",
        "type": "address"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "bytes32",
        "name": "businessId",
        "type": "bytes32"
      },
      {
        "internalType": "address",
        "name": "businessOwner",
        "type": "address"
      }
    ],
    "name": "setBusinessOwner",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "moderator",
        "type": "address"
      },
      {
        "internalType": "bool",
        "name": "status",
        "type": "bool"
      }
    ],
    "name": "setModerator",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  }
];