import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useContract } from '../hooks/useContract';
import { useWallet } from '../hooks/useWallet';
import { useUsernames } from '../hooks/useUsernames';
import { 
  Trophy, Medal, Award, Crown, Star, TrendingUp, 
  Clock, Calendar, Flame, Zap, Target, Gift,
  User, ChevronUp, ChevronDown, Timer, Edit2
} from 'lucide-react';
import { KENYAN_BUSINESSES } from '../data/kenyanBusinesses';
import { UsernameModal } from './UsernameModal';

interface ReviewerStats {
  address: string;
  reviewCount: number;
  averageRating: number;
  totalScore: number;
  streak: number;
  badges: string[];
  rank: number;
  movement: 'up' | 'down' | 'same';
  lastReviewTime?: number;
}

type TimeFilter = 'today' | 'week' | 'month' | 'all';

const BADGES = {
  pioneer: { icon: '🚀', name: 'Pioneer', description: 'First 10 reviewers' },
  consistent: { icon: '⭐', name: 'Consistent', description: '5+ reviews' },
  quality: { icon: '💎', name: 'Quality', description: 'High-quality reviews' },
  explorer: { icon: '🗺️', name: 'Explorer', description: 'Reviewed 10+ businesses' },
  photographer: { icon: '📸', name: 'Photographer', description: 'Added 5+ photos' },
  helpful: { icon: '💪', name: 'Helpful', description: 'Detailed reviews' },
  champion: { icon: '🏆', name: 'Champion', description: 'Top reviewer' },
  rising: { icon: '📈', name: 'Rising Star', description: 'Fast growing' },
};

// Mock data generator for demonstration
const generateMockLeaderboard = (): ReviewerStats[] => {
  const addresses = [
    '0x742d...8c3f',
    '0x9fa2...4e7b',
    '0x3c8a...1d9e',
    '0xa5b6...7f2c',
    '0x8e4d...3b6a',
    '0x2f7c...9d4e',
    '0x6b3a...2e8f',
    '0xd4e8...5c7b',
    '0x1a9f...8b3d',
    '0x7c2e...4f6a'
  ];

  return addresses.map((address, index) => ({
    address,
    reviewCount: Math.floor(Math.random() * 50) + 10,
    averageRating: +(Math.random() * 2 + 3).toFixed(1),
    totalScore: Math.floor(Math.random() * 5000) + 1000,
    streak: Math.floor(Math.random() * 30) + 1,
    badges: Object.keys(BADGES).slice(0, Math.floor(Math.random() * 4) + 1),
    rank: index + 1,
    movement: (index < 3 ? 'up' : index > 6 ? 'down' : 'same') as 'up' | 'down' | 'same',
    lastReviewTime: Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000
  })).sort((a, b) => b.totalScore - a.totalScore);
};

