import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
// eslint-disable-next-line no-unused-vars
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import {
  ArrowLeftIcon,
  ForwardIcon,
  HomeIcon,
  ArrowPathIcon,
  SparklesIcon
} from '@heroicons/react/24/outline';
import { useStudyStore, useCollectionStore } from '@/stores';
import { useDebounce } from '@/hooks';
import Button from '@/components/common/Button';
import ProgressBar from '@/components/common/ProgressBar';
import { PageLoading } from '@/components/common/Loading';
import StudyCard from '@/components/study/StudyCard';
import TTSPlayer from '@/components/study/TTSPlayer';
import UnderscoreInput from '@/components/study/UnderscoreInput';
import { validateSpelling } from '@/utils/validation';

import Confetti from '@/components/common/Confetti';

/**
 * 新词背诵页面
 * 核心功能：待检验队列逻辑
 */
const StudyNew = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const collectionId = searchParams.get('collection');

  const {
    learningQueue,
    currentIndex,
    getCurrentWord,
    getProgress,
    startStudySession,
    submitAnswer,
    nextWord,
    isLoading,
    // 统计数据
    correctCount,
    incorrectCount,
    skipCount
  } = useStudyStore();

  const { fetchCollectionDetail, currentCollection } = useCollectionStore();

  const [userInput, setUserInput] = useState('');
  const [isFlipped, setIsFlipped] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [feedbackState, setFeedbackState] = useState(null);               // 'correct' | 'incorrect' | null
  const [isCardFlippedToSkip, setIsCardFlippedToSkip] = useState(false);  // 是否通过翻转卡片标记为跳过

  const [isInitialized, setIsInitialized] = useState(false);              // 会话初始化状态
  const [isCompleted, setIsCompleted] = useState(false);                  // 是否已完成所有学习

  // eslint-disable-next-line no-unused-vars
  const debouncedInput = useDebounce(userInput, 300);
  const currentWord = getCurrentWord();
  const progress = getProgress();

  // 初始化学习会话
  useEffect(() => {
    if (!collectionId) {
      toast.error('请选择单词本');
      navigate('/wordbook');
      return;
    }

    setIsCompleted(false);
    setIsInitialized(false);

    const init = async () => {
      try {
        await Promise.all([
          fetchCollectionDetail(collectionId),
          startStudySession(collectionId, 'new')
        ]);
        setIsInitialized(true);
      } catch (error) {
        console.error('Initialization failed:', error);
      }
    };

    init();
  }, [collectionId, fetchCollectionDetail, startStudySession, navigate]);

  // 检查是否完成
  useEffect(() => {
    if (!isInitialized || isCompleted) return;

    // 条件：队列非空且索引越界
    const hasFinishedQueue = learningQueue.length > 0 && currentIndex >= learningQueue.length;

    if (hasFinishedQueue && !isLoading) {
      setIsCompleted(true);
    }
  }, [currentIndex, learningQueue, isLoading, isCompleted, isInitialized]);

  // 处理提交答案
  const handleSubmit = async () => {
    if (!userInput.trim() || !currentWord) return;

    setIsSubmitting(true);

    try {
      // 1. 验证拼写
      const { isCorrect } = validateSpelling(userInput, currentWord.word);

      if (isCorrect) {
        setFeedbackState('correct');
        toast.success('回答正确！');

        // 延迟跳转
        setTimeout(handleNext, 1500);
      } else {
        setFeedbackState('incorrect');
        setIsFlipped(true);
        setIsCardFlippedToSkip(true);
        toast.error('回答错误，请查看正确答案');
      }

      // 2. 提交结果到后端 (即使错误也提交记录)
      await submitAnswer(currentWord.item_id, userInput, false);

    } catch (error) {
      console.error('Submit error:', error);
      toast.error('提交失败，请重试');
      setFeedbackState(null);
    } finally {
      setIsSubmitting(false);
    }
  };

  // 下一个单词
  const handleNext = () => {
    nextWord();
    setUserInput('');
    setIsFlipped(false);
    setFeedbackState(null);
    setIsCardFlippedToSkip(false);
  };

  // 跳过
  const handleSkip = async () => {
    if (!currentWord) return;

    try {
      await submitAnswer(currentWord.item_id, '', true);
      // toast('已跳过');
      handleNext();
    } catch (error) {
      console.error('Skip error:', error);
      toast.error('操作失败');
    }
  };

  // 回车提交
  // eslint-disable-next-line no-unused-vars
  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !isSubmitting && userInput.trim()) {
      handleSubmit();
    }
  };

  if (isLoading && !currentWord && !isCompleted) {
    return <PageLoading />;
  }

  // 完成状态视图
  if (isCompleted) {
    // 修正统计：跳过数 = 总跳过数 - 错误数
    // 逻辑：因为错误时也会标记为跳过(或最终点跳过)，导致 skipCount 增加
    // 但用户想看到的可能是：纯粹没做而跳过的 vs 做了但错了的
    // 这里简单处理：展示原始数据即可，或者按需求调整
    // 根据需求： "跳过的单词数量需要减去错误的数量"
    const adjustedSkipCount = Math.max(0, skipCount - incorrectCount);

    return (
      <div className="max-w-2xl mx-auto py-12 px-4 relative">
        <Confetti />

        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="bg-white dark:bg-dark-surface rounded-2xl shadow-xl p-8 text-center relative z-10 border border-gray-100 dark:border-dark-border"
        >
          <div className="w-24 h-24 bg-yellow-100 dark:bg-yellow-900/30 rounded-full flex items-center justify-center mx-auto mb-6">
            <SparklesIcon className="w-12 h-12 text-yellow-600 dark:text-yellow-400" />
          </div>

          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            恭喜！本轮学习完成
          </h2>
          <p className="text-gray-500 dark:text-gray-400 mb-8">
            你已经完成了所有新词的学习任务
          </p>

          <div className="grid grid-cols-3 gap-4 mb-8">
            <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-xl">
              <p className="text-sm text-green-600 dark:text-green-400 mb-1">正确</p>
              <p className="text-2xl font-bold text-green-700 dark:text-green-300">{correctCount}</p>
            </div>
            <div className="bg-red-50 dark:bg-red-900/20 p-4 rounded-xl">
              <p className="text-sm text-red-600 dark:text-red-400 mb-1">错误</p>
              <p className="text-2xl font-bold text-red-700 dark:text-red-300">{incorrectCount}</p>
            </div>
            <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-xl">
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">跳过</p>
              <p className="text-2xl font-bold text-gray-700 dark:text-gray-300">{adjustedSkipCount}</p>
            </div>
          </div>

          <div className="flex flex-col space-y-3">
            <Button
              variant="primary"
              size="lg"
              onClick={() => navigate(`/wordbook/${collectionId}`)}
              className="w-full justify-center"
            >
              <HomeIcon className="w-5 h-5 mr-2" />
              返回单词本
            </Button>

            <Button
              variant="outline"
              size="lg"
              onClick={() => window.location.reload()}
              className="w-full justify-center"
            >
              <ArrowPathIcon className="w-5 h-5 mr-2" />
              再来一组
            </Button>
          </div>
        </motion.div>
      </div>
    );
  }

  if (!currentWord) {
    return (
      <div className="text-center py-16">
        <p className="text-gray-600 dark:text-gray-400">没有可学习的单词</p>
        <Button
          variant="primary"
          onClick={() => navigate(`/wordbook/${collectionId}`)}
          className="mt-4"
        >
          返回单词本
        </Button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8 py-8 px-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => navigate(`/wordbook/${collectionId}`)}
          className="inline-flex items-center text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
        >
          <ArrowLeftIcon className="w-4 h-4 mr-2" />
          返回单词本
        </button>

        <div className="text-right">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            {currentCollection?.name}
          </p>
          <p className="text-lg font-semibold text-gray-900 dark:text-white">
            新词背诵
          </p>
        </div>
      </div>

      {/* Progress */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
            学习进度
          </span>
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
            {progress.current} / {progress.total}
          </span>
        </div>
        <ProgressBar value={progress.current} max={progress.total} animated />
      </div>

      {/* Study Card */}
      <StudyCard
        word={currentWord}
        isFlipped={isFlipped}
        isCorrect={feedbackState === 'correct' ? true : feedbackState === 'incorrect' ? false : null}
        onFlip={() => {
          if (!isFlipped) {
            // 首次翻转到背面，标记为跳过
            setIsCardFlippedToSkip(true);
          }
          setIsFlipped(!isFlipped);
        }}
      />

      {/* TTS Player */}
      <div className="flex justify-center">
        <TTSPlayer word={currentWord.word} autoPlay />
      </div>

      {/* Input - 下划线样式 */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="space-y-6"
      >
        <UnderscoreInput
          wordLength={currentWord?.word?.length || 0}
          value={userInput}
          onChange={setUserInput}
          onSubmit={handleSubmit}
          disabled={isSubmitting || isCardFlippedToSkip}
          isCorrect={feedbackState === 'correct' ? true : feedbackState === 'incorrect' ? false : null}
        />

        <div className="flex items-center justify-center space-x-4">
          <Button
            variant="outline"
            onClick={handleSkip}
            disabled={isSubmitting}
          >
            <ForwardIcon className="w-5 h-5 mr-2" />
            {isCardFlippedToSkip ? '下一个' : '跳过'}
          </Button>

          {!isCardFlippedToSkip && (
            <Button
              variant="primary"
              size="lg"
              onClick={handleSubmit}
              loading={isSubmitting}
              disabled={userInput.length !== currentWord?.word?.length}
            >
              提交答案
            </Button>
          )}
        </div>

        {isCardFlippedToSkip && (
          <p className="text-center text-sm text-yellow-600 dark:text-yellow-400 mt-2 flex items-center justify-center">
            <ForwardIcon className="w-4 h-4 mr-1" />
            已查看答案，本单词将标记为跳过
          </p>
        )}

        {/* 提示：占满字符后按回车提交 */}
        {!isCardFlippedToSkip && userInput.length === currentWord?.word?.length && (
          <p className="text-center text-sm text-green-600 dark:text-green-400">
            按回车键提交答案
          </p>
        )}
      </motion.div>

      {/* Hint */}
      {currentWord.isRecheck && (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg text-center"
        >
          <p className="text-sm text-yellow-800 dark:text-yellow-300 flex items-center justify-center">
            <ArrowPathIcon className="w-4 h-4 mr-2" />
            这是一个待检验单词，请再次确认拼写
          </p>
        </motion.div>
      )}
    </div>
  );
};

export default StudyNew;