import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useContract } from '../hooks/useContract';
import { useWallet } from '../hooks/useWallet';
import { 
  Star, Upload, X, Plus, Sparkles, Heart, Camera, 
  Award, MessageSquare, Hash, Image as ImageIcon,
  CheckCircle, AlertCircle, Zap, Gift, Shield
} from 'lucide-react';
import toast from 'react-hot-toast';

interface AddReviewModernProps {
  businessName: string;
  onReviewAdded: () => void;
  isInModal?: boolean;
}

const EMOJI_REACTIONS = [
  { emoji: '😍', label: 'Love it!' },
  { emoji: '😊', label: 'Great' },
  { emoji: '😐', label: 'Okay' },
  { emoji: '😕', label: 'Not great' },
  { emoji: '😢', label: 'Disappointed' }
];

const QUICK_TAGS = [
  { tag: 'great service', icon: '👏' },
  { tag: 'value for money', icon: '💰' },
  { tag: 'quick service', icon: '⚡' },
  { tag: 'clean', icon: '✨' },
  { tag: 'friendly staff', icon: '😊' },
  { tag: 'recommended', icon: '👍' },
  { tag: 'family friendly', icon: '👨‍👩‍👧‍👦' },
  { tag: 'instagram worthy', icon: '📸' }
];

const MOTIVATIONAL_MESSAGES = [
  "Your review helps build trust in the community! 🌟",
  "Be the change you want to see in reviews! ✨",
  "Your honest feedback makes businesses better! 🚀",
  "Help others discover amazing experiences! 🎯",
  "Your voice matters on the blockchain! 💪"
];

