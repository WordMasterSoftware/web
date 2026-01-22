import { apiClient } from './client';

/**
 * 考试模块相关 API
 */
export const examApi = {
  /**
   * 生成考试
   * @param {string} collectionId - 单词本ID
   * @param {Object} data - { mode, count }
   * @returns {Promise} - { exam_id, collection_id, title, total_questions, sections }
   */
  generate: (collectionId, data) => {
    return apiClient.post('/api/exam/generate', data, {
      params: {
        collection_id: collectionId,
      },
    });
  },

  /**
   * 提交考试
   * @param {string} examId - 考试ID
   * @param {Object} spellingAnswers - 拼写题答案 { question_id: answer }
   * @param {Object} translationAnswers - 翻译题答案 { question_id: answer }
   * @returns {Promise} - { exam_id, score, total_questions, correct_answers, incorrect_answers, details }
   */
  submit: (examId, spellingAnswers, translationAnswers) => {
    return apiClient.post('/api/exam/submit', {
      exam_id: examId,
      spelling_answers: spellingAnswers,
      translation_answers: translationAnswers,
    });
  },
};
