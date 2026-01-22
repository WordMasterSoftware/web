import { Navigate, Outlet } from 'react-router-dom';
import { useAuthStore } from '@/stores';

/**
 * 路由守卫组件
 * 保护需要登录才能访问的路由
 */
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, checkAuth } = useAuthStore();

  // 检查是否已登录
  if (!checkAuth()) {
    return <Navigate to="/user/login" replace />;
  }

  return children || <Outlet />;
};

export default ProtectedRoute;
