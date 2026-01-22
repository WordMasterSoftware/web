/**
 * 工具函数 - 表单验证
 */

/**
 * Levenshtein 距离算法（编辑距离）
 * 用于计算两个字符串的相似度
 */
const levenshteinDistance = (str1, str2) => {
  const m = str1.length;
  const n = str2.length;
  const dp = Array(m + 1)
    .fill(null)
    .map(() => Array(n + 1).fill(0));

  for (let i = 0; i <= m; i++) dp[i][0] = i;
  for (let j = 0; j <= n; j++) dp[0][j] = j;

  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      if (str1[i - 1] === str2[j - 1]) {
        dp[i][j] = dp[i - 1][j - 1];
      } else {
        dp[i][j] = Math.min(dp[i - 1][j] + 1, dp[i][j - 1] + 1, dp[i - 1][j - 1] + 1);
      }
    }
  }

  return dp[m][n];
};

/**
 * 验证拼写（支持模糊匹配）
 * @param {string} userInput - 用户输入
 * @param {string} correctAnswer - 正确答案
 * @returns {Object} - { isCorrect, similarity, hint }
 */
export const validateSpelling = (userInput, correctAnswer) => {
  const normalized1 = userInput.toLowerCase().trim();
  const normalized2 = correctAnswer.toLowerCase().trim();

  // 完全匹配
  if (normalized1 === normalized2) {
    return { isCorrect: true, similarity: 100 };
  }

  // 计算编辑距离
  const distance = levenshteinDistance(normalized1, normalized2);
  const maxLen = Math.max(normalized1.length, normalized2.length);
  const similarity = maxLen > 0 ? ((maxLen - distance) / maxLen) * 100 : 0;

  // 相似度 > 80% 给予提示
  if (similarity > 80) {
    return {
      isCorrect: false,
      similarity: Math.round(similarity),
      hint: `拼写接近（相似度 ${Math.round(similarity)}%），请检查`,
    };
  }

  return { isCorrect: false, similarity: Math.round(similarity) };
};

/**
 * 验证邮箱格式
 * @param {string} email - 邮箱
 * @returns {boolean}
 */
export const validateEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

/**
 * 验证用户名格式
 * 3-50字符，仅支持字母、数字、下划线
 * @param {string} username - 用户名
 * @returns {boolean}
 */
export const validateUsername = (username) => {
  const usernameRegex = /^[a-zA-Z0-9_]{3,50}$/;
  return usernameRegex.test(username);
};

/**
 * 验证密码强度
 * 6-20字符，至少包含字母和数字
 * @param {string} password - 密码
 * @returns {Object} - { isValid, strength, message }
 */
export const validatePassword = (password) => {
  if (!password || password.length < 6) {
    return {
      isValid: false,
      strength: 'weak',
      message: '密码至少6个字符',
    };
  }

  if (password.length > 20) {
    return {
      isValid: false,
      strength: 'weak',
      message: '密码最多20个字符',
    };
  }

  const hasLetter = /[a-zA-Z]/.test(password);
  const hasNumber = /\d/.test(password);
  const hasSpecial = /[!@#$%^&*(),.?":{}|<>]/.test(password);

  if (!hasLetter || !hasNumber) {
    return {
      isValid: false,
      strength: 'weak',
      message: '密码必须包含字母和数字',
    };
  }

  // 计算强度
  let strength = 'medium';
  if (password.length >= 12 && hasSpecial) {
    strength = 'strong';
  } else if (password.length >= 8 && (hasSpecial || password.length >= 10)) {
    strength = 'medium';
  }

  return {
    isValid: true,
    strength,
    message: '密码符合要求',
  };
};

/**
 * 验证URL格式
 * @param {string} url - URL
 * @returns {boolean}
 */
export const validateUrl = (url) => {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
};

/**
 * 清理单词列表（去重、去空）
 * @param {string} text - 用户输入的单词列表（换行分隔）
 * @returns {Array<string>} - 清理后的单词列表
 */
export const cleanWordList = (text) => {
  if (!text) return [];

  const words = text
    .split(/[\n,，\s]+/) // 支持换行、逗号、空格分隔
    .map((word) => word.trim().toLowerCase())
    .filter((word) => word && /^[a-z]+$/.test(word)); // 只保留英文字母

  // 去重
  return [...new Set(words)];
};
