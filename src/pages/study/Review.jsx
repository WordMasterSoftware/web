import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import {
  BookOpenIcon,
  BeakerIcon,
  ClockIcon,
  InformationCircleIcon,
  PlusIcon,
  CheckCircleIcon,
  XCircleIcon,
  ArrowLeftIcon
} from '@heroicons/react/24/outline';
import { collectionsApi } from '@/api/collections';
import { examApi } from '@/api/exam';
import Button from '@/components/common/Button';
import Card from '@/components/common/Card';
import Modal from '@/components/common/Modal';
import { PageLoading } from '@/components/common/Loading';
import { useNavigate } from 'react-router-dom';

/**
 * Generation View Component (The Split-Screen UI)
 */
const GenerateView = ({ onBack, onSuccess }) => {
  const [collections, setCollections] = useState([]);
  const [selectedCollection, setSelectedCollection] = useState('');
  const [loading, setLoading] = useState(false);
  const [generating, setGenerating] = useState(false);

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
        onSuccess();
      } else {
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
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="max-w-5xl w-full mx-auto bg-white dark:bg-dark-surface rounded-2xl shadow-xl overflow-hidden flex flex-col md:flex-row min-h-[600px] border border-gray-100 dark:border-dark-border"
    >
      {/* Left: Visual Area */}
      <div className="md:w-1/2 bg-blue-600 p-12 text-white flex flex-col justify-between relative overflow-hidden">
        <div className="relative z-10">
          <button
            onClick={onBack}
            className="flex items-center text-blue-100 hover:text-white mb-8 transition-colors"
          >
            <ArrowLeftIcon className="w-5 h-5 mr-2" />
            返回列表
          </button>

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

        {/* Background Decorations */}
        <div className="absolute top-0 right-0 -mr-20 -mt-20 w-80 h-80 bg-blue-500 rounded-full opacity-20 blur-3xl"></div>
        <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-60 h-60 bg-indigo-500 rounded-full opacity-20 blur-3xl"></div>
      </div>

      {/* Right: Control Panel */}
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

            <div className="flex gap-4">
              <Button
                variant="outline"
                className="flex-1 justify-center py-4"
                onClick={onBack}
                disabled={generating}
              >
                取消
              </Button>
              <Button
                size="lg"
                className="flex-1 justify-center py-4 text-lg"
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
    </motion.div>
  );
};

/**
 * List View Component (Exam History)
 */
const ExamList = ({ onGenerate }) => {
  const navigate = useNavigate();
  const [exams, setExams] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchExams = async () => {
    try {
      setLoading(true);
      const res = await examApi.getList({ page: 1, size: 20 });
      setExams(res.exams || []);
    } catch (error) {
      toast.error('获取考试记录失败');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchExams();
  }, []);

  const getStatusBadge = (status) => {
    switch (status) {
      case 'completed':
        return <span className="px-2 py-1 bg-green-100 text-green-700 rounded text-xs font-bold dark:bg-green-900/30 dark:text-green-400">已完成</span>;
      case 'failed':
        return <span className="px-2 py-1 bg-red-100 text-red-700 rounded text-xs font-bold dark:bg-red-900/30 dark:text-red-400">失败</span>;
      case 'generated':
        return <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs font-bold dark:bg-blue-900/30 dark:text-blue-400">待考试</span>;
      case 'pending':
        return <span className="px-2 py-1 bg-yellow-100 text-yellow-700 rounded text-xs font-bold dark:bg-yellow-900/30 dark:text-yellow-400">生成中</span>;
      default:
        return <span className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs dark:bg-gray-800 dark:text-gray-400">{status}</span>;
    }
  };

  if (loading) return <PageLoading />;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="space-y-6"
    >
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">复习试卷</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">查看历史考试记录或生成新的复习</p>
        </div>
        <Button onClick={onGenerate}>
          <PlusIcon className="w-5 h-5 mr-2" />
          生成复习
        </Button>
      </div>

      {exams.length === 0 ? (
        <Card className="text-center py-12">
          <BeakerIcon className="w-16 h-16 mx-auto text-gray-300 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-white">暂无考试记录</h3>
          <p className="text-gray-500 dark:text-gray-400 mt-2 mb-6">您还没有生成过任何复习试卷</p>
          <Button onClick={onGenerate}>开始第一次复习</Button>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {exams.map((exam) => (
            <Card
              key={exam.exam_id}
              hoverable
              className="relative overflow-hidden cursor-pointer group"
              onClick={() => {
                if (exam.exam_status === 'generated' || exam.exam_status === 'completed') {
                  navigate(`/exam/${exam.exam_id}`);
                }
              }}
            >
              <div className="flex justify-between items-start mb-4">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-primary-50 dark:bg-primary-900/20 rounded-lg">
                    <ClockIcon className="w-6 h-6 text-primary-600 dark:text-primary-400" />
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900 dark:text-white">{exam.collection_name || '未知单词本'}</h3>
                    <p className="text-xs text-gray-500">{new Date(exam.created_at).toLocaleString()}</p>
                  </div>
                </div>
                {getStatusBadge(exam.exam_status)}
              </div>

              <div className="flex items-center justify-between text-sm text-gray-600 dark:text-gray-400 border-t pt-4 border-gray-100 dark:border-dark-border">
                <span>{exam.total_words} 单词</span>
                <span>{exam.translation_sentences_count} 例句</span>
              </div>

              {/* Hover Effect overlay for interactive cards */}
              {exam.exam_status === 'generated' && (
                <div className="absolute inset-0 bg-primary-600/90 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                  <span className="text-white font-bold text-lg flex items-center">
                    开始考试 <ArrowLeftIcon className="w-5 h-5 ml-2 rotate-180" />
                  </span>
                </div>
              )}
            </Card>
          ))}
        </div>
      )}
    </motion.div>
  );
};

/**
 * Main Review Page Container
 */
const Review = () => {
  const [view, setView] = useState('list'); // 'list' | 'generate'

  return (
    <AnimatePresence mode="wait">
      {view === 'list' ? (
        <ExamList key="list" onGenerate={() => setView('generate')} />
      ) : (
        <GenerateView
          key="generate"
          onBack={() => setView('list')}
          onSuccess={() => setView('list')}
        />
      )}
    </AnimatePresence>
  );
};

export default Review;
