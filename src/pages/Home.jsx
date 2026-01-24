import { Link } from 'react-router-dom';
// eslint-disable-next-line no-unused-vars
import { motion } from 'framer-motion';
import {
  BookOpenIcon,
  AcademicCapIcon,
  ChartBarIcon,
  SparklesIcon,
} from '@heroicons/react/24/outline';
import Button from '@/components/common/Button';
import { useConfigStore } from '@/stores';

/**
 * 首页 - 系统介绍
 */
const Home = () => {
  const { isConfigured } = useConfigStore();

  const features = [
    {
      name: 'AI智能翻译',
      description: '基于大模型的智能单词翻译，自动生成例句和音标',
      icon: SparklesIcon,
    },
    {
      name: '科学记忆曲线',
      description: '根据艾宾浩斯遗忘曲线，智能安排复习时间',
      icon: AcademicCapIcon,
    },
    {
      name: '多模式学习',
      description: '新词背诵、即时复习、随机复习、完全复习四种模式',
      icon: BookOpenIcon,
    },
    {
      name: '数据可视化',
      description: '学习进度、复习曲线一目了然，激励持续学习',
      icon: ChartBarIcon,
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-purple-50 dark:from-dark-bg dark:via-dark-surface dark:to-dark-bg">
      {/* Hero Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <motion.div
          className="text-center"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <h1 className="text-5xl md:text-6xl font-bold text-gray-900 dark:text-white mb-6">
            <span className="text-gradient">WordMaster</span>
          </h1>
          <p className="text-xl md:text-2xl text-gray-600 dark:text-gray-300 mb-8">
            AI驱动的智能背单词系统
          </p>
          <p className="text-lg text-gray-500 dark:text-gray-400 mb-12 max-w-2xl mx-auto">
            通过大模型技术提供智能化的单词学习、复习和评测功能。
            <br />
            科学的记忆曲线，让背单词更高效。
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-4">
            <Link to={isConfigured ? '/user/register' : '/url-config'}>
              <Button size="lg" variant="primary">
                {isConfigured ? '注册' : '开始使用'}
              </Button>
            </Link>
            <Link to="/user/login">
              <Button size="lg" variant="outline">
                已有账号？登录
              </Button>
            </Link>
          </div>
        </motion.div>

        {/* Features */}
        <motion.div
          className="mt-24 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.6 }}
        >
          {features.map((feature, index) => (
            <motion.div
              key={feature.name}
              className="bg-white dark:bg-dark-surface rounded-xl p-6 shadow-lg hover:shadow-xl transition-shadow"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 + index * 0.1, duration: 0.5 }}
              whileHover={{ y: -4 }}
            >
              <div className="w-12 h-12 bg-primary-100 dark:bg-primary-900/30 rounded-lg flex items-center justify-center mb-4">
                <feature.icon className="w-6 h-6 text-primary-600 dark:text-primary-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                {feature.name}
              </h3>
              <p className="text-gray-600 dark:text-gray-400 text-sm">
                {feature.description}
              </p>
            </motion.div>
          ))}
        </motion.div>

        {/* How it works */}
        <motion.div
          className="mt-24"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8, duration: 0.6 }}
        >
          <h2 className="text-3xl font-bold text-center text-gray-900 dark:text-white mb-12">
            使用流程
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                step: '01',
                title: '配置后端',
                description: '输入后端API地址，测试连接',
              },
              {
                step: '02',
                title: '导入单词',
                description: '创建单词本，批量导入单词',
              },
              {
                step: '03',
                title: '开始学习',
                description: '选择学习模式，开始背单词',
              },
            ].map((item, index) => (
              <motion.div
                key={item.step}
                className="relative"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 1 + index * 0.1, duration: 0.5 }}
              >
                <div className="text-center">
                  <div className="text-6xl font-bold text-primary-200 dark:text-primary-900/30 mb-4">
                    {item.step}
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                    {item.title}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400">
                    {item.description}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Footer */}
        <motion.div
          className="mt-24 text-center text-gray-500 dark:text-gray-400 text-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.5, duration: 0.6 }}
        >
          <p>WordMaster v1.2.0 - 开源背单词系统</p>
        </motion.div>
      </div>
    </div>
  );
};

export default Home;
