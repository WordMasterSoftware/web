import { create } from 'zustand';
import { examApi } from '@/api';

/**
 * 考试状态管理
 */
const useExamStore = create((set, get) => ({
  // 状态
  examId: null,
  collectionId: null,
  title: '',
  totalQuestions: 0,

  // 题目
  spellingQuestions: [], // 拼写题 [{ question_id, chinese, correct_answer }]
  translationQuestions: [], // 翻译题 [{ question_id, english, chinese_prompt }]

  // 用户答案
  spellingAnswers: {}, // { question_id: user_answer }
  translationAnswers: {}, // { question_id: user_answer }

  // 考试结果
  result: null,

  // 状态
  isLoading: false,
  error: null,
  isSubmitted: false,

  // Actions
  /**
   * 生成考试
   * @param {string} collectionId - 单词本ID
   * @param {string} mode - 考试模式 (review/test)
   * @param {number} count - 单词数量
   */
  generateExam: async (collectionId, mode, count) => {
    set({ isLoading: true, error: null });

    try {
      const response = await examApi.generate(collectionId, { mode, count });

      set({
        examId: response.exam_id,
        collectionId: response.collection_id,
        title: response.title || '复习考试',
        totalQuestions: response.total_questions || 0,
        spellingQuestions: response.sections?.spelling || [],
        translationQuestions: response.sections?.translation || [],
        spellingAnswers: {},
        translationAnswers: {},
        result: null,
        isSubmitted: false,
        isLoading: false,
      });
    } catch (error) {
      set({
        error: error.message || '生成考试失败',
        isLoading: false,
      });
      throw error;
    }
  },

  /**
   * 保存拼写题答案
   * @param {string} questionId - 题目ID
   * @param {string} answer - 用户答案
   */
  saveSpellingAnswer: (questionId, answer) => {
    set({
      spellingAnswers: {
        ...get().spellingAnswers,
        [questionId]: answer,
      },
    });
  },

  /**
   * 保存翻译题答案
   * @param {string} questionId - 题目ID
   * @param {string} answer - 用户答案
   */
  saveTranslationAnswer: (questionId, answer) => {
    set({
      translationAnswers: {
        ...get().translationAnswers,
        [questionId]: answer,
      },
    });
  },

  /**
   * 提交考试
   */
  submitExam: async () => {
    const { examId, spellingAnswers, translationAnswers } = get();

    if (!examId) {
      throw new Error('考试ID不存在');
    }

    set({ isLoading: true, error: null });

    try {
      const result = await examApi.submit(examId, spellingAnswers, translationAnswers);

      set({
        result,
        isSubmitted: true,
        isLoading: false,
      });

      return result;
    } catch (error) {
      set({
        error: error.message || '提交考试失败',
        isLoading: false,
      });
      throw error;
    }
  },

  /**
   * 获取答题进度
   * @returns {Object} - { answered, total, percentage }
   */
  getProgress: () => {
    const { spellingQuestions, translationQuestions, spellingAnswers, translationAnswers } =
      get();

    const total = spellingQuestions.length + translationQuestions.length;
    const answered =
      Object.keys(spellingAnswers).filter((k) => spellingAnswers[k]).length +
      Object.keys(translationAnswers).filter((k) => translationAnswers[k]).length;
    const percentage = total > 0 ? Math.round((answered / total) * 100) : 0;

    return { answered, total, percentage };
  },

  /**
   * 检查是否所有题目都已答
   * @returns {boolean}
   */
  isAllAnswered: () => {
    const { answered, total } = get().getProgress();
    return answered === total;
  },

  /**
   * 获取未答题目数量
   * @returns {number}
   */
  getUnansweredCount: () => {
    const { answered, total } = get().getProgress();
    return total - answered;
  },

  /**
   * 重置考试状态
   */
  reset: () => {
    set({
      examId: null,
      collectionId: null,
      title: '',
      totalQuestions: 0,
      spellingQuestions: [],
      translationQuestions: [],
      spellingAnswers: {},
      translationAnswers: {},
      result: null,
      isLoading: false,
      error: null,
      isSubmitted: false,
    });
  },
}));

export default useExamStore;
