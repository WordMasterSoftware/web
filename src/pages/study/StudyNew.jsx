import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
// eslint-disable-next-line no-unused-vars
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import {
  ArrowLeftIcon,
  ForwardIcon,
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
  } = useStudyStore();

  const { fetchCollectionDetail, currentCollection } = useCollectionStore();

  const [userInput, setUserInput] = useState('');
  const [isFlipped, setIsFlipped] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [feedbackState, setFeedbackState] = useState(null);               // 'correct' | 'incorrect' | null
  const [isCardFlippedToSkip, setIsCardFlippedToSkip] = useState(false);  // 是否通过翻转卡片标记为跳过
  const [hasShownComplete, setHasShownComplete] = useState(false);        // 是否已显示完成提示
  const [isInitialized, setIsInitialized] = useState(false);              // 会话初始化状态，防止旧状态导致的误判


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

    // 重置状态
    setHasShownComplete(false);
    setIsInitialized(false);

    const init = async () => {
      try {
        await fetchCollectionDetail(collectionId);
        await startStudySession(collectionId, 'new');
        setIsInitialized(true);
      } catch (error) {
        console.error('Initialization failed:', error);
      }
    };

    init();

    return () => {
      // 组件卸载时不重置，保持状态
    };
  }, [collectionId,fetchCollectionDetail, startStudySession, navigate]);

  // 检查是否完成
  useEffect(() => {
    // 只有在会话初始化完成后才开始检查
    if (!isInitialized) return;

    // 条件：1. 队列不为空（有单词） 2. 当前索引到达队列末尾 3. 至少学习过一个单词 4. 没有显示过完成提示
    if (
      learningQueue.length > 0 &&
      currentIndex >= learningQueue.length &&
      currentIndex > 0 &&
      !isLoading &&
      !hasShownComplete
    ) {
      setHasShownComplete(true); // 标记已显示，避免重复触发
      toast.success('恭喜！本轮学习已完成！');
      setTimeout(() => {
        navigate(`/wordbook/${collectionId}`);
      }, 2000);
    }
  }, [currentIndex, learningQueue, isLoading, hasShownComplete, navigate, collectionId, isInitialized]);

  // 处理提交答案
  const handleSubmit = async () => {
    if (!userInput.trim()) {
      return;
    }

    if (!currentWord) return;

    setIsSubmitting(true);

    try {
      // 先验证拼写
      const validation = validateSpelling(userInput, currentWord.word);
      console.log('前端验证结果:', validation);

      if (validation.isCorrect) {
        setFeedbackState('correct');
      } else {
        setFeedbackState('incorrect');
        // 错误时自动翻转卡片显示正确答案
        setIsFlipped(true);
      }

      // 提交到后端
      const result = await submitAnswer(currentWord.item_id, userInput, false);
      console.log('后端验证结果:', result);

      // 显示反馈
      if (result.correct) {
        toast.success(result.status_update || '回答正确！');

        // 只有回答正确时才自动跳转
        setTimeout(() => {
          handleNext();
        }, 1500);
      }
      // 错误时不自动跳转，停留在当前单词，等待用户手动操作

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
      toast('已跳过');
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

  if (isLoading && !currentWord) {
    return <PageLoading />;
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
            跳过
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
          <p className="text-center text-sm text-yellow-600 dark:text-yellow-400 mt-2">
            ⚠️ 已查看答案，本单词将标记为跳过
          </p>
        )}

        {/* 提示：占满字符后按回车提交 */}
        {!isCardFlippedToSkip && userInput.length === currentWord?.word?.length && (
          <p className="text-center text-sm text-green-600 dark:text-green-400">
            ✓ 按回车键提交答案
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
          <p className="text-sm text-yellow-800 dark:text-yellow-300">
            🔄 这是一个待检验单词，请再次确认拼写
          </p>
        </motion.div>
      )}
    </div>
  );
};

export default StudyNew;
