import { useState, useEffect } from 'react';
// eslint-disable-next-line no-unused-vars
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import {
  BookOpenIcon,
  ClockIcon,
  PlusIcon,
  CheckCircleIcon,
  TrashIcon,
  ArrowLeftIcon,
  SparklesIcon,
  ArrowPathIcon,
  AcademicCapIcon
} from '@heroicons/react/24/outline';
import { collectionsApi } from '@/api/collections';
import { examApi } from '@/api/exam';
import Button from '@/components/common/Button';
import Card from '@/components/common/Card';
import Modal from '@/components/common/Modal';
import { PageLoading } from '@/components/common/Loading';
import { useNavigate } from 'react-router-dom';
import useIntersectionObserver from '@/hooks/useIntersectionObserver';

const MODES = {
  IMMEDIATE: {
    id: 'immediate',
    label: '即时复习',
    icon: ClockIcon,
    desc: '复习最近学习的单词，巩固记忆曲线',
    color: 'blue'
  },
  RANDOM: {
    id: 'random',
    label: '随机复习',
    icon: ArrowPathIcon,
    desc: '随机抽取复习中或已完成的单词，全面检测',
    color: 'purple'
  },
  COMPLETE: {
    id: 'complete',
    label: '完全复习',
    icon: AcademicCapIcon,
    desc: '针对已掌握单词的全面考核，完成后单词毕业',
    color: 'green'
  }
};

/**
 * Generation View Component
 */
