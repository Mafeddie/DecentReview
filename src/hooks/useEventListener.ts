import { useEffect } from 'react';
import { useWallet } from './useWallet';
import toast from 'react-hot-toast';

export const useEventListener = (onReviewUpdate?: () => void) => {
  const { contract } = useWallet();

  useEffect(() => {
    if (!contract) return;

    // Event listeners
    const handleReviewAdded = (businessId: string, reviewer: string, rating: number, comment: string) => {
      toast.success(`New review added by ${reviewer.slice(0, 6)}...${reviewer.slice(-4)}`);
      onReviewUpdate?.();
    };

    const handleReviewFlagged = (businessId: string, reviewer: string) => {
      toast(`Review by ${reviewer.slice(0, 6)}...${reviewer.slice(-4)} has been flagged`);
      onReviewUpdate?.();
    };

    const handleReviewArchived = (businessId: string, reviewer: string) => {
      toast(`Review by ${reviewer.slice(0, 6)}...${reviewer.slice(-4)} has been archived`);
      onReviewUpdate?.();
    };

    const handleOwnerResponse = (businessId: string, reviewer: string, response: string) => {
      toast.success('Business owner has responded to a review');
      onReviewUpdate?.();
    };

    const handleBusinessOwnerSet = (businessId: string, owner: string) => {
      toast(`Business owner set to ${owner.slice(0, 6)}...${owner.slice(-4)}`);
    };

    // Attach listeners
    contract.on('ReviewAdded', handleReviewAdded);
    contract.on('ReviewFlagged', handleReviewFlagged);
    contract.on('ReviewArchived', handleReviewArchived);
    contract.on('OwnerResponseAdded', handleOwnerResponse);
    contract.on('BusinessOwnerSet', handleBusinessOwnerSet);

    // Cleanup
    return () => {
      contract.off('ReviewAdded', handleReviewAdded);
      contract.off('ReviewFlagged', handleReviewFlagged);
      contract.off('ReviewArchived', handleReviewArchived);
      contract.off('OwnerResponseAdded', handleOwnerResponse);
      contract.off('BusinessOwnerSet', handleBusinessOwnerSet);
    };
  }, [contract, onReviewUpdate]);
};