/**
 * Animation presets for different character personalities.
 * The "Alien Child" from the movie "Her" is aggressive, hyperactive, and twitchy.
 */

export interface AnimationPreset {
  name: string;
  description: string;

  // Idle state parameters
  idle: {
    twitchFrequency: number;        // How often random twitches occur (per second)
    twitchIntensity: number;        // 0-1, how strong twitches are
    restlessness: number;           // 0-1, constant fidgeting amount
    breathingSpeed: number;         // Breathing cycle speed multiplier
    breathingIntensity: number;     // 0-1, breathing movement amount
    headWanderSpeed: number;        // How fast head looks around
    headWanderAmount: number;       // How much head moves
    weightShiftSpeed: number;       // Body sway/weight shift speed
    weightShiftAmount: number;      // How much body sways
  };

  // Speaking state parameters
  speaking: {
    headBobIntensity: number;       // 0-1, how much head bobs
    headBobSpeed: number;           // Head bob speed multiplier
    bodySwayIntensity: number;      // 0-1, body movement
    bodySwaySpeed: number;          // Body sway speed
    armGestureIntensity: number;    // 0-1, arm movement amount
    armGestureSpeed: number;        // Arm gesture speed
    leanAmount: number;             // Forward lean when speaking
    energyMultiplier: number;       // Overall energy level multiplier
    asymmetry: number;              // 0-1, how asymmetric left/right movements are
    randomSpeedVariation: number;   // 0-1, how much speed varies randomly
  };

  // Agitated state parameters (for high-energy moments)
  agitated: {
    intensity: number;              // Overall intensity multiplier
    twitchRate: number;             // Twitches per second
    armFlailProbability: number;    // 0-1, chance of arm flail per second
    headShakeProbability: number;   // 0-1, chance of head shake
  };

  // Gesture triggering
  gestures: {
    emphasisProbability: number;    // 0-1, chance to gesture on emphasis
    exclamationIntensity: number;   // How intense gestures are on '!'
    questionTilt: number;           // Head tilt amount on '?'
    pauseResetSpeed: number;        // How fast to return to neutral on pauses
  };

  // Noise parameters for organic movement
  noise: {
    enabled: boolean;               // Use simplex noise instead of pure sine
    frequency: number;              // Noise frequency
    octaves: number;                // Noise detail levels
    amplitude: number;              // Base noise amplitude
  };
}

/**
 * Alien Child preset - aggressive, hyperactive, twitchy
 * Based on the character from the movie "Her"
 */
export const ALIEN_CHILD_PRESET: AnimationPreset = {
  name: 'Alien Child',
  description: 'Aggressive, hyperactive, twitchy - like the character from Her',

  idle: {
    twitchFrequency: 1.5,           // Frequent random twitches
    twitchIntensity: 0.8,           // Strong twitches
    restlessness: 0.7,              // Very fidgety
    breathingSpeed: 1.8,            // Fast, nervous breathing
    breathingIntensity: 0.4,        // Visible breathing
    headWanderSpeed: 2.0,           // Quick head movements
    headWanderAmount: 0.15,         // Significant head movement
    weightShiftSpeed: 1.5,          // Restless weight shifting
    weightShiftAmount: 0.1,         // Noticeable body sway
  },

  speaking: {
    headBobIntensity: 1.0,          // Very intense head bobbing (was 0.4)
    headBobSpeed: 2.5,              // Fast, energetic (2.5x normal)
    bodySwayIntensity: 0.8,         // Lots of body movement
    bodySwaySpeed: 2.0,             // Quick body movement
    armGestureIntensity: 0.9,       // Big arm gestures
    armGestureSpeed: 2.2,           // Fast arm movements
    leanAmount: 0.15,               // Leans forward aggressively
    energyMultiplier: 2.5,          // Very high energy
    asymmetry: 0.6,                 // Arms move at different times
    randomSpeedVariation: 0.4,      // Speed varies a lot (unpredictable)
  },

  agitated: {
    intensity: 1.5,                 // 50% more intense when agitated
    twitchRate: 3.0,                // Very frequent twitches
    armFlailProbability: 0.3,       // 30% chance of arm flail per second
    headShakeProbability: 0.2,      // 20% chance of head shake
  },

  gestures: {
    emphasisProbability: 0.7,       // 70% chance to gesture on emphasis
    exclamationIntensity: 1.5,      // Big gestures on exclamations
    questionTilt: 0.2,              // Noticeable head tilt on questions
    pauseResetSpeed: 0.3,           // Slow reset (stays keyed up)
  },

  noise: {
    enabled: true,                  // Use noise for organic movement
    frequency: 2.0,                 // Medium-high frequency
    octaves: 3,                     // Multiple detail levels
    amplitude: 0.5,                 // Significant noise contribution
  },
};

/**
 * Calm/Friendly preset - for comparison (the old behavior)
 */
export const CALM_FRIENDLY_PRESET: AnimationPreset = {
  name: 'Calm Friendly',
  description: 'Smooth, gentle movements - friendly mascot',

  idle: {
    twitchFrequency: 0,
    twitchIntensity: 0,
    restlessness: 0.1,
    breathingSpeed: 1.0,
    breathingIntensity: 0.2,
    headWanderSpeed: 0.5,
    headWanderAmount: 0.03,
    weightShiftSpeed: 0.3,
    weightShiftAmount: 0.02,
  },

  speaking: {
    headBobIntensity: 0.4,
    headBobSpeed: 1.0,
    bodySwayIntensity: 0.3,
    bodySwaySpeed: 1.0,
    armGestureIntensity: 0.4,
    armGestureSpeed: 1.0,
    leanAmount: 0.02,
    energyMultiplier: 1.0,
    asymmetry: 0.2,
    randomSpeedVariation: 0.1,
  },

  agitated: {
    intensity: 1.0,
    twitchRate: 0.5,
    armFlailProbability: 0.05,
    headShakeProbability: 0.05,
  },

  gestures: {
    emphasisProbability: 0.3,
    exclamationIntensity: 1.0,
    questionTilt: 0.1,
    pauseResetSpeed: 0.8,
  },

  noise: {
    enabled: false,
    frequency: 1.0,
    octaves: 1,
    amplitude: 0.1,
  },
};

// Default preset is the Alien Child
export const DEFAULT_PRESET = ALIEN_CHILD_PRESET;

// All available presets
export const ANIMATION_PRESETS: Record<string, AnimationPreset> = {
  'alien-child': ALIEN_CHILD_PRESET,
  'calm-friendly': CALM_FRIENDLY_PRESET,
};
