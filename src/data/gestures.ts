import { GestureType } from '../types';

/**
 * Gesture definitions for expressive body animation.
 * Each gesture defines bone rotation keyframes over time.
 */

export interface GestureKeyframe {
  time: number;  // 0-1 normalized time through gesture
  rotations: {
    bone: string;
    x?: number;
    y?: number;
    z?: number;
  }[];
}

export interface GestureDefinition {
  type: GestureType;
  duration: number;           // Base duration in seconds
  keyframes: GestureKeyframe[];
  canInterrupt: boolean;      // Can this gesture be interrupted by another?
  priority: number;           // Higher = more important
}

/**
 * Easing functions for gesture interpolation
 */
export const easings = {
  // Smooth start and end
  easeInOut: (t: number) => t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2,

  // Quick start, slow end (natural feeling)
  easeOut: (t: number) => 1 - Math.pow(1 - t, 3),

  // Slow start, quick end (anticipation)
  easeIn: (t: number) => t * t * t,

  // Overshoot then settle
  easeOutBack: (t: number) => {
    const c1 = 1.70158;
    const c3 = c1 + 1;
    return 1 + c3 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2);
  },

  // Bounce effect
  bounce: (t: number) => {
    const n1 = 7.5625;
    const d1 = 2.75;
    if (t < 1 / d1) return n1 * t * t;
    if (t < 2 / d1) return n1 * (t -= 1.5 / d1) * t + 0.75;
    if (t < 2.5 / d1) return n1 * (t -= 2.25 / d1) * t + 0.9375;
    return n1 * (t -= 2.625 / d1) * t + 0.984375;
  },
};

/**
 * Gesture library - predefined gestures for the Alien Child
 */
