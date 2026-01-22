/**
 * 工具函数统一导出
 */
export * from './constants';
export * from './formatter';
export * from './validation';

/**
 * classNames 工具函数（简化版 clsx）
 * 用于条件性组合 CSS 类名
 *
 * @param {...any} classes - 类名参数
 * @returns {string} - 组合后的类名字符串
 *
 * @example
 * cn('btn', isActive && 'btn-active', { 'btn-disabled': isDisabled })
 * // => 'btn btn-active' (if isActive is true and isDisabled is false)
 */
export const cn = (...classes) => {
  return classes
    .flat()
    .filter((x) => typeof x === 'string' || typeof x === 'number')
    .join(' ')
    .trim();
};

/**
 * 延迟函数
 * @param {number} ms - 延迟毫秒数
 * @returns {Promise}
 */
export const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

/**
 * 深拷贝
 * @param {any} obj - 要拷贝的对象
 * @returns {any}
 */
export const deepClone = (obj) => {
  if (obj === null || typeof obj !== 'object') return obj;
  return JSON.parse(JSON.stringify(obj));
};

/**
 * 生成唯一ID
 * @returns {string}
 */
export const generateId = () => {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
};
