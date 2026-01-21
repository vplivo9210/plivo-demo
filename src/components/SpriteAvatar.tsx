import { useEffect } from 'react';
import { MouthShape, Viseme } from '../types';
import { useSpriteAnimation } from '../hooks/useSpriteAnimation';
import { SpriteAnimationName, SPRITE_SHEET, SPRITE_DISPLAY, getFrameCenterOffset } from '../utils/spriteConfig';

interface SpriteAvatarProps {
  mouthShape: MouthShape;
  mouthOpenness: number;
  currentViseme: Viseme;
  amplitude: number;
  isPlaying: boolean;
  script?: string;
  onAnimationChange?: (animation: SpriteAnimationName) => void;
}

export function SpriteAvatar({
  mouthOpenness,
  currentViseme,
  amplitude,
  isPlaying,
  onAnimationChange,
}: SpriteAvatarProps) {
  const { currentAnimation, frameStyle, frameCoord } = useSpriteAnimation({
    isPlaying,
    currentViseme,
    mouthOpenness,
    amplitude,
  });

  // Notify parent of animation changes
  useEffect(() => {
    onAnimationChange?.(currentAnimation);
  }, [currentAnimation, onAnimationChange]);

  // Use fixed display size for consistent rendering
  const displayScale = 0.9;
  const displayWidth = SPRITE_DISPLAY.width * displayScale;
  const displayHeight = SPRITE_DISPLAY.height * displayScale;

  // Calculate centering offset for current frame within fixed container
  const centerOffset = getFrameCenterOffset(frameCoord);

  // Get raw background position from frame coordinates
  const bgPosition = frameStyle.backgroundPosition?.toString() || '0px 0px';
  const [rawBgX, rawBgY] = bgPosition.split(' ').map((v) => parseFloat(v) || 0);

  // Adjust background position to center frame in fixed container
  const adjustedBgX = (rawBgX - centerOffset.x) * displayScale;
  const adjustedBgY = (rawBgY - centerOffset.y) * displayScale;

  return (
    <div className="sprite-avatar-container">
      <div
        className={`sprite-character ${isPlaying ? 'speaking' : 'idle'}`}
        style={{
          width: displayWidth,
          height: displayHeight,
          backgroundImage: `url(${SPRITE_SHEET.path})`,
          backgroundSize: `${SPRITE_SHEET.width * displayScale}px ${SPRITE_SHEET.height * displayScale}px`,
          backgroundPosition: `${adjustedBgX}px ${adjustedBgY}px`,
          backgroundRepeat: 'no-repeat',
          imageRendering: 'pixelated',
          transform: 'translateZ(0)',
          transition: 'none',
        }}
      />
    </div>
  );
}
