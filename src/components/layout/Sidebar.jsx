import { Fragment } from 'react';
import { NavLink } from 'react-router-dom';
import { Dialog, Transition } from '@headlessui/react';
import {
  HomeIcon,
  BookOpenIcon,
  AcademicCapIcon,
  ChartBarIcon,
  XMarkIcon,
} from '@heroicons/react/24/outline';
import { cn } from '@/utils';

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

const SidebarContent = ({ onClose }) => (
  <div className="flex flex-col h-full w-full border-r border-gray-200 dark:border-dark-border bg-white dark:bg-dark-surface">
    <div className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
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
              onClick={onClose} // 点击链接关闭侧边栏（移动端）
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
                  onClick={onClose}
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
    </div>

    {/* Footer */}
    <div className="p-4 border-t border-gray-200 dark:border-dark-border">
      <p className="text-xs text-gray-500 dark:text-gray-400 text-center">
        WordMaster v1.2.0
      </p>
    </div>
  </div>
);

/**
 * 侧边栏导航组件
 */
const Sidebar = ({ isOpen, onClose }) => {
  return (
    <>
      {/* Mobile Sidebar (Drawer) */}
      <Transition.Root show={isOpen} as={Fragment}>
        <Dialog as="div" className="relative z-50 xl:hidden" onClose={onClose}>
          <Transition.Child
            as={Fragment}
            enter="transition-opacity ease-linear duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="transition-opacity ease-linear duration-300"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="fixed inset-0 bg-gray-900/80" />
          </Transition.Child>

          <div className="fixed inset-0 flex">
            <Transition.Child
              as={Fragment}
              enter="transition ease-in-out duration-300 transform"
              enterFrom="-translate-x-full"
              enterTo="translate-x-0"
              leave="transition ease-in-out duration-300 transform"
              leaveFrom="translate-x-0"
              leaveTo="-translate-x-full"
            >
              <Dialog.Panel className="relative mr-16 flex w-full max-w-md flex-1">
                <Transition.Child
                  as={Fragment}
                  enter="ease-in-out duration-300"
                  enterFrom="opacity-0"
                  enterTo="opacity-100"
                  leave="ease-in-out duration-300"
                  leaveFrom="opacity-100"
                  leaveTo="opacity-0"
                >
                  <div className="absolute left-full top-0 flex w-16 justify-center pt-5">
                    <button type="button" className="-m-2.5 p-2.5" onClick={onClose}>
                      <span className="sr-only">Close sidebar</span>
                      <XMarkIcon className="h-6 w-6 text-white" aria-hidden="true" />
                    </button>
                  </div>
                </Transition.Child>

                {/* Mobile Content */}
                <div className="w-full h-full">
                   <SidebarContent onClose={onClose} />
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </Dialog>
      </Transition.Root>

      {/* Desktop Sidebar (Static) - Hidden on mobile/tablet, visible on xl (>=1280px) */}
      <aside className="hidden xl:flex xl:flex-shrink-0 w-[245px]">
        <SidebarContent />
      </aside>
    </>
  );
};

export default Sidebar;
