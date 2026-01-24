import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  BookOpenIcon,
  AcademicCapIcon,
  ClockIcon,
  FireIcon,
} from '@heroicons/react/24/outline';
import { useAuthStore, useCollectionStore } from '@/stores';
import { dashboardApi } from '@/api/dashboard';
import Card from '@/components/common/Card';
import { PageLoading } from '@/components/common/Loading';

/**
 * 用户主看板
 */
const Dashboard = () => {
  const { user } = useAuthStore();
  const { collections, fetchCollections, isLoading: isCollectionsLoading } = useCollectionStore();
  const [stats, setStats] = useState({
    totalWords: 0,
    totalCollections: 0,
    todayLearned: 0,
    toReview: 0,
  });
  const [isStatsLoading, setIsStatsLoading] = useState(true);

  useEffect(() => {
    fetchCollections(1, 6); // Fetch top 6 for recent list

    const fetchStats = async () => {
      try {
        const data = await dashboardApi.getStats();
        setStats({
          totalWords: data.total_words,
          totalCollections: data.total_collections,
          todayLearned: data.today_learned,
          toReview: data.to_review,
        });
      } catch (error) {
        console.error("Failed to fetch dashboard stats", error);
      } finally {
        setIsStatsLoading(false);
      }
    };
    fetchStats();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const statsCards = [
    {
      name: '总单词数',
      value: stats.totalWords,
      icon: BookOpenIcon,
      color: 'text-primary-600 dark:text-primary-400',
      bgColor: 'bg-primary-100 dark:bg-primary-900/30',
    },
    {
      name: '单词本',
      value: stats.totalCollections,
      icon: BookOpenIcon,
      color: 'text-green-600 dark:text-green-400',
      bgColor: 'bg-green-100 dark:bg-green-900/30',
    },
    {
      name: '今日学习',
      value: stats.todayLearned,
      icon: FireIcon,
      color: 'text-orange-600 dark:text-orange-400',
      bgColor: 'bg-orange-100 dark:bg-orange-900/30',
    },
    {
      name: '待复习',
      value: stats.toReview,
      icon: ClockIcon,
      color: 'text-purple-600 dark:text-purple-400',
      bgColor: 'bg-purple-100 dark:bg-purple-900/30',
    },
  ];

  if ((isCollectionsLoading || isStatsLoading) && collections.length === 0) {
    return <PageLoading />;
  }

  return (
    <div className="space-y-8">
      {/* Welcome Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          欢迎回来，{user?.nickname || user?.username}！
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mt-2">
          继续您的学习之旅
        </p>
      </motion.div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statsCards.map((stat, index) => (
          <motion.div
            key={stat.name}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1, duration: 0.5 }}
          >
            <Card hoverable>
              <div className="flex items-center space-x-4">
                <div className={`p-3 rounded-lg ${stat.bgColor}`}>
                  <stat.icon className={`w-6 h-6 ${stat.color}`} />
                </div>
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {stat.name}
                  </p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {stat.value}
                  </p>
                </div>
              </div>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Recent Collections */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4, duration: 0.5 }}
      >
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            我的单词本
          </h2>
          <Link
            to="/wordbook"
            className="text-primary-600 dark:text-primary-400 hover:underline"
          >
            查看全部 →
          </Link>
        </div>

        {collections.length === 0 ? (
          <Card>
            <div className="text-center py-12">
              <BookOpenIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                还没有单词本
              </p>
              <Link to="/wordbook">
                <button className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors">
                  创建第一个单词本
                </button>
              </Link>
            </div>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {collections.slice(0, 6).map((collection) => (
              <Link key={collection.id} to={`/wordbook/${collection.id}`}>
                <Card hoverable>
                  <div className="flex items-start space-x-4">
                    <div
                      className="w-12 h-12 rounded-lg flex items-center justify-center text-white text-xl font-bold"
                      style={{ backgroundColor: collection.color || '#3b82f6' }}
                    >
                      {collection.icon || '📚'}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white truncate">
                        {collection.name}
                      </h3>
                      <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                        {collection.word_count || 0} 个单词
                      </p>
                    </div>
                  </div>
                  {collection.description && (
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-3 line-clamp-2">
                      {collection.description}
                    </p>
                  )}
                </Card>
              </Link>
            ))}
          </div>
        )}
      </motion.div>

      {/* Quick Actions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6, duration: 0.5 }}
      >
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
          快捷操作
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Link to="/study/new">
            <Card hoverable>
              <div className="flex items-center space-x-4">
                <div className="p-3 rounded-lg bg-primary-100 dark:bg-primary-900/30">
                  <AcademicCapIcon className="w-8 h-8 text-primary-600 dark:text-primary-400" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    开始学习
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    背诵新单词
                  </p>
                </div>
              </div>
            </Card>
          </Link>

          <Link to="/study/review">
            <Card hoverable>
              <div className="flex items-center space-x-4">
                <div className="p-3 rounded-lg bg-green-100 dark:bg-green-900/30">
                  <ClockIcon className="w-8 h-8 text-green-600 dark:text-green-400" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    复习单词
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    巩固已学单词
                  </p>
                </div>
              </div>
            </Card>
          </Link>
        </div>
      </motion.div>
    </div>
  );
};

export default Dashboard;
