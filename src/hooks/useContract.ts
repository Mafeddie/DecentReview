import { useState, useCallback } from 'react';
import { ethers } from 'ethers';
import { useWallet } from './useWallet';
import { Review, TransactionStatus } from '../types';
import toast from 'react-hot-toast';

export const useContract = () => {
  const { contract, account } = useWallet();
  const [transactionStatus, setTransactionStatus] = useState<TransactionStatus | null>(null);

  // Generate businessId from business name
  const getBusinessId = (businessName: string): string => {
    return ethers.keccak256(ethers.toUtf8Bytes(businessName));
  };

  // Add review
  const addReview = useCallback(async (
    businessName: string,
    rating: number,
    comment: string,
    tags: string[],
    imageHash: string
  ) => {
    if (!contract || !account) {
      toast.error('Please connect your wallet');
      return;
    }

    // Validation
    if (rating < 1 || rating > 5) {
      toast.error('Rating must be between 1 and 5');
      return;
    }
    if (!comment.trim()) {
      toast.error('Comment cannot be empty');
      return;
    }
    if (tags.length > 5) {
      toast.error('Maximum 5 tags allowed');
      return;
    }
    if (tags.some(tag => tag.length > 20)) {
      toast.error('Tags must be 20 characters or less');
      return;
    }

    const businessId = getBusinessId(businessName);

    try {
      setTransactionStatus({ type: 'pending', message: 'Adding review...' });
      
      const tx = await contract.addReview(businessId, rating, comment, tags, imageHash);
      setTransactionStatus({ 
        type: 'pending', 
        message: 'Transaction submitted...', 
        txHash: tx.hash 
      });
      
      await tx.wait();
      
      setTransactionStatus({ 
        type: 'success', 
        message: 'Review added successfully!', 
        txHash: tx.hash 
      });
      toast.success('Review added successfully!');
      
      return tx.hash;
    } catch (error: any) {
      const errorMessage = error.reason || error.message || 'Failed to add review';
      setTransactionStatus({ type: 'error', message: errorMessage });
      toast.error(errorMessage);
      throw error;
    }
  }, [contract, account]);

  // Get reviews for a business
  const getReviews = useCallback(async (businessName: string): Promise<Review[]> => {
    if (!contract) return [];

    const businessId = getBusinessId(businessName);

    try {
      const reviewers = await contract.getReviewers(businessId);
      const reviews: Review[] = [];

      for (const reviewer of reviewers) {
        const review = await contract.getReview(businessId, reviewer);
        reviews.push({
          reviewer: review.reviewer,
          timestamp: Number(review.timestamp),
          rating: Number(review.rating),
          comment: review.comment,
          tags: review.tags,
          imageHash: review.imageHash,
          isFlagged: review.isFlagged,
          isArchived: review.isArchived,
          ownerResponse: review.ownerResponse,
          hasOwnerResponse: review.hasOwnerResponse,
        });
      }

      return reviews;
    } catch (error) {
      console.error('Error fetching reviews:', error);
      return [];
    }
  }, [contract]);

  // Add owner response
  const addOwnerResponse = useCallback(async (
    businessName: string,
    reviewer: string,
    response: string
  ) => {
    if (!contract || !account) {
      toast.error('Please connect your wallet');
      return;
    }

    if (!response.trim()) {
      toast.error('Response cannot be empty');
      return;
    }

    const businessId = getBusinessId(businessName);

    try {
      setTransactionStatus({ type: 'pending', message: 'Adding response...' });
      
      const tx = await contract.addOwnerResponse(businessId, reviewer, response);
      setTransactionStatus({ 
        type: 'pending', 
        message: 'Transaction submitted...', 
        txHash: tx.hash 
      });
      
      await tx.wait();
      
      setTransactionStatus({ 
        type: 'success', 
        message: 'Response added successfully!', 
        txHash: tx.hash 
      });
      toast.success('Response added successfully!');
      
      return tx.hash;
    } catch (error: any) {
      const errorMessage = error.reason || error.message || 'Failed to add response';
      setTransactionStatus({ type: 'error', message: errorMessage });
      toast.error(errorMessage);
      throw error;
    }
  }, [contract, account]);

  // Flag review
  const flagReview = useCallback(async (businessName: string, reviewer: string) => {
    if (!contract || !account) {
      toast.error('Please connect your wallet');
      return;
    }

    const businessId = getBusinessId(businessName);

    try {
      setTransactionStatus({ type: 'pending', message: 'Flagging review...' });
      
      const tx = await contract.flagReview(businessId, reviewer);
      setTransactionStatus({ 
        type: 'pending', 
        message: 'Transaction submitted...', 
        txHash: tx.hash 
      });
      
      await tx.wait();
      
      setTransactionStatus({ 
        type: 'success', 
        message: 'Review flagged successfully!', 
        txHash: tx.hash 
      });
      toast.success('Review flagged successfully!');
      
      return tx.hash;
    } catch (error: any) {
      const errorMessage = error.reason || error.message || 'Failed to flag review';
      setTransactionStatus({ type: 'error', message: errorMessage });
      toast.error(errorMessage);
      throw error;
    }
  }, [contract, account]);

  // Archive review
  const archiveReview = useCallback(async (businessName: string, reviewer: string) => {
    if (!contract || !account) {
      toast.error('Please connect your wallet');
      return;
    }

    const businessId = getBusinessId(businessName);

    try {
      setTransactionStatus({ type: 'pending', message: 'Archiving review...' });
      
      const tx = await contract.archiveReview(businessId, reviewer);
      setTransactionStatus({ 
        type: 'pending', 
        message: 'Transaction submitted...', 
        txHash: tx.hash 
      });
      
      await tx.wait();
      
      setTransactionStatus({ 
        type: 'success', 
        message: 'Review archived successfully!', 
        txHash: tx.hash 
      });
      toast.success('Review archived successfully!');
      
      return tx.hash;
    } catch (error: any) {
      const errorMessage = error.reason || error.message || 'Failed to archive review';
      setTransactionStatus({ type: 'error', message: errorMessage });
      toast.error(errorMessage);
      throw error;
    }
  }, [contract, account]);

  // Get business owner
  const getBusinessOwner = useCallback(async (businessName: string): Promise<string | null> => {
    if (!contract) return null;

    const businessId = getBusinessId(businessName);

    try {
      const owner = await contract.getBusinessOwner(businessId);
      return owner === ethers.ZeroAddress ? null : owner;
    } catch (error) {
      console.error('Error fetching business owner:', error);
      return null;
    }
  }, [contract]);

  // Set business owner (admin only)
  const setBusinessOwner = useCallback(async (businessName: string, ownerAddress: string) => {
    if (!contract || !account) {
      toast.error('Please connect your wallet');
      return;
    }

    const businessId = getBusinessId(businessName);

    try {
      setTransactionStatus({ type: 'pending', message: 'Setting business owner...' });
      
      const tx = await contract.setBusinessOwner(businessId, ownerAddress);
      setTransactionStatus({ 
        type: 'pending', 
        message: 'Transaction submitted...', 
        txHash: tx.hash 
      });
      
      await tx.wait();
      
      setTransactionStatus({ 
        type: 'success', 
        message: 'Business owner set successfully!', 
        txHash: tx.hash 
      });
      toast.success('Business owner set successfully!');
      
      return tx.hash;
    } catch (error: any) {
      const errorMessage = error.reason || error.message || 'Failed to set business owner';
      setTransactionStatus({ type: 'error', message: errorMessage });
      toast.error(errorMessage);
      throw error;
    }
  }, [contract, account]);

  return {
    getBusinessId,
    addReview,
    getReviews,
    addOwnerResponse,
    flagReview,
    archiveReview,
    getBusinessOwner,
    setBusinessOwner,
    transactionStatus,
  };
};