// eslint-disable-next-line no-unused-vars
import { motion } from 'framer-motion';

/**
 * 加载动画组件
 */
const Loading = ({ size = 'md', text = '加载中...' }) => {
  const sizes = {
    sm: 'w-6 h-6',
    md: 'w-10 h-10',
    lg: 'w-16 h-16',
  };

  return (
    <div className="flex flex-col items-center justify-center space-y-4">
      <motion.div
        className={`${sizes[size]} border-4 border-gray-200 dark:border-dark-border border-t-primary-600 dark:border-t-primary-400 rounded-full`}
        animate={{ rotate: 360 }}
        transition={{
          duration: 1,
          repeat: Infinity,
          ease: 'linear',
        }}
      />
      {text && (
        <p className="text-sm text-gray-600 dark:text-gray-400">{text}</p>
      )}
    </div>
  );
};

/**
 * 骨架屏组件
 */
export const Skeleton = ({ className = '', count = 1 }) => {
  return (
    <>
      {Array.from({ length: count }).map((_, index) => (
        <div
          key={index}
          className={`animate-pulse bg-gray-200 dark:bg-dark-border rounded ${className}`}
        />
      ))}
    </>
  );
};

/**
 * 页面加载组件
 */
export const PageLoading = () => {
  return (
    <div className="flex items-center justify-center min-h-[50vh]">
      <Loading size="lg" text="页面加载中..." />
    </div>
  );
};

export default Loading;
