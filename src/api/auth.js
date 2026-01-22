import { apiClient } from './client';

/**
 * 认证相关 API
 */
export const authApi = {
  /**
   * 用户注册
   * @param {Object} data - { username, email, password, nickname }
   * @returns {Promise}
   */
  register: (data) => {
    return apiClient.post('/api/auth/register', data);
  },

  /**
   * 用户登录
   * @param {Object} data - { account, password }
   * @returns {Promise}
   */
  login: (data) => {
    return apiClient.post('/api/auth/login', data);
  },

  /**
   * 退出登录
   * @returns {Promise}
   */
  logout: () => {
    return apiClient.post('/api/auth/logout');
  },

  /**
   * 获取当前用户信息
   * @returns {Promise}
   */
  getCurrentUser: () => {
    return apiClient.get('/api/auth/me');
  },

  /**
   * 更新用户资料
   * @param {Object} data - { nickname, avatar_url }
   * @returns {Promise}
   */
  updateProfile: (data) => {
    return apiClient.put('/api/auth/profile', data);
  },

  /**
   * 修改密码
   * @param {Object} data - { old_password, new_password }
   * @returns {Promise}
   */
  changePassword: (data) => {
    return apiClient.put('/api/auth/password', data);
  },

  /**
   * 获取 LLM 配置
   * @returns {Promise}
   */
  getLlmConfig: () => {
    return apiClient.get('/api/auth/llm-config');
  },

  /**
   * 更新 LLM 配置
   * @param {Object} data - { use_default_llm, llm_api_key, llm_base_url, llm_model }
   * @returns {Promise}
   */
  updateLlmConfig: (data) => {
    return apiClient.put('/api/auth/llm-config', data);
  },
};
