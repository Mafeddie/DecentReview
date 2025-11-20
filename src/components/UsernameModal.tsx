import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useUsernames } from '../hooks/useUsernames';
import { User, X, Check, AlertCircle, Sparkles, AtSign } from 'lucide-react';

interface UsernameModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const UsernameModal: React.FC<UsernameModalProps> = ({ isOpen, onClose }) => {
  const { setUsername, checkUsernameAvailable, currentUsername } = useUsernames();
  const [input, setInput] = useState(currentUsername || '');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const validateUsername = (username: string) => {
    if (username.length < 3) {
      return 'Username must be at least 3 characters';
    }
    if (username.length > 20) {
      return 'Username must be less than 20 characters';
    }
    if (!/^[a-zA-Z0-9_]+$/.test(username)) {
      return 'Username can only contain letters, numbers, and underscores';
    }
    if (!checkUsernameAvailable(username) && username !== currentUsername) {
      return 'Username already taken';
    }
    return '';
  };

  const handleSubmit = () => {
    const validationError = validateUsername(input);
    if (validationError) {
      setError(validationError);
      return;
    }

    setUsername(input);
    setSuccess(true);
    setTimeout(() => {
      onClose();
      setSuccess(false);
    }, 1500);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setInput(value);
    setError('');
    setSuccess(false);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="fixed inset-0 flex items-center justify-center z-50 pointer-events-none"
          >
            <div className="bg-gradient-to-br from-purple-50 via-pink-50 to-orange-50 rounded-3xl shadow-2xl p-8 max-w-md w-full mx-4 pointer-events-auto">
              {/* Header */}
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center space-x-3">
                  <motion.div
                    animate={{ rotate: [0, 360] }}
                    transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                  >
                    <div className="p-3 bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl">
                      <AtSign className="w-6 h-6 text-white" />
                    </div>
                  </motion.div>
                  <div>
                    <h2 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                      Set Your Username
                    </h2>
                    <p className="text-sm text-gray-600">Choose how you appear on the leaderboard</p>
                  </div>
                </div>
                <button
                  onClick={onClose}
                  className="p-2 hover:bg-white/50 rounded-xl transition-colors"
                >
                  <X className="w-5 h-5 text-gray-500" />
                </button>
              </div>

              {/* Input Section */}
              <div className="space-y-4">
                <div className="relative">
                  <input
                    type="text"
                    value={input}
                    onChange={handleInputChange}
                    placeholder="Enter username..."
                    className="w-full px-4 py-3 pr-12 bg-white border-2 border-purple-200 rounded-xl focus:border-purple-500 focus:outline-none transition-colors text-lg"
                    maxLength={20}
                  />
                  {success && (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="absolute right-3 top-1/2 -translate-y-1/2"
                    >
                      <div className="p-1 bg-green-500 rounded-full">
                        <Check className="w-4 h-4 text-white" />
                      </div>
                    </motion.div>
                  )}
                </div>

                {/* Character Count */}
                <div className="flex justify-between text-sm">
                  <span className={`${error ? 'text-red-500' : 'text-gray-500'}`}>
                    {error || 'Letters, numbers, and underscores only'}
                  </span>
                  <span className={`${input.length > 15 ? 'text-orange-500' : 'text-gray-500'}`}>
                    {input.length}/20
                  </span>
                </div>

                {/* Preview */}
                {input && !error && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="p-4 bg-white rounded-xl border border-purple-200"
                  >
                    <p className="text-sm text-gray-600 mb-2">Preview:</p>
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
                        <User className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <p className="font-bold text-lg bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                          @{input}
                        </p>
                        <p className="text-xs text-gray-500">Top Contributor</p>
                      </div>
                    </div>
                  </motion.div>
                )}

                {/* Suggestions */}
                {!currentUsername && !input && (
                  <div className="p-4 bg-purple-100 rounded-xl">
                    <p className="text-sm text-purple-700 mb-2 flex items-center">
                      <Sparkles className="w-4 h-4 mr-1" />
                      Suggestions:
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {['CryptoReviewer', 'BlockExplorer', 'Web3Critic', 'ChainReviewer'].map((suggestion) => (
                        <button
                          key={suggestion}
                          onClick={() => setInput(suggestion)}
                          className="px-3 py-1 bg-white text-purple-600 rounded-lg text-sm hover:bg-purple-50 transition-colors"
                        >
                          {suggestion}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex space-x-3 pt-4">
                  <button
                    onClick={onClose}
                    className="flex-1 px-4 py-3 bg-gray-200 text-gray-700 rounded-xl font-semibold hover:bg-gray-300 transition-colors"
                  >
                    Cancel
                  </button>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleSubmit}
                    disabled={!input || !!error}
                    className={`flex-1 px-4 py-3 rounded-xl font-semibold transition-all ${
                      success
                        ? 'bg-green-500 text-white'
                        : !input || error
                        ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                        : 'bg-gradient-to-r from-purple-600 to-pink-600 text-white hover:shadow-lg'
                    }`}
                  >
                    {success ? (
                      <span className="flex items-center justify-center">
                        <Check className="w-5 h-5 mr-2" />
                        Saved!
                      </span>
                    ) : (
                      'Set Username'
                    )}
                  </motion.button>
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};