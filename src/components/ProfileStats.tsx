import React from 'react';
import { motion } from 'framer-motion';
import { useWallet } from '../hooks/useWallet';
import { 
  User, Trophy, Star, TrendingUp, Award, Target,
  Calendar, Clock, Zap, Gift, Shield, Sparkles,
  MessageSquare, Camera, Hash, Flame
} from 'lucide-react';

interface StatCardProps {
  icon: React.ReactNode;
  label: string;
  value: string | number;
  color: string;
  trend?: number;
  delay?: number;
}

const StatCard: React.FC<StatCardProps> = ({ icon, label, value, color, trend, delay = 0 }) => {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay }}
      whileHover={{ scale: 1.05 }}
      className={`bg-gradient-to-br ${color} p-6 rounded-2xl shadow-xl text-white relative overflow-hidden`}
    >
      <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16" />
      <div className="relative z-10">
        <div className="flex items-center justify-between mb-3">
          <div className="p-3 bg-white/20 rounded-xl backdrop-blur">
            {icon}
          </div>
          {trend !== undefined && (
            <div className={`flex items-center space-x-1 text-sm ${trend >= 0 ? 'text-green-200' : 'text-red-200'}`}>
              <TrendingUp className="w-4 h-4" />
              <span>{trend >= 0 ? '+' : ''}{trend}%</span>
            </div>
          )}
        </div>
        <div className="text-3xl font-bold mb-1">{value}</div>
        <div className="text-white/80 text-sm">{label}</div>
      </div>
    </motion.div>
  );
};

