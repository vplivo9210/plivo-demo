import { useState, useEffect, useRef } from 'react';
import { Viseme } from '../types';
import {
  SpriteAnimationName,
  SPRITE_ANIMATIONS,
  SPRITE_SHEET,
  FaceExpression,
  FrameCoord,
  getAnimationFrame,
  getFaceFrame,
  getFaceFromViseme,
  getFaceFromOpenness,
  getFrameBackgroundPosition,
} from '../utils/spriteConfig';

interface UseSpriteAnimationOptions {
  isPlaying: boolean;
  currentViseme: Viseme;
  mouthOpenness: number;
  amplitude: number;
}

interface UseSpriteAnimationResult {
  currentAnimation: SpriteAnimationName;
  currentFrame: number;
  currentFace: FaceExpression;
  frameStyle: React.CSSProperties;
  frameCoord: FrameCoord;
}

/**
 * Hook for managing sprite sheet animation state
 * Handles idle loop animation and lip-synced face expressions
 */
export function useSpriteAnimation({
  isPlaying,
  currentViseme,
  mouthOpenness,
  amplitude,
}: UseSpriteAnimationOptions): UseSpriteAnimationResult {
  const [currentAnimation, setCurrentAnimation] = useState<SpriteAnimationName>('idle');
  const [idleFrame, setIdleFrame] = useState(0);
  const [currentFace, setCurrentFace] = useState<FaceExpression>('neutral');
  const frameTimerRef = useRef<number | null>(null);

  // Handle idle animation loop
  useEffect(() => {
    if (isPlaying) {
      // Clear idle timer when speaking
      if (frameTimerRef.current) {
        cancelAnimationFrame(frameTimerRef.current);
        frameTimerRef.current = null;
      }
      setCurrentAnimation('talk');
      return;
    }

    // Switch to idle when not playing
    setCurrentAnimation('idle');

    const idleConfig = SPRITE_ANIMATIONS.idle;
    const frameInterval = 1000 / idleConfig.fps;
    let lastFrameTime = performance.now();

    const animate = (currentTime: number) => {
      const elapsed = currentTime - lastFrameTime;

      if (elapsed >= frameInterval) {
        setIdleFrame((prev) => (prev + 1) % idleConfig.frames.length);
        lastFrameTime = currentTime - (elapsed % frameInterval);
      }

      frameTimerRef.current = requestAnimationFrame(animate);
    };

    frameTimerRef.current = requestAnimationFrame(animate);

    return () => {
      if (frameTimerRef.current) {
        cancelAnimationFrame(frameTimerRef.current);
        frameTimerRef.current = null;
      }
    };
  }, [isPlaying]);

  // Update face expression based on viseme or amplitude when speaking
  useEffect(() => {
    if (!isPlaying) {
      setCurrentFace('neutral');
      return;
    }

    // Determine face expression from viseme data or fallback to amplitude
    let face: FaceExpression;

    // If we have a meaningful viseme (not silence), use viseme mapping
    if (currentViseme !== 'sil') {
      face = getFaceFromViseme(currentViseme);
    } else if (amplitude > 5) {
      // Fallback to openness-based mapping when amplitude is present
      face = getFaceFromOpenness(mouthOpenness);
    } else {
      // Closed mouth for silence
      face = 'neutral';
    }

    setCurrentFace(face);
  }, [isPlaying, currentViseme, mouthOpenness, amplitude]);

  // Get the current frame coordinate based on animation state
  const currentFrame = idleFrame;

  // Get the frame coordinate - use body animation for idle, face for speaking
  const frameCoord: FrameCoord = isPlaying
    ? getFaceFrame(currentFace)
    : getAnimationFrame('idle', currentFrame);

  // Generate CSS styles for the sprite
  const frameStyle: React.CSSProperties = {
    width: frameCoord.w,
    height: frameCoord.h,
    backgroundImage: `url(${SPRITE_SHEET.path})`,
    backgroundPosition: getFrameBackgroundPosition(frameCoord),
    backgroundRepeat: 'no-repeat',
    imageRendering: 'pixelated',
  };

  return {
    currentAnimation,
    currentFrame,
    currentFace,
    frameStyle,
    frameCoord,
  };
}
