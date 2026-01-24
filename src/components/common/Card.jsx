// eslint-disable-next-line no-unused-vars
import { motion } from 'framer-motion';
import { cn } from '@/utils';

/**
 * 卡片组件
 * 支持Hover动画和多种样式
 */
const Card = ({
  children,
  title,
  subtitle,
  footer,
  hoverable = false,
  className = '',
  bodyClassName = '',
  onClick,
}) => {
  const cardVariants = {
    initial: { scale: 1 },
    hover: hoverable ? { scale: 1.02, y: -4 } : {},
  };

  return (
    <motion.div
      className={cn(
        'bg-white dark:bg-dark-surface rounded-xl border border-gray-200 dark:border-dark-border overflow-hidden',
        'shadow-sm hover:shadow-md transition-shadow duration-200',
        hoverable && 'cursor-pointer',
        className
      )}
      variants={cardVariants}
      initial="initial"
      whileHover="hover"
      onClick={onClick}
    >
      {/* Header */}
      {(title || subtitle) && (
        <div className="px-6 py-4 border-b border-gray-200 dark:border-dark-border">
          {title && (
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              {title}
            </h3>
          )}
          {subtitle && (
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              {subtitle}
            </p>
          )}
        </div>
      )}

      {/* Body */}
      <div className={cn('px-6 py-4', bodyClassName)}>{children}</div>

      {/* Footer */}
      {footer && (
        <div className="px-6 py-4 bg-gray-50 dark:bg-dark-hover border-t border-gray-200 dark:border-dark-border">
          {footer}
        </div>
      )}
    </motion.div>
  );
};

export default Card;
