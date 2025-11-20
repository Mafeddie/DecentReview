import React from 'react';
import { motion } from 'framer-motion';
import { 
  Filter, MapPin, DollarSign, Star, Clock, 
  Search, X, TrendingUp, Award
} from 'lucide-react';

interface BusinessFiltersProps {
  categories: string[];
  cities: string[];
  selectedCategory: string;
  selectedCity: string;
  selectedPriceRange: string;
  selectedRating: number;
  searchQuery: string;
  onCategoryChange: (category: string) => void;
  onCityChange: (city: string) => void;
  onPriceRangeChange: (range: string) => void;
  onRatingChange: (rating: number) => void;
  onSearchChange: (query: string) => void;
  onClearFilters: () => void;
}

export const BusinessFilters: React.FC<BusinessFiltersProps> = ({
  categories,
  cities,
  selectedCategory,
  selectedCity,
  selectedPriceRange,
  selectedRating,
  searchQuery,
  onCategoryChange,
  onCityChange,
  onPriceRangeChange,
  onRatingChange,
  onSearchChange,
  onClearFilters
}) => {
  const priceRanges = ['$', '$$', '$$$', '$$$$'];
  const ratings = [5, 4, 3, 2, 1];

  const hasActiveFilters = selectedCategory || selectedCity || selectedPriceRange || selectedRating > 0 || searchQuery;

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      className="bg-white rounded-2xl shadow-xl p-6 sticky top-24"
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-2">
          <Filter className="w-5 h-5 text-purple-600" />
          <h3 className="text-lg font-bold text-gray-900">Filters</h3>
        </div>
        {hasActiveFilters && (
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={onClearFilters}
            className="text-sm text-purple-600 hover:text-purple-700 font-medium"
          >
            Clear all
          </motion.button>
        )}
      </div>

      {/* Search */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Search
        </label>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search businesses..."
            className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-xl focus:outline-none focus:border-purple-500 transition-colors"
          />
        </div>
      </div>

      {/* Category Filter */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
          <Award className="w-4 h-4 mr-1 text-purple-500" />
          Category
        </label>
        <select
          value={selectedCategory}
          onChange={(e) => onCategoryChange(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-xl focus:outline-none focus:border-purple-500 transition-colors"
        >
          <option value="">All Categories</option>
          {categories.map(category => (
            <option key={category} value={category}>{category}</option>
          ))}
        </select>
      </div>

      {/* City Filter */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
          <MapPin className="w-4 h-4 mr-1 text-blue-500" />
          Location
        </label>
        <select
          value={selectedCity}
          onChange={(e) => onCityChange(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-xl focus:outline-none focus:border-purple-500 transition-colors"
        >
          <option value="">All Cities</option>
          {cities.map(city => (
            <option key={city} value={city}>{city}</option>
          ))}
        </select>
      </div>

      {/* Price Range Filter */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
          <DollarSign className="w-4 h-4 mr-1 text-green-500" />
          Price Range
        </label>
        <div className="flex space-x-2">
          {priceRanges.map(range => (
            <motion.button
              key={range}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => onPriceRangeChange(selectedPriceRange === range ? '' : range)}
              className={`flex-1 px-3 py-2 rounded-lg font-medium transition-all ${
                selectedPriceRange === range
                  ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-md'
                  : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
              }`}
            >
              {range}
            </motion.button>
          ))}
        </div>
      </div>

      {/* Rating Filter */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
          <Star className="w-4 h-4 mr-1 text-yellow-500" />
          Minimum Rating
        </label>
        <div className="space-y-2">
          {ratings.map(rating => (
            <motion.button
              key={rating}
              whileHover={{ scale: 1.02 }}
              onClick={() => onRatingChange(selectedRating === rating ? 0 : rating)}
              className={`w-full px-3 py-2 rounded-lg flex items-center justify-between transition-all ${
                selectedRating === rating
                  ? 'bg-gradient-to-r from-yellow-400 to-orange-400 text-white shadow-md'
                  : 'bg-gray-50 hover:bg-gray-100 text-gray-700'
              }`}
            >
              <div className="flex items-center">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={`w-4 h-4 ${
                      i < rating 
                        ? selectedRating === rating ? 'text-white fill-current' : 'text-yellow-400 fill-current'
                        : 'text-gray-300'
                    }`}
                  />
                ))}
              </div>
              <span className="text-sm font-medium">& up</span>
            </motion.button>
          ))}
        </div>
      </div>

      {/* Quick Filters */}
      <div className="border-t pt-4">
        <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
          <TrendingUp className="w-4 h-4 mr-1 text-orange-500" />
          Quick Filters
        </label>
        <div className="space-y-2">
          <motion.button
            whileHover={{ scale: 1.02 }}
            className="w-full px-3 py-2 bg-gradient-to-r from-purple-100 to-pink-100 text-purple-700 rounded-lg text-sm font-medium hover:from-purple-200 hover:to-pink-200 transition-all"
          >
            🔥 Trending Now
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.02 }}
            className="w-full px-3 py-2 bg-gradient-to-r from-green-100 to-emerald-100 text-green-700 rounded-lg text-sm font-medium hover:from-green-200 hover:to-emerald-200 transition-all"
          >
            🆕 Recently Added
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.02 }}
            className="w-full px-3 py-2 bg-gradient-to-r from-yellow-100 to-orange-100 text-yellow-700 rounded-lg text-sm font-medium hover:from-yellow-200 hover:to-orange-200 transition-all"
          >
            ⭐ Top Rated
          </motion.button>
        </div>
      </div>
    </motion.div>
  );
};