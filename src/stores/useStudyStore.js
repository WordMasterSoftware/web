import { create } from 'zustand';
import { studyApi } from '@/api';

/**
 * 学习会话状态管理
 * 核心逻辑：待检验单词队列算法
 */
const useStudyStore = create((set, get) => ({
  // 状态
  mode: null, // 'new' | 'review' | 'random' | 'final'
  collectionId: null,
  sessionId: null,
  learningQueue: [], // 原始学习队列
  currentIndex: 0, // 当前学习位置
  pendingCheckWords: [], // 待检验单词队列 [{ wordId, insertIndex, checkCount }]

  // 学习统计
  totalCount: 0,
  correctCount: 0,
  incorrectCount: 0,
  skipCount: 0,

  // 加载状态
  isLoading: false,
  error: null,

  // Actions
  /**
   * 开始学习会话
   * @param {string} collectionId - 单词本ID
   * @param {string} mode - 学习模式 (new/review/random/final)
   */
  startStudySession: async (collectionId, mode) => {
    set({ isLoading: true, error: null });

    try {
      const response = await studyApi.getSession(collectionId, mode);

      set({
        mode,
        collectionId,
        sessionId: response.session_id,
        learningQueue: response.words || [],
        currentIndex: 0,
        totalCount: response.total_count || 0,
        correctCount: 0,
        incorrectCount: 0,
        skipCount: 0,
        pendingCheckWords: [],
        isLoading: false,
        error: null,
      });
    } catch (error) {
      console.error('❌ 学习会话加载失败:', error);
      set({
        error: error.message || '加载学习会话失败',
        isLoading: false,
      });
      throw error;
    }
  },

  /**
   * 提交答案（核心逻辑）
   * @param {string} itemId - 学习条目ID
   * @param {string} userInput - 用户输入
   * @param {boolean} isSkip - 是否跳过
   * @returns {Promise<Object>} - 后端返回结果
   */
  submitAnswer: async (itemId, userInput, isSkip = false) => {
    const result = await studyApi.submitAnswer(itemId, userInput, isSkip);

    // 更新统计
    // 注意：这里我们简单地根据前端行为来计数
    // 在 StudyNew 中，错误后会强制走跳过，所以这里需要小心处理，避免重复计数
    // 如果 isSkip 为 true，可能是用户主动跳过，也可能是错误后跳过
    if (isSkip) {
      set({ skipCount: get().skipCount + 1 });
    } else {
      if (result.correct) {
        set({ correctCount: get().correctCount + 1 });
      } else {
        set({ incorrectCount: get().incorrectCount + 1 });
      }
    }

    // 核心逻辑：处理待检验单词（status 从 0 → 1）
    // 只有第一次回答正确时，才会触发这个逻辑
    // 如果单词已经在待检验列表中，就不再添加
    if (result.correct && result.current_status === 1) {
      const { currentIndex, learningQueue, pendingCheckWords } = get();
      const currentWord = learningQueue[currentIndex];

      if (currentWord) {
         // 插入位置：当前位置 + 3，但不超过队列长度
        const insertIndex = Math.min(currentIndex + 3, learningQueue.length);

        set({
          pendingCheckWords: [
            ...pendingCheckWords,
            {
              wordId: currentWord.word_id, // 修复：使用 currentWord.word_id
              insertIndex,
              checkCount: 0,
            },
          ],
        });
      }
    }

    return result;
  },

  /**
   * 下一个单词（处理待检验插入逻辑）
   */
  nextWord: () => {
    const { currentIndex, pendingCheckWords, learningQueue } = get();

    // 检查是否有待检验单词需要在下一个位置插入
    const wordsToInsert = pendingCheckWords.filter(
      (w) => w.insertIndex === currentIndex + 1
    );

    if (wordsToInsert.length > 0) {
      // 从原队列中找到对应单词，插入到当前位置 + 1
      const newQueue = [...learningQueue];

      wordsToInsert.forEach((w) => {
        const word = learningQueue.find((word) => word.word_id === w.wordId);
        if (word) {
          // 标记为复查单词
          // 创建副本以避免引用问题
          const recheckWord = {
            ...word,
            isRecheck: true,
            checkCount: w.checkCount + 1,
            // 确保唯一键，因为可能有重复单词
            _uniqueKey: `${word.word_id}_recheck_${Date.now()}`
          };
          newQueue.splice(currentIndex + 1, 0, recheckWord);
        }
      });

      // 更新队列，移除已插入的待检验单词
      set({
        learningQueue: newQueue,
        pendingCheckWords: pendingCheckWords.filter(
          (w) => w.insertIndex !== currentIndex + 1
        ),
      });
    }

    // 移动到下一个单词
    set({ currentIndex: currentIndex + 1 });
  },

  /**
   * 上一个单词
   */
  previousWord: () => {
    const { currentIndex } = get();
    if (currentIndex > 0) {
      set({ currentIndex: currentIndex - 1 });
    }
  },

  /**
   * 获取当前单词
   * @returns {Object|null}
   */
  getCurrentWord: () => {
    const { learningQueue, currentIndex } = get();
    return learningQueue[currentIndex] || null;
  },

  /**
   * 检查会话是否完成
   * @returns {boolean}
   */
  isSessionComplete: () => {
    const { currentIndex, learningQueue } = get();
    return currentIndex >= learningQueue.length;
  },

  /**
   * 获取学习进度
   * @returns {Object} - { current, total, percentage }
   */
  getProgress: () => {
    const { currentIndex, learningQueue } = get();
    const total = learningQueue.length;
    const current = Math.min(currentIndex, total);
    const percentage = total > 0 ? Math.round((current / total) * 100) : 0;

    return { current, total, percentage };
  },

  /**
   * 重置学习会话
   */
  reset: () => {
    set({
      mode: null,
      collectionId: null,
      sessionId: null,
      learningQueue: [],
      currentIndex: 0,
      pendingCheckWords: [],
      totalCount: 0,
      correctCount: 0,
      incorrectCount: 0,
      skipCount: 0,
      isLoading: false,
      error: null,
    });
  },
}));

export default useStudyStore;
