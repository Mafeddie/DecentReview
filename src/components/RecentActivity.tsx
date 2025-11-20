import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Clock, Star, MessageSquare, Camera, Award, 
  TrendingUp, Users, Sparkles, Filter, Calendar
} from 'lucide-react';

interface ActivityItem {
  id: string;
  type: 'review' | 'response' | 'photo' | 'badge' | 'trending';
  user: string;
  business?: string;
  rating?: number;
  badge?: string;
  message?: string;
  timestamp: Date;
  likes?: number;
}

// Mock data generator
const generateMockActivities = (): ActivityItem[] => {
  const activities: ActivityItem[] = [
    {
      id: '1',
      type: 'review',
      user: '0x742d...8c3f',
      business: 'Java House',
      rating: 5,
      message: 'Amazing coffee and great ambiance for work!',
      timestamp: new Date(Date.now() - 1000 * 60 * 5),
      likes: 12
    },
    {
      id: '2',
      type: 'trending',
      user: '0x9fa2...4e7b',
      business: 'Carnivore Restaurant',
      message: 'This review is trending with 50+ likes!',
      timestamp: new Date(Date.now() - 1000 * 60 * 30),
      likes: 52
    },
    {
      id: '3',
      type: 'photo',
      user: '0x3c8a...1d9e',
      business: 'Sarit Centre',
      message: 'Added 4 new photos',
      timestamp: new Date(Date.now() - 1000 * 60 * 60),
      likes: 8
    },
    {
      id: '4',
      type: 'badge',
      user: '0xa5b6...7f2c',
      badge: 'Elite Reviewer',
      message: 'Just earned Elite Reviewer status!',
      timestamp: new Date(Date.now() - 1000 * 60 * 120),
      likes: 25
    },
    {
      id: '5',
      type: 'response',
      user: 'Talisman Restaurant',
      message: 'Thank you for your wonderful review!',
      timestamp: new Date(Date.now() - 1000 * 60 * 180),
      likes: 5
    }
  ];

  // Generate more random activities
  for (let i = 6; i <= 20; i++) {
    activities.push({
      id: i.toString(),
      type: ['review', 'photo', 'badge', 'response'][Math.floor(Math.random() * 4)] as any,
      user: `0x${Math.random().toString(16).slice(2, 6)}...${Math.random().toString(16).slice(2, 6)}`,
      business: ['Nairobi National Park', 'ArtCaffe', 'Two Rivers Mall', 'Giraffe Centre'][Math.floor(Math.random() * 4)],
      rating: Math.floor(Math.random() * 3) + 3,
      message: 'Great experience!',
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * Math.random() * 24),
      likes: Math.floor(Math.random() * 30)
    });
  }

  return activities.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
};

