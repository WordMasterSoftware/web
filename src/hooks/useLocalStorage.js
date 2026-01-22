import { useState, useEffect } from 'react';

/**
 * LocalStorage Hook
 * 提供响应式的 localStorage 读写
 *
 * @param {string} key - localStorage 的 key
 * @param {any} defaultValue - 默认值
 * @returns {[any, Function, Function]} - [value, setValue, removeValue]
 *
 * @example
 * const [theme, setTheme, removeTheme] = useLocalStorage('theme', 'light');
 *
 * // 更新值
 * setTheme('dark');
 *
 * // 移除值
 * removeTheme();
 */
export const useLocalStorage = (key, defaultValue) => {
  // 初始化状态
  const [value, setValue] = useState(() => {
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : defaultValue;
    } catch (error) {
      console.error(`Error reading localStorage key "${key}":`, error);
      return defaultValue;
    }
  });

  // 更新 localStorage 和状态
  const setStoredValue = (newValue) => {
    try {
      // 允许传入函数（类似 useState）
      const valueToStore = newValue instanceof Function ? newValue(value) : newValue;

      // 保存状态
      setValue(valueToStore);

      // 保存到 localStorage
      window.localStorage.setItem(key, JSON.stringify(valueToStore));

      // 触发自定义事件，通知其他组件
      window.dispatchEvent(
        new CustomEvent('localStorageChange', {
          detail: { key, value: valueToStore },
        })
      );
    } catch (error) {
      console.error(`Error setting localStorage key "${key}":`, error);
    }
  };

  // 移除值
  const removeStoredValue = () => {
    try {
      window.localStorage.removeItem(key);
      setValue(defaultValue);

      // 触发自定义事件
      window.dispatchEvent(
        new CustomEvent('localStorageChange', {
          detail: { key, value: null },
        })
      );
    } catch (error) {
      console.error(`Error removing localStorage key "${key}":`, error);
    }
  };

  // 监听其他标签页/窗口的 storage 变化
  useEffect(() => {
    const handleStorageChange = (e) => {
      if (e.key === key && e.newValue !== null) {
        try {
          setValue(JSON.parse(e.newValue));
        } catch (error) {
          console.error('Error parsing storage event:', error);
        }
      }
    };

    // 监听 storage 事件（跨标签页同步）
    window.addEventListener('storage', handleStorageChange);

    // 监听自定义事件（同一标签页内同步）
    const handleCustomStorageChange = (e) => {
      if (e.detail.key === key) {
        setValue(e.detail.value ?? defaultValue);
      }
    };

    window.addEventListener('localStorageChange', handleCustomStorageChange);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('localStorageChange', handleCustomStorageChange);
    };
  }, [key, defaultValue]);

  return [value, setStoredValue, removeStoredValue];
};

export default useLocalStorage;
