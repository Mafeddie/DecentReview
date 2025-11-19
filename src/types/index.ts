export interface Review {
  reviewer: string;
  timestamp: number;
  rating: number;
  comment: string;
  tags: string[];
  imageHash: string;
  isFlagged: boolean;
  isArchived: boolean;
  ownerResponse: string;
  hasOwnerResponse: boolean;
}

export interface Business {
  id: string;
  name: string;
  owner?: string;
}

export type UserRole = 'admin' | 'business_owner' | 'moderator' | 'user';

export interface TransactionStatus {
  type: 'pending' | 'success' | 'error';
  message: string;
  txHash?: string;
}