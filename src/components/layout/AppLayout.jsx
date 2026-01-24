import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Header from './Header';
import Sidebar from './Sidebar';

/**
 * 应用主布局组件
 * 包含顶部导航栏、侧边栏和内容区域
 */
const AppLayout = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-dark-bg">
      {/* Header */}
      <Header onMenuClick={() => setIsSidebarOpen(!isSidebarOpen)} />

      {/* Main Content */}
      <div className="flex h-[calc(100vh-4rem)]">
        {/* Sidebar */}
        <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />

        {/* Content Area */}
        <main className="flex-1 overflow-y-auto w-full">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};

export default AppLayout;
