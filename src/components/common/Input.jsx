import { forwardRef } from 'react';
import { cn } from '@/utils';

/**
 * 输入框组件
 * 支持多种类型、前缀图标、错误提示
 */
const Input = forwardRef(
  (
    {
      label,
      type = 'text',
      error,
      helperText,
      prefix,
      suffix,
      fullWidth = false,
      className = '',
      inputClassName = '',
      disabled = false,
      ...props
    },
    ref
  ) => {
    return (
      <div className={cn('flex flex-col space-y-1', fullWidth && 'w-full', className)}>
        {/* Label */}
        {label && (
          <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
            {label}
          </label>
        )}

        {/* Input Container */}
        <div className="relative">
          {/* Prefix */}
          {prefix && (
            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
              {typeof prefix === 'string' ? (
                <span className="text-gray-500 dark:text-gray-400">{prefix}</span>
              ) : (
                prefix
              )}
            </div>
          )}

          {/* Input */}
          <input
            ref={ref}
            type={type}
            disabled={disabled}
            className={cn(
              'block w-full rounded-lg border transition-colors',
              'px-4 py-2 text-base',
              'placeholder:text-gray-400 dark:placeholder:text-gray-500',
              'focus:outline-none focus:ring-2 focus:ring-offset-0',
              error
                ? 'border-error-500 focus:ring-error-500 dark:border-error-400 dark:focus:ring-error-400'
                : 'border-gray-300 dark:border-dark-border focus:ring-primary-500 dark:focus:ring-primary-400',
              'bg-white dark:bg-dark-surface',
              'text-gray-900 dark:text-gray-100',
              disabled && 'opacity-50 cursor-not-allowed bg-gray-50 dark:bg-dark-hover',
              prefix && 'pl-10',
              suffix && 'pr-10',
              inputClassName
            )}
            {...props}
          />

          {/* Suffix */}
          {suffix && (
            <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
              {typeof suffix === 'string' ? (
                <span className="text-gray-500 dark:text-gray-400">{suffix}</span>
              ) : (
                suffix
              )}
            </div>
          )}
        </div>

        {/* Error or Helper Text */}
        {(error || helperText) && (
          <p
            className={cn(
              'text-sm',
              error
                ? 'text-error-600 dark:text-error-400'
                : 'text-gray-500 dark:text-gray-400'
            )}
          >
            {error || helperText}
          </p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';

export default Input;
