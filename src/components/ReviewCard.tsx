import React, { useState } from 'react';
import { Review } from '../types';
import { useContract } from '../hooks/useContract';
import { useWallet } from '../hooks/useWallet';
import { IPFS_GATEWAY } from '../config/contract';
import { 
  Star, Flag, Archive, MessageCircle, User, Calendar, 
  Image as ImageIcon, AlertCircle, CheckCircle, Briefcase
} from 'lucide-react';

interface ReviewCardProps {
  review: Review;
  businessName: string;
  businessOwner: string | null;
  onUpdate: () => void;
}

export const ReviewCard: React.FC<ReviewCardProps> = ({
  review,
  businessName,
  businessOwner,
  onUpdate,
}) => {
  const [showResponse, setShowResponse] = useState(false);
  const [responseText, setResponseText] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { addOwnerResponse, flagReview, archiveReview } = useContract();
  const { account, userRole } = useWallet();

  const isBusinessOwner = businessOwner && account && 
    businessOwner.toLowerCase() === account.toLowerCase();
  const canFlag = (userRole === 'moderator' || userRole === 'admin') && 
    !review.isFlagged && !review.isArchived;
  const canArchive = userRole === 'admin' && !review.isArchived;
  const canRespond = isBusinessOwner && !review.hasOwnerResponse;

  const handleOwnerResponse = async () => {
    if (!responseText.trim()) return;
    
    setIsSubmitting(true);
    try {
      await addOwnerResponse(businessName, review.reviewer, responseText);
      setResponseText('');
      setShowResponse(false);
      onUpdate();
    } catch (error) {
      console.error('Error adding response:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleFlag = async () => {
    try {
      await flagReview(businessName, review.reviewer);
      onUpdate();
    } catch (error) {
      console.error('Error flagging review:', error);
    }
  };

  const handleArchive = async () => {
    if (window.confirm('Are you sure you want to archive this review?')) {
      try {
        await archiveReview(businessName, review.reviewer);
        onUpdate();
      } catch (error) {
        console.error('Error archiving review:', error);
      }
    }
  };

  const formatDate = (timestamp: number) => {
    return new Date(timestamp * 1000).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const renderStars = (rating: number) => {
    return Array(5).fill(0).map((_, i) => (
      <Star
        key={i}
        className={`w-4 h-4 ${i < rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`}
      />
    ));
  };

  return (
    <div className={`border rounded-lg p-4 ${review.isArchived ? 'bg-gray-50 opacity-75' : 'bg-white'}`}>
      {/* Status badges */}
      <div className="flex justify-between items-start mb-3">
        <div className="flex items-center space-x-2">
          {review.isFlagged && (
            <span className="px-2 py-1 bg-yellow-100 text-yellow-800 text-xs rounded-full flex items-center space-x-1">
              <AlertCircle className="w-3 h-3" />
              <span>Flagged</span>
            </span>
          )}
          {review.isArchived && (
            <span className="px-2 py-1 bg-gray-100 text-gray-800 text-xs rounded-full flex items-center space-x-1">
              <Archive className="w-3 h-3" />
              <span>Archived</span>
            </span>
          )}
          {review.hasOwnerResponse && (
            <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full flex items-center space-x-1">
              <CheckCircle className="w-3 h-3" />
              <span>Owner Responded</span>
            </span>
          )}
        </div>

        {/* Action buttons */}
        <div className="flex space-x-2">
          {canRespond && (
            <button
              onClick={() => setShowResponse(!showResponse)}
              className="p-1 hover:bg-gray-100 rounded transition-colors"
              title="Add Response"
            >
              <MessageCircle className="w-4 h-4 text-gray-600" />
            </button>
          )}
          {canFlag && (
            <button
              onClick={handleFlag}
              className="p-1 hover:bg-yellow-100 rounded transition-colors"
              title="Flag Review"
            >
              <Flag className="w-4 h-4 text-yellow-600" />
            </button>
          )}
          {canArchive && (
            <button
              onClick={handleArchive}
              className="p-1 hover:bg-red-100 rounded transition-colors"
              title="Archive Review"
            >
              <Archive className="w-4 h-4 text-red-600" />
            </button>
          )}
        </div>
      </div>

      {/* Review header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center space-x-3">
          <div className="flex items-center space-x-1">
            <User className="w-4 h-4 text-gray-400" />
            <span className="text-sm font-medium">
              {review.reviewer.slice(0, 6)}...{review.reviewer.slice(-4)}
            </span>
          </div>
          <div className="flex items-center space-x-1">
            <Calendar className="w-4 h-4 text-gray-400" />
            <span className="text-sm text-gray-500">{formatDate(review.timestamp)}</span>
          </div>
        </div>
        <div className="flex items-center">
          {renderStars(review.rating)}
        </div>
      </div>

      {/* Review content */}
      <p className="text-gray-800 mb-3">{review.comment}</p>

      {/* Tags */}
      {review.tags.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-3">
          {review.tags.map((tag, index) => (
            <span
              key={index}
              className="px-2 py-1 bg-blue-50 text-blue-700 text-xs rounded-full"
            >
              {tag}
            </span>
          ))}
        </div>
      )}

      {/* Image */}
      {review.imageHash && review.imageHash !== '' && (
        <div className="mb-3">
          <a
            href={`${IPFS_GATEWAY}${review.imageHash}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center space-x-2 text-blue-600 hover:underline"
          >
            <ImageIcon className="w-4 h-4" />
            <span className="text-sm">View attached image</span>
          </a>
        </div>
      )}

      {/* Owner response */}
      {review.hasOwnerResponse && review.ownerResponse && (
        <div className="mt-4 p-3 bg-blue-50 rounded-lg border-l-4 border-blue-400">
          <div className="flex items-center space-x-2 mb-2">
            <Briefcase className="w-4 h-4 text-blue-600" />
            <span className="text-sm font-semibold text-blue-900">Business Owner Response:</span>
          </div>
          <p className="text-sm text-gray-700">{review.ownerResponse}</p>
        </div>
      )}

      {/* Response form */}
      {showResponse && canRespond && (
        <div className="mt-4 p-3 bg-gray-50 rounded-lg">
          <div className="flex items-start space-x-2">
            <textarea
              value={responseText}
              onChange={(e) => setResponseText(e.target.value)}
              placeholder="Write your response..."
              className="flex-1 px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none resize-none"
              rows={3}
              disabled={isSubmitting}
            />
          </div>
          <div className="flex justify-end space-x-2 mt-2">
            <button
              onClick={() => {
                setShowResponse(false);
                setResponseText('');
              }}
              className="px-3 py-1 text-gray-600 hover:bg-gray-200 rounded transition-colors"
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button
              onClick={handleOwnerResponse}
              className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors disabled:opacity-50"
              disabled={isSubmitting || !responseText.trim()}
            >
              {isSubmitting ? 'Submitting...' : 'Submit Response'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};