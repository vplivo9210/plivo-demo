import { useRef, useEffect, useState } from 'react';
import { MouthShape } from '../types';
import { useBodyAnimation } from '../hooks/useBodyAnimation';

interface AvatarProps {
  mouthShape: MouthShape;
  mouthOpenness: number;
  amplitude: number;
  isPlaying: boolean;
}

export function Avatar({ mouthShape, mouthOpenness, amplitude, isPlaying }: AvatarProps) {
  const [animTime, setAnimTime] = useState(0);
  const animFrameRef = useRef<number | null>(null);

  // Get body part animation styles
  const { styles: bodyStyles } = useBodyAnimation(amplitude, isPlaying);

  // Animation loop for speaking
  useEffect(() => {
    if (isPlaying) {
      const animate = () => {
        setAnimTime(Date.now());
        animFrameRef.current = requestAnimationFrame(animate);
      };
      animFrameRef.current = requestAnimationFrame(animate);
    } else {
      if (animFrameRef.current) {
        cancelAnimationFrame(animFrameRef.current);
      }
      setAnimTime(0);
    }

    return () => {
      if (animFrameRef.current) {
        cancelAnimationFrame(animFrameRef.current);
      }
    };
  }, [isPlaying]);

  // Calculate speaking animation based on amplitude
  const normalizedAmp = Math.min(1, amplitude / 70);

  // Speaking animation styles - bobbing and slight rotation for the container
  const speakingStyle = isPlaying && animTime > 0 ? {
    transform: `translateY(${Math.sin(animTime / 100) * 4 * normalizedAmp}px) rotate(${Math.sin(animTime / 150) * 2 * normalizedAmp}deg)`,
    transition: 'transform 0.05s ease-out',
  } : {};

  return (
    <div className="relative flex items-center justify-center">
      <div
        className="relative w-[300px] h-[350px]"
        style={speakingStyle}
      >
        {/* Base mascot image layer - hidden, used for reference */}
        <img
          src="/assets/mascot/mascot.png"
          alt=""
          className="w-full h-full object-contain opacity-0 absolute"
          aria-hidden="true"
        />

        {/* Head region - animates separately */}
        <div
          className={`absolute inset-0 ${!isPlaying ? 'body-part-idle-head' : ''}`}
          style={{
            clipPath: 'inset(0 0 60% 0)',
            ...bodyStyles.head,
          }}
        >
          <img
            src="/assets/mascot/mascot.png"
            alt=""
            className="w-full h-full object-contain drop-shadow-2xl"
          />
        </div>

        {/* Left arm region */}
        <div
          className={`absolute inset-0 ${!isPlaying ? 'body-part-idle-arm-left' : ''}`}
          style={{
            clipPath: 'polygon(0 30%, 25% 30%, 25% 75%, 0 75%)',
            transformOrigin: '20% 35%',
            ...bodyStyles.leftArm,
          }}
        >
          <img
            src="/assets/mascot/mascot.png"
            alt=""
            className="w-full h-full object-contain"
          />
        </div>

        {/* Right arm region */}
        <div
          className={`absolute inset-0 ${!isPlaying ? 'body-part-idle-arm-right' : ''}`}
          style={{
            clipPath: 'polygon(75% 30%, 100% 30%, 100% 75%, 75% 75%)',
            transformOrigin: '80% 35%',
            ...bodyStyles.rightArm,
          }}
        >
          <img
            src="/assets/mascot/mascot.png"
            alt=""
            className="w-full h-full object-contain"
          />
        </div>

        {/* Torso region */}
        <div
          className="absolute inset-0"
          style={{
            clipPath: 'polygon(25% 40%, 75% 40%, 75% 70%, 25% 70%)',
            ...bodyStyles.torso,
          }}
        >
          <img
            src="/assets/mascot/mascot.png"
            alt=""
            className="w-full h-full object-contain"
          />
        </div>

        {/* Legs region */}
        <div
          className="absolute inset-0"
          style={{
            clipPath: 'inset(70% 0 0 0)',
            ...bodyStyles.legs,
          }}
        >
          <img
            src="/assets/mascot/mascot.png"
            alt=""
            className="w-full h-full object-contain"
          />
        </div>

        {/* Mouth overlay - positioned below the eyes on the mascot's face */}
        <div
          className="absolute"
          style={{
            left: '50%',
            top: '41%',
            transform: 'translate(-50%, -50%)',
          }}
        >
          <SvgMouth shape={mouthShape} openness={mouthOpenness} />
        </div>
      </div>

      {/* Speaking indicator */}
      {isPlaying && (
        <div className="absolute -bottom-2 flex gap-1">
          <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
          <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse delay-75" />
          <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse delay-150" />
        </div>
      )}
    </div>
  );
}

interface SvgMouthProps {
  shape: MouthShape;
  openness: number;
}

function SvgMouth({ shape, openness }: SvgMouthProps) {
  // Use openness for smooth interpolation
  const width = 20 + openness * 18; // 20-38px
  const height = Math.max(4, openness * 30); // 4-30px
  const cornerRadius = Math.min(width, height) / 2;

  // Show tongue when wide open
  const showTongue = shape === 'wide' && openness > 0.6;

  return (
    <svg
      width={width}
      height={height}
      viewBox={`0 0 ${width} ${height}`}
      style={{
        transition: 'all 0.05s ease-out',
        overflow: 'visible',
      }}
    >
      {/* Mouth shape */}
      <rect
        x={0}
        y={0}
        width={width}
        height={height}
        rx={cornerRadius}
        ry={cornerRadius}
        fill="#1a1a2e"
      />

      {/* Tongue */}
      {showTongue && (
        <ellipse
          cx={width / 2}
          cy={height - 4}
          rx={width * 0.35}
          ry={height * 0.25}
          fill="#e57373"
          style={{
            transition: 'all 0.05s ease-out',
          }}
        />
      )}
    </svg>
  );
}
