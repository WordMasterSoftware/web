import { apiClient } from './client';

/**
 * 考试模块相关 API
 */
export const examApi = {
  /**
   * 生成考试
   * @param {string} collectionId - 单词本ID
   * @param {Object} data - { mode, count }
   * @returns {Promise}
   */
  generate: (collectionId, data) => {
    return apiClient.post('/api/exam/generate', {
      collection_id: collectionId,
      ...data
    });
  },

  /**
   * 获取考试列表
   * @param {Object} params - { page, size }
   * @returns {Promise}
   */
  getList: (params = {}) => {
    return apiClient.get('/api/exam/info', { params });
  },

  /**
   * 获取考试详情
   * @param {string} examId
   * @returns {Promise}
   */
  getDetail: (examId) => {
    return apiClient.get('/api/exam/detail', { params: { exam_id: examId } });
  },

  /**
   * 提交考试
   * @param {Object} data - { exam_id, user_id, collection_id, wrong_words, sentences }
   * @returns {Promise}
   */
  submit: (data) => {
    return apiClient.post('/api/exam/submit', data);
  },

  /**
   * 删除考试
   * @param {string} examId
   * @returns {Promise}
   */
  delete: (examId) => {
    return apiClient.delete(`/api/exam/${examId}`);
  }
};