export const RecentActivity: React.FC = () => {
  const [activities, setActivities] = useState<ActivityItem[]>([]);
  const [filter, setFilter] = useState<'all' | 'review' | 'photo' | 'badge'>('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate loading activities
    setTimeout(() => {
      setActivities(generateMockActivities());
      setLoading(false);
    }, 1000);
  }, []);

  const filteredActivities = activities.filter(activity => {
    if (filter === 'all') return true;
    return activity.type === filter;
  });

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'review': return <Star className="w-5 h-5 text-yellow-500" />;
      case 'response': return <MessageSquare className="w-5 h-5 text-blue-500" />;
      case 'photo': return <Camera className="w-5 h-5 text-green-500" />;
      case 'badge': return <Award className="w-5 h-5 text-purple-500" />;
      case 'trending': return <TrendingUp className="w-5 h-5 text-red-500" />;
      default: return <Sparkles className="w-5 h-5 text-gray-500" />;
    }
  };

  const formatTime = (date: Date) => {
    const diff = Date.now() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (days > 0) return `${days} day${days > 1 ? 's' : ''} ago`;
    if (hours > 0) return `${hours} hour${hours > 1 ? 's' : ''} ago`;
    return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-r from-purple-600 via-pink-600 to-orange-500 rounded-3xl p-6 text-white shadow-2xl"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ repeat: Infinity, duration: 3, ease: "linear" }}
            >
              <Clock className="w-8 h-8" />
            </motion.div>
            <div>
              <h2 className="text-2xl font-bold">Live Activity Feed</h2>
              <p className="text-white/80">See what's happening in the community</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-2 bg-white/20 backdrop-blur px-4 py-2 rounded-xl">
            <Users className="w-5 h-5" />
            <span className="font-semibold">{activities.length} activities today</span>
          </div>
        </div>
      </motion.div>

      {/* Filters */}
      <div className="flex space-x-2">
        {(['all', 'review', 'photo', 'badge'] as const).map((filterType) => (
          <motion.button
            key={filterType}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setFilter(filterType)}
            className={`
              px-4 py-2 rounded-xl font-medium transition-all
              ${filter === filterType
                ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg'
                : 'bg-white text-gray-700 hover:bg-gray-100'
              }
            `}
          >
            <Filter className="w-4 h-4 inline mr-2" />
            {filterType.charAt(0).toUpperCase() + filterType.slice(1)}
          </motion.button>
        ))}
      </div>

      {/* Activity List */}
      <div className="space-y-4">
        <AnimatePresence>
          {loading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto" />
              <p className="mt-4 text-gray-500">Loading activities...</p>
            </div>
          ) : (
            filteredActivities.map((activity, index) => (
              <motion.div
                key={activity.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ delay: index * 0.05 }}
                whileHover={{ scale: 1.02 }}
                className="bg-white rounded-2xl shadow-lg p-6 border border-purple-100"
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-4">
                    {/* Icon */}
                    <motion.div
                      whileHover={{ rotate: 360 }}
                      transition={{ duration: 0.5 }}
                      className="p-3 bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl"
                    >
                      {getActivityIcon(activity.type)}
                    </motion.div>

                    {/* Content */}
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-1">
                        <span className="font-semibold text-gray-900">{activity.user}</span>
                        {activity.type === 'trending' && (
                          <span className="px-2 py-0.5 bg-red-100 text-red-600 text-xs rounded-full font-medium">
                            Trending 🔥
                          </span>
                        )}
                      </div>

                      {/* Activity Description */}
                      <div className="text-gray-700">
                        {activity.type === 'review' && (
                          <>
                            Reviewed <span className="font-semibold">{activity.business}</span>
                            <div className="flex items-center space-x-1 mt-1">
                              {[...Array(5)].map((_, i) => (
                                <Star
                                  key={i}
                                  className={`w-4 h-4 ${
                                    i < (activity.rating || 0)
                                      ? 'fill-yellow-400 text-yellow-400'
                                      : 'text-gray-300'
                                  }`}
                                />
                              ))}
                            </div>
                          </>
                        )}
                        {activity.type === 'photo' && (
                          <>Added photos to <span className="font-semibold">{activity.business}</span></>
                        )}
                        {activity.type === 'badge' && (
                          <>Earned <span className="font-semibold">{activity.badge}</span> badge!</>
                        )}
                        {activity.type === 'response' && (
                          <>Business owner responded to a review</>
                        )}
                      </div>

                      {/* Message */}
                      {activity.message && (
                        <p className="mt-2 text-gray-600 italic">"{activity.message}"</p>
                      )}

                      {/* Engagement */}
                      <div className="flex items-center space-x-4 mt-3">
                        <motion.button
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          className="flex items-center space-x-1 text-gray-500 hover:text-purple-600"
                        >
                          <Sparkles className="w-4 h-4" />
                          <span className="text-sm">{activity.likes} likes</span>
                        </motion.button>
                        <span className="text-sm text-gray-400">{formatTime(activity.timestamp)}</span>
                      </div>
                    </div>
                  </div>

                  {/* Trending Indicator */}
                  {activity.likes && activity.likes > 20 && (
                    <motion.div
                      animate={{
                        scale: [1, 1.2, 1],
                      }}
                      transition={{
                        repeat: Infinity,
                        duration: 2
                      }}
                      className="text-2xl"
                    >
                      🔥
                    </motion.div>
                  )}
                </div>
              </motion.div>
            ))
          )}
        </AnimatePresence>
      </div>

      {/* Load More */}
      {!loading && filteredActivities.length > 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center"
        >
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl font-semibold shadow-lg"
          >
            Load More Activities
          </motion.button>
        </motion.div>
      )}
    </div>
  );
};