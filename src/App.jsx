import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { useEffect } from 'react';
import { useThemeStore } from '@/stores';

// Layout
import AppLayout from '@/components/layout/AppLayout';
import ProtectedRoute from '@/components/layout/ProtectedRoute';
import ConfigGuard from '@/components/layout/ConfigGuard';

// Public Pages
import Home from '@/pages/Home';
import UrlConfig from '@/pages/UrlConfig';
import Login from '@/pages/auth/Login';
import Register from '@/pages/auth/Register';

// Protected Pages
import Dashboard from '@/pages/dashboard/Dashboard';
import Settings from '@/pages/user/Settings';
import WordbookList from '@/pages/wordbook/WordbookList';
import WordbookDetail from '@/pages/wordbook/WordbookDetail';
import StudyNew from '@/pages/study/StudyNew';
import Review from '@/pages/study/Review';
import RandomReview from '@/pages/study/RandomReview';
import CompleteReview from '@/pages/study/CompleteReview';
import Exam from '@/pages/exam/Exam';
import MessageCenter from '@/pages/messages/MessageCenter';
import Marketplace from '@/pages/Marketplace';

function App() {
  const { initTheme } = useThemeStore();

  // 初始化主题
  useEffect(() => {
    initTheme();
  }, [initTheme]);

  return (
    <BrowserRouter>
      <Toaster
        position="top-center"
        toastOptions={{
          duration: 3000,
          style: {
            background: 'var(--toast-bg)',
            color: 'var(--toast-color)',
          },
          success: {
            iconTheme: {
              primary: '#10b981',
              secondary: '#fff',
            },
          },
          error: {
            iconTheme: {
              primary: '#ef4444',
              secondary: '#fff',
            },
          },
        }}
      />

      <Routes>
        {/* 级别 0: 无条件访问 */}
        <Route path="/" element={<Home />} />
        <Route path="/url-config" element={<UrlConfig />} />

        {/* 级别 1 & 2: 需要后端配置（ConfigGuard） */}
        <Route element={<ConfigGuard />}>
          {/* 登录/注册页（仅需配置） */}
          <Route path="/user/login" element={<Login />} />
          <Route path="/user/register" element={<Register />} />

          {/* 受保护路由（需配置 + 登录） */}
          <Route
            element={
              <ProtectedRoute>
                <AppLayout />
              </ProtectedRoute>
            }
          >
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/user/settings" element={<Settings />} />
            <Route path="/wordbook" element={<WordbookList />} />
            <Route path="/wordbook/:id" element={<WordbookDetail />} />
            <Route path="/study/new" element={<StudyNew />} />
            <Route path="/messages" element={<MessageCenter />} />
            <Route path="/study/review" element={<Review />} />
            <Route path="/study/random" element={<RandomReview />} />
            <Route path="/study/complete" element={<CompleteReview />} />
            <Route path="/exam/:examId" element={<Exam />} />
            <Route path="/marketplace" element={<Marketplace />} />
          </Route>
        </Route>

        {/* 404 */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
