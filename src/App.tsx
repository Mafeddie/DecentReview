import React, { useState } from 'react';
import { WalletProvider, useWallet } from './hooks/useWallet';
import { Header } from './components/Header';
import { BusinessExplorer } from './components/BusinessExplorer';
import { ReviewList } from './components/ReviewList';
import { AddReview } from './components/AddReview';
import { AdminPanel } from './components/AdminPanel';
import { TransactionStatus } from './components/TransactionStatus';
import { HelpSection } from './components/HelpSection';
import { WelcomeHero } from './components/WelcomeHero';
import { BusinessDetails } from './data/kenyanBusinesses';
import { Toaster } from 'react-hot-toast';
import { Star, TrendingUp, Users, Award } from 'lucide-react';

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
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
      <Header />
      
      {/* Stats Bar - Only show when connected */}
      {account && (
        <div className="bg-white border-b shadow-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
            <div className="flex justify-center space-x-8">
              {stats.map((stat, index) => (
                <div key={index} className="flex items-center space-x-2">
                  <div className="text-blue-600">{stat.icon}</div>
                  <div>
                    <span className="font-semibold text-gray-900">{stat.value}</span>
                    <span className="ml-1 text-sm text-gray-500">{stat.label}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
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
                  <AddReview 
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
                  {/* Business Header Card */}
                  <div className="bg-white rounded-lg shadow-sm p-6">
                    <div className="flex justify-between items-start">
                      <div>
                        <h1 className="text-2xl font-bold text-gray-900 mb-1">
                          {selectedBusiness.name}
                        </h1>
                        <p className="text-gray-600">{selectedBusiness.description}</p>
                        <div className="flex items-center mt-2 space-x-4 text-sm text-gray-500">
                          <span className="px-2 py-1 bg-gray-100 rounded-full">
                            {selectedBusiness.category}
                          </span>
                          <span>{selectedBusiness.location}, {selectedBusiness.city}</span>
                        </div>
                      </div>
                    </div>
                  </div>

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
