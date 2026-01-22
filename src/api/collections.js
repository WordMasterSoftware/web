import { apiClient } from './client';

/**
 * 单词本管理相关 API
 */
export const collectionsApi = {
  /**
   * 创建单词本
   * @param {Object} data - { name, description, color, icon }
   * @returns {Promise}
   */
  create: (data) => {
    return apiClient.post('/api/collections', data);
  },

  /**
   * 获取所有单词本列表
   * @param {Object} params - { page, page_size }
   * @returns {Promise}
   */
  getList: (params = {}) => {
    return apiClient.get('/api/collections', { params });
  },

  /**
   * 获取单个单词本详情
   * @param {string} collectionId - 单词本ID
   * @returns {Promise}
   */
  getDetail: (collectionId) => {
    return apiClient.get(`/api/collections/${collectionId}`);
  },

  /**
   * 更新单词本信息
   * @param {string} collectionId - 单词本ID
   * @param {Object} data - { name, description, color, icon }
   * @returns {Promise}
   */
  update: (collectionId, data) => {
    return apiClient.put(`/api/collections/${collectionId}`, data);
  },

  /**
   * 删除单词本
   * @param {string} collectionId - 单词本ID
   * @returns {Promise}
   */
  delete: (collectionId) => {
    return apiClient.delete(`/api/collections/${collectionId}`);
  },

  /**
   * 导入单词到指定单词本
   * @param {string} collectionId - 单词本ID
   * @param {Array<string>} words - 单词列表
   * @returns {Promise} - { success, imported, duplicates, reused, llm_generated, total }
   */
  importWords: (collectionId, words) => {
    return apiClient.post(`/api/collections/${collectionId}/import`, {
      collection_id: collectionId,
      words: words
    });
  },

  /**
   * 获取单词本中的所有单词
   * @param {string} collectionId - 单词本ID
   * @param {Object} params - { page, page_size }
   * @returns {Promise}
   */
  getWords: (collectionId, params = {}) => {
    return apiClient.get(`/api/collections/${collectionId}/words`, { params });
  },
};

/**
 * 学习条目管理相关 API
 */
export const itemsApi = {
  /**
   * 获取学习条目详情
   * @param {string} itemId - 学习条目ID
   * @returns {Promise}
   */
  getDetail: (itemId) => {
    return apiClient.get(`/api/items/${itemId}`);
  },

  /**
   * 删除学习条目
   * @param {string} itemId - 学习条目ID
   * @returns {Promise}
   */
  delete: (itemId) => {
    return apiClient.delete(`/api/items/${itemId}`);
  },
};
