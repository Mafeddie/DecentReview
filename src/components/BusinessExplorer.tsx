import React, { useState, useEffect } from 'react';
import { 
  KENYAN_BUSINESSES, 
  BUSINESS_CATEGORIES, 
  BusinessDetails,
  getBusinessesByCategory,
  searchBusinesses 
} from '../data/kenyanBusinesses';
import { BusinessCard } from './BusinessCard';
import { useContract } from '../hooks/useContract';
import { Search, Filter, MapPin, TrendingUp, Store } from 'lucide-react';

interface BusinessExplorerProps {
  selectedBusiness: BusinessDetails | null;
  onBusinessSelect: (business: BusinessDetails) => void;
}

export const BusinessExplorer: React.FC<BusinessExplorerProps> = ({
  selectedBusiness,
  onBusinessSelect,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All Categories');
  const [filteredBusinesses, setFilteredBusinesses] = useState<BusinessDetails[]>(KENYAN_BUSINESSES);
  const [showFilters, setShowFilters] = useState(false);
  const [businessStats, setBusinessStats] = useState<Map<string, { reviews: number; rating: number }>>(new Map());
  const { getReviews } = useContract();

  // Filter businesses based on search and category
  useEffect(() => {
    let businesses: BusinessDetails[] = [];
    
    if (searchTerm) {
      businesses = searchBusinesses(searchTerm);
    } else {
      businesses = getBusinessesByCategory(selectedCategory);
    }
    
    setFilteredBusinesses(businesses);
  }, [searchTerm, selectedCategory]);

  // Fetch review stats for displayed businesses
  useEffect(() => {
    const fetchStats = async () => {
      const stats = new Map<string, { reviews: number; rating: number }>();
      
      for (const business of filteredBusinesses.slice(0, 10)) { // Limit to first 10 for performance
        try {
          const reviews = await getReviews(business.name);
          if (reviews.length > 0) {
            const avgRating = reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length;
            stats.set(business.id, { reviews: reviews.length, rating: avgRating });
          }
        } catch (error) {
          console.error(`Error fetching reviews for ${business.name}:`, error);
        }
      }
      
      setBusinessStats(stats);
    };

    fetchStats();
  }, [filteredBusinesses, getReviews]);

  const popularBusinesses = KENYAN_BUSINESSES
    .filter(b => ['Carnivore Restaurant', 'Java House', 'Sarit Centre', 'Nairobi National Park'].includes(b.name))
    .slice(0, 4);

  return (
    <div className="bg-white rounded-lg shadow-sm">
      {/* Header */}
      <div className="p-6 border-b">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2">
            <Store className="w-6 h-6 text-blue-600" />
            <h2 className="text-2xl font-bold text-gray-900">Explore Kenyan Businesses</h2>
          </div>
          <div className="flex items-center text-sm text-gray-500">
            <MapPin className="w-4 h-4 mr-1" />
            <span>Nairobi & Beyond</span>
          </div>
        </div>

        {/* Search Bar */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search businesses, categories, or locations..."
            className="w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none text-lg"
          />
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <Filter className="w-5 h-5 text-gray-600" />
          </button>
        </div>

        {/* Category Filters */}
        {showFilters && (
          <div className="mt-4 p-4 bg-gray-50 rounded-lg">
            <h3 className="font-semibold text-sm text-gray-700 mb-3">Categories</h3>
            <div className="flex flex-wrap gap-2">
              {BUSINESS_CATEGORIES.map((category) => (
                <button
                  key={category}
                  onClick={() => {
                    setSelectedCategory(category);
                    setSearchTerm('');
                  }}
                  className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                    selectedCategory === category
                      ? 'bg-blue-600 text-white'
                      : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  {category}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Quick Access - Popular Businesses */}
      {!searchTerm && selectedCategory === 'All Categories' && (
        <div className="p-6 bg-gradient-to-r from-blue-50 to-purple-50 border-b">
          <div className="flex items-center mb-4">
            <TrendingUp className="w-5 h-5 text-purple-600 mr-2" />
            <h3 className="font-semibold text-gray-900">Popular Businesses</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {popularBusinesses.map((business) => (
              <button
                key={business.id}
                onClick={() => onBusinessSelect(business)}
                className={`p-3 bg-white rounded-lg text-left hover:shadow-md transition-shadow ${
                  selectedBusiness?.id === business.id ? 'ring-2 ring-blue-500' : ''
                }`}
              >
                <div className="font-medium text-gray-900">{business.name}</div>
                <div className="text-xs text-gray-500 mt-1">
                  {business.category} • {business.location}
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Business List */}
      <div className="p-6">
        {/* Results Header */}
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-gray-900">
            {searchTerm 
              ? `Search results for "${searchTerm}"` 
              : selectedCategory === 'All Categories'
                ? 'All Businesses'
                : selectedCategory}
          </h3>
          <span className="text-sm text-gray-500">
            {filteredBusinesses.length} {filteredBusinesses.length === 1 ? 'business' : 'businesses'}
          </span>
        </div>

        {/* Business Cards */}
        <div className="space-y-4 max-h-[600px] overflow-y-auto pr-2">
          {filteredBusinesses.length === 0 ? (
            <div className="text-center py-12">
              <Store className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500">No businesses found</p>
              <p className="text-sm text-gray-400 mt-1">Try adjusting your search or filters</p>
            </div>
          ) : (
            filteredBusinesses.map((business) => {
              const stats = businessStats.get(business.id);
              return (
                <BusinessCard
                  key={business.id}
                  business={business}
                  isSelected={selectedBusiness?.id === business.id}
                  onClick={() => onBusinessSelect(business)}
                  reviewCount={stats?.reviews}
                  averageRating={stats?.rating}
                />
              );
            })
          )}
        </div>
      </div>

      {/* Footer Tip */}
      <div className="p-4 bg-gray-50 border-t text-center">
        <p className="text-sm text-gray-600">
          💡 Can't find a business? You can still add it by typing its name in the search bar!
        </p>
      </div>
    </div>
  );
};