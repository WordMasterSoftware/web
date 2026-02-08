import axios from 'axios';
import toast from 'react-hot-toast';

/**
 * Parse stored state from localStorage
 * @param {string} key - localStorage key
 * @returns {object|null} - parsed state or null
 */
function getStoredState(key) {
  const stored = localStorage.getItem(key);
  if (!stored) return null;

  try {
    const { state } = JSON.parse(stored);
    return state;
  } catch (error) {
    console.error(`Failed to parse ${key}:`, error);
    return null;
  }
}

/**
 * 创建 Axios 实例
 * 支持动态 baseURL 和自动添加 Authorization header
 */
function createApiClient() {
  const instance = axios.create({
    timeout: 30000,
    headers: {
      'Content-Type': 'application/json',
    },
  });

  // 请求拦截器
  instance.interceptors.request.use(
    (config) => {
      const configState = getStoredState('config-storage');
      if (configState?.baseURL) {
        config.baseURL = configState.baseURL;
      }

      const authState = getStoredState('auth-storage');
      if (authState?.token) {
        config.headers.Authorization = `Bearer ${authState.token}`;
      }

      return config;
    },
    (error) => Promise.reject(error)
  );

  // 响应拦截器
  instance.interceptors.response.use(
    (response) => {
      // 直接返回 data 部分
      return response.data;
    },
    (error) => {
      // 统一错误处理
      if (error.response) {
        const { status, data } = error.response;

        switch (status) {
          case 401:
            // Token 过期，清除认证信息
            localStorage.removeItem('auth-storage');
            toast.error('登录已过期，请重新登录');
            // 跳转到登录页
            if (window.location.pathname !== '/user/login') {
              window.location.href = '/user/login';
            }
            break;

          case 403:
            toast.error('无权限访问');
            break;

          case 404:
            toast.error('请求的资源不存在');
            break;

          case 429:
            toast.error('请求过于频繁，请稍后再试');
            break;

          case 500:
            toast.error('服务器错误，请稍后重试');
            break;

          default:
            toast.error(data?.message || '请求失败');
        }
      } else if (error.request) {
        toast.error('网络错误，请检查后端服务是否启动');
      } else {
        toast.error('请求配置错误');
      }

      return Promise.reject(error);
    }
  );

  return instance;
};

// 导出单例 API 客户端
export const apiClient = createApiClient();
