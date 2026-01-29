import { useState, useEffect, useCallback } from 'react';

/**
 * Custom hook for a countdown timer.
 * @param {number} initialMinutes - The initial time in minutes.
 * @param {Function} onExpire - Callback function when timer reaches 0.
 * @returns {Object} - Timer state and controls.
 */
const useTimer = (initialMinutes, onExpire) => {
  const [timeLeft, setTimeLeft] = useState(null);
  const [isActive, setIsActive] = useState(false);

  useEffect(() => {
    if (initialMinutes && initialMinutes > 0) {
      setTimeLeft(initialMinutes * 60);
      setIsActive(true);
    }
  }, [initialMinutes]);

  useEffect(() => {
    if (!isActive || timeLeft === null) return;

    if (timeLeft <= 0) {
      setIsActive(false);
      if (onExpire) onExpire();
      return;
    }

    const timer = setInterval(() => {
      setTimeLeft((prev) => prev - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [isActive, timeLeft, onExpire]);

  const formatTime = useCallback((seconds) => {
    if (seconds === null) return '--:--';
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  }, []);

  return {
    timeLeft,
    formattedTime: formatTime(timeLeft),
    isActive,
    stop: () => setIsActive(false),
  };
};

export default useTimer;
