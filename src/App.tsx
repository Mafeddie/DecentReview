import React, { useState, useMemo } from 'react';
import { WalletProvider, useWallet } from './hooks/useWallet';
import { UsernameProvider } from './hooks/useUsernames';
import { HeaderModern } from './components/HeaderModern';
import { BusinessCard } from './components/BusinessCard';
import { BusinessFilters } from './components/BusinessFilters';
import { ReviewModal } from './components/ReviewModal';
import { ReviewList } from './components/ReviewList';
import { AdminPanel } from './components/AdminPanel';
import { TransactionStatus } from './components/TransactionStatus';
import { HelpSection } from './components/HelpSection';
import { WelcomeHero } from './components/WelcomeHero';
import { Leaderboard } from './components/Leaderboard';
import { ProfileStats } from './components/ProfileStats';
import { RecentActivity } from './components/RecentActivity';
import { ModernTabs, TabPanel, TabType } from './components/ModernTabs';
import { BusinessDetails, KENYAN_BUSINESSES } from './data/kenyanBusinesses';
import { Toaster } from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';
import { Star, TrendingUp, Users, Award, Sparkles, MapPin, Store, Zap } from 'lucide-react';

function AppContent() {
  const [selectedBusiness, setSelectedBusiness] = useState<BusinessDetails | null>(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [activeTab, setActiveTab] = useState<TabType>('explore');
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [reviewBusiness, setReviewBusiness] = useState<BusinessDetails | null>(null);
  
  // Filter states
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedCity, setSelectedCity] = useState('');
  const [selectedPriceRange, setSelectedPriceRange] = useState('');
  const [selectedRating, setSelectedRating] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  
  const { account } = useWallet();

  const handleReviewAdded = () => {
    setRefreshTrigger(prev => prev + 1);
    setShowReviewModal(false);
  };

  const handleBusinessSelect = (business: BusinessDetails) => {
    setSelectedBusiness(business);
  };
  
  const handleWriteReview = (business: BusinessDetails) => {
    setReviewBusiness(business);
    setShowReviewModal(true);
  };
  
  const handleClearFilters = () => {
    setSelectedCategory('');
    setSelectedCity('');
    setSelectedPriceRange('');
    setSelectedRating(0);
    setSearchQuery('');
  };
  
  // Get unique categories and cities
  const categories = useMemo(() => {
    const cats = new Set(KENYAN_BUSINESSES.map(b => b.category));
    return Array.from(cats).sort();
  }, []);
  
  const cities = useMemo(() => {
    const cts = new Set(KENYAN_BUSINESSES.map(b => b.city));
    return Array.from(cts).sort();
  }, []);
  
  // Filter businesses
  const filteredBusinesses = useMemo(() => {
    return KENYAN_BUSINESSES.filter(business => {
      if (searchQuery && !business.name.toLowerCase().includes(searchQuery.toLowerCase()) && 
          !business.description.toLowerCase().includes(searchQuery.toLowerCase())) {
        return false;
      }
      if (selectedCategory && business.category !== selectedCategory) return false;
      if (selectedCity && business.city !== selectedCity) return false;
      if (selectedPriceRange && business.priceRange !== selectedPriceRange) return false;
      // For rating filter, we'd need actual review data
      return true;
    });
  }, [searchQuery, selectedCategory, selectedCity, selectedPriceRange]);

  // Stats for the header
  const stats = [
    { icon: <Star className="w-4 h-4" />, value: '50+', label: 'Businesses' },
    { icon: <Users className="w-4 h-4" />, value: '100+', label: 'Reviews' },
    { icon: <Award className="w-4 h-4" />, value: '4.2', label: 'Avg Rating' }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-orange-50">
      <HeaderModern />
      
      {/* Animated Stats Bar - Only show when connected */}
      {account && (
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-r from-purple-600 via-pink-600 to-orange-500 shadow-lg"
        >
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <div className="flex justify-center space-x-8">
              {stats.map((stat, index) => (
                <motion.div 
                  key={index}
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: index * 0.1 }}
                  className="flex items-center space-x-2 bg-white/20 backdrop-blur px-4 py-2 rounded-full"
                >
                  <div className="text-yellow-300">{stat.icon}</div>
                  <div>
                    <span className="font-bold text-white text-lg">{stat.value}</span>
                    <span className="ml-1 text-sm text-white/80">{stat.label}</span>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </motion.div>
      )}
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Hero for non-connected users */}
        {!account && (
          <div className="mb-8">
            <WelcomeHero />
          </div>
        )}

        {/* Main Content - Only show when connected */}
        {account && (
          <div className="space-y-6">
            {/* Modern Tab Navigation */}
            <ModernTabs 
              activeTab={activeTab} 
              onTabChange={setActiveTab}
              notifications={{
                leaderboard: 3,
                activity: 5
              }}
            />

            {/* Tab Content */}
            <AnimatePresence mode="wait">
              {activeTab === 'explore' && (
                <TabPanel tabKey="explore">
                  {/* Horizontal Banner */}
                  <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-gradient-to-r from-purple-600 via-pink-600 to-orange-500 rounded-3xl p-8 mb-8 text-white shadow-2xl overflow-hidden relative"
                  >
                    {/* Animated Background Pattern */}
                    <div className="absolute inset-0 opacity-10">
                      {[...Array(5)].map((_, i) => (
                        <motion.div
                          key={i}
                          className="absolute w-64 h-64 bg-white/20 rounded-full"
                          animate={{
                            x: [0, 100, 0],
                            y: [0, -50, 0],
                          }}
                          transition={{
                            duration: 15 + i * 3,
                            repeat: Infinity,
                            ease: "linear"
                          }}
                          style={{
                            left: `${i * 20}%`,
                            top: `${Math.random() * 100}%`
                          }}
                        />
                      ))}
                    </div>
                    
                    <div className="relative z-10">
                      <div className="flex items-center justify-between">
                        <div>
                          <motion.h2 
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.2 }}
                            className="text-4xl font-bold mb-2"
                          >
                            Discover Amazing Kenyan Businesses
                          </motion.h2>
                          <motion.p 
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.3 }}
                            className="text-xl text-white/90"
                          >
                            Share your experiences and help others make informed decisions
                          </motion.p>
                        </div>
                        <motion.div
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          transition={{ delay: 0.4 }}
                          className="hidden lg:block"
                        >
                          <div className="flex items-center space-x-6">
                            <div className="text-center">
                              <motion.div
                                animate={{ scale: [1, 1.1, 1] }}
                                transition={{ repeat: Infinity, duration: 2 }}
                                className="text-5xl font-bold"
                              >
                                {filteredBusinesses.length}
                              </motion.div>
                              <p className="text-sm text-white/80">Businesses</p>
                            </div>
                            <div className="text-center">
                              <motion.div
                                animate={{ scale: [1, 1.1, 1] }}
                                transition={{ repeat: Infinity, duration: 2, delay: 0.5 }}
                                className="text-5xl font-bold"
                              >
                                500+
                              </motion.div>
                              <p className="text-sm text-white/80">Reviews</p>
                            </div>
                            <div className="text-center">
                              <motion.div
                                animate={{ scale: [1, 1.1, 1] }}
                                transition={{ repeat: Infinity, duration: 2, delay: 1 }}
                                className="text-5xl font-bold"
                              >
                                4.5
                              </motion.div>
                              <p className="text-sm text-white/80">Avg Rating</p>
                            </div>
                          </div>
                        </motion.div>
                      </div>
                      
                      {/* Quick Stats */}
                      <motion.div 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.5 }}
                        className="flex flex-wrap gap-3 mt-6"
                      >
                        <span className="px-4 py-2 bg-white/20 backdrop-blur rounded-full flex items-center space-x-2">
                          <MapPin className="w-4 h-4" />
                          <span>{cities.length} Cities</span>
                        </span>
                        <span className="px-4 py-2 bg-white/20 backdrop-blur rounded-full flex items-center space-x-2">
                          <Store className="w-4 h-4" />
                          <span>{categories.length} Categories</span>
                        </span>
                        <span className="px-4 py-2 bg-white/20 backdrop-blur rounded-full flex items-center space-x-2">
                          <Zap className="w-4 h-4" />
                          <span>Live on Sepolia</span>
                        </span>
                      </motion.div>
                    </div>
                  </motion.div>
                  
                  {/* Main Content Area with Sidebar */}
                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                    {/* Main Content - Business Grid */}
                    <div className="lg:col-span-9">
                      {/* Results Header */}
                      <div className="flex items-center justify-between mb-6">
                        <h3 className="text-2xl font-bold text-gray-900">
                          {searchQuery || selectedCategory || selectedCity ? 
                            `Found ${filteredBusinesses.length} businesses` : 
                            'All Businesses'
                          }
                        </h3>
                        <div className="flex items-center space-x-2">
                          <span className="text-sm text-gray-500">Sort by:</span>
                          <select className="px-3 py-1.5 border border-gray-300 rounded-lg focus:outline-none focus:border-purple-500">
                            <option>Most Recent</option>
                            <option>Highest Rated</option>
                            <option>Most Reviewed</option>
                            <option>Name (A-Z)</option>
                          </select>
                        </div>
                      </div>
                      
                      {/* Business Cards Grid */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {filteredBusinesses.map((business, index) => (
                          <BusinessCard
                            key={business.name}
                            business={business}
                            onSelect={() => handleBusinessSelect(business)}
                            onWriteReview={() => handleWriteReview(business)}
                            index={index}
                          />
                        ))}
                      </div>
                      
                      {/* Empty State */}
                      {filteredBusinesses.length === 0 && (
                        <motion.div
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          className="text-center py-12"
                        >
                          <Store className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                          <h3 className="text-xl font-semibold text-gray-700 mb-2">
                            No businesses found
                          </h3>
                          <p className="text-gray-500 mb-4">
                            Try adjusting your filters or search query
                          </p>
                          <button
                            onClick={handleClearFilters}
                            className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                          >
                            Clear all filters
                          </button>
                        </motion.div>
                      )}
                    </div>
                    
                    {/* Right Sidebar - Filters */}
                    <div className="lg:col-span-3">
                      <BusinessFilters
                        categories={categories}
                        cities={cities}
                        selectedCategory={selectedCategory}
                        selectedCity={selectedCity}
                        selectedPriceRange={selectedPriceRange}
                        selectedRating={selectedRating}
                        searchQuery={searchQuery}
                        onCategoryChange={setSelectedCategory}
                        onCityChange={setSelectedCity}
                        onPriceRangeChange={setSelectedPriceRange}
                        onRatingChange={setSelectedRating}
                        onSearchChange={setSearchQuery}
                        onClearFilters={handleClearFilters}
                      />
                    </div>
                  </div>
                  
                  {/* Selected Business Reviews Section */}
                  {selectedBusiness && (
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="mt-8 bg-white rounded-2xl shadow-xl p-6"
                    >
                      <div className="flex items-center justify-between mb-6">
                        <h3 className="text-2xl font-bold text-gray-900">
                          Reviews for {selectedBusiness.name}
                        </h3>
                        <button
                          onClick={() => setSelectedBusiness(null)}
                          className="text-gray-500 hover:text-gray-700"
                        >
                          Close
                        </button>
                      </div>
                      <ReviewList 
                        key={`${selectedBusiness.name}-${refreshTrigger}`}
                        businessName={selectedBusiness.name} 
                      />
                    </motion.div>
                  )}
                </TabPanel>
              )}

              {/* Leaderboard Tab */}
              {activeTab === 'leaderboard' && (
                <TabPanel tabKey="leaderboard">
                  <Leaderboard />
                </TabPanel>
              )}

              {/* Profile Tab */}
              {activeTab === 'profile' && (
                <TabPanel tabKey="profile">
                  <ProfileStats />
                </TabPanel>
              )}

              {/* Activity Tab */}
              {activeTab === 'activity' && (
                <TabPanel tabKey="activity">
                  <RecentActivity />
                </TabPanel>
              )}
            </AnimatePresence>
          </div>
        )}
      </main>
      
      {/* Review Modal */}
      <ReviewModal
        isOpen={showReviewModal}
        onClose={() => setShowReviewModal(false)}
        businessName={reviewBusiness?.name || ''}
        onReviewAdded={handleReviewAdded}
      />
      
      <TransactionStatus />
      <Toaster position="top-right" />
    </div>
  );
}

function App() {
  return (
    <WalletProvider>
      <UsernameProvider>
        <AppContent />
      </UsernameProvider>
    </WalletProvider>
  );
}

export default App;