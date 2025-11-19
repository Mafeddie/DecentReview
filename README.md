# YelpReview dApp - Decentralized Review System

A fully-featured decentralized review application built on Ethereum's Sepolia testnet, providing transparent, immutable, and audit-friendly business reviews.

## Features

### Core Functionality
- **Decentralized Reviews**: All reviews stored permanently on-chain
- **Role-Based Access Control**: Admin, Business Owner, Moderator, and User roles
- **Business Management**: Select or create businesses, view and add reviews
- **Review System**: Rate businesses (1-5 stars), add comments, tags, and images via IPFS
- **Owner Responses**: Business owners can respond once to each review
- **Moderation**: Flag inappropriate content (moderators) and archive reviews (admins)
- **Soft Deletion**: Reviews are archived (not deleted) for audit compliance

### User Interface
- **Wallet Integration**: Connect via MetaMask or Web3 wallets
- **Real-time Updates**: Event listeners for instant feedback
- **Advanced Filtering**: Search by keywords, filter by tags, toggle archived reviews
- **Transaction Status**: Visual feedback for all blockchain interactions
- **Responsive Design**: Works on desktop and mobile devices

## Prerequisites

- Node.js v16+ and npm
- MetaMask or compatible Web3 wallet
- Sepolia testnet ETH for gas fees
- Access to Sepolia RPC endpoint

## Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd yelp-review-dapp
```

2. Install dependencies:
```bash
npm install
```

3. Configure the smart contract:
   - Edit `src/config/contract.ts`
   - Replace `CONTRACT_ADDRESS` with your deployed contract address
   - Ensure the ABI matches your deployed contract

4. Start the development server:
```bash
npm start
```

5. Open [http://localhost:3000](http://localhost:3000) in your browser

## Configuration

### Contract Configuration
Update `src/config/contract.ts`:
```typescript
export const CONTRACT_ADDRESS = "0xYourContractAddress";
export const SEPOLIA_CHAIN_ID = 11155111;
export const IPFS_GATEWAY = "https://ipfs.io/ipfs/";
```

### Environment Variables (Optional)
Create a `.env` file:
```
REACT_APP_CONTRACT_ADDRESS=0xYourContractAddress
REACT_APP_IPFS_API_KEY=your-ipfs-api-key
```

## Usage Guide

### For Regular Users
1. **Connect Wallet**: Click "Connect Wallet" and approve the connection
2. **Select Business**: Choose from existing businesses or add a new one
3. **Write Review**: 
   - Rate the business (1-5 stars)
   - Write a comment (max 1000 characters)
   - Add up to 5 tags (max 20 chars each)
   - Optionally upload an image
4. **View Reviews**: Browse all reviews, filter by tags or search keywords

### For Business Owners
1. **Claim Business**: Contact admin to assign ownership
2. **Respond to Reviews**: Click the response icon on any review
3. **Monitor Feedback**: View all reviews including archived ones

### For Moderators
1. **Flag Reviews**: Mark inappropriate content for visibility
2. **View All Content**: Toggle to see archived reviews
3. **Monitor Activity**: Track flagged reviews across businesses

### For Admins
1. **Assign Ownership**: Set business owners via Admin Panel
2. **Archive Reviews**: Remove inappropriate content (soft delete)
3. **Full Access**: View and manage all platform content

## Smart Contract Integration

### Key Functions
```solidity
// Add a review
addReview(businessId, rating, comment, tags[], imageHash)

// Business owner response
addOwnerResponse(businessId, reviewer, response)

// Moderation
flagReview(businessId, reviewer)  // Moderator/Admin
archiveReview(businessId, reviewer)  // Admin only

// Admin functions
setBusinessOwner(businessId, ownerAddress)
setModerator(address, status)
```

### Events
- `ReviewAdded`: New review submitted
- `ReviewFlagged`: Review marked as inappropriate
- `ReviewArchived`: Review soft-deleted
- `OwnerResponseAdded`: Business owner responded
- `BusinessOwnerSet`: Ownership assigned

## Technical Architecture

### Frontend Stack
- **React 18** with TypeScript
- **ethers.js v6** for blockchain interaction
- **Tailwind CSS** for styling
- **React Hot Toast** for notifications
- **Lucide React** for icons

### Smart Contract
- **Solidity ^0.8.0**
- **Role-based access control**
- **Input validation and sanitization**
- **Event emission for transparency**
- **Gas-optimized storage patterns**

### Data Storage
- **On-chain**: Reviews, ratings, responses, metadata
- **IPFS**: Images and large media files
- **Local State**: UI preferences, filters

## Security Considerations

1. **Input Validation**: All inputs validated client and contract-side
2. **Role Verification**: Strict role-based access control
3. **Reentrancy Protection**: Safe external calls pattern
4. **Rate Limiting**: One review per account per business
5. **Soft Deletion**: Maintains audit trail, no data destruction

## Development

### Available Scripts
```bash
npm start       # Start development server
npm test        # Run test suite
npm run build   # Build for production
npm run eject   # Eject from Create React App
```

### Project Structure
```
src/
├── components/     # React components
├── hooks/         # Custom React hooks
├── types/         # TypeScript definitions
├── config/        # Configuration files
└── App.tsx        # Main application
```

### Testing
```bash
# Run unit tests
npm test

# Run with coverage
npm test -- --coverage
```

## Deployment

1. Build the application:
```bash
npm run build
```

2. Deploy to hosting service:
   - Vercel: `vercel deploy`
   - Netlify: Drag build folder to Netlify
   - IPFS: Pin build folder to IPFS

3. Configure environment variables on hosting platform

## Troubleshooting

### Common Issues

**Wallet Connection Failed**
- Ensure MetaMask is installed and unlocked
- Check you're on Sepolia network
- Clear browser cache and reconnect

**Transaction Failures**
- Verify sufficient ETH for gas
- Check contract address is correct
- Ensure proper role permissions

**IPFS Upload Issues**
- Verify IPFS gateway is accessible
- Check file size limits (5MB max)
- Ensure proper CORS configuration

## Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open Pull Request

## License

This project is licensed under the MIT License - see LICENSE file for details.

## Support

For issues, questions, or suggestions:
- Open an issue on GitHub
- Contact the development team
- Check the FAQ section in the app

## Acknowledgments

- Built with Create React App
- Smart contract patterns from OpenZeppelin
- UI components inspired by modern Web3 applications
