import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { useEffect, lazy, Suspense } from 'react';
import { useThemeStore } from '@/stores';
import { PageLoading } from '@/components/common/Loading';

// Layout
import AppLayout from '@/components/layout/AppLayout';
import ProtectedRoute from '@/components/layout/ProtectedRoute';
import ConfigGuard from '@/components/layout/ConfigGuard';

// Lazy Load Public Pages
const Home = lazy(() => import('@/pages/Home'));
const UrlConfig = lazy(() => import('@/pages/UrlConfig'));
const Login = lazy(() => import('@/pages/auth/Login'));
const Register = lazy(() => import('@/pages/auth/Register'));

// Lazy Load Protected Pages
const Dashboard = lazy(() => import('@/pages/dashboard/Dashboard'));
const Settings = lazy(() => import('@/pages/user/Settings'));
const WordbookList = lazy(() => import('@/pages/wordbook/WordbookList'));
const WordbookDetail = lazy(() => import('@/pages/wordbook/WordbookDetail'));
const StudyNew = lazy(() => import('@/pages/study/StudyNew'));
const Review = lazy(() => import('@/pages/study/Review'));
const RandomReview = lazy(() => import('@/pages/study/RandomReview'));
const CompleteReview = lazy(() => import('@/pages/study/CompleteReview'));
const Exam = lazy(() => import('@/pages/exam/Exam'));
const MessageCenter = lazy(() => import('@/pages/messages/MessageCenter'));
const Marketplace = lazy(() => import('@/pages/Marketplace'));

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
          className: 'bg-white dark:bg-gray-800 text-gray-900 dark:text-white border border-gray-200 dark:border-gray-700 shadow-lg',
          style: {
            padding: '16px',
            borderRadius: '12px',
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

      <Suspense fallback={<PageLoading />}>
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
      </Suspense>
    </BrowserRouter>
  );
}

export default App;