export const Leaderboard: React.FC = () => {
  const [timeFilter, setTimeFilter] = useState<TimeFilter>('all');
  const [leaderboardData, setLeaderboardData] = useState<ReviewerStats[]>([]);
  const [userRank, setUserRank] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [showUsernameModal, setShowUsernameModal] = useState(false);
  const { account } = useWallet();
  const { getReviews } = useContract();
  const { getUserDisplay, currentUsername } = useUsernames();

  useEffect(() => {
    fetchLeaderboardData();
  }, [timeFilter]);

  const fetchLeaderboardData = async () => {
    setLoading(true);
    
    // In production, this would aggregate data from the blockchain
    // For demo, using mock data
    const mockData = generateMockLeaderboard();
    setLeaderboardData(mockData);
    
    // Find user's rank if connected
    if (account) {
      const userIndex = mockData.findIndex(
        r => r.address.toLowerCase() === account.slice(0, 6).toLowerCase() + '...' + account.slice(-4).toLowerCase()
      );
      setUserRank(userIndex >= 0 ? userIndex + 1 : null);
    }
    
    setLoading(false);
  };

  const getTimeFilterLabel = () => {
    switch (timeFilter) {
      case 'today': return "Today's Heroes";
      case 'week': return "This Week's Champions";
      case 'month': return "Monthly Leaders";
      default: return "All-Time Legends";
    }
  };

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1: return <Crown className="w-6 h-6 text-yellow-500" />;
      case 2: return <Medal className="w-6 h-6 text-gray-400" />;
      case 3: return <Award className="w-6 h-6 text-orange-600" />;
      default: return <span className="text-lg font-bold text-gray-600">#{rank}</span>;
    }
  };

  const getMovementIcon = (movement: 'up' | 'down' | 'same') => {
    switch (movement) {
      case 'up': return <ChevronUp className="w-4 h-4 text-green-500" />;
      case 'down': return <ChevronDown className="w-4 h-4 text-red-500" />;
      default: return <span className="w-4 h-4 text-gray-400">-</span>;
    }
  };

  const calculateScoreBreakdown = (stats: ReviewerStats) => {
    return {
      reviews: stats.reviewCount * 100,
      quality: stats.averageRating * 200,
      streak: stats.streak * 50,
      badges: stats.badges.length * 150,
    };
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-gradient-to-br from-purple-900 via-pink-900 to-orange-900 rounded-3xl p-8 text-white shadow-2xl"
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <motion.div
            animate={{ rotate: [0, 10, -10, 0] }}
            transition={{ repeat: Infinity, duration: 2 }}
          >
            <Trophy className="w-10 h-10 text-yellow-400" />
          </motion.div>
          <div>
            <h2 className="text-3xl font-bold">Leaderboard</h2>
            <p className="text-white/70 text-sm">{getTimeFilterLabel()}</p>
          </div>
        </div>

        {/* Time Filters */}
        <div className="flex space-x-2">
          {(['today', 'week', 'month', 'all'] as TimeFilter[]).map((filter) => (
            <motion.button
              key={filter}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setTimeFilter(filter)}
              className={`px-4 py-2 rounded-xl font-medium transition-all ${
                timeFilter === filter
                  ? 'bg-white text-purple-900 shadow-lg'
                  : 'bg-white/10 hover:bg-white/20 text-white'
              }`}
            >
              {filter === 'today' && <Clock className="w-4 h-4 inline mr-1" />}
              {filter === 'week' && <Calendar className="w-4 h-4 inline mr-1" />}
              {filter === 'month' && <TrendingUp className="w-4 h-4 inline mr-1" />}
              {filter === 'all' && <Star className="w-4 h-4 inline mr-1" />}
              {filter.charAt(0).toUpperCase() + filter.slice(1)}
            </motion.button>
          ))}
        </div>
      </div>

      {/* Your Stats Card */}
      {account && userRank && (
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="bg-gradient-to-r from-yellow-500/20 to-orange-500/20 rounded-2xl p-4 mb-6 border border-yellow-500/30"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-yellow-500 rounded-full flex items-center justify-center font-bold text-purple-900">
                #{userRank}
              </div>
              <div>
                <p className="text-white/70 text-sm">Your Rank</p>
                <p className="font-bold text-lg">Keep climbing! 💪</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-2xl font-bold">2,450</p>
              <p className="text-sm text-white/70">Total Points</p>
            </div>
          </div>
        </motion.div>
      )}

      {/* Leaderboard List */}
      <div className="space-y-3">
        <AnimatePresence>
          {loading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto" />
              <p className="mt-4 text-white/70">Loading rankings...</p>
            </div>
          ) : (
            leaderboardData.slice(0, 10).map((reviewer, index) => {
              const isCurrentUser = account && 
                reviewer.address.toLowerCase() === account.slice(0, 6).toLowerCase() + '...' + account.slice(-4).toLowerCase();
              const scoreBreakdown = calculateScoreBreakdown(reviewer);
              
              return (
                <motion.div
                  key={reviewer.address}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  whileHover={{ scale: 1.02 }}
                  className={`relative ${
                    isCurrentUser 
                      ? 'bg-gradient-to-r from-yellow-500/30 to-orange-500/30 border-2 border-yellow-500' 
                      : 'bg-white/10'
                  } rounded-2xl p-4 backdrop-blur transition-all hover:bg-white/15`}
                >
                  {/* Rank Badge for Top 3 */}
                  {index < 3 && (
                    <motion.div
                      initial={{ rotate: -180, scale: 0 }}
                      animate={{ rotate: 0, scale: 1 }}
                      transition={{ delay: index * 0.1 + 0.3 }}
                      className="absolute -top-2 -right-2"
                    >
                      {getRankIcon(index + 1)}
                    </motion.div>
                  )}

                  <div className="flex items-center justify-between">
                    {/* Left: Rank & User Info */}
                    <div className="flex items-center space-x-4">
                      <div className="flex items-center space-x-2">
                        {index >= 3 && (
                          <span className="text-2xl font-bold text-white/50">#{index + 1}</span>
                        )}
                        {index < 3 && getRankIcon(index + 1)}
                        {getMovementIcon(reviewer.movement)}
                      </div>

                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
                          <User className="w-6 h-6" />
                        </div>
                        <div>
                          <div className="flex items-center">
                            <p className="font-semibold text-lg">
                              @{getUserDisplay(reviewer.address)}
                            </p>
                            {isCurrentUser && (
                              <>
                                <span className="ml-2 text-yellow-400">(You)</span>
                                {!currentUsername && (
                                  <motion.button
                                    whileHover={{ scale: 1.1 }}
                                    whileTap={{ scale: 0.9 }}
                                    onClick={() => setShowUsernameModal(true)}
                                    className="ml-2 p-1 hover:bg-white/20 rounded-lg transition-colors"
                                    title="Set username"
                                  >
                                    <Edit2 className="w-3 h-3" />
                                  </motion.button>
                                )}
                              </>
                            )}
                          </div>
                          <div className="flex items-center space-x-3 text-sm text-white/70">
                            <span className="text-xs text-white/50">{reviewer.address}</span>
                            <span className="flex items-center">
                              <Star className="w-3 h-3 mr-1" />
                              {reviewer.reviewCount} reviews
                            </span>
                            <span className="flex items-center">
                              <Flame className="w-3 h-3 mr-1" />
                              {reviewer.streak} day streak
                            </span>
                            <span>⭐ {reviewer.averageRating} avg</span>
                          </div>
                        </div>
                      </div>

                      {/* Badges */}
                      <div className="flex space-x-1">
                        {reviewer.badges.slice(0, 3).map((badgeKey) => (
                          <motion.div
                            key={badgeKey}
                            whileHover={{ scale: 1.2 }}
                            className="text-2xl"
                            title={BADGES[badgeKey as keyof typeof BADGES]?.name}
                          >
                            {BADGES[badgeKey as keyof typeof BADGES]?.icon}
                          </motion.div>
                        ))}
                        {reviewer.badges.length > 3 && (
                          <span className="text-sm text-white/50">+{reviewer.badges.length - 3}</span>
                        )}
                      </div>
                    </div>

                    {/* Right: Score */}
                    <div className="text-right">
                      <motion.p 
                        className="text-3xl font-bold"
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ delay: index * 0.05 + 0.2 }}
                      >
                        {reviewer.totalScore.toLocaleString()}
                      </motion.p>
                      <p className="text-sm text-white/70">points</p>
                    </div>
                  </div>

                  {/* Score Breakdown (on hover) */}
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    whileHover={{ height: 'auto', opacity: 1 }}
                    className="overflow-hidden"
                  >
                    <div className="mt-3 pt-3 border-t border-white/10">
                      <div className="grid grid-cols-4 gap-2 text-xs">
                        <div className="text-center">
                          <p className="text-white/50">Reviews</p>
                          <p className="font-bold">{scoreBreakdown.reviews}</p>
                        </div>
                        <div className="text-center">
                          <p className="text-white/50">Quality</p>
                          <p className="font-bold">{scoreBreakdown.quality}</p>
                        </div>
                        <div className="text-center">
                          <p className="text-white/50">Streak</p>
                          <p className="font-bold">{scoreBreakdown.streak}</p>
                        </div>
                        <div className="text-center">
                          <p className="text-white/50">Badges</p>
                          <p className="font-bold">{scoreBreakdown.badges}</p>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                </motion.div>
              );
            })
          )}
        </AnimatePresence>
      </div>

      {/* Call to Action */}
      {!account && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="mt-6 text-center p-4 bg-white/10 rounded-xl backdrop-blur"
        >
          <p className="text-white/90 mb-2">Want to join the leaderboard?</p>
          <p className="text-sm text-white/70">Connect your wallet and start reviewing!</p>
        </motion.div>
      )}

      {/* Scoring Info */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.6 }}
        className="mt-6 p-4 bg-white/5 rounded-xl"
      >
        <h3 className="font-semibold mb-2 flex items-center">
          <Zap className="w-4 h-4 mr-2 text-yellow-400" />
          How to Earn Points
        </h3>
        <div className="grid grid-cols-2 gap-2 text-sm text-white/70">
          <div>📝 Write a review: +100 pts</div>
          <div>⭐ Quality rating: +200 pts</div>
          <div>🔥 Daily streak: +50 pts/day</div>
          <div>🏅 Earn badges: +150 pts</div>
          <div>📸 Add photos: +75 pts</div>
          <div>🏷️ Add tags: +25 pts</div>
        </div>
      </motion.div>

      {/* Username Modal */}
      <UsernameModal 
        isOpen={showUsernameModal}
        onClose={() => setShowUsernameModal(false)}
      />
    </motion.div>
  );
};