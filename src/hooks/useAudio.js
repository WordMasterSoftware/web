import { useState, useEffect, useRef } from 'react';

/**
 * 音频播放 Hook
 * 用于 TTS 单词发音播放
 *
 * @param {string} url - 音频文件 URL
 * @param {boolean} autoPlay - 是否自动播放（默认false）
 * @returns {Object} - { isPlaying, isLoading, error, play, pause, replay }
 */
export const useAudio = (url, autoPlay = false) => {
  const audioRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!url) {
      setError('音频URL不能为空');
      return;
    }

    setIsLoading(true);
    setError(null);

    // 创建音频对象
    audioRef.current = new Audio(url);

    // 监听事件
    const audio = audioRef.current;

    const handleCanPlay = () => {
      setIsLoading(false);
      if (autoPlay) {
        play();
      }
    };

    const handleEnded = () => {
      setIsPlaying(false);
    };

    const handleError = (e) => {
      setError('音频加载失败');
      setIsLoading(false);
      setIsPlaying(false);
      console.error('Audio error:', e);
    };

    const handlePlaying = () => {
      setIsPlaying(true);
    };

    const handlePause = () => {
      setIsPlaying(false);
    };

    audio.addEventListener('canplaythrough', handleCanPlay);
    audio.addEventListener('ended', handleEnded);
    audio.addEventListener('error', handleError);
    audio.addEventListener('playing', handlePlaying);
    audio.addEventListener('pause', handlePause);

    // 加载音频
    audio.load();

    // 清理函数
    return () => {
      if (audio) {
        audio.pause();
        audio.removeEventListener('canplaythrough', handleCanPlay);
        audio.removeEventListener('ended', handleEnded);
        audio.removeEventListener('error', handleError);
        audio.removeEventListener('playing', handlePlaying);
        audio.removeEventListener('pause', handlePause);
        audioRef.current = null;
      }
    };
  }, [url, autoPlay]);

  // 播放音频
  const play = () => {
    if (audioRef.current && !isPlaying) {
      audioRef.current.play().catch((error) => {
        console.error('Play error:', error);
        setError('播放失败');
      });
    }
  };

  // 暂停音频
  const pause = () => {
    if (audioRef.current && isPlaying) {
      audioRef.current.pause();
    }
  };

  // 重新播放
  const replay = () => {
    if (audioRef.current) {
      audioRef.current.currentTime = 0;
      play();
    }
  };

  return {
    isPlaying,
    isLoading,
    error,
    play,
    pause,
    replay,
  };
};

export default useAudio;
