import { useState, useRef, useCallback, useEffect } from 'react';
import { AnimationState, GestureType, Gesture } from '../types';
import { AnimationPreset, CALM_FRIENDLY_PRESET } from '../data/animationPresets';
import { GESTURE_LIBRARY, getGestureForTrigger, getGestureRotations } from '../data/gestures';

interface UseAnimationStateReturn {
  animationState: AnimationState;
  activeGesture: Gesture | null;
  preset: AnimationPreset;
  queueGesture: (type: GestureType, intensity?: number) => void;
  triggerRandomTwitch: () => void;
  setPreset: (preset: AnimationPreset) => void;
  getGestureRotations: () => Map<string, { x?: number; y?: number; z?: number }> | null;
  gestureProgress: number;
}

interface GestureTrigger {
  time: number;
  type: 'emphasis' | 'question' | 'exclaim';
}

export function useAnimationState(
  isPlaying: boolean,
  amplitude: number,
  playbackTime: number,
  gestureTriggers: GestureTrigger[] = []
): UseAnimationStateReturn {
  const [animationState, setAnimationState] = useState<AnimationState>('idle');
  const [activeGesture, setActiveGesture] = useState<Gesture | null>(null);
  const [preset, setPreset] = useState<AnimationPreset>(CALM_FRIENDLY_PRESET);
  const [gestureProgress, setGestureProgress] = useState(0);

  const gestureQueueRef = useRef<Gesture[]>([]);
  const gestureStartTimeRef = useRef<number | null>(null);
  const lastTwitchTimeRef = useRef(0);
  const processedTriggersRef = useRef<Set<number>>(new Set());
  const animationFrameRef = useRef<number | null>(null);

  // Update animation state based on amplitude
  useEffect(() => {
    if (isPlaying) {
      // Determine if agitated based on amplitude
      if (amplitude > 60) {
        setAnimationState('agitated');
      } else {
        setAnimationState('speaking');
      }
    } else {
      setAnimationState('idle');
      // Reset processed triggers when speech ends
      processedTriggersRef.current.clear();
    }
  }, [isPlaying, amplitude]);

  // Process gesture triggers from speech alignment
  useEffect(() => {
    if (!isPlaying || gestureTriggers.length === 0) return;

    for (const trigger of gestureTriggers) {
      // Skip if we've already processed this trigger
      if (processedTriggersRef.current.has(trigger.time)) continue;

      // Check if we've reached this trigger time (with small tolerance)
      if (playbackTime >= trigger.time - 0.05 && playbackTime <= trigger.time + 0.2) {
        processedTriggersRef.current.add(trigger.time);

        // Randomly decide whether to trigger gesture based on preset
        if (Math.random() < preset.gestures.emphasisProbability) {
          const gestureType = getGestureForTrigger(trigger.type);
          const intensity =
            trigger.type === 'exclaim'
              ? preset.gestures.exclamationIntensity
              : 1.0;

          queueGesture(gestureType, intensity);
        }
      }
    }
  }, [playbackTime, gestureTriggers, isPlaying, preset.gestures]);

  // Queue a gesture for playback
  const queueGesture = useCallback((type: GestureType, intensity: number = 1.0) => {
    const definition = GESTURE_LIBRARY[type];
    if (!definition) return;

    const gesture: Gesture = {
      type,
      duration: definition.duration,
      intensity,
    };

    // If no active gesture or current can be interrupted, start immediately
    if (!activeGesture) {
      setActiveGesture(gesture);
      gestureStartTimeRef.current = performance.now();
      setGestureProgress(0);
    } else if (definition.priority > (GESTURE_LIBRARY[activeGesture.type]?.priority || 0)) {
      // Higher priority gesture interrupts current
      setActiveGesture(gesture);
      gestureStartTimeRef.current = performance.now();
      setGestureProgress(0);
    } else {
      // Queue for later
      gestureQueueRef.current.push(gesture);
    }
  }, [activeGesture]);

  // Trigger a random twitch (for idle fidgeting)
  const triggerRandomTwitch = useCallback(() => {
    const now = performance.now();
    const minInterval = 1000 / preset.idle.twitchFrequency;

    if (now - lastTwitchTimeRef.current < minInterval) return;

    lastTwitchTimeRef.current = now;

    // Random twitch types
    const twitchGestures: GestureType[] = ['headShake', 'headNod'];
    const randomType = twitchGestures[Math.floor(Math.random() * twitchGestures.length)];

    queueGesture(randomType, preset.idle.twitchIntensity);
  }, [preset.idle, queueGesture]);

  // Animation loop for gesture playback
  useEffect(() => {
    const updateGesture = (timestamp: number) => {
      if (!activeGesture || gestureStartTimeRef.current === null) {
        animationFrameRef.current = requestAnimationFrame(updateGesture);
        return;
      }

      const elapsed = (timestamp - gestureStartTimeRef.current) / 1000;
      const progress = Math.min(1, elapsed / activeGesture.duration);

      setGestureProgress(progress);

      if (progress >= 1) {
        // Gesture complete
        setActiveGesture(null);
        gestureStartTimeRef.current = null;
        setGestureProgress(0);

        // Start next queued gesture
        const nextGesture = gestureQueueRef.current.shift();
        if (nextGesture) {
          setActiveGesture(nextGesture);
          gestureStartTimeRef.current = performance.now();
        }
      }

      animationFrameRef.current = requestAnimationFrame(updateGesture);
    };

    animationFrameRef.current = requestAnimationFrame(updateGesture);

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [activeGesture]);

  // Get current gesture rotations
  const getCurrentGestureRotations = useCallback((): Map<string, { x?: number; y?: number; z?: number }> | null => {
    if (!activeGesture) return null;

    const definition = GESTURE_LIBRARY[activeGesture.type];
    if (!definition) return null;

    const rotations = getGestureRotations(definition, gestureProgress);

    // Apply intensity scaling
    if (activeGesture.intensity !== 1.0) {
      for (const [bone, rotation] of rotations) {
        rotations.set(bone, {
          x: rotation.x !== undefined ? rotation.x * activeGesture.intensity : undefined,
          y: rotation.y !== undefined ? rotation.y * activeGesture.intensity : undefined,
          z: rotation.z !== undefined ? rotation.z * activeGesture.intensity : undefined,
        });
      }
    }

    return rotations;
  }, [activeGesture, gestureProgress]);

  return {
    animationState,
    activeGesture,
    preset,
    queueGesture,
    triggerRandomTwitch,
    setPreset,
    getGestureRotations: getCurrentGestureRotations,
    gestureProgress,
  };
}

/**
 * Simple noise function for organic movement (cheaper than full simplex)
 * Returns value between -1 and 1
 */
export function noise(x: number, seed: number = 0): number {
  const xi = Math.floor(x);
  const xf = x - xi;

  // Hash function
  const hash = (n: number) => {
    const h = Math.sin(n + seed) * 43758.5453;
    return h - Math.floor(h);
  };

  // Smooth interpolation
  const t = xf * xf * (3 - 2 * xf);

  return hash(xi) * (1 - t) + hash(xi + 1) * t;
}

/**
 * Multi-octave noise for more organic movement
 */
export function fbmNoise(
  x: number,
  octaves: number = 3,
  persistence: number = 0.5,
  seed: number = 0
): number {
  let total = 0;
  let amplitude = 1;
  let maxValue = 0;
  let frequency = 1;

  for (let i = 0; i < octaves; i++) {
    total += noise(x * frequency, seed + i * 100) * amplitude;
    maxValue += amplitude;
    amplitude *= persistence;
    frequency *= 2;
  }

  return total / maxValue;
}

/**
 * Get a random impulse for twitchy movement
 * Returns a value that spikes and decays
 */
export function getRandomImpulse(
  time: number,
  frequency: number,
  decay: number = 0.9
): number {
  // Use noise to determine when impulses occur
  const impulseNoise = noise(time * frequency, 12345);

  // Only trigger impulse when noise crosses threshold
  if (impulseNoise > 0.8) {
    // Calculate decay from peak
    const peakTime = Math.floor(time * frequency) / frequency;
    const timeSincePeak = time - peakTime;
    return Math.exp(-timeSincePeak * decay * 10);
  }

  return 0;
}
