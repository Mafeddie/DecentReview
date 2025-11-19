import React, { useState, useEffect } from 'react';
import { useContract } from '../hooks/useContract';
import { useWallet } from '../hooks/useWallet';
import { Upload, X, Plus, Star } from 'lucide-react';
import toast from 'react-hot-toast';

interface AddReviewProps {
  businessName: string;
  onReviewAdded: () => void;
}

export const AddReview: React.FC<AddReviewProps> = ({ businessName, onReviewAdded }) => {
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState('');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [hasExistingReview, setHasExistingReview] = useState(false);
  
  const { addReview, getReviews } = useContract();
  const { account } = useWallet();

  // Check if user already has a review
  useEffect(() => {
    checkExistingReview();
  }, [businessName, account]);

  const checkExistingReview = async () => {
    if (!account || !businessName) return;
    
    const reviews = await getReviews(businessName);
    const userReview = reviews.find(r => 
      r.reviewer.toLowerCase() === account.toLowerCase()
    );
    setHasExistingReview(!!userReview);
  };

  // Handle image upload
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error('Image size must be less than 5MB');
        return;
      }
      
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  // Upload to IPFS (using a mock for demo)
  const uploadToIPFS = async (file: File): Promise<string> => {
    // In production, you would upload to IPFS here
    // For demo, we'll return a mock CID
    console.log('Uploading file to IPFS:', file.name);
    return 'QmXoypizjW3WknFiJnKLwHCnL72vedxjQkDDP1mXWo6uco'; // Mock IPFS hash
  };

  // Add tag
  const addTag = () => {
    const trimmedTag = tagInput.trim();
    
    if (!trimmedTag) return;
    if (tags.length >= 5) {
      toast.error('Maximum 5 tags allowed');
      return;
    }
    if (trimmedTag.length > 20) {
      toast.error('Tag must be 20 characters or less');
      return;
    }
    if (tags.includes(trimmedTag)) {
      toast.error('Tag already added');
      return;
    }
    
    setTags([...tags, trimmedTag]);
    setTagInput('');
  };

  // Remove tag
  const removeTag = (index: number) => {
    setTags(tags.filter((_, i) => i !== index));
  };

  // Validate and submit
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation
    if (rating < 1 || rating > 5) {
      toast.error('Please select a rating between 1 and 5');
      return;
    }
    if (!comment.trim()) {
      toast.error('Please write a comment');
      return;
    }
    if (comment.length > 1000) {
      toast.error('Comment must be 1000 characters or less');
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      // Upload image to IPFS if provided
      let imageHash = '';
      if (imageFile) {
        imageHash = await uploadToIPFS(imageFile);
      }
      
      // Submit review
      await addReview(businessName, rating, comment, tags, imageHash);
      
      // Reset form
      setRating(0);
      setComment('');
      setTags([]);
      setImageFile(null);
      setImagePreview(null);
      
      onReviewAdded();
      checkExistingReview();
    } catch (error) {
      console.error('Error submitting review:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (hasExistingReview) {
    return (
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <p className="text-yellow-800">
          You have already submitted a review for this business. Only one review per account is allowed.
        </p>
      </div>
    );
  }

  if (!account) {
    return (
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <p className="text-blue-800">
          Please connect your wallet to submit a review.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h2 className="text-xl font-semibold mb-4">Write a Review</h2>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Rating */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Rating *
          </label>
          <div className="flex space-x-2">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                type="button"
                onClick={() => setRating(star)}
                onMouseEnter={() => setHoverRating(star)}
                onMouseLeave={() => setHoverRating(0)}
                className="focus:outline-none"
              >
                <Star
                  className={`w-8 h-8 transition-colors ${
                    star <= (hoverRating || rating)
                      ? 'fill-yellow-400 text-yellow-400'
                      : 'text-gray-300'
                  }`}
                />
              </button>
            ))}
          </div>
        </div>

        {/* Comment */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Comment * ({comment.length}/1000)
          </label>
          <textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            rows={4}
            maxLength={1000}
            placeholder="Share your experience..."
            className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none resize-none"
            required
          />
        </div>

        {/* Tags */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Tags (max 5)
          </label>
          <div className="flex flex-wrap gap-2 mb-2">
            {tags.map((tag, index) => (
              <span
                key={index}
                className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full flex items-center space-x-1"
              >
                <span>{tag}</span>
                <button
                  type="button"
                  onClick={() => removeTag(index)}
                  className="hover:text-blue-600"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            ))}
          </div>
          {tags.length < 5 && (
            <div className="flex space-x-2">
              <input
                type="text"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
                maxLength={20}
                placeholder="Add a tag..."
                className="flex-1 px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
              <button
                type="button"
                onClick={addTag}
                className="px-3 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
              >
                <Plus className="w-5 h-5" />
              </button>
            </div>
          )}
        </div>

        {/* Image Upload */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Attach Image (optional)
          </label>
          {!imagePreview ? (
            <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50">
              <Upload className="w-8 h-8 text-gray-400 mb-2" />
              <span className="text-sm text-gray-500">Click to upload image</span>
              <span className="text-xs text-gray-400">Max 5MB</span>
              <input
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className="hidden"
              />
            </label>
          ) : (
            <div className="relative">
              <img
                src={imagePreview}
                alt="Preview"
                className="w-full h-48 object-cover rounded-lg"
              />
              <button
                type="button"
                onClick={() => {
                  setImageFile(null);
                  setImagePreview(null);
                }}
                className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isSubmitting || rating === 0 || !comment.trim()}
          className="w-full py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSubmitting ? 'Submitting Review...' : 'Submit Review'}
        </button>
      </form>
    </div>
  );
};