import React from 'react';
import { BusinessDetails } from '../data/kenyanBusinesses';
import { MapPin, Clock, Phone, Globe, DollarSign, Star } from 'lucide-react';

interface BusinessCardProps {
  business: BusinessDetails;
  isSelected: boolean;
  onClick: () => void;
  reviewCount?: number;
  averageRating?: number;
}

export const BusinessCard: React.FC<BusinessCardProps> = ({
  business,
  isSelected,
  onClick,
  reviewCount = 0,
  averageRating = 0
}) => {
  const renderStars = (rating: number) => {
    return Array(5).fill(0).map((_, i) => (
      <Star
        key={i}
        className={`w-4 h-4 ${i < Math.floor(rating) ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`}
      />
    ));
  };

  return (
    <div
      onClick={onClick}
      className={`border rounded-lg p-4 cursor-pointer transition-all hover:shadow-lg ${
        isSelected ? 'border-blue-500 bg-blue-50 shadow-md' : 'border-gray-200 hover:border-gray-300'
      }`}
    >
      {/* Header with business name and category */}
      <div className="flex justify-between items-start mb-3">
        <div className="flex-1">
          <h3 className="font-semibold text-lg text-gray-900">{business.name}</h3>
          <span className="inline-block px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full mt-1">
            {business.category}
          </span>
        </div>
        
        {/* Rating display */}
        {reviewCount > 0 && (
          <div className="text-right">
            <div className="flex items-center">
              {renderStars(averageRating)}
            </div>
            <p className="text-xs text-gray-500 mt-1">
              {averageRating.toFixed(1)} ({reviewCount} {reviewCount === 1 ? 'review' : 'reviews'})
            </p>
          </div>
        )}
      </div>

      {/* Business description */}
      <p className="text-sm text-gray-600 mb-3 line-clamp-2">
        {business.description}
      </p>

      {/* Business details */}
      <div className="space-y-1">
        <div className="flex items-center text-sm text-gray-500">
          <MapPin className="w-4 h-4 mr-2 flex-shrink-0" />
          <span className="truncate">{business.location}, {business.city}</span>
        </div>

        {business.hours && (
          <div className="flex items-center text-sm text-gray-500">
            <Clock className="w-4 h-4 mr-2 flex-shrink-0" />
            <span className="truncate">{business.hours}</span>
          </div>
        )}

        {business.priceRange && (
          <div className="flex items-center text-sm text-gray-500">
            <DollarSign className="w-4 h-4 mr-2 flex-shrink-0" />
            <span>{business.priceRange}</span>
          </div>
        )}

        {business.phone && (
          <div className="flex items-center text-sm text-gray-500">
            <Phone className="w-4 h-4 mr-2 flex-shrink-0" />
            <span>{business.phone}</span>
          </div>
        )}

        {business.website && (
          <div className="flex items-center text-sm text-gray-500">
            <Globe className="w-4 h-4 mr-2 flex-shrink-0" />
            <a 
              href={business.website} 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-blue-500 hover:underline truncate"
              onClick={(e) => e.stopPropagation()}
            >
              Website
            </a>
          </div>
        )}
      </div>

      {/* Tags */}
      {business.tags && business.tags.length > 0 && (
        <div className="flex flex-wrap gap-1 mt-3">
          {business.tags.slice(0, 3).map((tag, index) => (
            <span
              key={index}
              className="px-2 py-0.5 bg-blue-50 text-blue-700 text-xs rounded-full"
            >
              {tag}
            </span>
          ))}
          {business.tags.length > 3 && (
            <span className="px-2 py-0.5 text-gray-500 text-xs">
              +{business.tags.length - 3} more
            </span>
          )}
        </div>
      )}
    </div>
  );
};