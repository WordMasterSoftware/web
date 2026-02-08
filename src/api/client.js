import axios from 'axios';
import toast from 'react-hot-toast';

/**
 * 创建 Axios 实例
 * 支持动态 baseURL 和自动添加 Authorization header
 */
const createApiClient = () => {
  const instance = axios.create({
    timeout: 30000,
    headers: {
      'Content-Type': 'application/json',
    },
  });

  // 请求拦截器
  instance.interceptors.request.use(
    (config) => {
      // 动态获取 baseURL（从 localStorage）
      const configStore = localStorage.getItem('config-storage');
      if (configStore) {
        try {
          const { state } = JSON.parse(configStore);
          if (state?.baseURL) {
            config.baseURL = state.baseURL;
          }
        } catch (error) {
          console.error('Failed to parse config storage:', error);
        }
      }

      // 添加 Authorization header
      const authStore = localStorage.getItem('auth-storage');
      if (authStore) {
        try {
          const { state } = JSON.parse(authStore);
          if (state?.token) {
            config.headers.Authorization = `Bearer ${state.token}`;
          }
        } catch (error) {
          console.error('Failed to parse auth storage:', error);
        }
      }

      return config;
    },
    (error) => {
      return Promise.reject(error);
    }
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
