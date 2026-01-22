/**
 * 工具函数 - 常量定义
 */

// 学习模式
export const STUDY_MODES = {
  NEW: 'new',
  REVIEW: 'review',
  RANDOM: 'random',
  FINAL: 'final',
};

// 学习状态
export const WORD_STATUS = {
  NEW: 0, // 新词
  PENDING_CHECK: 1, // 待检验
  REVIEWING: 2, // 复习中
  MASTERED: 3, // 已掌握
  COMPLETED: 4, // 已完成
};

// 学习状态标签
export const WORD_STATUS_LABELS = {
  [WORD_STATUS.NEW]: '新词',
  [WORD_STATUS.PENDING_CHECK]: '待检验',
  [WORD_STATUS.REVIEWING]: '复习中',
  [WORD_STATUS.MASTERED]: '已掌握',
  [WORD_STATUS.COMPLETED]: '已完成',
};

// 学习状态颜色
export const WORD_STATUS_COLORS = {
  [WORD_STATUS.NEW]: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200',
  [WORD_STATUS.PENDING_CHECK]: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
  [WORD_STATUS.REVIEWING]: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
  [WORD_STATUS.MASTERED]: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
  [WORD_STATUS.COMPLETED]: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200',
};

// 考试模式
export const EXAM_MODES = {
  REVIEW: 'review',
  TEST: 'test',
};

// 主题模式
export const THEMES = {
  LIGHT: 'light',
  DARK: 'dark',
  SYSTEM: 'system',
};

// 单词本图标选项
export const WORDBOOK_ICONS = [
  '📚', // 书籍
  '🎓', // 学位帽
  '📝', // 备忘录
  '🗣️', // 说话
  '🔥', // 火焰
  '⭐', // 星星
  '🎯', // 靶心
  '🚀', // 火箭
];

// 单词本颜色选项
export const WORDBOOK_COLORS = [
  '#3b82f6', // blue
  '#10b981', // green
  '#f59e0b', // yellow
  '#ef4444', // red
  '#8b5cf6', // purple
  '#ec4899', // pink
  '#06b6d4', // cyan
  '#f97316', // orange
];

// 分页默认配置
export const PAGINATION = {
  DEFAULT_PAGE: 1,
  DEFAULT_PAGE_SIZE: 20,
  MAX_PAGE_SIZE: 100,
};

// API 响应超时时间
export const API_TIMEOUT = 30000; // 30秒

// Toast 显示时长
export const TOAST_DURATION = 3000; // 3秒

// 防抖延迟时间
export const DEBOUNCE_DELAY = 500; // 500ms
