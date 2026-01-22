import { apiClient } from './client';

/**
 * 学习模块相关 API
 */
export const studyApi = {
  /**
   * 获取学习会话
   * @param {string} collectionId - 单词本ID
   * @param {string} mode - 学习模式：new/review/random/final
   * @returns {Promise} - { mode, collection_id, words, total_count, session_id }
   */
  getSession: (collectionId, mode) => {
    return apiClient.get('/api/study/session', {
      params: {
        collection_id: collectionId,
        mode,
      },
    });
  },

  /**
   * 提交学习结果
   * @param {string} itemId - 学习条目ID（注意：是item_id不是word_id）
   * @param {string} userInput - 用户输入的答案
   * @param {boolean} isSkip - 是否跳过
   * @returns {Promise} - { success, correct, status_update, next_check_after, correct_answer }
   */
  submitAnswer: (itemId, userInput, isSkip = false) => {
    return apiClient.post('/api/study/submit', {
      item_id: itemId,
      user_input: userInput,
      is_skip: isSkip,
    });
  },
};
