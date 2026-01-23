import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import {
  BookOpenIcon,
  ClockIcon,
  BeakerIcon,
  CheckCircleIcon
} from '@heroicons/react/24/outline';
import { collectionsApi } from '@/api/collections';
import { examApi } from '@/api/exam';
import Button from '@/components/common/Button';

const Review = () => {
  const navigate = useNavigate();
  const [collections, setCollections] = useState([]);
  const [selectedCollection, setSelectedCollection] = useState('');
  const [loading, setLoading] = useState(false);
  const [generating, setGenerating] = useState(false);

  // 加载单词本列表
  useEffect(() => {
    const fetchCollections = async () => {
      try {
        setLoading(true);
        const res = await collectionsApi.getList({ page: 1, page_size: 100 });
        setCollections(res.collections || []);
        if (res.collections && res.collections.length > 0) {
          setSelectedCollection(res.collections[0].id);
        }
      } catch (error) {
        toast.error('获取单词本失败');
      } finally {
        setLoading(false);
      }
    };
    fetchCollections();
  }, []);

  const handleGenerate = async () => {
    if (!selectedCollection) {
      toast.error('请先选择单词本');
      return;
    }

    try {
      setGenerating(true);
      const res = await examApi.generate(selectedCollection, {
        mode: 'immediate',
        count: 20
      });

      if (res.success) {
        toast.success(res.message || '考试生成任务已提交');
        // 可以跳转到仪表盘或保持在当前页面
        // navigate('/dashboard');
      } else {
        // 后端返回 success: false (例如单词数不足)
        toast.error(res.message || '生成失败');
      }
    } catch (error) {
      console.error(error);
      toast.error('生成请求失败，请稍后重试');
    } finally {
      setGenerating(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center p-4 bg-gray-50 dark:bg-dark-bg">
      <div className="max-w-5xl w-full bg-white dark:bg-dark-surface rounded-2xl shadow-xl overflow-hidden flex flex-col md:flex-row min-h-[600px]">

        {/* 左侧：视觉区域 */}
        <div className="md:w-1/2 bg-blue-600 p-12 text-white flex flex-col justify-between relative overflow-hidden">
          <div className="relative z-10">
            <div className="w-16 h-16 bg-blue-500/50 rounded-2xl flex items-center justify-center mb-8 backdrop-blur-sm">
              <ClockIcon className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-4xl font-bold mb-6">即时复习</h1>
            <p className="text-blue-100 text-lg leading-relaxed mb-8">
              系统将为您挑选最近学习且状态为"复习中"的单词。
              通过拼写和翻译测试，巩固记忆，将单词推向下一个记忆阶段。
            </p>

            <div className="space-y-4">
              <div className="flex items-center text-blue-100">
                <CheckCircleIcon className="w-5 h-5 mr-3 text-blue-300" />
                <span>精准筛选 Status 2 单词</span>
              </div>
              <div className="flex items-center text-blue-100">
                <CheckCircleIcon className="w-5 h-5 mr-3 text-blue-300" />
                <span>智能生成翻译例句</span>
              </div>
              <div className="flex items-center text-blue-100">
                <CheckCircleIcon className="w-5 h-5 mr-3 text-blue-300" />
                <span>自动评判与状态流转</span>
              </div>
            </div>
          </div>

          {/* 装饰背景圆 */}
          <div className="absolute top-0 right-0 -mr-20 -mt-20 w-80 h-80 bg-blue-500 rounded-full opacity-20 blur-3xl"></div>
          <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-60 h-60 bg-indigo-500 rounded-full opacity-20 blur-3xl"></div>
        </div>

        {/* 右侧：操作区域 */}
        <div className="md:w-1/2 p-12 flex flex-col justify-center bg-white dark:bg-dark-surface">
          <div className="max-w-md mx-auto w-full space-y-8">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                开始复习会话
              </h2>
              <p className="text-gray-500 dark:text-gray-400">
                请选择一个单词本开始生成复习试卷
              </p>
            </div>

            <div className="space-y-6">
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  选择单词本
                </label>
                {loading ? (
                  <div className="h-10 bg-gray-100 dark:bg-gray-700 rounded-lg animate-pulse"></div>
                ) : (
                  <div className="relative">
                    <BookOpenIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <select
                      value={selectedCollection}
                      onChange={(e) => setSelectedCollection(e.target.value)}
                      className="w-full pl-10 pr-4 py-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all dark:text-white appearance-none"
                    >
                      {collections.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.name} ({c.word_count} 词)
                        </option>
                      ))}
                    </select>
                  </div>
                )}
              </div>

              <div className="p-4 bg-yellow-50 dark:bg-yellow-900/10 rounded-xl border border-yellow-100 dark:border-yellow-900/30">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <BeakerIcon className="h-5 w-5 text-yellow-400" aria-hidden="true" />
                  </div>
                  <div className="ml-3">
                    <h3 className="text-sm font-medium text-yellow-800 dark:text-yellow-200">
                      生成规则
                    </h3>
                    <div className="mt-2 text-sm text-yellow-700 dark:text-yellow-300">
                      <ul className="list-disc pl-5 space-y-1">
                        <li>每次生成 20 个单词</li>
                        <li>需要单词本中至少有 10 个待复习单词</li>
                        <li>生成过程需要约 1-2 分钟，请留意站内信通知</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>

              <Button
                size="lg"
                className="w-full justify-center py-4 text-lg"
                onClick={handleGenerate}
                loading={generating}
                disabled={loading || collections.length === 0}
              >
                生成复习试卷
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Review;
