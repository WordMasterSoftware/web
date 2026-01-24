// eslint-disable-next-line no-unused-vars
import { motion } from 'framer-motion';
import { cn } from '@/utils';

/**
 * 进度条组件
 * 支持动画和多种样式
 */
const ProgressBar = ({
  value = 0,
  max = 100,
  size = 'md',
  showLabel = false,
  animated = true,
  color = 'primary',
  className = '',
}) => {
  const percentage = Math.min((value / max) * 100, 100);

  const sizes = {
    sm: 'h-1',
    md: 'h-2',
    lg: 'h-3',
  };

  const colors = {
    primary: 'bg-primary-600 dark:bg-primary-500',
    success: 'bg-success-600 dark:bg-success-500',
    warning: 'bg-warning-600 dark:bg-warning-500',
    error: 'bg-error-600 dark:bg-error-500',
  };

  return (
    <div className={cn('w-full', className)}>
      {/* Label */}
      {showLabel && (
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
            进度
          </span>
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
            {Math.round(percentage)}%
          </span>
        </div>
      )}

      {/* Progress Track */}
      <div
        className={cn(
          'w-full bg-gray-200 dark:bg-dark-border rounded-full overflow-hidden',
          sizes[size]
        )}
      >
        {/* Progress Bar */}
        <motion.div
          className={cn('h-full rounded-full', colors[color])}
          initial={{ width: 0 }}
          animate={{ width: `${percentage}%` }}
          transition={
            animated
              ? {
                  duration: 0.5,
                  ease: 'easeOut',
                }
              : { duration: 0 }
          }
        />
      </div>
    </div>
  );
};

/**
 * 环形进度条组件
 */
export const CircularProgress = ({
  value = 0,
  max = 100,
  size = 120,
  strokeWidth = 8,
  color = 'primary',
  showLabel = true,
}) => {
  const percentage = Math.min((value / max) * 100, 100);
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const offset = circumference - (percentage / 100) * circumference;

  const colors = {
    primary: '#3b82f6',
    success: '#10b981',
    warning: '#f59e0b',
    error: '#ef4444',
  };

  return (
    <div className="relative inline-flex items-center justify-center">
      <svg width={size} height={size} className="transform -rotate-90">
        {/* Background Circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="currentColor"
          strokeWidth={strokeWidth}
          className="text-gray-200 dark:text-dark-border"
        />
        {/* Progress Circle */}
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={colors[color]}
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={circumference}
          strokeLinecap="round"
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
        />
      </svg>

      {/* Label */}
      {showLabel && (
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-2xl font-bold text-gray-900 dark:text-white">
            {Math.round(percentage)}%
          </span>
        </div>
      )}
    </div>
  );
};

export default ProgressBar;
