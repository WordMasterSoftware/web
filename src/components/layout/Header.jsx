import { Fragment, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Menu, Transition } from '@headlessui/react';
import { SunIcon, MoonIcon, UserCircleIcon, BellIcon, Bars3Icon } from '@heroicons/react/24/outline';
import { useAuthStore, useThemeStore, useMessageStore } from '@/stores';
import { cn } from '@/utils';

/**
 * 顶部导航栏组件
 */
const Header = ({ onMenuClick }) => {
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();
  const { toggleTheme, actualTheme } = useThemeStore();
  const { unreadCount, fetchMessages } = useMessageStore();

  useEffect(() => {
    if (user) {
      // 获取消息计数，不需要加载具体列表，size: 1 足够
      fetchMessages({ size: 1 });
    }
  }, [user, fetchMessages]);

  const handleLogout = () => {
    logout();
    navigate('/user/login');
  };

  return (
    <header className="sticky top-0 z-50 bg-white dark:bg-dark-surface border-b border-gray-200 dark:border-dark-border">
      <div className="max-w-full mx-auto px-5">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
            {/* Mobile Menu Button */}
            <button
              type="button"
              className="p-2 -ml-2 mr-2 rounded-lg xl:hidden hover:bg-gray-100 dark:hover:bg-dark-hover text-gray-500 dark:text-gray-400"
              onClick={onMenuClick}
            >
              <Bars3Icon className="w-6 h-6" />
            </button>

            {/* Logo */}
            <Link to="/dashboard" className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-br from-primary-500 to-primary-700 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-lg">W</span>
              </div>
              <span className="hidden md:block text-xl font-bold text-gray-900 dark:text-white">
                WordMaster
              </span>
            </Link>
          </div>

          {/* Right Section */}
          <div className="flex items-center space-x-4">
            {/* Theme Switcher - Direct Toggle with Animation */}
            <button
              onClick={(e) => {
                // 获取点击位置（相对于按钮中心）
                const rect = e.currentTarget.getBoundingClientRect();
                const x = rect.left + rect.width / 2;
                const y = rect.top + rect.height / 2;
                toggleTheme({ x, y });
              }}
              className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-dark-hover transition-colors"
              aria-label="切换主题"
            >
              {actualTheme === 'dark' ? (
                <MoonIcon className="w-5 h-5 text-gray-700 dark:text-gray-300" />
              ) : (
                <SunIcon className="w-5 h-5 text-gray-700 dark:text-gray-300" />
              )}
            </button>

            {/* Message Icon */}
            <Link
              to="/messages"
              className="relative p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-dark-hover transition-colors"
              aria-label="消息中心"
            >
              <BellIcon className="w-6 h-6 text-gray-700 dark:text-gray-300" />
              {unreadCount > 0 && (
                <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full ring-2 ring-white dark:ring-dark-surface" />
              )}
            </Link>

            {/* User Menu */}
            <Menu as="div" className="relative">
              <Menu.Button className="flex items-center space-x-2 p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-dark-hover transition-colors">
                {user?.avatarUrl ? (
                  <img
                    src={user.avatarUrl}
                    alt={user.nickname || user.username}
                    className="w-8 h-8 rounded-full"
                  />
                ) : (
                  <UserCircleIcon className="w-8 h-8 text-gray-700 dark:text-gray-300" />
                )}
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300 hidden sm:block">
                  {user?.nickname || user?.username}
                </span>
              </Menu.Button>

              <Transition
                as={Fragment}
                enter="transition ease-out duration-100"
                enterFrom="transform opacity-0 scale-95"
                enterTo="transform opacity-100 scale-100"
                leave="transition ease-in duration-75"
                leaveFrom="transform opacity-100 scale-100"
                leaveTo="transform opacity-0 scale-95"
              >
                <Menu.Items className="absolute right-0 mt-2 w-48 origin-top-right rounded-lg bg-white dark:bg-dark-surface shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
                  <div className="py-1">
                    <Menu.Item>
                      {({ active }) => (
                        <Link
                          to="/user/settings"
                          className={cn(
                            'block px-4 py-2 text-sm',
                            active
                              ? 'bg-gray-100 dark:bg-dark-hover text-gray-900 dark:text-white'
                              : 'text-gray-700 dark:text-gray-300'
                          )}
                        >
                          个人设置
                        </Link>
                      )}
                    </Menu.Item>
                    <Menu.Item>
                      {({ active }) => (
                        <button
                          onClick={handleLogout}
                          className={cn(
                            'block w-full text-left px-4 py-2 text-sm',
                            active
                              ? 'bg-gray-100 dark:bg-dark-hover text-gray-900 dark:text-white'
                              : 'text-gray-700 dark:text-gray-300'
                          )}
                        >
                          退出登录
                        </button>
                      )}
                    </Menu.Item>
                  </div>
                </Menu.Items>
              </Transition>
            </Menu>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