export const ProfileStats: React.FC = () => {
  const { account, userRole } = useWallet();

  // Mock stats for demonstration
  const stats = {
    totalReviews: 24,
    averageRating: 4.3,
    helpfulVotes: 156,
    photosUploaded: 12,
    businessesReviewed: 18,
    currentStreak: 7,
    totalPoints: 3420,
    globalRank: 15,
    badges: 6,
    responseRate: 92
  };

  const achievements = [
    { id: 'pioneer', name: 'Pioneer', icon: '🚀', unlocked: true, description: 'One of the first reviewers' },
    { id: 'photographer', name: 'Photographer', icon: '📸', unlocked: true, description: 'Added 10+ photos' },
    { id: 'consistent', name: 'Consistent', icon: '⭐', unlocked: true, description: '5+ quality reviews' },
    { id: 'explorer', name: 'Explorer', icon: '🗺️', unlocked: false, description: 'Review 25 businesses' },
    { id: 'influencer', name: 'Influencer', icon: '✨', unlocked: false, description: '100+ helpful votes' },
    { id: 'champion', name: 'Champion', icon: '🏆', unlocked: false, description: 'Reach top 10' }
  ];

  const recentActivity = [
    { type: 'review', business: 'Java House', rating: 5, time: '2 hours ago' },
    { type: 'photo', business: 'Carnivore Restaurant', count: 3, time: '1 day ago' },
    { type: 'badge', achievement: 'Photographer', time: '3 days ago' },
    { type: 'review', business: 'Sarit Centre', rating: 4, time: '5 days ago' }
  ];

  if (!account) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="text-center py-16"
      >
        <User className="w-16 h-16 text-gray-300 mx-auto mb-4" />
        <h3 className="text-xl font-semibold text-gray-700 mb-2">Connect Your Wallet</h3>
        <p className="text-gray-500">Sign in to view your profile and stats</p>
      </motion.div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Profile Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-r from-purple-600 via-pink-600 to-orange-500 rounded-3xl p-8 text-white shadow-2xl"
      >
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-4">
            <motion.div
              whileHover={{ rotate: 360 }}
              transition={{ duration: 0.5 }}
              className="w-20 h-20 bg-white/20 backdrop-blur rounded-2xl flex items-center justify-center"
            >
              <User className="w-10 h-10" />
            </motion.div>
            <div>
              <h2 className="text-2xl font-bold mb-1">
                {account.slice(0, 6)}...{account.slice(-4)}
              </h2>
              <p className="text-white/80 capitalize">{userRole.replace('_', ' ')}</p>
              <div className="flex items-center space-x-3 mt-2">
                <div className="flex items-center space-x-1">
                  <Trophy className="w-4 h-4 text-yellow-300" />
                  <span className="text-sm">Rank #{stats.globalRank}</span>
                </div>
                <div className="flex items-center space-x-1">
                  <Flame className="w-4 h-4 text-orange-300" />
                  <span className="text-sm">{stats.currentStreak} day streak</span>
                </div>
              </div>
            </div>
          </div>
          
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.3 }}
            className="text-right"
          >
            <div className="text-4xl font-bold">{stats.totalPoints}</div>
            <div className="text-sm text-white/80">Total Points</div>
          </motion.div>
        </div>
      </motion.div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          icon={<Star className="w-6 h-6" />}
          label="Total Reviews"
          value={stats.totalReviews}
          color="from-purple-500 to-pink-500"
          trend={12}
          delay={0.1}
        />
        <StatCard
          icon={<Award className="w-6 h-6" />}
          label="Average Rating"
          value={stats.averageRating}
          color="from-blue-500 to-indigo-500"
          trend={5}
          delay={0.2}
        />
        <StatCard
          icon={<Camera className="w-6 h-6" />}
          label="Photos Uploaded"
          value={stats.photosUploaded}
          color="from-green-500 to-emerald-500"
          delay={0.3}
        />
        <StatCard
          icon={<MessageSquare className="w-6 h-6" />}
          label="Helpful Votes"
          value={stats.helpfulVotes}
          color="from-orange-500 to-red-500"
          trend={23}
          delay={0.4}
        />
      </div>

      {/* Achievements Section */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="bg-white rounded-2xl shadow-xl p-6"
      >
        <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
          <Trophy className="w-5 h-5 mr-2 text-yellow-500" />
          Achievements
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {achievements.map((achievement, index) => (
            <motion.div
              key={achievement.id}
              initial={{ opacity: 0, scale: 0 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.6 + index * 0.1 }}
              whileHover={{ scale: 1.1 }}
              className={`
                relative p-4 rounded-xl text-center cursor-pointer transition-all
                ${achievement.unlocked 
                  ? 'bg-gradient-to-br from-yellow-50 to-orange-50 border-2 border-yellow-300' 
                  : 'bg-gray-100 border-2 border-gray-200 opacity-50'
                }
              `}
            >
              <div className="text-3xl mb-2">{achievement.icon}</div>
              <div className="text-xs font-semibold text-gray-700">{achievement.name}</div>
              {achievement.unlocked && (
                <motion.div
                  className="absolute -top-1 -right-1"
                  animate={{ rotate: 360 }}
                  transition={{ repeat: Infinity, duration: 3, ease: "linear" }}
                >
                  <Sparkles className="w-4 h-4 text-yellow-500" />
                </motion.div>
              )}
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Recent Activity */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.7 }}
        className="bg-white rounded-2xl shadow-xl p-6"
      >
        <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
          <Clock className="w-5 h-5 mr-2 text-blue-500" />
          Recent Activity
        </h3>
        <div className="space-y-3">
          {recentActivity.map((activity, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.8 + index * 0.1 }}
              className="flex items-center justify-between p-3 bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl"
            >
              <div className="flex items-center space-x-3">
                {activity.type === 'review' && <Star className="w-5 h-5 text-yellow-500" />}
                {activity.type === 'photo' && <Camera className="w-5 h-5 text-blue-500" />}
                {activity.type === 'badge' && <Award className="w-5 h-5 text-purple-500" />}
                <div>
                  {activity.type === 'review' && (
                    <span>Reviewed <strong>{activity.business}</strong> ({activity.rating}⭐)</span>
                  )}
                  {activity.type === 'photo' && (
                    <span>Added {activity.count} photos to <strong>{activity.business}</strong></span>
                  )}
                  {activity.type === 'badge' && (
                    <span>Earned <strong>{activity.achievement}</strong> badge!</span>
                  )}
                </div>
              </div>
              <span className="text-sm text-gray-500">{activity.time}</span>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Progress to Next Level */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.9 }}
        className="bg-gradient-to-r from-purple-100 to-pink-100 rounded-2xl p-6"
      >
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-bold text-gray-900">Progress to Elite Reviewer</h3>
          <span className="text-sm text-gray-600">680 / 1000 points</span>
        </div>
        <div className="w-full bg-white rounded-full h-4 overflow-hidden">
          <motion.div
            className="h-full bg-gradient-to-r from-purple-500 to-pink-500"
            initial={{ width: 0 }}
            animate={{ width: '68%' }}
            transition={{ duration: 1, delay: 1 }}
          />
        </div>
        <div className="flex justify-between mt-3 text-sm text-gray-600">
          <span>Current: Top Contributor</span>
          <span>Next: Elite Reviewer</span>
        </div>
      </motion.div>
    </div>
  );
};