import { useState, useEffect, useCallback } from 'react';
import { SpeakerWaveIcon } from '@heroicons/react/24/solid';
import { ttsApi } from '@/api';
import { cn } from '@/utils';

/**
 * TTS播放器组件
 * 优先使用浏览器TTS API，失败时回退到后端API
 */
const TTSPlayer = ({ word, autoPlay = false, className = '' }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [error, setError] = useState(null);

  // 浏览器TTS播放
  const playWithBrowserTTS = useCallback((text) => {
    return new Promise((resolve, reject) => {
      // 检查浏览器是否支持 Speech Synthesis
      if (!window.speechSynthesis) {
        reject(new Error('浏览器不支持语音合成'));
        return;
      }

      // 取消当前正在播放的语音
      window.speechSynthesis.cancel();

      const utterance = new SpeechSynthesisUtterance(text);

      // 设置语音参数
      utterance.lang = 'en-US'; // 英语
      utterance.rate = 0.7; // 语速（0.1-10，默认1）
      utterance.pitch = 1; // 音调（0-2，默认1）
      utterance.volume = 1; // 音量（0-1，默认1）

      // 尝试选择英语语音
      const voices = window.speechSynthesis.getVoices();
      const enVoice = voices.find(voice =>
        voice.lang.startsWith('en') && voice.name.includes('Google')
      ) || voices.find(voice => voice.lang.startsWith('en'));

      if (enVoice) {
        utterance.voice = enVoice;
      }

      utterance.onend = () => {
        setIsPlaying(false);
        resolve();
      };

      utterance.onerror = (e) => {
        setIsPlaying(false);
        reject(e);
      };

      window.speechSynthesis.speak(utterance);
      setIsPlaying(true);
    });
  }, []);

  // 后端API播放（备用方案）
  const playWithBackendAPI = useCallback(async (text) => {
    const audio = new Audio(ttsApi.getAudioUrl(text));

    return new Promise((resolve, reject) => {
      audio.oncanplaythrough = () => {
        setIsPlaying(true);
        audio.play()
          .then(() => {
            audio.onended = () => {
              setIsPlaying(false);
              resolve();
            };
          })
          .catch(reject);
      };

      audio.onerror = reject;
      audio.load();
    });
  }, []);

  // 播放函数
  const play = useCallback(async () => {
    if (!word || isPlaying) return;

    setError(null);

    try {
      // 优先尝试浏览器TTS
      await playWithBrowserTTS(word);
    } catch (browserError) {
      console.warn('浏览器TTS失败，尝试使用后端API:', browserError);

      try {
        // 回退到后端API
        await playWithBackendAPI(word);
      } catch (backendError) {
        console.error('后端TTS也失败:', backendError);
        setError('播放失败');
        setIsPlaying(false);
      }
    }
  }, [word, isPlaying, playWithBrowserTTS, playWithBackendAPI]);

  // 自动播放
  useEffect(() => {
    if (autoPlay && word && !isPlaying) {
      // 延迟一点播放，避免页面加载时冲突
      const timer = setTimeout(() => play(), 400);

      // 清理函数：组件卸载或单词变化时清除定时器
      return () => clearTimeout(timer);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autoPlay, word]);

  return (
    <button
      onClick={play}
      disabled={isPlaying || !word}
      className={cn(
        'inline-flex items-center space-x-2 px-4 py-2 rounded-lg',
        'bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-400',
        'hover:bg-primary-200 dark:hover:bg-primary-900/50',
        'transition-all duration-200',
        'disabled:opacity-50 disabled:cursor-not-allowed',
        isPlaying && 'animate-pulse',
        className
      )}
    >
      <SpeakerWaveIcon className={cn('w-5 h-5', isPlaying && 'animate-pulse')} />
      <span className="text-sm font-medium">
        {isPlaying ? '播放中...' : error ? error : '播放发音'}
      </span>
    </button>
  );
};

export default TTSPlayer;
