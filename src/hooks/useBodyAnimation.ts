import { useMemo } from 'react';

interface BodyAnimationStyle {
  head: React.CSSProperties;
  torso: React.CSSProperties;
  leftArm: React.CSSProperties;
  rightArm: React.CSSProperties;
  legs: React.CSSProperties;
}

interface UseBodyAnimationReturn {
  styles: BodyAnimationStyle;
  animationIntensity: number;
}

/**
 * Hook that returns animation styles for body parts based on audio amplitude.
 * Higher amplitude = more expressive movement.
 */
export function useBodyAnimation(
  amplitude: number,
  isPlaying: boolean
): UseBodyAnimationReturn {
  // Normalize amplitude to 0-1 intensity
  const animationIntensity = Math.min(1, amplitude / 70);

  const styles = useMemo<BodyAnimationStyle>(() => {
    if (!isPlaying) {
      // Idle state - subtle breathing animation handled by CSS class
      return {
        head: {},
        torso: {},
        leftArm: {},
        rightArm: {},
        legs: {},
      };
    }

    // Audio-driven animation - scale animation duration/intensity by amplitude
    const baseDuration = 0.3; // seconds
    const duration = Math.max(0.15, baseDuration - animationIntensity * 0.15);

    return {
      head: {
        animation: `head-bob ${duration}s ease-in-out infinite`,
        animationPlayState: 'running',
      },
      torso: {
        animation: `torso-sway ${duration * 1.5}s ease-in-out infinite`,
        animationPlayState: 'running',
      },
      leftArm: {
        animation: `arm-wave-left ${duration * 2}s ease-in-out infinite`,
        animationPlayState: 'running',
      },
      rightArm: {
        animation: `arm-wave-right ${duration * 2}s ease-in-out infinite`,
        animationDelay: `${duration}s`,
        animationPlayState: 'running',
      },
      legs: {
        animation: `legs-bounce ${duration}s ease-in-out infinite`,
        animationPlayState: 'running',
      },
    };
  }, [isPlaying, animationIntensity]);

  return {
    styles,
    animationIntensity,
  };
}
