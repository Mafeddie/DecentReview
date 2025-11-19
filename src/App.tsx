import React, { useState } from 'react';
import { WalletProvider, useWallet } from './hooks/useWallet';
import { HeaderModern } from './components/HeaderModern';
import { BusinessExplorer } from './components/BusinessExplorer';
import { ReviewList } from './components/ReviewList';
import { AddReviewModern } from './components/AddReviewModern';
import { AdminPanel } from './components/AdminPanel';
import { TransactionStatus } from './components/TransactionStatus';
import { HelpSection } from './components/HelpSection';
import { WelcomeHero } from './components/WelcomeHero';
import { BusinessDetails } from './data/kenyanBusinesses';
import { Toaster } from 'react-hot-toast';
import { motion } from 'framer-motion';
import { Star, TrendingUp, Users, Award, Sparkles } from 'lucide-react';

function AppContent() {
  const [selectedBusiness, setSelectedBusiness] = useState<BusinessDetails | null>(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const { account } = useWallet();

  const handleReviewAdded = () => {
    setRefreshTrigger(prev => prev + 1);
  };

  const handleBusinessSelect = (business: BusinessDetails) => {
    setSelectedBusiness(business);
  };

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
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Column - Business Explorer */}
            <div className="lg:col-span-1 space-y-6">
              <BusinessExplorer 
                selectedBusiness={selectedBusiness}
                onBusinessSelect={handleBusinessSelect}
              />
              
              {selectedBusiness && (
                <>
                  <AddReviewModern 
                    businessName={selectedBusiness.name}
                    onReviewAdded={handleReviewAdded}
                  />
                  
                  <AdminPanel businessName={selectedBusiness.name} />
                </>
              )}
            </div>
            
            {/* Right Column - Reviews & Help */}
            <div className="lg:col-span-2 space-y-6">
              {selectedBusiness ? (
                <>
                  {/* Business Header Card - Modern Design */}
                  <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-gradient-to-br from-white to-purple-50 rounded-2xl shadow-xl p-6 border border-purple-100"
                  >
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <Sparkles className="w-6 h-6 text-purple-600" />
                          <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                            {selectedBusiness.name}
                          </h1>
                        </div>
                        <p className="text-gray-700 text-lg mb-3">{selectedBusiness.description}</p>
                        <div className="flex flex-wrap items-center gap-3">
                          <span className="px-3 py-1.5 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-full text-sm font-medium shadow-md">
                            {selectedBusiness.category}
                          </span>
                          <span className="px-3 py-1.5 bg-white border border-purple-200 rounded-full text-sm text-gray-700">
                            📍 {selectedBusiness.location}, {selectedBusiness.city}
                          </span>
                          {selectedBusiness.priceRange && (
                            <span className="px-3 py-1.5 bg-green-50 border border-green-200 rounded-full text-sm text-green-700">
                              💰 {selectedBusiness.priceRange}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </motion.div>

                  <ReviewList 
                    key={`${selectedBusiness.name}-${refreshTrigger}`}
                    businessName={selectedBusiness.name} 
                  />
                </>
              ) : (
                <div className="bg-white rounded-lg shadow-sm p-12 text-center">
                  <div className="max-w-md mx-auto">
                    <TrendingUp className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">
                      Select a Business to Start
                    </h3>
                    <p className="text-gray-500">
                      Choose from popular Kenyan businesses or search for a specific one to view and write reviews
                    </p>
                  </div>
                </div>
              )}
              
              <HelpSection />
            </div>
          </div>
        )}
      </main>
      
      <TransactionStatus />
      <Toaster position="top-right" />
    </div>
  );
}

function App() {
  return (
    <WalletProvider>
      <AppContent />
    </WalletProvider>
  );
}

export default App;
