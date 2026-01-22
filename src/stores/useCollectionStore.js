import { create } from 'zustand';
import { collectionsApi, itemsApi } from '@/api';

/**
 * 单词本状态管理
 */
const useCollectionStore = create((set, get) => ({
  // 状态
  collections: [], // 单词本列表
  currentCollection: null, // 当前选中的单词本
  words: [], // 当前单词本的单词列表
  isLoading: false,
  error: null,

  // 分页
  page: 1,
  pageSize: 20,
  total: 0,

  // Actions
  /**
   * 获取单词本列表
   * @param {number} page - 页码
   * @param {number} pageSize - 每页数量
   */
  fetchCollections: async (page = 1, pageSize = 20) => {
    set({ isLoading: true, error: null });

    try {
      const response = await collectionsApi.getList({ page, page_size: pageSize });

      set({
        collections: response.collections || [],
        total: response.total || 0,
        page: response.page || 1,
        pageSize: response.page_size || 20,
        isLoading: false,
      });
    } catch (error) {
      set({
        error: error.message || '获取单词本列表失败',
        isLoading: false,
      });
      throw error;
    }
  },

  /**
   * 获取单词本详情
   * @param {string} collectionId - 单词本ID
   */
  fetchCollectionDetail: async (collectionId) => {
    set({ isLoading: true, error: null });

    try {
      const collection = await collectionsApi.getDetail(collectionId);

      set({
        currentCollection: collection,
        isLoading: false,
      });
    } catch (error) {
      set({
        error: error.message || '获取单词本详情失败',
        isLoading: false,
      });
      throw error;
    }
  },

  /**
   * 获取单词本中的单词
   * @param {string} collectionId - 单词本ID
   * @param {number} page - 页码
   * @param {number} pageSize - 每页数量
   */
  fetchWords: async (collectionId, page = 1, pageSize = 20) => {
    set({ isLoading: true, error: null });

    try {
      const response = await collectionsApi.getWords(collectionId, {
        page,
        page_size: pageSize,
      });

      set({
        words: response.words || [],
        total: response.total || 0,
        page: response.page || 1,
        pageSize: response.page_size || 20,
        isLoading: false,
      });
    } catch (error) {
      set({
        error: error.message || '获取单词列表失败',
        isLoading: false,
      });
      throw error;
    }
  },

  /**
   * 创建单词本
   * @param {Object} data - { name, description, color, icon }
   */
  createCollection: async (data) => {
    set({ isLoading: true, error: null });

    try {
      const newCollection = await collectionsApi.create(data);

      // 添加到列表
      set({
        collections: [newCollection, ...get().collections],
        isLoading: false,
      });

      return newCollection;
    } catch (error) {
      set({
        error: error.message || '创建单词本失败',
        isLoading: false,
      });
      throw error;
    }
  },

  /**
   * 更新单词本
   * @param {string} collectionId - 单词本ID
   * @param {Object} data - 更新数据
   */
  updateCollection: async (collectionId, data) => {
    set({ isLoading: true, error: null });

    try {
      const updatedCollection = await collectionsApi.update(collectionId, data);

      // 更新列表中的单词本
      set({
        collections: get().collections.map((c) =>
          c.id === collectionId ? updatedCollection : c
        ),
        currentCollection:
          get().currentCollection?.id === collectionId
            ? updatedCollection
            : get().currentCollection,
        isLoading: false,
      });

      return updatedCollection;
    } catch (error) {
      set({
        error: error.message || '更新单词本失败',
        isLoading: false,
      });
      throw error;
    }
  },

  /**
   * 删除单词本
   * @param {string} collectionId - 单词本ID
   */
  deleteCollection: async (collectionId) => {
    set({ isLoading: true, error: null });

    try {
      await collectionsApi.delete(collectionId);

      // 从列表中移除
      set({
        collections: get().collections.filter((c) => c.id !== collectionId),
        currentCollection:
          get().currentCollection?.id === collectionId
            ? null
            : get().currentCollection,
        isLoading: false,
      });
    } catch (error) {
      set({
        error: error.message || '删除单词本失败',
        isLoading: false,
      });
      throw error;
    }
  },

  /**
   * 导入单词
   * @param {string} collectionId - 单词本ID
   * @param {Array<string>} words - 单词列表
   * @returns {Promise<Object>} - { imported, duplicates, reused, llm_generated }
   */
  importWords: async (collectionId, words) => {
    set({ isLoading: true, error: null });

    try {
      const result = await collectionsApi.importWords(collectionId, words);

      set({ isLoading: false });

      return result;
    } catch (error) {
      set({
        error: error.message || '导入单词失败',
        isLoading: false,
      });
      throw error;
    }
  },

  /**
   * 删除单词 (从当前单词本移除)
   * @param {string} itemId - 学习条目ID (注意：不是 wordId，是 item_id)
   */
  deleteWord: async (itemId) => {
    set({ isLoading: true, error: null });

    try {
      await itemsApi.delete(itemId);

      // 从当前列表中移除
      set({
        words: get().words.filter((w) => w.item_id !== itemId), // 注意: 后端返回的数据里是 item_id
        total: get().total - 1,
        isLoading: false,
      });
    } catch (error) {
      set({
        error: error.message || '删除单词失败',
        isLoading: false,
      });
      throw error;
    }
  },

  /**
   * 清空当前单词本
   */
  clearCurrentCollection: () => {
    set({ currentCollection: null, words: [] });
  },

  /**
   * 重置状态
   */
  reset: () => {
    set({
      collections: [],
      currentCollection: null,
      words: [],
      isLoading: false,
      error: null,
      page: 1,
      pageSize: 20,
      total: 0,
    });
  },
}));

export default useCollectionStore;
