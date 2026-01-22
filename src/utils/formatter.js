/**
 * 工具函数 - 数据格式化
 */

/**
 * 格式化日期
 * @param {string|Date} date - 日期
 * @param {string} format - 格式（默认 'YYYY-MM-DD HH:mm:ss'）
 * @returns {string}
 */
export const formatDate = (date, format = 'YYYY-MM-DD HH:mm:ss') => {
  if (!date) return '';

  const d = new Date(date);
  if (isNaN(d.getTime())) return '';

  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  const hours = String(d.getHours()).padStart(2, '0');
  const minutes = String(d.getMinutes()).padStart(2, '0');
  const seconds = String(d.getSeconds()).padStart(2, '0');

  return format
    .replace('YYYY', year)
    .replace('MM', month)
    .replace('DD', day)
    .replace('HH', hours)
    .replace('mm', minutes)
    .replace('ss', seconds);
};

/**
 * 格式化相对时间（如：3分钟前）
 * @param {string|Date} date - 日期
 * @returns {string}
 */
export const formatRelativeTime = (date) => {
  if (!date) return '';

  const d = new Date(date);
  if (isNaN(d.getTime())) return '';

  const now = new Date();
  const diff = now - d; // 毫秒差
  const seconds = Math.floor(diff / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (days > 7) {
    return formatDate(date, 'YYYY-MM-DD');
  } else if (days > 0) {
    return `${days}天前`;
  } else if (hours > 0) {
    return `${hours}小时前`;
  } else if (minutes > 0) {
    return `${minutes}分钟前`;
  } else if (seconds > 0) {
    return `${seconds}秒前`;
  } else {
    return '刚刚';
  }
};

/**
 * 格式化数字（千分位）
 * @param {number} num - 数字
 * @returns {string}
 */
export const formatNumber = (num) => {
  if (typeof num !== 'number') return '0';
  return num.toLocaleString('zh-CN');
};

/**
 * 格式化百分比
 * @param {number} value - 值
 * @param {number} total - 总数
 * @param {number} decimals - 小数位数（默认0）
 * @returns {string}
 */
export const formatPercentage = (value, total, decimals = 0) => {
  if (!total || total === 0) return '0%';
  const percentage = (value / total) * 100;
  return `${percentage.toFixed(decimals)}%`;
};

/**
 * 截断文本
 * @param {string} text - 文本
 * @param {number} maxLength - 最大长度
 * @param {string} suffix - 后缀（默认...）
 * @returns {string}
 */
export const truncateText = (text, maxLength, suffix = '...') => {
  if (!text || text.length <= maxLength) return text;
  return text.substring(0, maxLength) + suffix;
};

/**
 * 将秒数格式化为 MM:SS
 * @param {number} seconds - 秒数
 * @returns {string}
 */
export const formatTime = (seconds) => {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
};

/**
 * 生成随机颜色
 * @returns {string} - HEX颜色值
 */
export const randomColor = () => {
  const colors = [
    '#3b82f6',
    '#10b981',
    '#f59e0b',
    '#ef4444',
    '#8b5cf6',
    '#ec4899',
    '#06b6d4',
    '#f97316',
  ];
  return colors[Math.floor(Math.random() * colors.length)];
};