const GenerateView = ({ mode, onBack, onSuccess }) => {
  const [collections, setCollections] = useState([]);
  const [selectedCollection, setSelectedCollection] = useState('');
  const [wordCount, setWordCount] = useState(20);
  const [availableWords, setAvailableWords] = useState(0);
  const [loading, setLoading] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [checkingAvailability, setCheckingAvailability] = useState(false);

  const modeConfig = MODES[mode.toUpperCase()];

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
        console.error('获取单词本失败', error);
      } finally {
        setLoading(false);
      }
    };
    fetchCollections();
  }, []);

  // 当选择的单词本改变时，获取可用单词数量
  useEffect(() => {
    const fetchAvailableWords = async () => {
      if (!selectedCollection) return;

      try {
        setCheckingAvailability(true);
        const res = await examApi.getAvailableWords(selectedCollection, mode);
        setAvailableWords(res.available_count || 0);

        // 自动调整单词数量
        if (mode !== 'complete') {
          if (wordCount > res.available_count) {
            setWordCount(Math.min(20, res.available_count));
          }
        }
      } catch (error) {
        console.error('获取可用单词数量失败', error);
        setAvailableWords(0);
      } finally {
        setCheckingAvailability(false);
      }
    };
    fetchAvailableWords();
  }, [selectedCollection, wordCount, mode]);

  const getCompleteReviewInfo = () => {
    if (availableWords < 50) return { count: 1, percent: '100%' };
    if (availableWords < 150) return { count: 2, percent: '50%' };
    if (availableWords < 300) return { count: 5, percent: '20%' };
    return { count: 10, percent: '10%' };
  };

  const handleGenerate = async () => {
    if (!selectedCollection) {
      toast.error('请先选择单词本');
      return;
    }

    if (mode === 'complete') {
      if (availableWords === 0) {
        toast.error('当前没有符合完全复习条件的单词');
        return;
      }
    } else {
      if (wordCount < 10) {
        toast.error('单词数量至少需要10个');
        return;
      }
      if (wordCount > availableWords) {
        toast.error(`单词数量不能超过可用数量（${availableWords}个）`);
        return;
      }
      if (wordCount > 50) {
        toast.error('每次生成的单词数量不能超过50个');
        return;
      }
    }

    try {
      setGenerating(true);
      const res = await examApi.generate(selectedCollection, {
        mode: mode,
        count: mode === 'complete' ? availableWords : wordCount
      });

      if (res.success) {
        toast.success(res.message || '生成成功');
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

  const themeColor = modeConfig.color;
  const bgColors = {
    blue: 'bg-blue-600',
    purple: 'bg-purple-600',
    green: 'bg-green-600'
  };
  const bgLightColors = {
    blue: 'bg-blue-500',
    purple: 'bg-purple-500',
    green: 'bg-green-500'
  };
  const textLightColors = {
    blue: 'text-blue-100',
    purple: 'text-purple-100',
    green: 'text-green-100'
  };
  const checkColors = {
    blue: 'text-blue-300',
    purple: 'text-purple-300',
    green: 'text-green-300'
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="max-w-5xl w-full mx-auto bg-white dark:bg-dark-surface rounded-2xl shadow-xl overflow-hidden flex flex-col md:flex-row min-h-[600px] border border-gray-100 dark:border-dark-border"
    >
      {/* Left: Visual Area */}
      <div className={`md:w-1/2 ${bgColors[themeColor]} p-12 text-white flex flex-col justify-between relative overflow-hidden`}>
        <div className="relative z-10">
          <button
            onClick={onBack}
            className={`flex items-center ${textLightColors[themeColor]} hover:text-white mb-8 transition-colors`}
          >
            <ArrowLeftIcon className="w-5 h-5 mr-2" />
            返回列表
          </button>

          <div className={`w-16 h-16 ${bgLightColors[themeColor]}/50 rounded-2xl flex items-center justify-center mb-8 backdrop-blur-sm`}>
            <modeConfig.icon className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-4xl font-bold mb-6">{modeConfig.label}</h1>
          <p className={`${textLightColors[themeColor]} text-lg leading-relaxed mb-8`}>
            {mode === 'immediate' && '系统将为您挑选最近学习且状态为"复习中"的单词。通过拼写和翻译测试，巩固记忆。'}
            {mode === 'random' && '随机抽取"复习中"的单词进行突击检查，防止遗忘，全面覆盖知识盲区。'}
            {mode === 'complete' && '针对"已掌握"单词的终极考核。系统将自动生成全量覆盖试卷，通过即可将单词标记为"已完成"。'}
          </p>

          <div className="space-y-4">
            <div className={`flex items-center ${textLightColors[themeColor]}`}>
              <CheckCircleIcon className={`w-5 h-5 mr-3 ${checkColors[themeColor]}`} />
              <span>
                {mode === 'complete' ? '筛选"已掌握"状态单词' : '筛选"复习中"状态单词'}
              </span>
            </div>
            <div className={`flex items-center ${textLightColors[themeColor]}`}>
              <CheckCircleIcon className={`w-5 h-5 mr-3 ${checkColors[themeColor]}`} />
              <span>智能生成翻译例句</span>
            </div>
            <div className={`flex items-center ${textLightColors[themeColor]}`}>
              <CheckCircleIcon className={`w-5 h-5 mr-3 ${checkColors[themeColor]}`} />
              <span>自动评判与状态流转</span>
            </div>
          </div>
        </div>

        {/* Background Decorations */}
        <div className={`absolute top-0 right-0 -mr-20 -mt-20 w-80 h-80 ${bgLightColors[themeColor]} rounded-full opacity-20 blur-3xl`}></div>
        <div className={`absolute bottom-0 left-0 -ml-20 -mb-20 w-60 h-60 bg-indigo-500 rounded-full opacity-20 blur-3xl`}></div>
      </div>

      {/* Right: Control Panel */}
      <div className="md:w-1/2 p-12 flex flex-col justify-center bg-white dark:bg-dark-surface">
        <div className="max-w-md mx-auto w-full space-y-8">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
              开始{modeConfig.label}
            </h2>
            <p className="text-gray-500 dark:text-gray-400">
              请选择一个单词本，系统将为您生成试卷
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
                        {c.name} (本内有 {c.word_count} 词)
                      </option>
                    ))}
                  </select>
                </div>
              )}
            </div>

            {mode === 'complete' ? (
               <div className="space-y-4">
                 <div className="p-4 bg-green-50 dark:bg-green-900/10 rounded-xl border border-green-100 dark:border-green-900/30">
                   <h3 className="text-sm font-medium text-green-800 dark:text-green-200 mb-2">
                     复习预览
                   </h3>
                   <div className="flex justify-between items-center mb-2">
                      <span className="text-sm text-gray-600 dark:text-gray-400">符合条件的单词数：</span>
                      <span className="text-lg font-bold text-gray-900 dark:text-white">
                        {checkingAvailability ? '...' : availableWords}
                      </span>
                   </div>
                   {availableWords > 0 && (
                     <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600 dark:text-gray-400">预计生成试卷数：</span>
                        <span className="text-lg font-bold text-green-600 dark:text-green-400">
                          {getCompleteReviewInfo().count} 套
                          <span className="text-xs font-normal text-gray-500 ml-1">
                            (每套覆盖 {getCompleteReviewInfo().percent})
                          </span>
                        </span>
                     </div>
                   )}
                 </div>
                 <p className="text-xs text-gray-500 dark:text-gray-400">
                    注意：完全复习模式将一次性生成覆盖所有已掌握单词的试卷组合。
                 </p>
               </div>
            ) : (
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  单词数量
                  {checkingAvailability && (
                    <span className="ml-2 text-xs text-gray-400">检查中...</span>
                  )}
                  {!checkingAvailability && availableWords >= 0 && (
                    <span className="ml-2 text-xs text-gray-500">
                      （可用: {availableWords} 个）
                    </span>
                  )}
                </label>
                <input
                  type="number"
                  min="10"
                  max={Math.min(availableWords, 50)}
                  value={wordCount}
                  onChange={(e) => setWordCount(Math.max(10, Math.min(availableWords, 50, parseInt(e.target.value) || 10)))}
                  className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all dark:text-white"
                  disabled={checkingAvailability || availableWords === 0}
                />
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  最少 10 个，单次最多 50 个
                </p>
              </div>
            )}

            <div className="p-4 bg-yellow-50 dark:bg-yellow-900/10 rounded-xl border border-yellow-100 dark:border-yellow-900/30">
              <div className="flex">
                <div className="flex-shrink-0">
                  <SparklesIcon className="h-5 w-5 text-yellow-400" aria-hidden="true" />
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-yellow-800 dark:text-yellow-200">
                    {modeConfig.label}规则
                  </h3>
                  <div className="mt-2 text-sm text-yellow-700 dark:text-yellow-300">
                    <ul className="list-disc pl-5 space-y-1">
                      {mode === 'immediate' && (
                        <>
                          <li>优先选择最近学习的单词</li>
                          <li>已经用于生成试卷的单词无法被选中</li>
                        </>
                      )}
                      {mode === 'random' && (
                        <>
                          <li>随机选择复习中状态的单词</li>
                          <li>用于查漏补缺，不考虑学习时间顺序</li>
                        </>
                      )}
                      {mode === 'complete' && (
                         <>
                           <li><strong>前提：本内所有单词需为已掌握或已完成</strong></li>
                           <li>一次性覆盖所有已掌握单词</li>
                           <li>通过后单词进入"已完成"状态</li>
                         </>
                      )}
                      <li>需要单词本中至少有 10 个符合条件的单词</li>
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
                className={`flex-1 justify-center py-4 text-lg text-white border-transparent focus:ring-2 focus:ring-offset-2 ${
                   mode === 'immediate' ? 'bg-blue-600 hover:bg-blue-700 focus:ring-blue-500' :
                   mode === 'random' ? 'bg-purple-600 hover:bg-purple-700 focus:ring-purple-500' :
                   'bg-green-600 hover:bg-green-700 focus:ring-green-500'
                }`}
                onClick={handleGenerate}
                loading={generating}
                disabled={loading || collections.length === 0 || checkingAvailability || availableWords < 10}
              >
                {mode === 'complete' ? '批量生成试卷' : '开始生成'}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

