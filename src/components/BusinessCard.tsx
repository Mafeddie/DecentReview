import React from 'react';
import { motion } from 'framer-motion';
import { BusinessDetails } from '../data/kenyanBusinesses';
import { 
  Star, MapPin, Clock, DollarSign, Phone, Globe, 
  MessageSquare, Award, TrendingUp, Users, Camera
} from 'lucide-react';

interface BusinessCardProps {
  business: BusinessDetails;
  onSelect: () => void;
  onWriteReview: () => void;
  index: number;
  averageRating?: number;
  reviewCount?: number;
}

export const BusinessCard: React.FC<BusinessCardProps> = ({ 
  business, 
  onSelect, 
  onWriteReview,
  index,
  averageRating = 4.2,
  reviewCount = Math.floor(Math.random() * 50) + 5
}) => {
  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      'Restaurant': 'from-orange-400 to-red-500',
      'Hotel': 'from-blue-400 to-indigo-500',
      'Cafe': 'from-yellow-400 to-orange-500',
      'Shopping': 'from-purple-400 to-pink-500',
      'Tourism': 'from-green-400 to-emerald-500',
      'Healthcare': 'from-cyan-400 to-blue-500',
      'Entertainment': 'from-pink-400 to-purple-500',
      'Technology': 'from-indigo-400 to-purple-500',
    };
    return colors[category] || 'from-gray-400 to-gray-600';
  };

  const getPriceSymbol = (range?: string) => {
    if (!range) return null;
    const levels = range.match(/\$/g)?.length || 1;
    return (
      <div className="flex items-center">
        {[...Array(4)].map((_, i) => (
          <span key={i} className={i < levels ? 'text-green-600' : 'text-gray-300'}>
            $
          </span>
        ))}
      </div>
    );
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      whileHover={{ y: -5, transition: { duration: 0.2 } }}
      className="bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden group"
    >
      {/* Image/Header Section */}
      <div className={`relative h-48 bg-gradient-to-br ${getCategoryColor(business.category)} overflow-hidden`}>
        {/* Animated Background Pattern */}
        <div className="absolute inset-0 opacity-20">
          <div className="absolute inset-0 bg-white/10 backdrop-blur-xl" />
          {[...Array(3)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-32 h-32 bg-white/10 rounded-full"
              animate={{
                x: [0, 100, 0],
                y: [0, -50, 0],
              }}
              transition={{
                duration: 10 + i * 2,
                repeat: Infinity,
                ease: "linear"
              }}
              style={{
                left: `${i * 30}%`,
                top: `${i * 20}%`
              }}
            />
          ))}
        </div>

        {/* Business Name Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
        
        <div className="absolute bottom-0 left-0 right-0 p-4 text-white">
          <h3 className="text-xl font-bold mb-1">{business.name}</h3>
          <div className="flex items-center space-x-3 text-sm">
            <span className="px-2 py-1 bg-white/20 backdrop-blur rounded-full">
              {business.category}
            </span>
            {(business as any).featured && (
              <span className="px-2 py-1 bg-yellow-400/80 text-yellow-900 rounded-full font-medium flex items-center">
                <Award className="w-3 h-3 mr-1" />
                Featured
              </span>
            )}
          </div>
        </div>

        {/* Review Count Badge */}
        <div className="absolute top-4 right-4 bg-white/90 backdrop-blur rounded-xl px-3 py-2 shadow-lg">
          <div className="flex items-center space-x-1">
            <Star className="w-4 h-4 text-yellow-500 fill-current" />
            <span className="font-bold text-gray-900">{averageRating}</span>
            <span className="text-gray-500 text-sm">({reviewCount})</span>
          </div>
        </div>
      </div>

      {/* Content Section */}
      <div className="p-5">
        {/* Description */}
        <p className="text-gray-600 mb-4 line-clamp-2">
          {business.description}
        </p>

        {/* Info Grid */}
        <div className="space-y-2 mb-4">
          <div className="flex items-center text-sm text-gray-600">
            <MapPin className="w-4 h-4 mr-2 text-purple-500" />
            <span>{business.location}, {business.city}</span>
          </div>
          
          {business.hours && (
            <div className="flex items-center text-sm text-gray-600">
              <Clock className="w-4 h-4 mr-2 text-blue-500" />
              <span>{business.hours}</span>
            </div>
          )}
          
          {business.priceRange && (
            <div className="flex items-center text-sm text-gray-600">
              <DollarSign className="w-4 h-4 mr-2 text-green-500" />
              {getPriceSymbol(business.priceRange)}
            </div>
          )}

          {business.phone && (
            <div className="flex items-center text-sm text-gray-600">
              <Phone className="w-4 h-4 mr-2 text-orange-500" />
              <span>{business.phone}</span>
            </div>
          )}
        </div>

        {/* Specialties */}
        {(business as any).specialties && (business as any).specialties.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-4">
            {(business as any).specialties.slice(0, 3).map((specialty: string, i: number) => (
              <span
                key={i}
                className="px-2 py-1 bg-purple-100 text-purple-700 rounded-full text-xs"
              >
                {specialty}
              </span>
            ))}
            {(business as any).specialties?.length > 3 && (
              <span className="px-2 py-1 bg-gray-100 text-gray-600 rounded-full text-xs">
                +{(business as any).specialties.length - 3} more
              </span>
            )}
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex space-x-2">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={onWriteReview}
            className="flex-1 px-4 py-2.5 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all flex items-center justify-center space-x-2"
          >
            <MessageSquare className="w-4 h-4" />
            <span>Write Review</span>
          </motion.button>
          
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={onSelect}
            className="px-4 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl font-semibold transition-all flex items-center justify-center"
          >
            <Users className="w-4 h-4" />
          </motion.button>
        </div>
      </div>

      {/* Hover Effect Gradient */}
      <div className="absolute inset-0 bg-gradient-to-t from-purple-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
    </motion.div>
  );
};