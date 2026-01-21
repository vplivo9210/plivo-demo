import { useEffect, useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { Viseme } from '../types';
import { analyzeScript } from '../utils/scriptAnalyzer';

interface SvgAnimatedCharacterProps {
  currentViseme: Viseme;
  isPlaying: boolean;
  amplitude: number;
  script?: string;
  onAnimationChange?: (animation: string) => void;
}

type EmotionState = 'idle' | 'waving' | 'laughing' | 'excited' | 'dancing';

// Mouth shapes for each viseme - designed for SVG path morphing
const MOUTH_SHAPES: Record<Viseme, { d: string; openness: number }> = {
  'sil': { d: 'M 35,55 Q 50,58 65,55', openness: 0 },
  'PP': { d: 'M 38,55 Q 50,56 62,55', openness: 0.1 },
  'FF': { d: 'M 35,54 Q 50,58 65,54', openness: 0.2 },
  'TH': { d: 'M 35,52 Q 50,60 65,52', openness: 0.3 },
  'DD': { d: 'M 35,52 Q 50,60 65,52', openness: 0.3 },
  'kk': { d: 'M 35,50 Q 50,65 65,50', openness: 0.5 },
  'CH': { d: 'M 38,51 Q 50,62 62,51', openness: 0.4 },
  'SS': { d: 'M 38,53 Q 50,58 62,53', openness: 0.2 },
  'nn': { d: 'M 35,51 Q 50,61 65,51', openness: 0.35 },
  'RR': { d: 'M 40,50 Q 50,62 60,50', openness: 0.4 },
  'aa': { d: 'M 32,48 Q 50,70 68,48', openness: 0.8 },
  'E': { d: 'M 33,50 Q 50,66 67,50', openness: 0.6 },
  'I': { d: 'M 33,52 Q 50,60 67,52', openness: 0.3 },
  'O': { d: 'M 40,48 Q 50,68 60,48', openness: 0.7 },
  'U': { d: 'M 42,50 Q 50,64 58,50', openness: 0.5 },
};

export function SvgAnimatedCharacter({
  currentViseme = 'sil',
  isPlaying,
  amplitude,
  script,
  onAnimationChange,
}: SvgAnimatedCharacterProps) {
  const [emotion, setEmotion] = useState<EmotionState>('idle');
  const [isBlinking, setIsBlinking] = useState(false);
  const [prevScript, setPrevScript] = useState<string | undefined>(undefined);

  // Analyze script and determine emotion
  useEffect(() => {
    if (script && script !== prevScript) {
      setPrevScript(script);
      const analysis = analyzeScript(script);

      // Map animation names to emotions
      const emotionMap: Record<string, EmotionState> = {
        'Waving': 'waving',
        'Wave Hip Hop Dance': 'dancing',
        'Sitting Clap': 'excited',
        'Sitting Laughing': 'laughing',
      };

      const newEmotion = emotionMap[analysis.animation] || 'waving';
      setEmotion(newEmotion);
      onAnimationChange?.(analysis.animation);
    }
  }, [script, prevScript, onAnimationChange]);

  // Reset to idle when not playing
  useEffect(() => {
    if (!isPlaying) {
      const timeout = setTimeout(() => {
        setEmotion('idle');
      }, 500);
      return () => clearTimeout(timeout);
    }
  }, [isPlaying]);

  // Random blinking
  useEffect(() => {
    const blinkInterval = setInterval(() => {
      if (Math.random() > 0.7) {
        setIsBlinking(true);
        setTimeout(() => setIsBlinking(false), 150);
      }
    }, 2000);
    return () => clearInterval(blinkInterval);
  }, []);

  const mouthShape = useMemo(() => MOUTH_SHAPES[currentViseme] || MOUTH_SHAPES['sil'], [currentViseme]);

  // Animation variants for different emotions
  const bodyVariants = {
    idle: {
      y: [0, -2, 0],
      transition: { duration: 3, repeat: Infinity, ease: 'easeInOut' as const }
    },
    waving: {
      y: [0, -3, 0],
      rotate: [0, 1, -1, 0],
      transition: { duration: 1.5, repeat: Infinity, ease: 'easeInOut' as const }
    },
    laughing: {
      y: [0, -8, 0, -5, 0],
      scale: [1, 1.02, 1, 1.01, 1],
      transition: { duration: 0.5, repeat: Infinity, ease: 'easeInOut' as const }
    },
    excited: {
      y: [0, -10, 0],
      scale: [1, 1.03, 1],
      transition: { duration: 0.4, repeat: Infinity, ease: 'easeOut' as const }
    },
    dancing: {
      y: [0, -12, 0, -12, 0],
      rotate: [0, -5, 0, 5, 0],
      transition: { duration: 0.8, repeat: Infinity, ease: 'easeInOut' as const }
    }
  };

  const leftArmVariants = {
    idle: {
      rotate: [0, 2, 0],
      transition: { duration: 4, repeat: Infinity, ease: 'easeInOut' as const }
    },
    waving: {
      rotate: [0, -45, -30, -45, 0],
      transition: { duration: 0.8, repeat: Infinity, ease: 'easeInOut' as const }
    },
    laughing: {
      rotate: [10, 20, 10],
      transition: { duration: 0.3, repeat: Infinity, ease: 'easeInOut' as const }
    },
    excited: {
      rotate: [-60, -70, -60],
      y: [-5, -10, -5],
      transition: { duration: 0.3, repeat: Infinity, ease: 'easeOut' as const }
    },
    dancing: {
      rotate: [-30, 20, -30, 40, -30],
      transition: { duration: 0.8, repeat: Infinity, ease: 'easeInOut' as const }
    }
  };

  const rightArmVariants = {
    idle: {
      rotate: [0, -2, 0],
      transition: { duration: 4, repeat: Infinity, ease: 'easeInOut' as const, delay: 0.5 }
    },
    waving: {
      rotate: [0, 2, 0],
      transition: { duration: 1, repeat: Infinity, ease: 'easeInOut' as const }
    },
    laughing: {
      rotate: [-10, -20, -10],
      transition: { duration: 0.3, repeat: Infinity, ease: 'easeInOut' as const }
    },
    excited: {
      rotate: [60, 70, 60],
      y: [-5, -10, -5],
      transition: { duration: 0.3, repeat: Infinity, ease: 'easeOut' as const }
    },
    dancing: {
      rotate: [30, -20, 30, -40, 30],
      transition: { duration: 0.8, repeat: Infinity, ease: 'easeInOut' as const, delay: 0.4 }
    }
  };

  const leftLegVariants = {
    idle: {
      rotate: 0,
      transition: { duration: 0.5 }
    },
    waving: {
      rotate: [0, 2, 0],
      transition: { duration: 1, repeat: Infinity, ease: 'easeInOut' as const }
    },
    laughing: {
      rotate: [0, 5, 0],
      transition: { duration: 0.3, repeat: Infinity, ease: 'easeInOut' as const }
    },
    excited: {
      y: [0, -5, 0],
      transition: { duration: 0.2, repeat: Infinity, ease: 'easeOut' as const }
    },
    dancing: {
      rotate: [-15, 15, -15],
      y: [0, -5, 0, -5, 0],
      transition: { duration: 0.8, repeat: Infinity, ease: 'easeInOut' as const }
    }
  };

  const rightLegVariants = {
    idle: {
      rotate: 0,
      transition: { duration: 0.5 }
    },
    waving: {
      rotate: [0, -2, 0],
      transition: { duration: 1, repeat: Infinity, ease: 'easeInOut' as const, delay: 0.3 }
    },
    laughing: {
      rotate: [0, -5, 0],
      transition: { duration: 0.3, repeat: Infinity, ease: 'easeInOut' as const }
    },
    excited: {
      y: [0, -5, 0],
      transition: { duration: 0.2, repeat: Infinity, ease: 'easeOut' as const, delay: 0.1 }
    },
    dancing: {
      rotate: [15, -15, 15],
      y: [0, -5, 0, -5, 0],
      transition: { duration: 0.8, repeat: Infinity, ease: 'easeInOut' as const, delay: 0.4 }
    }
  };

  const headVariants = {
    idle: {
      rotate: [0, 1, 0, -1, 0],
      transition: { duration: 5, repeat: Infinity, ease: 'easeInOut' as const }
    },
    waving: {
      rotate: [0, 3, 0, -3, 0],
      transition: { duration: 1.2, repeat: Infinity, ease: 'easeInOut' as const }
    },
    laughing: {
      rotate: [0, 5, -5, 5, 0],
      y: [0, -3, 0, -3, 0],
      transition: { duration: 0.4, repeat: Infinity, ease: 'easeInOut' as const }
    },
    excited: {
      y: [0, -5, 0],
      transition: { duration: 0.3, repeat: Infinity, ease: 'easeOut' as const }
    },
    dancing: {
      rotate: [0, -8, 0, 8, 0],
      transition: { duration: 0.8, repeat: Infinity, ease: 'easeInOut' as const }
    }
  };

  // Eye squint for laughing
  const eyeScaleY = emotion === 'laughing' ? 0.3 : isBlinking ? 0.1 : 1;

  return (
    <div className="relative w-[350px] h-[400px] flex items-center justify-center">
      <svg
        viewBox="0 0 100 120"
        className="w-full h-full"
        style={{ maxWidth: '350px', maxHeight: '400px' }}
      >
        <defs>
          {/* Gradient for body */}
          <linearGradient id="bodyGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#6366f1" />
            <stop offset="100%" stopColor="#8b5cf6" />
          </linearGradient>

          {/* Gradient for head */}
          <linearGradient id="headGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#818cf8" />
            <stop offset="100%" stopColor="#a78bfa" />
          </linearGradient>

          {/* Glow filter */}
          <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="2" result="coloredBlur" />
            <feMerge>
              <feMergeNode in="coloredBlur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>

          {/* Shadow filter */}
          <filter id="shadow" x="-20%" y="-20%" width="140%" height="140%">
            <feDropShadow dx="1" dy="2" stdDeviation="2" floodOpacity="0.3" />
          </filter>
        </defs>

        {/* Main character group */}
        <motion.g
          animate={bodyVariants[emotion]}
          style={{ transformOrigin: '50px 100px' }}
        >
          {/* Left Leg */}
          <motion.g
            animate={leftLegVariants[emotion]}
            style={{ transformOrigin: '42px 85px' }}
          >
            <path
              d="M 42,85 L 38,105 L 35,110 L 42,110 L 45,105 L 45,85"
              fill="url(#bodyGradient)"
              filter="url(#shadow)"
            />
            {/* Foot */}
            <ellipse cx="38" cy="110" rx="6" ry="3" fill="#4f46e5" />
          </motion.g>

          {/* Right Leg */}
          <motion.g
            animate={rightLegVariants[emotion]}
            style={{ transformOrigin: '58px 85px' }}
          >
            <path
              d="M 55,85 L 55,105 L 58,110 L 65,110 L 62,105 L 58,85"
              fill="url(#bodyGradient)"
              filter="url(#shadow)"
            />
            {/* Foot */}
            <ellipse cx="62" cy="110" rx="6" ry="3" fill="#4f46e5" />
          </motion.g>

          {/* Body / Torso */}
          <ellipse
            cx="50"
            cy="75"
            rx="18"
            ry="15"
            fill="url(#bodyGradient)"
            filter="url(#shadow)"
          />

          {/* Belly highlight */}
          <ellipse
            cx="50"
            cy="73"
            rx="10"
            ry="8"
            fill="#818cf8"
            opacity="0.5"
          />

          {/* Left Arm */}
          <motion.g
            animate={leftArmVariants[emotion]}
            style={{ transformOrigin: '32px 68px' }}
          >
            {/* Upper arm */}
            <path
              d="M 32,68 Q 22,72 18,80"
              stroke="url(#bodyGradient)"
              strokeWidth="6"
              strokeLinecap="round"
              fill="none"
              filter="url(#shadow)"
            />
            {/* Hand */}
            <circle cx="18" cy="80" r="4" fill="#a78bfa" />
            {/* Fingers when waving */}
            {(emotion === 'waving' || emotion === 'excited') && (
              <>
                <circle cx="15" cy="78" r="1.5" fill="#a78bfa" />
                <circle cx="14" cy="81" r="1.5" fill="#a78bfa" />
                <circle cx="15" cy="84" r="1.5" fill="#a78bfa" />
              </>
            )}
          </motion.g>

          {/* Right Arm */}
          <motion.g
            animate={rightArmVariants[emotion]}
            style={{ transformOrigin: '68px 68px' }}
          >
            {/* Upper arm */}
            <path
              d="M 68,68 Q 78,72 82,80"
              stroke="url(#bodyGradient)"
              strokeWidth="6"
              strokeLinecap="round"
              fill="none"
              filter="url(#shadow)"
            />
            {/* Hand */}
            <circle cx="82" cy="80" r="4" fill="#a78bfa" />
            {/* Fingers when excited */}
            {emotion === 'excited' && (
              <>
                <circle cx="85" cy="78" r="1.5" fill="#a78bfa" />
                <circle cx="86" cy="81" r="1.5" fill="#a78bfa" />
                <circle cx="85" cy="84" r="1.5" fill="#a78bfa" />
              </>
            )}
          </motion.g>

          {/* Head */}
          <motion.g
            animate={headVariants[emotion]}
            style={{ transformOrigin: '50px 50px' }}
          >
            {/* Head circle */}
            <circle
              cx="50"
              cy="40"
              r="22"
              fill="url(#headGradient)"
              filter="url(#shadow)"
            />

            {/* Face highlight */}
            <circle
              cx="45"
              cy="35"
              r="8"
              fill="#c4b5fd"
              opacity="0.4"
            />

            {/* Left Eye */}
            <motion.ellipse
              cx="42"
              cy="38"
              rx="4"
              ry="5"
              fill="white"
              animate={{ scaleY: eyeScaleY }}
              transition={{ duration: 0.1 }}
              style={{ transformOrigin: '42px 38px' }}
            />
            <motion.circle
              cx="43"
              cy="39"
              r="2"
              fill="#1e1b4b"
              animate={{ scaleY: eyeScaleY }}
              transition={{ duration: 0.1 }}
              style={{ transformOrigin: '43px 39px' }}
            />
            {/* Eye shine */}
            <circle cx="44" cy="37" r="1" fill="white" opacity={isBlinking ? 0 : 0.8} />

            {/* Right Eye */}
            <motion.ellipse
              cx="58"
              cy="38"
              rx="4"
              ry="5"
              fill="white"
              animate={{ scaleY: eyeScaleY }}
              transition={{ duration: 0.1 }}
              style={{ transformOrigin: '58px 38px' }}
            />
            <motion.circle
              cx="59"
              cy="39"
              r="2"
              fill="#1e1b4b"
              animate={{ scaleY: eyeScaleY }}
              transition={{ duration: 0.1 }}
              style={{ transformOrigin: '59px 39px' }}
            />
            {/* Eye shine */}
            <circle cx="60" cy="37" r="1" fill="white" opacity={isBlinking ? 0 : 0.8} />

            {/* Eyebrows */}
            <motion.path
              d="M 38,32 Q 42,30 46,32"
              stroke="#4c1d95"
              strokeWidth="1.5"
              strokeLinecap="round"
              fill="none"
              animate={{
                d: emotion === 'excited'
                  ? 'M 38,30 Q 42,28 46,30'
                  : emotion === 'laughing'
                  ? 'M 38,33 Q 42,31 46,33'
                  : 'M 38,32 Q 42,30 46,32'
              }}
              transition={{ duration: 0.2 }}
            />
            <motion.path
              d="M 54,32 Q 58,30 62,32"
              stroke="#4c1d95"
              strokeWidth="1.5"
              strokeLinecap="round"
              fill="none"
              animate={{
                d: emotion === 'excited'
                  ? 'M 54,30 Q 58,28 62,30'
                  : emotion === 'laughing'
                  ? 'M 54,33 Q 58,31 62,33'
                  : 'M 54,32 Q 58,30 62,32'
              }}
              transition={{ duration: 0.2 }}
            />

            {/* Cheeks / Blush */}
            <AnimatePresence>
              {(emotion === 'laughing' || emotion === 'excited') && (
                <>
                  <motion.ellipse
                    cx="32"
                    cy="45"
                    rx="5"
                    ry="3"
                    fill="#f472b6"
                    opacity="0.5"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 0.5 }}
                    exit={{ opacity: 0 }}
                  />
                  <motion.ellipse
                    cx="68"
                    cy="45"
                    rx="5"
                    ry="3"
                    fill="#f472b6"
                    opacity="0.5"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 0.5 }}
                    exit={{ opacity: 0 }}
                  />
                </>
              )}
            </AnimatePresence>

            {/* Mouth - Lip Sync */}
            <motion.path
              d={mouthShape.d}
              fill="#1e1b4b"
              stroke="#7c3aed"
              strokeWidth="1.5"
              strokeLinecap="round"
              animate={{ d: mouthShape.d }}
              transition={{ duration: 0.08, ease: 'easeOut' as const }}
            />

            {/* Teeth for open mouth */}
            {mouthShape.openness > 0.4 && (
              <motion.rect
                x="42"
                y="52"
                width="16"
                height="3"
                rx="1"
                fill="white"
                initial={{ opacity: 0 }}
                animate={{ opacity: 0.9 }}
                transition={{ duration: 0.08 }}
              />
            )}

            {/* Tongue for certain visemes */}
            {(currentViseme === 'TH' || currentViseme === 'nn' || currentViseme === 'aa') && (
              <motion.ellipse
                cx="50"
                cy="58"
                rx="5"
                ry="3"
                fill="#f472b6"
                initial={{ opacity: 0 }}
                animate={{ opacity: 0.7 }}
                transition={{ duration: 0.08 }}
              />
            )}

            {/* Happy smile lines when laughing */}
            {emotion === 'laughing' && (
              <>
                <motion.path
                  d="M 30,42 Q 28,45 30,48"
                  stroke="#4c1d95"
                  strokeWidth="1"
                  fill="none"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 0.5 }}
                />
                <motion.path
                  d="M 70,42 Q 72,45 70,48"
                  stroke="#4c1d95"
                  strokeWidth="1"
                  fill="none"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 0.5 }}
                />
              </>
            )}

            {/* Small antenna/hair */}
            <motion.path
              d="M 50,18 Q 48,10 55,12"
              stroke="url(#bodyGradient)"
              strokeWidth="3"
              strokeLinecap="round"
              fill="none"
              animate={{
                d: emotion === 'excited' || emotion === 'dancing'
                  ? ['M 50,18 Q 48,10 55,12', 'M 50,18 Q 52,8 45,12', 'M 50,18 Q 48,10 55,12']
                  : 'M 50,18 Q 48,10 55,12'
              }}
              transition={{ duration: 0.5, repeat: Infinity }}
            />
            <circle cx="55" cy="12" r="3" fill="#fbbf24" />
          </motion.g>
        </motion.g>

        {/* Ground shadow */}
        <ellipse
          cx="50"
          cy="115"
          rx="20"
          ry="3"
          fill="#000"
          opacity="0.2"
        />
      </svg>

      {/* Amplitude-based glow effect when speaking */}
      {isPlaying && amplitude > 20 && (
        <motion.div
          className="absolute inset-0 pointer-events-none rounded-full"
          style={{
            background: `radial-gradient(circle at 50% 40%, rgba(99, 102, 241, ${amplitude / 400}) 0%, transparent 50%)`,
          }}
          animate={{
            opacity: [0.3, 0.6, 0.3],
          }}
          transition={{
            duration: 0.3,
            repeat: Infinity,
          }}
        />
      )}

      {/* Playing indicator */}
      {isPlaying && (
        <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 flex gap-1">
          <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
          <span
            className="w-2 h-2 bg-green-400 rounded-full animate-pulse"
            style={{ animationDelay: '75ms' }}
          />
          <span
            className="w-2 h-2 bg-green-400 rounded-full animate-pulse"
            style={{ animationDelay: '150ms' }}
          />
        </div>
      )}

      {/* Animation label */}
      {isPlaying && emotion !== 'idle' && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          className="absolute top-2 right-2 px-2 py-1 bg-purple-500/20 rounded-full text-xs text-purple-300"
        >
          {emotion}
        </motion.div>
      )}
    </div>
  );
}