export const GESTURE_LIBRARY: Record<GestureType, GestureDefinition> = {
  armFlailLeft: {
    type: 'armFlailLeft',
    duration: 0.4,
    canInterrupt: true,
    priority: 2,
    keyframes: [
      {
        time: 0,
        rotations: [
          { bone: 'leftArm', z: 1.2, x: 0 },
          { bone: 'leftForeArm', z: 0.3, y: 0 },
        ],
      },
      {
        time: 0.2,
        rotations: [
          { bone: 'leftArm', z: 0.3, x: -0.5 },  // Arm swings up and out
          { bone: 'leftForeArm', z: 0.8, y: 0.3 },
        ],
      },
      {
        time: 0.5,
        rotations: [
          { bone: 'leftArm', z: 0.6, x: 0.3 },   // Arm swings across
          { bone: 'leftForeArm', z: 0.5, y: -0.2 },
        ],
      },
      {
        time: 1,
        rotations: [
          { bone: 'leftArm', z: 1.2, x: 0 },     // Return to rest
          { bone: 'leftForeArm', z: 0.3, y: 0 },
        ],
      },
    ],
  },

  armFlailRight: {
    type: 'armFlailRight',
    duration: 0.4,
    canInterrupt: true,
    priority: 2,
    keyframes: [
      {
        time: 0,
        rotations: [
          { bone: 'rightArm', z: -1.2, x: 0 },
          { bone: 'rightForeArm', z: -0.3, y: 0 },
        ],
      },
      {
        time: 0.2,
        rotations: [
          { bone: 'rightArm', z: -0.3, x: -0.5 },
          { bone: 'rightForeArm', z: -0.8, y: -0.3 },
        ],
      },
      {
        time: 0.5,
        rotations: [
          { bone: 'rightArm', z: -0.6, x: 0.3 },
          { bone: 'rightForeArm', z: -0.5, y: 0.2 },
        ],
      },
      {
        time: 1,
        rotations: [
          { bone: 'rightArm', z: -1.2, x: 0 },
          { bone: 'rightForeArm', z: -0.3, y: 0 },
        ],
      },
    ],
  },

  armFlailBoth: {
    type: 'armFlailBoth',
    duration: 0.5,
    canInterrupt: false,
    priority: 3,
    keyframes: [
      {
        time: 0,
        rotations: [
          { bone: 'leftArm', z: 1.2 },
          { bone: 'rightArm', z: -1.2 },
          { bone: 'spine2', x: 0 },
        ],
      },
      {
        time: 0.15,
        rotations: [
          { bone: 'leftArm', z: 0.2, x: -0.4 },
          { bone: 'rightArm', z: -0.2, x: -0.4 },
          { bone: 'spine2', x: -0.1 },  // Lean back slightly for anticipation
        ],
      },
      {
        time: 0.4,
        rotations: [
          { bone: 'leftArm', z: 0.5, x: 0.3 },
          { bone: 'rightArm', z: -0.5, x: 0.3 },
          { bone: 'spine2', x: 0.1 },   // Lean forward
        ],
      },
      {
        time: 1,
        rotations: [
          { bone: 'leftArm', z: 1.2 },
          { bone: 'rightArm', z: -1.2 },
          { bone: 'spine2', x: 0 },
        ],
      },
    ],
  },

  headShake: {
    type: 'headShake',
    duration: 0.3,
    canInterrupt: true,
    priority: 1,
    keyframes: [
      { time: 0, rotations: [{ bone: 'head', y: 0 }] },
      { time: 0.15, rotations: [{ bone: 'head', y: 0.2 }] },
      { time: 0.35, rotations: [{ bone: 'head', y: -0.2 }] },
      { time: 0.55, rotations: [{ bone: 'head', y: 0.15 }] },
      { time: 0.75, rotations: [{ bone: 'head', y: -0.1 }] },
      { time: 1, rotations: [{ bone: 'head', y: 0 }] },
    ],
  },

  headNod: {
    type: 'headNod',
    duration: 0.25,
    canInterrupt: true,
    priority: 1,
    keyframes: [
      { time: 0, rotations: [{ bone: 'head', x: 0 }] },
      { time: 0.3, rotations: [{ bone: 'head', x: 0.15 }] },
      { time: 0.6, rotations: [{ bone: 'head', x: -0.05 }] },
      { time: 1, rotations: [{ bone: 'head', x: 0 }] },
    ],
  },

  pointLeft: {
    type: 'pointLeft',
    duration: 0.5,
    canInterrupt: true,
    priority: 2,
    keyframes: [
      {
        time: 0,
        rotations: [
          { bone: 'leftArm', z: 1.2, x: 0, y: 0 },
          { bone: 'leftForeArm', z: 0.3 },
          { bone: 'leftHand', z: 0 },
        ],
      },
      {
        time: 0.3,
        rotations: [
          { bone: 'leftArm', z: 0.4, x: -0.3, y: 0.5 },  // Arm out to side
          { bone: 'leftForeArm', z: 0.1 },              // Straighten elbow
          { bone: 'leftHand', z: -0.2 },                // Point finger
        ],
      },
      {
        time: 0.7,
        rotations: [
          { bone: 'leftArm', z: 0.4, x: -0.3, y: 0.5 },  // Hold
          { bone: 'leftForeArm', z: 0.1 },
          { bone: 'leftHand', z: -0.2 },
        ],
      },
      {
        time: 1,
        rotations: [
          { bone: 'leftArm', z: 1.2, x: 0, y: 0 },
          { bone: 'leftForeArm', z: 0.3 },
          { bone: 'leftHand', z: 0 },
        ],
      },
    ],
  },

  pointRight: {
    type: 'pointRight',
    duration: 0.5,
    canInterrupt: true,
    priority: 2,
    keyframes: [
      {
        time: 0,
        rotations: [
          { bone: 'rightArm', z: -1.2, x: 0, y: 0 },
          { bone: 'rightForeArm', z: -0.3 },
          { bone: 'rightHand', z: 0 },
        ],
      },
      {
        time: 0.3,
        rotations: [
          { bone: 'rightArm', z: -0.4, x: -0.3, y: -0.5 },
          { bone: 'rightForeArm', z: -0.1 },
          { bone: 'rightHand', z: 0.2 },
        ],
      },
      {
        time: 0.7,
        rotations: [
          { bone: 'rightArm', z: -0.4, x: -0.3, y: -0.5 },
          { bone: 'rightForeArm', z: -0.1 },
          { bone: 'rightHand', z: 0.2 },
        ],
      },
      {
        time: 1,
        rotations: [
          { bone: 'rightArm', z: -1.2, x: 0, y: 0 },
          { bone: 'rightForeArm', z: -0.3 },
          { bone: 'rightHand', z: 0 },
        ],
      },
    ],
  },

  shrug: {
    type: 'shrug',
    duration: 0.4,
    canInterrupt: true,
    priority: 2,
    keyframes: [
      {
        time: 0,
        rotations: [
          { bone: 'leftShoulder', y: 0 },
          { bone: 'rightShoulder', y: 0 },
          { bone: 'head', z: 0 },
        ],
      },
      {
        time: 0.25,
        rotations: [
          { bone: 'leftShoulder', y: 0.3 },    // Shoulders up
          { bone: 'rightShoulder', y: -0.3 },
          { bone: 'head', z: 0.1 },            // Slight head tilt
        ],
      },
      {
        time: 0.6,
        rotations: [
          { bone: 'leftShoulder', y: 0.25 },   // Hold
          { bone: 'rightShoulder', y: -0.25 },
          { bone: 'head', z: 0.08 },
        ],
      },
      {
        time: 1,
        rotations: [
          { bone: 'leftShoulder', y: 0 },
          { bone: 'rightShoulder', y: 0 },
          { bone: 'head', z: 0 },
        ],
      },
    ],
  },

  leanForward: {
    type: 'leanForward',
    duration: 0.3,
    canInterrupt: true,
    priority: 1,
    keyframes: [
      {
        time: 0,
        rotations: [
          { bone: 'spine', x: 0 },
          { bone: 'spine1', x: 0 },
          { bone: 'neck', x: 0 },
        ],
      },
      {
        time: 0.4,
        rotations: [
          { bone: 'spine', x: 0.1 },
          { bone: 'spine1', x: 0.08 },
          { bone: 'neck', x: 0.05 },
        ],
      },
      {
        time: 0.7,
        rotations: [
          { bone: 'spine', x: 0.1 },
          { bone: 'spine1', x: 0.08 },
          { bone: 'neck', x: 0.05 },
        ],
      },
      {
        time: 1,
        rotations: [
          { bone: 'spine', x: 0 },
          { bone: 'spine1', x: 0 },
          { bone: 'neck', x: 0 },
        ],
      },
    ],
  },

  leanBack: {
    type: 'leanBack',
    duration: 0.3,
    canInterrupt: true,
    priority: 1,
    keyframes: [
      {
        time: 0,
        rotations: [
          { bone: 'spine', x: 0 },
          { bone: 'spine1', x: 0 },
          { bone: 'neck', x: 0 },
        ],
      },
      {
        time: 0.4,
        rotations: [
          { bone: 'spine', x: -0.08 },
          { bone: 'spine1', x: -0.06 },
          { bone: 'neck', x: -0.04 },
        ],
      },
      {
        time: 0.7,
        rotations: [
          { bone: 'spine', x: -0.08 },
          { bone: 'spine1', x: -0.06 },
          { bone: 'neck', x: -0.04 },
        ],
      },
      {
        time: 1,
        rotations: [
          { bone: 'spine', x: 0 },
          { bone: 'spine1', x: 0 },
          { bone: 'neck', x: 0 },
        ],
      },
    ],
  },
};

