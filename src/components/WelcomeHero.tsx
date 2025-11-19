import React from 'react';
import { useWallet } from '../hooks/useWallet';
import { Wallet, Star, Shield, TrendingUp, Users, Award, Globe } from 'lucide-react';

export const WelcomeHero: React.FC = () => {
  const { account, connectWallet, isConnecting } = useWallet();

  const features = [
    {
      icon: <Shield className="w-5 h-5" />,
      title: 'Blockchain Verified',
      description: 'All reviews are permanently stored on-chain'
    },
    {
      icon: <Users className="w-5 h-5" />,
      title: 'Community Driven',
      description: 'Real reviews from real Kenyans'
    },
    {
      icon: <Award className="w-5 h-5" />,
      title: 'Transparent Ratings',
      description: 'No fake reviews, no manipulation'
    },
    {
      icon: <Globe className="w-5 h-5" />,
      title: 'Support Local',
      description: 'Discover and support Kenyan businesses'
    }
  ];

  const stats = [
    { value: '50+', label: 'Businesses' },
    { value: '100%', label: 'Transparent' },
    { value: '24/7', label: 'Available' },
    { value: 'Free', label: 'To Use' }
  ];

  if (account) return null;

  return (
    <div className="bg-gradient-to-br from-blue-600 via-purple-600 to-pink-600 rounded-2xl p-8 text-white shadow-2xl">
      {/* Hero Section */}
      <div className="text-center mb-8">
        <div className="flex justify-center mb-4">
          <div className="p-4 bg-white/10 backdrop-blur-sm rounded-2xl">
            <Star className="w-12 h-12 text-yellow-300" />
          </div>
        </div>
        
        <h1 className="text-4xl font-bold mb-3">
          Welcome to DecentReview Kenya
        </h1>
        <p className="text-xl text-white/90 mb-2">
          The First Blockchain-Powered Review Platform for Kenyan Businesses
        </p>
        <p className="text-lg text-white/80">
          Discover, Review, and Support Local Businesses with Trust and Transparency
        </p>
      </div>

      {/* CTA Button */}
      <div className="text-center mb-8">
        <button
          onClick={connectWallet}
          disabled={isConnecting}
          className="inline-flex items-center space-x-3 px-8 py-4 bg-white text-gray-900 rounded-xl font-semibold text-lg hover:bg-gray-100 transform hover:scale-105 transition-all shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Wallet className="w-6 h-6" />
          <span>{isConnecting ? 'Connecting...' : 'Connect Wallet to Get Started'}</span>
        </button>
        <p className="mt-3 text-white/80 text-sm">
          Connect with MetaMask to write reviews and interact with businesses
        </p>
      </div>

      {/* Features Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {features.map((feature, index) => (
          <div key={index} className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
            <div className="text-yellow-300 mb-2">{feature.icon}</div>
            <h3 className="font-semibold text-sm mb-1">{feature.title}</h3>
            <p className="text-xs text-white/80">{feature.description}</p>
          </div>
        ))}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4 p-4 bg-white/10 backdrop-blur-sm rounded-xl">
        {stats.map((stat, index) => (
          <div key={index} className="text-center">
            <div className="text-2xl font-bold text-yellow-300">{stat.value}</div>
            <div className="text-xs text-white/80">{stat.label}</div>
          </div>
        ))}
      </div>

      {/* How It Works */}
      <div className="mt-8 p-6 bg-white/10 backdrop-blur-sm rounded-xl">
        <h3 className="font-semibold text-lg mb-4 flex items-center">
          <TrendingUp className="w-5 h-5 mr-2 text-yellow-300" />
          How It Works
        </h3>
        <div className="space-y-3">
          <div className="flex items-start">
            <span className="flex-shrink-0 w-7 h-7 bg-yellow-300 text-gray-900 rounded-full flex items-center justify-center font-bold text-sm">
              1
            </span>
            <div className="ml-3">
              <p className="font-medium">Connect Your Wallet</p>
              <p className="text-sm text-white/80">Use MetaMask or any Web3 wallet on Sepolia testnet</p>
            </div>
          </div>
          <div className="flex items-start">
            <span className="flex-shrink-0 w-7 h-7 bg-yellow-300 text-gray-900 rounded-full flex items-center justify-center font-bold text-sm">
              2
            </span>
            <div className="ml-3">
              <p className="font-medium">Find or Add Businesses</p>
              <p className="text-sm text-white/80">Browse Kenyan businesses or add new ones</p>
            </div>
          </div>
          <div className="flex items-start">
            <span className="flex-shrink-0 w-7 h-7 bg-yellow-300 text-gray-900 rounded-full flex items-center justify-center font-bold text-sm">
              3
            </span>
            <div className="ml-3">
              <p className="font-medium">Write Honest Reviews</p>
              <p className="text-sm text-white/80">Share your experience with ratings, comments, and photos</p>
            </div>
          </div>
          <div className="flex items-start">
            <span className="flex-shrink-0 w-7 h-7 bg-yellow-300 text-gray-900 rounded-full flex items-center justify-center font-bold text-sm">
              4
            </span>
            <div className="ml-3">
              <p className="font-medium">Build Trust Together</p>
              <p className="text-sm text-white/80">Help others make informed decisions</p>
            </div>
          </div>
        </div>
      </div>

      {/* Footer Message */}
      <div className="mt-6 text-center text-sm text-white/70">
        <p>🇰🇪 Built with love for Kenya's digital transformation</p>
      </div>
    </div>
  );
};