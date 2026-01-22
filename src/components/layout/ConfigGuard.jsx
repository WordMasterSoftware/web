import { Navigate, Outlet } from 'react-router-dom';
import { useConfigStore } from '@/stores';

/**
 * 配置守卫组件
 * 检查后端 URL 是否已配置
 * 未配置则重定向到 /url-config 页面
 */
const ConfigGuard = ({ children }) => {
  const { isConfigured } = useConfigStore();

  // 检查是否已配置后端 URL
  if (!isConfigured) {
    return <Navigate to="/url-config" replace />;
  }

  return children || <Outlet />;
};

export default ConfigGuard;
