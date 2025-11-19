import React, { useState, useEffect } from 'react';
import { Search, Plus } from 'lucide-react';
import { useContract } from '../hooks/useContract';
import { useWallet } from '../hooks/useWallet';

interface BusinessSelectorProps {
  selectedBusiness: string;
  onBusinessSelect: (businessName: string) => void;
}

// Predefined businesses for demo purposes
const DEMO_BUSINESSES = [
  'Pizza Palace',
  'Coffee Corner',
  'Tech Hub Restaurant',
  'Green Garden Cafe',
  'Sunset Sushi Bar',
];

export const BusinessSelector: React.FC<BusinessSelectorProps> = ({
  selectedBusiness,
  onBusinessSelect,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [businessOwner, setBusinessOwner] = useState<string | null>(null);
  const { getBusinessOwner, getBusinessId } = useContract();
  const { account, userRole } = useWallet();

  useEffect(() => {
    if (selectedBusiness) {
      fetchBusinessOwner();
    }
  }, [selectedBusiness]);

  const fetchBusinessOwner = async () => {
    const owner = await getBusinessOwner(selectedBusiness);
    setBusinessOwner(owner);
  };

  const filteredBusinesses = DEMO_BUSINESSES.filter(business =>
    business.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleCustomBusiness = () => {
    if (searchTerm && !DEMO_BUSINESSES.includes(searchTerm)) {
      onBusinessSelect(searchTerm);
    }
  };

  const isBusinessOwner = businessOwner && account && 
    businessOwner.toLowerCase() === account.toLowerCase();

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h2 className="text-xl font-semibold mb-4">Select a Business</h2>
      
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Search or enter business name..."
          className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
        />
      </div>

      {searchTerm && (
        <div className="mt-2 max-h-48 overflow-y-auto">
          {filteredBusinesses.map((business) => (
            <button
              key={business}
              onClick={() => {
                onBusinessSelect(business);
                setSearchTerm('');
              }}
              className={`w-full text-left px-4 py-2 hover:bg-gray-100 rounded ${
                selectedBusiness === business ? 'bg-blue-50 text-blue-600' : ''
              }`}
            >
              {business}
            </button>
          ))}
          
          {!filteredBusinesses.length && searchTerm && (
            <button
              onClick={handleCustomBusiness}
              className="w-full text-left px-4 py-2 hover:bg-gray-100 rounded flex items-center space-x-2"
            >
              <Plus className="w-4 h-4" />
              <span>Add "{searchTerm}" as new business</span>
            </button>
          )}
        </div>
      )}

      {selectedBusiness && (
        <div className="mt-4 p-4 bg-gray-50 rounded-lg">
          <div className="flex justify-between items-start">
            <div>
              <h3 className="font-semibold text-lg">{selectedBusiness}</h3>
              <p className="text-xs text-gray-500 mt-1 break-all">
                Business ID: {getBusinessId(selectedBusiness).slice(0, 16)}...
              </p>
            </div>
            {isBusinessOwner && (
              <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                You own this business
              </span>
            )}
          </div>
          
          {businessOwner && !isBusinessOwner && (
            <p className="text-sm text-gray-600 mt-2">
              Owner: {businessOwner.slice(0, 6)}...{businessOwner.slice(-4)}
            </p>
          )}
          
          {!businessOwner && userRole === 'admin' && (
            <p className="text-sm text-yellow-600 mt-2">
              No owner assigned. You can assign one as admin.
            </p>
          )}
        </div>
      )}
    </div>
  );
};