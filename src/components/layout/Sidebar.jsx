import { NavLink } from 'react-router-dom';
import {
  HomeIcon,
  BookOpenIcon,
  AcademicCapIcon,
  ChartBarIcon,
} from '@heroicons/react/24/outline';
import { cn } from '@/utils';

/**
 * 侧边栏导航组件
 */
const Sidebar = () => {
  const navItems = [
    {
      name: '主看板',
      path: '/dashboard',
      icon: HomeIcon,
    },
    {
      name: '单词本',
      path: '/wordbook',
      icon: BookOpenIcon,
    },
    {
      name: '学习',
      path: '/study/new',
      icon: AcademicCapIcon,
      disabled: true, // 禁止点击父级
      subItems: [
        { name: '新词背诵', path: '/study/new' },
        { name: '即时复习', path: '/study/review' },
        { name: '随机复习', path: '/study/random' },
        { name: '完全复习', path: '/study/complete' },
      ],
    },
    {
      name: '学习统计',
      path: '/statistics',
      icon: ChartBarIcon,
    },
  ];

  return (
    <aside className="hidden md:flex md:flex-shrink-0">
      <div className="flex flex-col w-64 border-r border-gray-200 dark:border-dark-border bg-white dark:bg-dark-surface">
        <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
          {navItems.map((item) => (
            <div key={item.path}>
              {item.disabled ? (
                // 如果禁用，显示为普通div而不是NavLink
                <div
                  className={cn(
                    'flex items-center space-x-3 px-4 py-3 rounded-lg cursor-default',
                    'text-gray-700 dark:text-gray-300'
                  )}
                >
                  <item.icon className="w-5 h-5 flex-shrink-0" />
                  <span className="font-medium">{item.name}</span>
                </div>
              ) : (
                <NavLink
                  to={item.path}
                  className={({ isActive }) =>
                    cn(
                      'flex items-center space-x-3 px-4 py-3 rounded-lg transition-all duration-200',
                      isActive
                        ? 'bg-primary-50 dark:bg-primary-900/20 text-primary-700 dark:text-primary-400'
                        : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-dark-hover'
                    )
                  }
                >
                  <item.icon className="w-5 h-5 flex-shrink-0" />
                  <span className="font-medium">{item.name}</span>
                </NavLink>
              )}

              {/* Sub Items */}
              {item.subItems && (
                <div className="ml-8 mt-1 space-y-1">
                  {item.subItems.map((subItem) => (
                    <NavLink
                      key={subItem.path}
                      to={subItem.path}
                      className={({ isActive }) =>
                        cn(
                          'block px-4 py-2 text-sm rounded-lg transition-colors',
                          isActive
                            ? 'text-primary-700 dark:text-primary-400 bg-primary-50 dark:bg-primary-900/10'
                            : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-dark-hover'
                        )
                      }
                    >
                      {subItem.name}
                    </NavLink>
                  ))}
                </div>
              )}
            </div>
          ))}
        </nav>

        {/* Footer */}
        <div className="p-4 border-t border-gray-200 dark:border-dark-border">
          <p className="text-xs text-gray-500 dark:text-gray-400 text-center">
            WordMaster v1.0.0
          </p>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
