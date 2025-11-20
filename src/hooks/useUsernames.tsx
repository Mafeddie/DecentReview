import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useWallet } from './useWallet';

interface UsernameData {
  address: string;
  username: string;
  avatar?: string;
  createdAt: number;
}

interface UsernameContextType {
  usernames: Map<string, UsernameData>;
  currentUsername: string | null;
  setUsername: (username: string) => void;
  getUserDisplay: (address: string) => string;
  checkUsernameAvailable: (username: string) => boolean;
}

const UsernameContext = createContext<UsernameContextType | undefined>(undefined);

// Mock initial usernames for demo
const INITIAL_USERNAMES: UsernameData[] = [
  { address: '0x742d...8c3f', username: 'CryptoExplorer', createdAt: Date.now() - 86400000 * 30 },
  { address: '0x9fa2...4e7b', username: 'NairobiReviewer', createdAt: Date.now() - 86400000 * 25 },
  { address: '0x3c8a...1d9e', username: 'SafariLover', createdAt: Date.now() - 86400000 * 20 },
  { address: '0xa5b6...7f2c', username: 'KenyaCoffee', createdAt: Date.now() - 86400000 * 15 },
  { address: '0x8e4d...3b6a', username: 'MasaiMara', createdAt: Date.now() - 86400000 * 10 },
  { address: '0x2f7c...9d4e', username: 'TechSavannah', createdAt: Date.now() - 86400000 * 8 },
  { address: '0x6b3a...2e8f', username: 'FoodieKenya', createdAt: Date.now() - 86400000 * 5 },
  { address: '0xd4e8...5c7b', username: 'BlockchainBoma', createdAt: Date.now() - 86400000 * 3 },
  { address: '0x1a9f...8b3d', username: 'UhuruPark', createdAt: Date.now() - 86400000 * 2 },
  { address: '0x7c2e...4f6a', username: 'MathareeValley', createdAt: Date.now() - 86400000 * 1 },
];

export const UsernameProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { account } = useWallet();
  const [usernames, setUsernames] = useState<Map<string, UsernameData>>(new Map());
  const [currentUsername, setCurrentUsername] = useState<string | null>(null);

  useEffect(() => {
    // Load usernames from localStorage
    const stored = localStorage.getItem('yelp_usernames');
    if (stored) {
      const parsed = JSON.parse(stored);
      setUsernames(new Map(Object.entries(parsed)));
    } else {
      // Initialize with mock data
      const initialMap = new Map<string, UsernameData>();
      INITIAL_USERNAMES.forEach(user => {
        initialMap.set(user.address.toLowerCase(), user);
      });
      setUsernames(initialMap);
      localStorage.setItem('yelp_usernames', JSON.stringify(Object.fromEntries(initialMap)));
    }
  }, []);

  useEffect(() => {
    // Load current user's username
    if (account) {
      const shortAddress = `${account.slice(0, 6).toLowerCase()}...${account.slice(-4).toLowerCase()}`;
      const userData = usernames.get(shortAddress);
      setCurrentUsername(userData?.username || null);
    }
  }, [account, usernames]);

  const setUsername = (username: string) => {
    if (!account) return;
    
    const shortAddress = `${account.slice(0, 6).toLowerCase()}...${account.slice(-4).toLowerCase()}`;
    const userData: UsernameData = {
      address: shortAddress,
      username,
      createdAt: Date.now()
    };
    
    const updated = new Map(usernames);
    updated.set(shortAddress, userData);
    setUsernames(updated);
    setCurrentUsername(username);
    
    // Save to localStorage
    localStorage.setItem('yelp_usernames', JSON.stringify(Object.fromEntries(updated)));
  };

  const getUserDisplay = (address: string): string => {
    const userData = usernames.get(address.toLowerCase());
    if (userData?.username) {
      return userData.username;
    }
    // Return shortened address as fallback
    if (address.includes('...')) {
      return address; // Already shortened
    }
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  const checkUsernameAvailable = (username: string): boolean => {
    const normalizedUsername = username.toLowerCase().trim();
    for (const userData of usernames.values()) {
      if (userData.username.toLowerCase() === normalizedUsername) {
        return false;
      }
    }
    return true;
  };

  return (
    <UsernameContext.Provider 
      value={{
        usernames,
        currentUsername,
        setUsername,
        getUserDisplay,
        checkUsernameAvailable
      }}
    >
      {children}
    </UsernameContext.Provider>
  );
};

export const useUsernames = () => {
  const context = useContext(UsernameContext);
  if (context === undefined) {
    throw new Error('useUsernames must be used within a UsernameProvider');
  }
  return context;
};