import React from 'react';
import { useWallet } from '../hooks/useWallet';
import { Wallet, LogOut, Shield, User, Briefcase, ShieldAlert } from 'lucide-react';

export const Header: React.FC = () => {
  const { account, userRole, connectWallet, disconnectWallet, isConnecting } = useWallet();

  const getRoleIcon = () => {
    switch (userRole) {
      case 'admin': return <Shield className="w-4 h-4" />;
      case 'moderator': return <ShieldAlert className="w-4 h-4" />;
      case 'business_owner': return <Briefcase className="w-4 h-4" />;
      default: return <User className="w-4 h-4" />;
    }
  };

  const getRoleBadgeColor = () => {
    switch (userRole) {
      case 'admin': return 'bg-red-500';
      case 'moderator': return 'bg-yellow-500';
      case 'business_owner': return 'bg-blue-500';
      default: return 'bg-gray-500';
    }
  };

  return (
    <header className="bg-white shadow-sm border-b">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <h1 className="text-2xl font-bold text-gray-900">YelpReview dApp</h1>
            <span className="ml-3 text-sm text-gray-500">Sepolia Testnet</span>
          </div>

          <div className="flex items-center space-x-4">
            {account ? (
              <>
                <div className="flex items-center space-x-2">
                  <div className={`px-2 py-1 rounded-full ${getRoleBadgeColor()} text-white text-xs flex items-center space-x-1`}>
                    {getRoleIcon()}
                    <span className="capitalize">{userRole.replace('_', ' ')}</span>
                  </div>
                  <span className="text-sm text-gray-600">
                    {account.slice(0, 6)}...{account.slice(-4)}
                  </span>
                </div>
                <button
                  onClick={disconnectWallet}
                  className="flex items-center space-x-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Disconnect</span>
                </button>
              </>
            ) : (
              <button
                onClick={connectWallet}
                disabled={isConnecting}
                className="flex items-center space-x-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Wallet className="w-4 h-4" />
                <span>{isConnecting ? 'Connecting...' : 'Connect Wallet'}</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};