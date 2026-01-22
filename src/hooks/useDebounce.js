import { useState, useEffect } from 'react';

/**
 * 防抖 Hook
 * 延迟更新值，避免频繁触发操作
 *
 * @param {any} value - 要防抖的值
 * @param {number} delay - 延迟时间（毫秒），默认500ms
 * @returns {any} - 防抖后的值
 *
 * @example
 * const [searchTerm, setSearchTerm] = useState('');
 * const debouncedSearchTerm = useDebounce(searchTerm, 500);
 *
 * useEffect(() => {
 *   // 只在用户停止输入500ms后才执行搜索
 *   if (debouncedSearchTerm) {
 *     searchAPI(debouncedSearchTerm);
 *   }
 * }, [debouncedSearchTerm]);
 */
export const useDebounce = (value, delay = 500) => {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    // 设置定时器
    const timer = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    // 清理函数：在value变化或组件卸载时清除定时器
    return () => {
      clearTimeout(timer);
    };
  }, [value, delay]);

  return debouncedValue;
};

export default useDebounce;