/**
 * Get a random gesture appropriate for a trigger type
 */
export function getGestureForTrigger(
  triggerType: 'emphasis' | 'question' | 'exclaim'
): GestureType {
  const gestureMap: Record<string, GestureType[]> = {
    emphasis: ['headNod', 'pointLeft', 'pointRight', 'leanForward'],
    question: ['headShake', 'shrug', 'leanBack'],
    exclaim: ['armFlailBoth', 'armFlailLeft', 'armFlailRight', 'leanForward'],
  };

  const options = gestureMap[triggerType];
  return options[Math.floor(Math.random() * options.length)];
}

/**
 * Interpolate between two keyframes
 */
export function interpolateKeyframes(
  kf1: GestureKeyframe,
  kf2: GestureKeyframe,
  progress: number,
  easing: (t: number) => number = easings.easeInOut
): Map<string, { x?: number; y?: number; z?: number }> {
  const result = new Map<string, { x?: number; y?: number; z?: number }>();
  const t = easing(progress);

  // Get all bone names from both keyframes
  const boneNames = new Set([
    ...kf1.rotations.map((r) => r.bone),
    ...kf2.rotations.map((r) => r.bone),
  ]);

  for (const boneName of boneNames) {
    const rot1 = kf1.rotations.find((r) => r.bone === boneName);
    const rot2 = kf2.rotations.find((r) => r.bone === boneName);

    if (rot1 && rot2) {
      result.set(boneName, {
        x: rot1.x !== undefined && rot2.x !== undefined
          ? rot1.x + (rot2.x - rot1.x) * t
          : rot1.x ?? rot2.x,
        y: rot1.y !== undefined && rot2.y !== undefined
          ? rot1.y + (rot2.y - rot1.y) * t
          : rot1.y ?? rot2.y,
        z: rot1.z !== undefined && rot2.z !== undefined
          ? rot1.z + (rot2.z - rot1.z) * t
          : rot1.z ?? rot2.z,
      });
    } else if (rot1) {
      result.set(boneName, { x: rot1.x, y: rot1.y, z: rot1.z });
    } else if (rot2) {
      result.set(boneName, { x: rot2.x, y: rot2.y, z: rot2.z });
    }
  }

  return result;
}

/**
 * Get bone rotations for a gesture at a given progress
 */
export function getGestureRotations(
  gesture: GestureDefinition,
  progress: number
): Map<string, { x?: number; y?: number; z?: number }> {
  const { keyframes } = gesture;

  // Find the two keyframes we're between
  let kf1 = keyframes[0];
  let kf2 = keyframes[keyframes.length - 1];

  for (let i = 0; i < keyframes.length - 1; i++) {
    if (progress >= keyframes[i].time && progress <= keyframes[i + 1].time) {
      kf1 = keyframes[i];
      kf2 = keyframes[i + 1];
      break;
    }
  }

  // Calculate local progress between keyframes
  const localProgress =
    kf2.time > kf1.time ? (progress - kf1.time) / (kf2.time - kf1.time) : 0;

  return interpolateKeyframes(kf1, kf2, localProgress);
}
