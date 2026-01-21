import { useState, useEffect, useCallback } from 'react';

interface UseIdleAnimationReturn {
  isBlinking: boolean;
  triggerBlink: () => void;
}

export function useIdleAnimation(): UseIdleAnimationReturn {
  const [isBlinking, setIsBlinking] = useState(false);

  const triggerBlink = useCallback(() => {
    setIsBlinking(true);
    setTimeout(() => setIsBlinking(false), 150);
  }, []);

  useEffect(() => {
    // Random blink interval between 2-5 seconds
    const scheduleBlink = () => {
      const delay = 2000 + Math.random() * 3000;
      return setTimeout(() => {
        triggerBlink();
        blinkTimeoutId = scheduleBlink();
      }, delay);
    };

    let blinkTimeoutId = scheduleBlink();

    return () => {
      clearTimeout(blinkTimeoutId);
    };
  }, [triggerBlink]);

  return {
    isBlinking,
    triggerBlink,
  };
}