/**
 * List View Component
 */
const ExamList = ({ mode, onGenerate }) => {
  const navigate = useNavigate();
  const [exams, setExams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deleteId, setDeleteId] = useState(null);

  // Pagination State
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [loadingMore, setLoadingMore] = useState(false);
  const [loadRef, isIntersecting] = useIntersectionObserver({ threshold: 0.1 });

  const hasMore = exams.length < total;

  const fetchExams = async (pageNum, append = false) => {
    try {
      if (!append) setLoading(true);

      const res = await examApi.getList({ page: pageNum, size: 20, mode });

      if (append) {
        setExams(prev => [...prev, ...(res.exams || [])]);
      } else {
        setExams(res.exams || []);
      }

      setTotal(res.pagination?.total || 0);
    } catch (error) {
      toast.error('获取考试记录失败');
      console.error('获取考试记录失败', error);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  useEffect(() => {
    fetchExams(1);
    setPage(1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mode]);

  useEffect(() => {
    if (isIntersecting && hasMore && !loadingMore && !loading) {
      loadMore();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isIntersecting, hasMore, loadingMore, loading]);

  const loadMore = async () => {
    setLoadingMore(true);
    const nextPage = page + 1;
    await fetchExams(nextPage, true);
    setPage(nextPage);
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      const res = await examApi.delete(deleteId);
      if (res.success) {
        toast.success('考试记录已删除');
        setExams(prev => prev.filter(e => e.exam_id !== deleteId));
        setTotal(prev => prev - 1);
      }
    } catch (error) {
      toast.error('删除失败');
      console.error('删除考试记录失败', error);
    } finally {
      setDeleteId(null);
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'completed':
        return <span className="px-2 py-1 bg-green-100 text-green-700 rounded text-xs font-bold dark:bg-green-900/30 dark:text-green-400">已完成</span>;
      case 'failed':
        return <span className="px-2 py-1 bg-red-100 text-red-700 rounded text-xs font-bold dark:bg-red-900/30 dark:text-red-400">失败</span>;
      case 'generated':
        return <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs font-bold dark:bg-blue-900/30 dark:text-blue-400">待考试</span>;
      case 'grading':
        return <span className="px-2 py-1 bg-purple-100 text-purple-700 rounded text-xs font-bold dark:bg-purple-900/30 dark:text-purple-400">阅卷中</span>;
      case 'pending':
        return <span className="px-2 py-1 bg-yellow-100 text-yellow-700 rounded text-xs font-bold dark:bg-yellow-900/30 dark:text-yellow-400">生成中</span>;
      default:
        return <span className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs dark:bg-gray-800 dark:text-gray-400">{status}</span>;
    }
  };

  const modeConfig = MODES[mode.toUpperCase()];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="space-y-6"
    >
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{modeConfig.label}</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">
            {modeConfig.desc}
          </p>
        </div>
        <Button onClick={onGenerate}>
          <PlusIcon className="w-5 h-5 mr-2" />
          生成{modeConfig.label}试卷
        </Button>
      </div>

      {loading && exams.length === 0 ? (
        <PageLoading />
      ) : exams.length === 0 ? (
        <Card className="text-center py-12">
          <modeConfig.icon className="w-16 h-16 mx-auto text-gray-300 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-white">暂无{modeConfig.label}记录</h3>
          <p className="text-gray-500 dark:text-gray-400 mt-2 mb-6">{modeConfig.desc}</p>
          <Button onClick={onGenerate}>开始第一次复习</Button>
        </Card>
      ) : (
        <>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {exams.map((exam) => (
                <Card
                  key={exam.exam_id}
                  hoverable
                  className={`relative overflow-hidden group ${
                    exam.exam_status === 'generated' ? 'cursor-pointer' : 'cursor-default'
                  }`}
                  onClick={() => {
                    if (exam.exam_status === 'generated') {
                      navigate(`/exam/${exam.exam_id}`);
                    }
                  }}
                >
                <div className="flex justify-between items-start mb-4">
                  <div className="flex items-center space-x-3">
                    <div className={`p-2 rounded-lg ${
                       exam.mode === 'complete' ? 'bg-green-50 dark:bg-green-900/20' :
                       exam.mode === 'random' ? 'bg-purple-50 dark:bg-purple-900/20' :
                       'bg-blue-50 dark:bg-blue-900/20'
                    }`}>
                      {exam.mode === 'complete' ? (
                         <AcademicCapIcon className="w-6 h-6 text-green-600 dark:text-green-400" />
                      ) : exam.mode === 'random' ? (
                         <ArrowPathIcon className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                      ) : (
                         <ClockIcon className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                      )}
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-900 dark:text-white">{exam.collection_name || '未知单词本'}</h3>
                      <p className="text-xs text-gray-500">{new Date(exam.created_at).toLocaleString()}</p>
                    </div>
                  </div>
                  {getStatusBadge(exam.exam_status)}
                </div>

                <div className="flex items-center justify-between text-sm text-gray-600 dark:text-gray-400 border-t pt-4 border-gray-100 dark:border-dark-border">
                  <span>{exam.spelling_words_count} 单词</span>
                  <span>{exam.translation_sentences_count} 例句</span>
                </div>

                {/* Delete Button */}
                {(exam.exam_status === 'completed' || exam.exam_status === 'failed') && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setDeleteId(exam.exam_id);
                    }}
                    className="absolute top-2 right-2 p-2 rounded-full bg-white dark:bg-dark-surface shadow-sm opacity-0 group-hover:opacity-100 transition-opacity text-gray-400 hover:text-red-500 z-10"
                    title="删除考试记录"
                  >
                    <TrashIcon className="w-4 h-4" />
                  </button>
                )}

                {/* Hover Effect */}
                {exam.exam_status === 'generated' && (
                  <div className={`absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none ${
                     exam.mode === 'complete' ? 'bg-green-600/90' :
                     exam.mode === 'random' ? 'bg-purple-600/90' :
                     'bg-blue-600/90'
                  }`}>
                    <span className="text-white font-bold text-lg flex items-center">
                      开始考试 <ArrowLeftIcon className="w-5 h-5 ml-2 rotate-180" />
                    </span>
                  </div>
                )}
              </Card>
            ))}
          </div>

          {hasMore && (
            <div ref={loadRef} className="py-8 flex justify-center">
              <div className="w-8 h-8 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
            </div>
          )}

          {!hasMore && exams.length > 0 && (
             <p className="text-center text-gray-400 text-sm py-8">没有更多记录了</p>
          )}
        </>
      )}

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={!!deleteId}
        onClose={() => setDeleteId(null)}
        title="确认删除"
        size="sm"
      >
        <div className="space-y-4">
          <p className="text-gray-600 dark:text-gray-300">
            确定要删除这份考试记录吗？此操作不可恢复。
            <br />
            <span className="text-xs text-gray-500">(注意：这不会影响您的单词学习进度)</span>
          </p>
          <div className="flex justify-end space-x-3">
            <Button variant="ghost" onClick={() => setDeleteId(null)}>
              取消
            </Button>
            <Button variant="danger" onClick={handleDelete}>
              确认删除
            </Button>
          </div>
        </div>
      </Modal>
    </motion.div>
  );
};

const ReviewBase = ({ mode }) => {
  const [view, setView] = useState('list');

  return (
    <AnimatePresence mode="wait">
      {view === 'list' ? (
        <ExamList
          key="list"
          mode={mode}
          onGenerate={() => setView('generate')}
        />
      ) : (
        <GenerateView
          key="generate"
          mode={mode}
          onBack={() => setView('list')}
          onSuccess={() => setView('list')}
        />
      )}
    </AnimatePresence>
  );
};

export default ReviewBase;
