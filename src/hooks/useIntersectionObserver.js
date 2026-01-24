import { useEffect, useState } from 'react';

/**
 * Custom hook for Intersection Observer
 * Uses a callback ref pattern to correctly handle conditional rendering of the target element
 * @param {Object} options - IntersectionObserver options
 * @returns {Array} [refCallback, isIntersecting]
 */
const useIntersectionObserver = (options = {}) => {
  const [isIntersecting, setIsIntersecting] = useState(false);
  const [target, setTarget] = useState(null);

  useEffect(() => {
    if (!target) return;

    const observer = new IntersectionObserver(([entry]) => {
      setIsIntersecting(entry.isIntersecting);
    }, options);

    observer.observe(target);

    return () => {
      observer.disconnect();
    };
    // Destructure options to avoid unnecessary re-runs if options object reference changes but values don't
  }, [target, options.root, options.rootMargin, options.threshold, options]);

  // Return the state setter as the ref callback
  return [setTarget, isIntersecting];
};

export default useIntersectionObserver;
