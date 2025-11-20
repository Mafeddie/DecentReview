import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Home, Trophy, User, TrendingUp, Sparkles, 
  Star, Award, ChartBar, Globe, Zap
} from 'lucide-react';

export type TabType = 'explore' | 'leaderboard' | 'profile' | 'activity';

interface ModernTabsProps {
  activeTab: TabType;
  onTabChange: (tab: TabType) => void;
  notifications?: {
    explore?: number;
    leaderboard?: number;
    profile?: number;
    activity?: number;
  };
}

const tabs = [
  { 
    id: 'explore' as TabType, 
    label: 'Explore', 
    icon: Globe,
    color: 'from-purple-500 to-pink-500',
    description: 'Discover businesses'
  },
  { 
    id: 'leaderboard' as TabType, 
    label: 'Leaderboard', 
    icon: Trophy,
    color: 'from-yellow-500 to-orange-500',
    description: 'Top reviewers'
  },
  { 
    id: 'profile' as TabType, 
    label: 'Profile', 
    icon: User,
    color: 'from-blue-500 to-indigo-500',
    description: 'Your stats'
  },
  { 
    id: 'activity' as TabType, 
    label: 'Activity', 
    icon: TrendingUp,
    color: 'from-green-500 to-emerald-500',
    description: 'Recent reviews'
  }
];

export const ModernTabs: React.FC<ModernTabsProps> = ({ 
  activeTab, 
  onTabChange,
  notifications = {}
}) => {
  const [hoveredTab, setHoveredTab] = useState<TabType | null>(null);
  const activeIndex = tabs.findIndex(tab => tab.id === activeTab);
  const tabWidth = 100 / tabs.length;

  return (
    <div className="relative">
      {/* Main Tab Container */}
      <div className="bg-white/90 backdrop-blur-xl rounded-2xl shadow-2xl p-2 border border-purple-100">
        <div className="relative flex">
          {/* Animated Background Indicator */}
          <motion.div
            className="absolute inset-y-0 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl shadow-lg"
            initial={false}
            animate={{
              left: `${activeIndex * tabWidth}%`,
              width: `${tabWidth}%`,
            }}
            transition={{
              type: "spring",
              stiffness: 300,
              damping: 30
            }}
          />

          {/* Tab Items */}
          {tabs.map((tab, index) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            const isHovered = hoveredTab === tab.id;
            const hasNotification = notifications[tab.id] && notifications[tab.id]! > 0;

            return (
              <motion.button
                key={tab.id}
                onClick={() => onTabChange(tab.id)}
                onHoverStart={() => setHoveredTab(tab.id)}
                onHoverEnd={() => setHoveredTab(null)}
                className="relative flex-1 z-10 group px-1"
                whileTap={{ scale: 0.95 }}
              >
                <div className={`
                  relative px-4 py-3 rounded-xl transition-all duration-200
                  ${isActive ? '' : 'hover:bg-white/50'}
                `}>
                  {/* Content */}
                  <div className="flex flex-col items-center space-y-1">
                    {/* Icon with animation */}
                    <motion.div
                      animate={{
                        scale: isActive ? 1.1 : 1,
                        rotate: isActive ? [0, -10, 10, 0] : 0
                      }}
                      transition={{
                        rotate: {
                          repeat: isActive ? Infinity : 0,
                          duration: 3,
                          ease: "easeInOut"
                        }
                      }}
                      className={`
                        relative p-2 rounded-lg
                        ${isActive 
                          ? 'text-white' 
                          : 'text-gray-600 group-hover:text-gray-900'
                        }
                      `}
                    >
                      <Icon className="w-5 h-5" />
                      
                      {/* Notification Badge */}
                      {hasNotification && (
                        <motion.div
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center font-bold shadow-lg"
                        >
                          {notifications[tab.id]}
                        </motion.div>
                      )}
                    </motion.div>

                    {/* Label */}
                    <span className={`
                      text-sm font-semibold transition-all
                      ${isActive 
                        ? 'text-white' 
                        : 'text-gray-700 group-hover:text-gray-900'
                      }
                    `}>
                      {tab.label}
                    </span>

                    {/* Description - only show on hover */}
                    <AnimatePresence>
                      {(isHovered && !isActive) && (
                        <motion.span
                          initial={{ opacity: 0, y: -5 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -5 }}
                          className="absolute -bottom-6 left-1/2 transform -translate-x-1/2 text-xs text-gray-500 whitespace-nowrap bg-white px-2 py-1 rounded shadow-lg"
                        >
                          {tab.description}
                        </motion.span>
                      )}
                    </AnimatePresence>
                  </div>

                  {/* Active Indicator Sparkle */}
                  {isActive && (
                    <motion.div
                      className="absolute top-0 right-0"
                      animate={{
                        scale: [1, 1.5, 1],
                        opacity: [0.5, 1, 0.5]
                      }}
                      transition={{
                        repeat: Infinity,
                        duration: 2
                      }}
                    >
                      <Sparkles className="w-4 h-4 text-yellow-300" />
                    </motion.div>
                  )}
                </div>
              </motion.button>
            );
          })}
        </div>
      </div>

      {/* Decorative Elements */}
      <div className="absolute -top-2 -right-2 w-20 h-20 bg-gradient-to-br from-purple-400 to-pink-400 rounded-full blur-3xl opacity-20" />
      <div className="absolute -bottom-2 -left-2 w-20 h-20 bg-gradient-to-br from-blue-400 to-indigo-400 rounded-full blur-3xl opacity-20" />
    </div>
  );
};

// Tab Panel Component for smooth content transitions
export const TabPanel: React.FC<{
  children: React.ReactNode;
  tabKey: string;
}> = ({ children, tabKey }) => {
  return (
    <motion.div
      key={tabKey}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3 }}
      className="mt-6"
    >
      {children}
    </motion.div>
  );
};