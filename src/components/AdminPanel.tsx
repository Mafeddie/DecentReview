import React, { useState } from 'react';
import { useContract } from '../hooks/useContract';
import { useWallet } from '../hooks/useWallet';
import { Settings, UserPlus } from 'lucide-react';
import toast from 'react-hot-toast';

interface AdminPanelProps {
  businessName: string;
}

export const AdminPanel: React.FC<AdminPanelProps> = ({ businessName }) => {
  const [ownerAddress, setOwnerAddress] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { setBusinessOwner } = useContract();
  const { userRole } = useWallet();

  if (userRole !== 'admin') return null;

  const handleSetOwner = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!ownerAddress || !ownerAddress.match(/^0x[a-fA-F0-9]{40}$/)) {
      toast.error('Please enter a valid Ethereum address');
      return;
    }

    setIsSubmitting(true);
    try {
      await setBusinessOwner(businessName, ownerAddress);
      setOwnerAddress('');
    } catch (error) {
      console.error('Error setting business owner:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex items-center space-x-2 mb-4">
        <Settings className="w-5 h-5 text-gray-600" />
        <h2 className="text-xl font-semibold">Admin Controls</h2>
      </div>

      <form onSubmit={handleSetOwner} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Set Business Owner
          </label>
          <div className="flex space-x-2">
            <input
              type="text"
              value={ownerAddress}
              onChange={(e) => setOwnerAddress(e.target.value)}
              placeholder="0x..."
              className="flex-1 px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
              disabled={isSubmitting}
            />
            <button
              type="submit"
              disabled={isSubmitting || !ownerAddress}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
            >
              <UserPlus className="w-4 h-4" />
              <span>{isSubmitting ? 'Setting...' : 'Set Owner'}</span>
            </button>
          </div>
          <p className="text-xs text-gray-500 mt-1">
            Assign ownership of this business to an Ethereum address
          </p>
        </div>
      </form>
    </div>
  );
};