export const AddReviewModern: React.FC<AddReviewModernProps> = ({ businessName, onReviewAdded, isInModal = false }) => {
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [selectedEmoji, setSelectedEmoji] = useState<string | null>(null);
  const [comment, setComment] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState('');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [hasExistingReview, setHasExistingReview] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [characterCount, setCharacterCount] = useState(0);
  const [motivationalMessage] = useState(
    MOTIVATIONAL_MESSAGES[Math.floor(Math.random() * MOTIVATIONAL_MESSAGES.length)]
  );
  
  const { addReview, getReviews } = useContract();
  const { account } = useWallet();

  useEffect(() => {
    checkExistingReview();
  }, [businessName, account]);

  useEffect(() => {
    setCharacterCount(comment.length);
  }, [comment]);

  const checkExistingReview = async () => {
    if (!account || !businessName) return;
    
    const reviews = await getReviews(businessName);
    const userReview = reviews.find(r => 
      r.reviewer.toLowerCase() === account.toLowerCase()
    );
    setHasExistingReview(!!userReview);
  };

  const handleRatingClick = (value: number) => {
    setRating(value);
    setSelectedEmoji(EMOJI_REACTIONS[5 - value]?.emoji || '😊');
  };

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

  const uploadToIPFS = async (file: File): Promise<string> => {
    console.log('Uploading file to IPFS:', file.name);
    return 'QmXoypizjW3WknFiJnKLwHCnL72vedxjQkDDP1mXWo6uco';
  };

  const addTag = (tag: string) => {
    const trimmedTag = tag.trim();
    
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

  const removeTag = (index: number) => {
    setTags(tags.filter((_, i) => i !== index));
  };

  const handleQuickTag = (tag: string) => {
    if (!tags.includes(tag) && tags.length < 5) {
      setTags([...tags, tag]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (rating < 1 || rating > 5) {
      toast.error('Please select a rating');
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
      let imageHash = '';
      if (imageFile) {
        imageHash = await uploadToIPFS(imageFile);
      }
      
      await addReview(businessName, rating, comment, tags, imageHash);
      
      setShowSuccess(true);
      setTimeout(() => {
        setRating(0);
        setComment('');
        setTags([]);
        setImageFile(null);
        setImagePreview(null);
        setSelectedEmoji(null);
        setShowSuccess(false);
        onReviewAdded();
        checkExistingReview();
      }, 3000);
      
    } catch (error) {
      console.error('Error submitting review:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const getProgressPercentage = () => {
    let progress = 0;
    if (rating > 0) progress += 25;
    if (comment.length > 10) progress += 25;
    if (tags.length > 0) progress += 25;
    if (imageFile) progress += 25;
    return progress;
  };

  if (hasExistingReview) {
    return (
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl p-6 border border-green-200"
      >
        <div className="flex items-center space-x-3">
          <CheckCircle className="w-8 h-8 text-green-600" />
          <div>
            <h3 className="font-semibold text-green-900">You've Already Reviewed This Business!</h3>
            <p className="text-green-700 text-sm mt-1">
              Thank you for contributing to the community. Each wallet can only review a business once.
            </p>
          </div>
        </div>
      </motion.div>
    );
  }

  if (!account) {
    return (
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-6 border border-blue-200"
      >
        <div className="flex items-center space-x-3">
          <AlertCircle className="w-8 h-8 text-blue-600" />
          <div>
            <h3 className="font-semibold text-blue-900">Connect Your Wallet to Review</h3>
            <p className="text-blue-700 text-sm mt-1">
              Join our community of trusted reviewers by connecting your wallet.
            </p>
          </div>
        </div>
      </motion.div>
    );
  }

  if (showSuccess) {
    return (
      <motion.div 
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="bg-gradient-to-br from-green-400 to-emerald-500 rounded-2xl p-8 text-white text-center shadow-2xl"
      >
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          className="inline-block mb-4"
        >
          <Sparkles className="w-16 h-16" />
        </motion.div>
        <h3 className="text-2xl font-bold mb-2">Review Submitted Successfully! 🎉</h3>
        <p className="text-white/90">Your review is now permanently on the blockchain</p>
        <div className="mt-4 flex justify-center space-x-2">
          <Award className="w-5 h-5" />
          <span className="text-sm">You've earned community trust points!</span>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-gradient-to-br from-white via-purple-50/30 to-pink-50/30 rounded-2xl shadow-xl border border-purple-100 overflow-hidden"
    >
      {/* Header with motivation */}
      <div className="bg-gradient-to-r from-purple-600 to-pink-600 p-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold flex items-center">
              <MessageSquare className="w-7 h-7 mr-2" />
              Share Your Experience
            </h2>
            <p className="text-white/90 text-sm mt-1">{motivationalMessage}</p>
          </div>
          <div className="text-right">
            <div className="text-3xl">{selectedEmoji || '✍️'}</div>
          </div>
        </div>

        {/* Progress bar */}
        <div className="mt-4">
          <div className="flex justify-between text-xs text-white/80 mb-1">
            <span>Review Completeness</span>
            <span>{getProgressPercentage()}%</span>
          </div>
          <div className="w-full bg-white/20 rounded-full h-2">
            <motion.div 
              className="bg-white rounded-full h-2"
              initial={{ width: 0 }}
              animate={{ width: `${getProgressPercentage()}%` }}
              transition={{ duration: 0.3 }}
            />
          </div>
        </div>
      </div>
      
      <form onSubmit={handleSubmit} className="p-6 space-y-6">
        {/* Rating Section */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-purple-100">
          <label className="block text-lg font-semibold text-gray-800 mb-4 flex items-center">
            <Zap className="w-5 h-5 mr-2 text-yellow-500" />
            How was your experience?
          </label>
          <div className="flex justify-center space-x-3 mb-4">
            {[1, 2, 3, 4, 5].map((star) => (
              <motion.button
                key={star}
                type="button"
                whileHover={{ scale: 1.2 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => handleRatingClick(star)}
                onMouseEnter={() => setHoverRating(star)}
                onMouseLeave={() => setHoverRating(0)}
                className="focus:outline-none"
              >
                <Star
                  className={`w-12 h-12 transition-all ${
                    star <= (hoverRating || rating)
                      ? 'fill-yellow-400 text-yellow-400 drop-shadow-lg'
                      : 'text-gray-300'
                  }`}
                />
              </motion.button>
            ))}
          </div>
          
          {/* Emoji reactions */}
          <div className="flex justify-center space-x-4">
            {EMOJI_REACTIONS.map((reaction, index) => (
              <motion.button
                key={index}
                type="button"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => handleRatingClick(5 - index)}
                className={`flex flex-col items-center p-2 rounded-lg transition-all ${
                  rating === 5 - index ? 'bg-purple-100' : 'hover:bg-gray-50'
                }`}
              >
                <span className="text-2xl mb-1">{reaction.emoji}</span>
                <span className="text-xs text-gray-600">{reaction.label}</span>
              </motion.button>
            ))}
          </div>
        </div>

        {/* Comment Section */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-purple-100">
          <label className="block text-lg font-semibold text-gray-800 mb-4 flex items-center justify-between">
            <span className="flex items-center">
              <Heart className="w-5 h-5 mr-2 text-pink-500" />
              Tell us more
            </span>
            <span className={`text-sm font-normal ${
              characterCount > 900 ? 'text-red-500' : 'text-gray-500'
            }`}>
              {characterCount}/1000
            </span>
          </label>
          <textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            rows={5}
            maxLength={1000}
            placeholder="What made your visit special? Share details about the food, service, ambiance..."
            className="w-full px-4 py-3 border-2 border-purple-100 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none transition-all"
            required
          />
          
          {comment.length > 50 && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="mt-2 flex items-center text-sm text-green-600"
            >
              <CheckCircle className="w-4 h-4 mr-1" />
              Great detail! Your review will help others.
            </motion.div>
          )}
        </div>

        {/* Tags Section */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-purple-100">
          <label className="block text-lg font-semibold text-gray-800 mb-4 flex items-center">
            <Hash className="w-5 h-5 mr-2 text-blue-500" />
            Add Tags
            <span className="ml-2 text-sm font-normal text-gray-500">
              ({tags.length}/5)
            </span>
          </label>
          
          {/* Current tags */}
          <AnimatePresence>
            {tags.length > 0 && (
              <motion.div 
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="flex flex-wrap gap-2 mb-4"
              >
                {tags.map((tag, index) => (
                  <motion.span
                    key={index}
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    exit={{ scale: 0 }}
                    className="px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-full flex items-center space-x-2 shadow-md"
                  >
                    <span>{tag}</span>
                    <button
                      type="button"
                      onClick={() => removeTag(index)}
                      className="hover:bg-white/20 rounded-full p-0.5 transition-colors"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </motion.span>
                ))}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Quick tags */}
          <div className="mb-4">
            <p className="text-sm text-gray-600 mb-2">Quick add:</p>
            <div className="flex flex-wrap gap-2">
              {QUICK_TAGS.map((quickTag, index) => (
                <motion.button
                  key={index}
                  type="button"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => handleQuickTag(quickTag.tag)}
                  disabled={tags.includes(quickTag.tag) || tags.length >= 5}
                  className={`px-3 py-1.5 rounded-full text-sm transition-all ${
                    tags.includes(quickTag.tag)
                      ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                      : 'bg-purple-50 hover:bg-purple-100 text-purple-700 border border-purple-200'
                  }`}
                >
                  <span className="mr-1">{quickTag.icon}</span>
                  {quickTag.tag}
                </motion.button>
              ))}
            </div>
          </div>

          {/* Custom tag input */}
          {tags.length < 5 && (
            <div className="flex space-x-2">
              <input
                type="text"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag(tagInput))}
                maxLength={20}
                placeholder="Add custom tag..."
                className="flex-1 px-4 py-2 border-2 border-purple-100 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
              <motion.button
                type="button"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => addTag(tagInput)}
                className="px-4 py-2 bg-purple-600 text-white rounded-xl hover:bg-purple-700 transition-colors"
              >
                <Plus className="w-5 h-5" />
              </motion.button>
            </div>
          )}
        </div>

        {/* Image Upload */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-purple-100">
          <label className="block text-lg font-semibold text-gray-800 mb-4 flex items-center">
            <Camera className="w-5 h-5 mr-2 text-indigo-500" />
            Add Photo
            <span className="ml-2 text-sm font-normal text-gray-500">
              (Optional but helpful!)
            </span>
          </label>
          
          {!imagePreview ? (
            <motion.label 
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="flex flex-col items-center justify-center w-full h-40 border-2 border-dashed border-purple-300 rounded-xl cursor-pointer bg-gradient-to-br from-purple-50 to-pink-50 hover:from-purple-100 hover:to-pink-100 transition-all"
            >
              <Upload className="w-10 h-10 text-purple-500 mb-3" />
              <span className="text-sm text-gray-700 font-medium">Click to upload image</span>
              <span className="text-xs text-gray-500 mt-1">Max 5MB • JPG, PNG</span>
              <input
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className="hidden"
              />
            </motion.label>
          ) : (
            <div className="relative group">
              <img
                src={imagePreview}
                alt="Preview"
                className="w-full h-48 object-cover rounded-xl shadow-lg"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent rounded-xl opacity-0 group-hover:opacity-100 transition-opacity" />
              <motion.button
                type="button"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => {
                  setImageFile(null);
                  setImagePreview(null);
                }}
                className="absolute top-3 right-3 p-2 bg-red-500 text-white rounded-full hover:bg-red-600 shadow-lg"
              >
                <X className="w-5 h-5" />
              </motion.button>
              <div className="absolute bottom-3 left-3 flex items-center text-white">
                <ImageIcon className="w-5 h-5 mr-2" />
                <span className="text-sm font-medium">Photo added!</span>
              </div>
            </div>
          )}
        </div>

        {/* Submit Button */}
        <motion.button
          type="submit"
          disabled={isSubmitting || rating === 0 || !comment.trim()}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className={`w-full py-4 rounded-xl font-bold text-lg transition-all shadow-lg flex items-center justify-center space-x-3 ${
            isSubmitting || rating === 0 || !comment.trim()
              ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
              : 'bg-gradient-to-r from-purple-600 to-pink-600 text-white hover:from-purple-700 hover:to-pink-700'
          }`}
        >
          {isSubmitting ? (
            <>
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white" />
              <span>Submitting to Blockchain...</span>
            </>
          ) : (
            <>
              <Sparkles className="w-5 h-5" />
              <span>Submit Review</span>
              <Gift className="w-5 h-5" />
            </>
          )}
        </motion.button>

        {/* Trust Badge */}
        <div className="text-center">
          <div className="inline-flex items-center space-x-2 text-sm text-gray-600 bg-purple-50 px-4 py-2 rounded-full">
            <Shield className="w-4 h-4 text-purple-600" />
            <span>Secured by blockchain • Permanent & Transparent</span>
          </div>
        </div>
      </form>
    </motion.div>
  );
};