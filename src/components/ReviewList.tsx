import React, { useState, useEffect } from 'react';
import { Review } from '../types';
import { useContract } from '../hooks/useContract';
import { useWallet } from '../hooks/useWallet';
import { useEventListener } from '../hooks/useEventListener';
import { ReviewCard } from './ReviewCard';
import { Eye, EyeOff } from 'lucide-react';

interface ReviewListProps {
  businessName: string;
}

export const ReviewList: React.FC<ReviewListProps> = ({ businessName }) => {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [filteredReviews, setFilteredReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(false);
  const [showArchived, setShowArchived] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTag, setSelectedTag] = useState('');
  const { getReviews, getBusinessOwner } = useContract();
  const { account, userRole } = useWallet();
  const [businessOwner, setBusinessOwner] = useState<string | null>(null);

  // Fetch reviews
  const fetchReviews = async () => {
    setLoading(true);
    try {
      const fetchedReviews = await getReviews(businessName);
      setReviews(fetchedReviews);
      
      // Get business owner
      const owner = await getBusinessOwner(businessName);
      setBusinessOwner(owner);
    } catch (error) {
      console.error('Error fetching reviews:', error);
    } finally {
      setLoading(false);
    }
  };

  // Listen for events and refresh
  useEventListener(fetchReviews);

  useEffect(() => {
    if (businessName) {
      fetchReviews();
    }
  }, [businessName]);

  // Filter reviews
  useEffect(() => {
    let filtered = [...reviews];

    // Filter archived reviews
    if (!showArchived) {
      filtered = filtered.filter(r => !r.isArchived);
    }

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(r => 
        r.comment.toLowerCase().includes(searchTerm.toLowerCase()) ||
        r.reviewer.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Tag filter
    if (selectedTag) {
      filtered = filtered.filter(r => r.tags.includes(selectedTag));
    }

    // Sort by timestamp (newest first)
    filtered.sort((a, b) => b.timestamp - a.timestamp);

    setFilteredReviews(filtered);
  }, [reviews, showArchived, searchTerm, selectedTag]);

  // Get all unique tags
  const allTags = [...new Set(reviews.flatMap(r => r.tags))];

  const activeCount = reviews.filter(r => !r.isArchived).length;
  const archivedCount = reviews.filter(r => r.isArchived).length;

  const canViewArchived = userRole === 'admin' || userRole === 'moderator' ||
    (businessOwner && account && businessOwner.toLowerCase() === account.toLowerCase());

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="space-y-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-32 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex justify-between items-center mb-4">
        <div>
          <h2 className="text-xl font-semibold">Reviews</h2>
          <p className="text-sm text-gray-500">
            {activeCount} active {archivedCount > 0 && `/ ${archivedCount} archived`}
          </p>
        </div>

        {canViewArchived && archivedCount > 0 && (
          <button
            onClick={() => setShowArchived(!showArchived)}
            className="flex items-center space-x-2 px-3 py-1 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
          >
            {showArchived ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            <span className="text-sm">{showArchived ? 'Hide' : 'Show'} Archived</span>
          </button>
        )}
      </div>

      {/* Filters */}
      <div className="mb-4 space-y-2">
        <div className="flex space-x-2">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search reviews..."
            className="flex-1 px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
          />
          
          {allTags.length > 0 && (
            <select
              value={selectedTag}
              onChange={(e) => setSelectedTag(e.target.value)}
              className="px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
            >
              <option value="">All Tags</option>
              {allTags.map(tag => (
                <option key={tag} value={tag}>{tag}</option>
              ))}
            </select>
          )}
        </div>
      </div>

      {/* Reviews */}
      {filteredReviews.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          {reviews.length === 0 ? 'No reviews yet. Be the first to review!' : 'No reviews match your filters.'}
        </div>
      ) : (
        <div className="space-y-4">
          {filteredReviews.map((review) => (
            <ReviewCard
              key={`${review.reviewer}-${review.timestamp}`}
              review={review}
              businessName={businessName}
              businessOwner={businessOwner}
              onUpdate={fetchReviews}
            />
          ))}
        </div>
      )}
    </div>
  );
};