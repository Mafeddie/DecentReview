import React, { useState } from 'react';
import { WalletProvider } from './hooks/useWallet';
import { Header } from './components/Header';
import { BusinessSelector } from './components/BusinessSelector';
import { ReviewList } from './components/ReviewList';
import { AddReview } from './components/AddReview';
import { AdminPanel } from './components/AdminPanel';
import { TransactionStatus } from './components/TransactionStatus';
import { HelpSection } from './components/HelpSection';
import { Toaster } from 'react-hot-toast';

function AppContent() {
  const [selectedBusiness, setSelectedBusiness] = useState('');
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const handleReviewAdded = () => {
    setRefreshTrigger(prev => prev + 1);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column */}
          <div className="lg:col-span-1 space-y-6">
            <BusinessSelector 
              selectedBusiness={selectedBusiness}
              onBusinessSelect={setSelectedBusiness}
            />
            
            {selectedBusiness && (
              <>
                <AddReview 
                  businessName={selectedBusiness}
                  onReviewAdded={handleReviewAdded}
                />
                
                <AdminPanel businessName={selectedBusiness} />
              </>
            )}
            
            <HelpSection />
          </div>
          
          {/* Right Column */}
          <div className="lg:col-span-2">
            {selectedBusiness ? (
              <ReviewList 
                key={`${selectedBusiness}-${refreshTrigger}`}
                businessName={selectedBusiness} 
              />
            ) : (
              <div className="bg-white rounded-lg shadow p-12 text-center">
                <p className="text-gray-500 text-lg">
                  Select a business to view and add reviews
                </p>
              </div>
            )}
          </div>
        </div>
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
