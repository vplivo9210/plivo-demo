import { useRef, useCallback, useEffect, useState } from 'react';
import * as THREE from 'three';
import {
  loadAllAnimations,
  ANIMATION_NAMES,
  AnimationName,
} from '../utils/animationLoader';
import { retargetAnimation, buildBoneMapping } from '../utils/animationRetargeter';
import { analyzeScript } from '../utils/scriptAnalyzer';

interface UseMascotAnimationsOptions {
  crossfadeDuration?: number; // Duration of crossfade between animations
  defaultAnimation?: AnimationName;
  autoPlay?: boolean; // Start default animation automatically
}

interface UseMascotAnimationsReturn {
  isLoaded: boolean;
  isLoading: boolean;
  currentAnimation: AnimationName | null;
  mixer: THREE.AnimationMixer | null;
  setModel: (model: THREE.Object3D, skeleton: THREE.Skeleton) => void;
  playAnimation: (name: AnimationName) => void;
  playAnimationFromScript: (script: string) => AnimationName;
  stopAnimation: () => void;
  update: (delta: number) => void;
}

/**
 * Hook for managing mascot animations with crossfading
 */
export function useMascotAnimations(
  options: UseMascotAnimationsOptions = {}
): UseMascotAnimationsReturn {
  const {
    crossfadeDuration = 0.5,
    defaultAnimation = ANIMATION_NAMES.WAVING,
    autoPlay = true,
  } = options;

  const [isLoaded, setIsLoaded] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [currentAnimation, setCurrentAnimation] = useState<AnimationName | null>(null);

  const modelRef = useRef<THREE.Object3D | null>(null);
  const skeletonRef = useRef<THREE.Skeleton | null>(null);
  const mixerRef = useRef<THREE.AnimationMixer | null>(null);
  const actionsRef = useRef<Map<AnimationName, THREE.AnimationAction>>(new Map());
  const currentActionRef = useRef<THREE.AnimationAction | null>(null);
  const rawAnimationsRef = useRef<Map<AnimationName, THREE.AnimationClip>>(new Map());
  const boneMappingRef = useRef<Map<string, string>>(new Map());

  /**
   * Set the model and skeleton, then load and retarget animations
   */
  const setModel = useCallback(async (model: THREE.Object3D, skeleton: THREE.Skeleton) => {
    modelRef.current = model;
    skeletonRef.current = skeleton;
    mixerRef.current = new THREE.AnimationMixer(model);
    actionsRef.current.clear();

    // Build bone mapping for this skeleton
    boneMappingRef.current = buildBoneMapping(skeleton);
    console.log('Bone mapping built:', boneMappingRef.current.size, 'mappings');

    // Load animations if not already loaded
    if (rawAnimationsRef.current.size === 0) {
      setIsLoading(true);
      try {
        const animations = await loadAllAnimations();
        rawAnimationsRef.current = animations;
        console.log('Loaded', animations.size, 'animations');
      } catch (error) {
        console.error('Failed to load animations:', error);
      }
      setIsLoading(false);
    }

    // Retarget and create actions for each animation
    for (const [name, clip] of rawAnimationsRef.current) {
      try {
        const retargetedClip = retargetAnimation(clip, skeleton, boneMappingRef.current);
        const action = mixerRef.current.clipAction(retargetedClip);
        action.setLoop(THREE.LoopRepeat, Infinity);
        actionsRef.current.set(name, action);
        console.log(`Created action for: ${name}`);
      } catch (error) {
        console.error(`Failed to create action for ${name}:`, error);
      }
    }

    setIsLoaded(actionsRef.current.size > 0);

    // Auto-play default animation
    if (autoPlay && actionsRef.current.has(defaultAnimation)) {
      playAnimationInternal(defaultAnimation);
    }
  }, [autoPlay, defaultAnimation]);

  /**
   * Internal function to play an animation with crossfading
   */
  const playAnimationInternal = useCallback((name: AnimationName) => {
    const action = actionsRef.current.get(name);
    if (!action || !mixerRef.current) {
      console.warn(`Animation not found: ${name}`);
      return;
    }

    if (currentActionRef.current === action) {
      return; // Already playing this animation
    }

    // Crossfade from current to new animation
    if (currentActionRef.current) {
      action.reset();
      action.play();
      action.crossFadeFrom(currentActionRef.current, crossfadeDuration, true);
    } else {
      action.reset();
      action.play();
    }

    currentActionRef.current = action;
    setCurrentAnimation(name);
    console.log(`Playing animation: ${name}`);
  }, [crossfadeDuration]);

  /**
   * Play a specific animation
   */
  const playAnimation = useCallback((name: AnimationName) => {
    playAnimationInternal(name);
  }, [playAnimationInternal]);

  /**
   * Analyze script and play appropriate animation
   * Returns the selected animation name
   */
  const playAnimationFromScript = useCallback((script: string): AnimationName => {
    const analysis = analyzeScript(script);
    console.log('Script analysis:', analysis);
    playAnimationInternal(analysis.animation);
    return analysis.animation;
  }, [playAnimationInternal]);

  /**
   * Stop current animation and return to default
   */
  const stopAnimation = useCallback(() => {
    if (actionsRef.current.has(defaultAnimation)) {
      playAnimationInternal(defaultAnimation);
    } else if (currentActionRef.current) {
      currentActionRef.current.stop();
      currentActionRef.current = null;
      setCurrentAnimation(null);
    }
  }, [defaultAnimation, playAnimationInternal]);

  /**
   * Update the animation mixer
   */
  const update = useCallback((delta: number) => {
    if (mixerRef.current) {
      mixerRef.current.update(delta);
    }
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (mixerRef.current) {
        mixerRef.current.stopAllAction();
      }
      actionsRef.current.clear();
    };
  }, []);

  return {
    isLoaded,
    isLoading,
    currentAnimation,
    mixer: mixerRef.current,
    setModel,
    playAnimation,
    playAnimationFromScript,
    stopAnimation,
    update,
  };
}
