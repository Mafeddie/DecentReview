import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AddReviewModern } from './AddReviewModern';
import { X, Star, MessageSquare, Sparkles } from 'lucide-react';

interface ReviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  businessName: string;
  onReviewAdded: () => void;
}

export const ReviewModal: React.FC<ReviewModalProps> = ({ 
  isOpen, 
  onClose, 
  businessName,
  onReviewAdded 
}) => {
  const handleReviewAdded = () => {
    onReviewAdded();
    setTimeout(() => {
      onClose();
    }, 1500);
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
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="fixed inset-0 flex items-center justify-center z-50 pointer-events-none p-4 overflow-y-auto"
          >
            <div className="bg-gradient-to-br from-white to-purple-50 rounded-3xl shadow-2xl max-w-3xl w-full pointer-events-auto my-8">
              {/* Modal Header */}
              <div className="bg-gradient-to-r from-purple-600 via-pink-600 to-orange-500 p-6 rounded-t-3xl">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <motion.div
                      animate={{ rotate: [0, 360] }}
                      transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                      className="p-3 bg-white/20 backdrop-blur rounded-xl"
                    >
                      <MessageSquare className="w-6 h-6 text-white" />
                    </motion.div>
                    <div className="text-white">
                      <h2 className="text-2xl font-bold flex items-center">
                        Share Your Experience
                        <Sparkles className="w-5 h-5 ml-2 text-yellow-300" />
                      </h2>
                      <p className="text-white/80">Reviewing: {businessName}</p>
                    </div>
                  </div>
                  <button
                    onClick={onClose}
                    className="p-2 hover:bg-white/20 rounded-xl transition-colors"
                  >
                    <X className="w-6 h-6 text-white" />
                  </button>
                </div>
              </div>

              {/* Modal Body */}
              <div className="p-6">
                <AddReviewModern 
                  businessName={businessName}
                  onReviewAdded={handleReviewAdded}
                  isInModal={true}
                />
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};