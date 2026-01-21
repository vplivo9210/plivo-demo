import type { Viseme } from '../types';

/**
 * SVG path definitions for each Oculus viseme mouth shape.
 * These paths are designed for a viewBox of "0 0 100 60" and represent
 * different mouth positions for lip-sync animation.
 */

// Mouth shape paths - optimized for smooth morphing
// Each path represents the outline of the mouth opening
export const VISEME_PATHS: Record<Viseme, string> = {
  // Silence - closed/neutral mouth
  'sil': 'M 25,30 Q 50,30 75,30',

  // PP - p, b, m - lips pressed together
  'PP': 'M 25,30 Q 50,28 75,30',

  // FF - f, v - lower lip tucked under upper teeth
  'FF': 'M 25,32 Q 50,28 75,32',

  // TH - th sounds - tongue between teeth, slightly open
  'TH': 'M 25,28 Q 50,35 75,28',

  // DD - t, d, n - tongue behind teeth, slightly open
  'DD': 'M 25,28 Q 50,34 75,28',

  // kk - k, g - back of mouth open
  'kk': 'M 25,25 Q 50,40 75,25',

  // CH - ch, j, sh - rounded, slightly open
  'CH': 'M 28,27 Q 50,38 72,27',

  // SS - s, z - teeth together, lips apart (narrow)
  'SS': 'M 28,29 Q 50,33 72,29',

  // nn - n, l - relaxed open
  'nn': 'M 25,27 Q 50,36 75,27',

  // RR - r sound - rounded, medium open
  'RR': 'M 30,26 Q 50,38 70,26',

  // aa - "ah" sound (father) - wide open (largest)
  'aa': 'M 20,20 Q 50,50 80,20',

  // E - "eh" sound (bet) - medium open, wide
  'E': 'M 22,24 Q 50,42 78,24',

  // I - "ih" sound (bit) - smile shape
  'I': 'M 22,28 Q 50,35 78,28',

  // O - "oh" sound (boat) - rounded open
  'O': 'M 32,22 Q 50,45 68,22',

  // U - "oo" sound (boot) - small rounded
  'U': 'M 35,25 Q 50,40 65,25',
};

/**
 * Upper lip path for more realistic mouth rendering
 */
export const UPPER_LIP_PATHS: Record<Viseme, string> = {
  'sil': 'M 25,30 Q 37,27 50,28 Q 63,27 75,30',
  'PP': 'M 25,30 Q 37,28 50,29 Q 63,28 75,30',
  'FF': 'M 25,30 Q 37,28 50,28 Q 63,28 75,30',
  'TH': 'M 25,28 Q 37,26 50,27 Q 63,26 75,28',
  'DD': 'M 25,28 Q 37,26 50,27 Q 63,26 75,28',
  'kk': 'M 25,25 Q 37,23 50,24 Q 63,23 75,25',
  'CH': 'M 28,27 Q 39,25 50,26 Q 61,25 72,27',
  'SS': 'M 28,29 Q 39,27 50,28 Q 61,27 72,29',
  'nn': 'M 25,27 Q 37,25 50,26 Q 63,25 75,27',
  'RR': 'M 30,26 Q 40,24 50,25 Q 60,24 70,26',
  'aa': 'M 20,20 Q 35,18 50,19 Q 65,18 80,20',
  'E': 'M 22,24 Q 36,22 50,23 Q 64,22 78,24',
  'I': 'M 22,28 Q 36,26 50,27 Q 64,26 78,28',
  'O': 'M 32,22 Q 41,20 50,21 Q 59,20 68,22',
  'U': 'M 35,25 Q 42,23 50,24 Q 58,23 65,25',
};

/**
 * Lower lip path for more realistic mouth rendering
 */
