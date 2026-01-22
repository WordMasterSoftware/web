import { apiClient } from './client';

/**
 * TTS 语音相关 API
 */
export const ttsApi = {
  /**
   * 获取单词发音 URL
   * @param {string} word - 单词
   * @returns {string} - 音频文件 URL
   */
  getAudioUrl: (word) => {
    // 从 localStorage 获取 baseURL
    const configStore = localStorage.getItem('config-storage');
    let baseURL = 'http://localhost:8000';

    if (configStore) {
      try {
        const { state } = JSON.parse(configStore);
        if (state?.baseURL) {
          baseURL = state.baseURL;
        }
      } catch (error) {
        console.error('Failed to parse config storage:', error);
      }
    }

    return `${baseURL}/api/tts/${encodeURIComponent(word)}`;
  },

  /**
   * 预加载音频（可选）
   * @param {string} word - 单词
   * @returns {Promise}
   */
  preload: async (word) => {
    const url = ttsApi.getAudioUrl(word);

    return new Promise((resolve, reject) => {
      const audio = new Audio(url);
      audio.addEventListener('canplaythrough', () => resolve(audio));
      audio.addEventListener('error', reject);
      audio.load();
    });
  },
};
