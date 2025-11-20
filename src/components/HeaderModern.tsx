import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useWallet } from '../hooks/useWallet';
import { useUsernames } from '../hooks/useUsernames';
import { UsernameModal } from './UsernameModal';
import { 
  Wallet, LogOut, Shield, User, Briefcase, ShieldAlert, 
  Sparkles, Star, Globe, Zap, Menu, X, AtSign, Edit2
} from 'lucide-react';

export const HeaderModern: React.FC = () => {
  const { account, userRole, connectWallet, disconnectWallet, isConnecting } = useWallet();
  const { currentUsername, getUserDisplay } = useUsernames();
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showUsernameModal, setShowUsernameModal] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

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
      case 'admin': return 'from-red-500 to-pink-500';
      case 'moderator': return 'from-yellow-500 to-orange-500';
      case 'business_owner': return 'from-blue-500 to-indigo-500';
      default: return 'from-gray-500 to-gray-600';
    }
  };

  const getRoleLabel = () => {
    switch (userRole) {
      case 'admin': return 'Admin';
      case 'moderator': return 'Moderator';
      case 'business_owner': return 'Business Owner';
      default: return 'Reviewer';
    }
  };

  return (
    <motion.header 
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      className={`sticky top-0 z-50 transition-all duration-300 ${
        scrolled 
          ? 'bg-white/80 backdrop-blur-xl shadow-lg' 
          : 'bg-gradient-to-r from-purple-600 via-pink-600 to-orange-500'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo Section */}
          <div className="flex items-center space-x-3">
            <motion.div
              whileHover={{ rotate: 360 }}
              transition={{ duration: 0.5 }}
              className={`p-2 rounded-xl ${
                scrolled ? 'bg-gradient-to-br from-purple-500 to-pink-500' : 'bg-white/20 backdrop-blur'
              }`}
            >
              <Star className={`w-6 h-6 ${scrolled ? 'text-white' : 'text-yellow-300'}`} />
            </motion.div>
            
            <div>
              <h1 className={`text-xl font-bold ${scrolled ? 'text-gray-900' : 'text-white'}`}>
                DecentReview
              </h1>
              <div className="flex items-center space-x-2">
                <span className={`text-xs ${scrolled ? 'text-gray-500' : 'text-white/80'}`}>
                  Kenya's Blockchain Reviews
                </span>
                <div className="flex items-center space-x-1">
                  <Globe className={`w-3 h-3 ${scrolled ? 'text-green-500' : 'text-green-300'}`} />
                  <span className={`text-xs ${scrolled ? 'text-green-600' : 'text-green-300'} font-medium`}>
                    Sepolia
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-4">
            {account ? (
              <>
                {/* Username Display */}
                <motion.button
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  whileHover={{ scale: 1.05 }}
                  onClick={() => setShowUsernameModal(true)}
                  className={`flex items-center space-x-2 px-3 py-1.5 rounded-xl transition-colors ${
                    scrolled 
                      ? 'bg-purple-100 hover:bg-purple-200 text-purple-700' 
                      : 'bg-white/20 hover:bg-white/30 text-white'
                  }`}
                >
                  <AtSign className="w-4 h-4" />
                  <span className="font-medium">
                    {currentUsername || 'Set Username'}
                  </span>
                  {currentUsername ? (
                    <Edit2 className="w-3 h-3 opacity-50" />
                  ) : (
                    <Sparkles className="w-3 h-3" />
                  )}
                </motion.button>

                {/* Role Badge */}
                <motion.div 
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className={`px-3 py-1.5 bg-gradient-to-r ${getRoleBadgeColor()} text-white rounded-full flex items-center space-x-2 shadow-lg`}
                >
                  <motion.div
                    animate={{ rotate: [0, 10, -10, 0] }}
                    transition={{ repeat: Infinity, duration: 3 }}
                  >
                    {getRoleIcon()}
                  </motion.div>
                  <span className="text-sm font-medium">{getRoleLabel()}</span>
                </motion.div>

                {/* Account Info */}
                <div className={`px-4 py-2 rounded-xl ${
                  scrolled ? 'bg-gray-100' : 'bg-white/20 backdrop-blur'
                }`}>
                  <div className="flex items-center space-x-2">
                    <div className="relative">
                      <div className="w-2 h-2 bg-green-500 rounded-full absolute -top-0.5 -right-0.5 animate-pulse" />
                      <Wallet className={`w-4 h-4 ${scrolled ? 'text-gray-600' : 'text-white'}`} />
                    </div>
                    <span className={`text-sm font-mono ${scrolled ? 'text-gray-700' : 'text-white'}`}>
                      {account.slice(0, 6)}...{account.slice(-4)}
                    </span>
                  </div>
                </div>

                {/* Disconnect Button */}
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={disconnectWallet}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-xl transition-all ${
                    scrolled 
                      ? 'bg-red-50 hover:bg-red-100 text-red-600' 
                      : 'bg-white/20 backdrop-blur hover:bg-white/30 text-white'
                  }`}
                >
                  <LogOut className="w-4 h-4" />
                  <span className="text-sm font-medium">Disconnect</span>
                </motion.button>
              </>
            ) : (
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={connectWallet}
                disabled={isConnecting}
                className={`flex items-center space-x-2 px-6 py-2.5 rounded-xl font-medium transition-all shadow-lg disabled:opacity-50 disabled:cursor-not-allowed ${
                  scrolled
                    ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white hover:from-purple-700 hover:to-pink-700'
                    : 'bg-white text-purple-600 hover:bg-gray-100'
                }`}
              >
                {isConnecting ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current" />
                    <span>Connecting...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    <span>Connect Wallet</span>
                    <Zap className="w-4 h-4" />
                  </>
                )}
              </motion.button>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className={`p-2 rounded-lg ${
                scrolled ? 'text-gray-700' : 'text-white'
              }`}
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="md:hidden py-4 border-t border-white/20"
          >
            {account ? (
              <div className="space-y-3">
                <div className={`px-4 py-2 rounded-lg ${
                  scrolled ? 'bg-gray-50' : 'bg-white/10'
                }`}>
                  <div className="flex items-center justify-between">
                    <span className={`text-sm ${scrolled ? 'text-gray-600' : 'text-white/80'}`}>
                      Wallet Connected
                    </span>
                    <span className={`text-sm font-mono ${scrolled ? 'text-gray-800' : 'text-white'}`}>
                      {account.slice(0, 6)}...{account.slice(-4)}
                    </span>
                  </div>
                </div>
                
                <button
                  onClick={disconnectWallet}
                  className={`w-full flex items-center justify-center space-x-2 px-4 py-2 rounded-lg ${
                    scrolled 
                      ? 'bg-red-50 text-red-600' 
                      : 'bg-white/20 text-white'
                  }`}
                >
                  <LogOut className="w-4 h-4" />
                  <span>Disconnect</span>
                </button>
              </div>
            ) : (
              <button
                onClick={connectWallet}
                disabled={isConnecting}
                className="w-full flex items-center justify-center space-x-2 px-4 py-3 bg-white text-purple-600 rounded-lg font-medium"
              >
                <Wallet className="w-4 h-4" />
                <span>{isConnecting ? 'Connecting...' : 'Connect Wallet'}</span>
              </button>
            )}
          </motion.div>
        )}
      </div>

      {/* Decorative Elements */}
      {!scrolled && (
        <div className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-white/30 to-transparent" />
      )}

      {/* Username Modal */}
      <UsernameModal 
        isOpen={showUsernameModal}
        onClose={() => setShowUsernameModal(false)}
      />
    </motion.header>
  );
};