export const LOWER_LIP_PATHS: Record<Viseme, string> = {
  'sil': 'M 25,30 Q 37,33 50,32 Q 63,33 75,30',
  'PP': 'M 25,30 Q 37,32 50,31 Q 63,32 75,30',
  'FF': 'M 25,32 Q 37,34 50,33 Q 63,34 75,32',
  'TH': 'M 25,28 Q 37,38 50,37 Q 63,38 75,28',
  'DD': 'M 25,28 Q 37,37 50,36 Q 63,37 75,28',
  'kk': 'M 25,25 Q 37,43 50,42 Q 63,43 75,25',
  'CH': 'M 28,27 Q 39,40 50,39 Q 61,40 72,27',
  'SS': 'M 28,29 Q 39,35 50,34 Q 61,35 72,29',
  'nn': 'M 25,27 Q 37,39 50,38 Q 63,39 75,27',
  'RR': 'M 30,26 Q 40,40 50,39 Q 60,40 70,26',
  'aa': 'M 20,20 Q 35,52 50,51 Q 65,52 80,20',
  'E': 'M 22,24 Q 36,44 50,43 Q 64,44 78,24',
  'I': 'M 22,28 Q 36,37 50,36 Q 64,37 78,28',
  'O': 'M 32,22 Q 41,47 50,46 Q 59,47 68,22',
  'U': 'M 35,25 Q 42,42 50,41 Q 58,42 65,25',
};

/**
 * Get the viseme path for smooth single-path rendering
 */
export function getVisemePath(viseme: Viseme): string {
  return VISEME_PATHS[viseme] || VISEME_PATHS['sil'];
}

/**
 * Get the upper lip path
 */
export function getUpperLipPath(viseme: Viseme): string {
  return UPPER_LIP_PATHS[viseme] || UPPER_LIP_PATHS['sil'];
}

/**
 * Get the lower lip path
 */
export function getLowerLipPath(viseme: Viseme): string {
  return LOWER_LIP_PATHS[viseme] || LOWER_LIP_PATHS['sil'];
}

/**
 * Animation variants for body movements (for use with framer-motion)
 */
export type BodyAnimation = 'idle' | 'waving' | 'laughing' | 'clapping' | 'dancing';

export const BODY_ANIMATION_VARIANTS: Record<BodyAnimation, {
  rotate?: number | number[];
  y?: number | number[];
  scale?: number | number[];
  transition: {
    duration: number;
    repeat?: number;
    repeatDelay?: number;
    ease?: [number, number, number, number] | "linear" | "easeIn" | "easeOut" | "easeInOut";
  };
}> = {
  idle: {
    rotate: 0,
    y: 0,
    scale: 1,
    transition: { duration: 0.5 }
  },
  waving: {
    rotate: [0, -3, 3, -3, 3, 0],
    y: [0, -2, 0, -2, 0],
    transition: {
      duration: 2,
      repeat: Infinity,
      repeatDelay: 1
    }
  },
  laughing: {
    y: [0, -8, 0, -5, 0, -3, 0],
    rotate: [0, 2, -2, 1, -1, 0],
    scale: [1, 1.02, 1, 1.01, 1],
    transition: {
      duration: 0.6,
      repeat: 3,
      ease: "easeInOut"
    }
  },
  clapping: {
    scale: [1, 1.03, 1, 1.03, 1],
    y: [0, -3, 0, -3, 0],
    transition: {
      duration: 0.4,
      repeat: 5,
      ease: "easeOut"
    }
  },
  dancing: {
    rotate: [0, -8, 8, -8, 8, 0],
    y: [0, -12, 0, -12, 0],
    scale: [1, 1.02, 1, 1.02, 1],
    transition: {
      duration: 0.8,
      repeat: Infinity,
      ease: "easeInOut"
    }
  }
};

/**
 * Map animation loader names to body animations
 */
export function mapAnimationNameToBodyAnimation(animationName: string): BodyAnimation {
  const nameMap: Record<string, BodyAnimation> = {
    'Waving': 'waving',
    'Wave Hip Hop Dance': 'dancing',
    'Sitting Clap': 'clapping',
    'Sitting Laughing': 'laughing',
  };
  return nameMap[animationName] || 'idle';
}
