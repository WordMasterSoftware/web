import { create } from 'zustand';
import { persist } from 'zustand/middleware';

/**
 * 用户认证状态管理
 * 持久化到 localStorage
 */
const useAuthStore = create(
  persist(
    (set, get) => ({
      // 状态
      token: null,
      refreshToken: null,
      user: null,
      isAuthenticated: false,

      // Actions
      /**
       * 登录成功，保存用户信息和token
       * @param {Object} data - { user_id, username, email, nickname, avatar_url, use_default_llm, token, refresh_token }
       */
      login: (data) => {
        set({
          token: data.token,
          refreshToken: data.refresh_token,
          user: {
            id: data.user_id,
            username: data.username,
            email: data.email,
            nickname: data.nickname,
            avatarUrl: data.avatar_url,
            useDefaultLlm: data.use_default_llm,
          },
          isAuthenticated: true,
        });
      },

      /**
       * 更新用户信息
       * @param {Object} userData - 用户信息
       */
      updateUser: (userData) => {
        set({
          user: {
            ...get().user,
            ...userData,
          },
        });
      },

      /**
       * 登出，清除所有认证信息
       */
      logout: () => {
        set({
          token: null,
          refreshToken: null,
          user: null,
          isAuthenticated: false,
        });
      },

      /**
       * 检查是否已登录
       * @returns {boolean}
       */
      checkAuth: () => {
        const { token, isAuthenticated } = get();
        return !!(token && isAuthenticated);
      },
    }),
    {
      name: 'auth-storage',
    }
  )
);

export default useAuthStore;
