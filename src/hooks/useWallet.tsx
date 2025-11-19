import { useState, useEffect, createContext, useContext, ReactNode } from 'react';
import { ethers } from 'ethers';
import { CONTRACT_ADDRESS, CONTRACT_ABI, SEPOLIA_CHAIN_ID } from '../config/contract';
import { UserRole } from '../types';
import toast from 'react-hot-toast';

interface WalletContextType {
  account: string | null;
  provider: ethers.BrowserProvider | null;
  signer: ethers.JsonRpcSigner | null;
  contract: ethers.Contract | null;
  userRole: UserRole;
  isConnecting: boolean;
  connectWallet: () => Promise<void>;
  disconnectWallet: () => void;
  switchToSepolia: () => Promise<void>;
}

const WalletContext = createContext<WalletContextType | null>(null);

export const WalletProvider = ({ children }: { children: ReactNode }) => {
  const [account, setAccount] = useState<string | null>(null);
  const [provider, setProvider] = useState<ethers.BrowserProvider | null>(null);
  const [signer, setSigner] = useState<ethers.JsonRpcSigner | null>(null);
  const [contract, setContract] = useState<ethers.Contract | null>(null);
  const [userRole, setUserRole] = useState<UserRole>('user');
  const [isConnecting, setIsConnecting] = useState(false);

  // Switch to Sepolia network
  const switchToSepolia = async () => {
    if (!window.ethereum) return;

    try {
      await window.ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: `0x${SEPOLIA_CHAIN_ID.toString(16)}` }],
      });
    } catch (error: any) {
      // Chain doesn't exist, add it
      if (error.code === 4902) {
        await window.ethereum.request({
          method: 'wallet_addEthereumChain',
          params: [
            {
              chainId: `0x${SEPOLIA_CHAIN_ID.toString(16)}`,
              chainName: 'Sepolia Testnet',
              nativeCurrency: {
                name: 'SepoliaETH',
                symbol: 'ETH',
                decimals: 18,
              },
              rpcUrls: ['https://sepolia.infura.io/v3/'],
              blockExplorerUrls: ['https://sepolia.etherscan.io'],
            },
          ],
        });
      }
    }
  };

  // Get user role from contract
  const getUserRole = async (address: string, contractInstance: ethers.Contract): Promise<UserRole> => {
    try {
      // Check if admin (contract owner)
      const owner = await contractInstance.owner();
      if (owner.toLowerCase() === address.toLowerCase()) {
        return 'admin';
      }

      // Check if moderator
      const isMod = await contractInstance.isModerator(address);
      if (isMod) {
        return 'moderator';
      }

      // Check if business owner (would need to check multiple businesses)
      // For now, this will be determined when selecting a business
      return 'user';
    } catch (error) {
      console.error('Error getting user role:', error);
      return 'user';
    }
  };

  // Connect wallet
  const connectWallet = async () => {
    if (!window.ethereum) {
      toast.error('Please install MetaMask or another Web3 wallet');
      return;
    }

    setIsConnecting(true);
    try {
      // Request accounts
      const accounts = await window.ethereum.request({ 
        method: 'eth_requestAccounts' 
      });
      
      if (accounts.length === 0) {
        throw new Error('No accounts found');
      }

      // Switch to Sepolia
      await switchToSepolia();

      // Set up provider and signer
      const browserProvider = new ethers.BrowserProvider(window.ethereum);
      const signer = await browserProvider.getSigner();
      
      // Create contract instance
      const contractInstance = new ethers.Contract(
        CONTRACT_ADDRESS,
        CONTRACT_ABI,
        signer
      );

      // Get user role
      const role = await getUserRole(accounts[0], contractInstance);

      setAccount(accounts[0]);
      setProvider(browserProvider);
      setSigner(signer);
      setContract(contractInstance);
      setUserRole(role);

      toast.success('Wallet connected successfully');
    } catch (error) {
      console.error('Error connecting wallet:', error);
      toast.error('Failed to connect wallet');
    } finally {
      setIsConnecting(false);
    }
  };

  // Disconnect wallet
  const disconnectWallet = () => {
    setAccount(null);
    setProvider(null);
    setSigner(null);
    setContract(null);
    setUserRole('user');
    toast.success('Wallet disconnected');
  };

  // Listen for account changes
  useEffect(() => {
    if (!window.ethereum) return;

    const handleAccountsChanged = (accounts: string[]) => {
      if (accounts.length === 0) {
        disconnectWallet();
      } else if (account && accounts[0] !== account) {
        connectWallet();
      }
    };

    const handleChainChanged = () => {
      window.location.reload();
    };

    window.ethereum.on('accountsChanged', handleAccountsChanged);
    window.ethereum.on('chainChanged', handleChainChanged);

    return () => {
      if (window.ethereum) {
        window.ethereum.removeListener('accountsChanged', handleAccountsChanged);
        window.ethereum.removeListener('chainChanged', handleChainChanged);
      }
    };
  }, [account]);

  return (
    <WalletContext.Provider value={{
      account,
      provider,
      signer,
      contract,
      userRole,
      isConnecting,
      connectWallet,
      disconnectWallet,
      switchToSepolia,
    }}>
      {children}
    </WalletContext.Provider>
  );
};

export const useWallet = () => {
  const context = useContext(WalletContext);
  if (!context) {
    throw new Error('useWallet must be used within a WalletProvider');
  }
  return context;
};