import { create } from 'zustand';
import { persist } from 'zustand/middleware';

/**
 * 后端URL配置状态管理
 * 持久化到 localStorage
 */
const useConfigStore = create(
  persist(
    (set, get) => ({
      // 状态
      baseURL: '',
      isConfigured: false,

      // Actions
      /**
       * 设置后端URL
       * @param {string} url - 后端地址（如：http://localhost:8000）
       */
      setBaseURL: (url) => {
        // 移除尾部斜杠
        const cleanUrl = url.replace(/\/$/, '');
        set({
          baseURL: cleanUrl,
          isConfigured: true,
        });
      },

      /**
       * 清除配置
       */
      clearConfig: () => {
        set({
          baseURL: '',
          isConfigured: false,
        });
      },

      /**
       * 测试连接
       * @param {string} url - 要测试的后端地址
       * @returns {Promise<boolean>}
       */
      testConnection: async (url) => {
        const testUrl = url || get().baseURL;
        if (!testUrl) {
          throw new Error('请先配置后端地址');
        }

        try {
          const response = await fetch(`${testUrl}/health`);
          if (response.ok) {
            return true;
          }
          throw new Error('连接失败');
        } catch (error) {
          console.error('连接后端服务时发生错误:', error);
          throw new Error('无法连接到后端服务');
        }
      },
    }),
    {
      name: 'config-storage',
    }
  )
);

export default useConfigStore;
