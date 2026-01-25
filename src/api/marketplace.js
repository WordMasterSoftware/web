import axios from 'axios';
import { apiClient } from './client';

// 指向 GitHub 仓库的 Raw 地址
const GITHUB_BASE_URL = 'https://raw.githubusercontent.com/WordMasterSoftware/Marketplace/main';

export const marketplaceApi = {
  /**
   * 获取市场索引列表
   */
  getIndex: async () => {
    // 加上时间戳防止 GitHub 缓存
    const response = await axios.get(`${GITHUB_BASE_URL}/index.json?t=${new Date().getTime()}`);
    return response.data;
  },

  /**
   * 获取单词本详情内容 (JSON)
   * @param {string} relativePath - 也就是 index.json 中的 path 字段
   */
  getBookDetail: async (relativePath) => {
    // 移除开头可能多余的 /
    const cleanPath = relativePath.startsWith('/') ? relativePath.slice(1) : relativePath;
    const response = await axios.get(`${GITHUB_BASE_URL}/${cleanPath}?t=${new Date().getTime()}`);
    return response.data;
  },

  /**
   * 调用后端 API 进行导入 (自动创建单词本)
   * @param {object} bookJsonData - 完整的 JSON 内容
   */
  importBook: async (bookJsonData) => {
    return apiClient.post(`/api/collections/import-json`, bookJsonData);
  }
};
