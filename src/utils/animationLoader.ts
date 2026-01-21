import * as THREE from 'three';
import { FBXLoader } from 'three/examples/jsm/loaders/FBXLoader.js';

// Animation name constants
export const ANIMATION_NAMES = {
  WAVING: 'Waving',
  DANCE: 'Wave Hip Hop Dance',
  CLAP: 'Sitting Clap',
  LAUGHING: 'Sitting Laughing',
} as const;

export type AnimationName = typeof ANIMATION_NAMES[keyof typeof ANIMATION_NAMES];

// Animation paths
const ANIMATION_PATHS: Record<AnimationName, string> = {
  [ANIMATION_NAMES.WAVING]: '/assets/mascot/animations/Waving.fbx',
  [ANIMATION_NAMES.DANCE]: '/assets/mascot/animations/Wave Hip Hop Dance.fbx',
  [ANIMATION_NAMES.CLAP]: '/assets/mascot/animations/Sitting Clap.fbx',
  [ANIMATION_NAMES.LAUGHING]: '/assets/mascot/animations/Sitting Laughing.fbx',
};

// Cache for loaded animations
const animationCache = new Map<string, THREE.AnimationClip>();

// FBX Loader instance
let fbxLoader: FBXLoader | null = null;

function getFBXLoader(): FBXLoader {
  if (!fbxLoader) {
    fbxLoader = new FBXLoader();
  }
  return fbxLoader;
}

/**
 * Load a single FBX animation file
 */
export async function loadFBXAnimation(name: AnimationName): Promise<THREE.AnimationClip | null> {
  // Check cache first
  if (animationCache.has(name)) {
    return animationCache.get(name)!;
  }

  const path = ANIMATION_PATHS[name];
  if (!path) {
    console.error(`Animation path not found for: ${name}`);
    return null;
  }

  const loader = getFBXLoader();

  return new Promise((resolve) => {
    loader.load(
      path,
      (fbx) => {
        if (fbx.animations && fbx.animations.length > 0) {
          const clip = fbx.animations[0];
          clip.name = name;
          animationCache.set(name, clip);
          console.log(`Loaded animation: ${name}, duration: ${clip.duration.toFixed(2)}s`);
          resolve(clip);
        } else {
          console.warn(`No animations found in FBX: ${name}`);
          resolve(null);
        }
      },
      (progress) => {
        if (progress.total > 0) {
          const percent = (progress.loaded / progress.total * 100).toFixed(0);
          console.log(`Loading ${name}: ${percent}%`);
        }
      },
      (error) => {
        console.error(`Failed to load animation ${name}:`, error);
        resolve(null);
      }
    );
  });
}

/**
 * Load all FBX animations
 */
export async function loadAllAnimations(): Promise<Map<AnimationName, THREE.AnimationClip>> {
  const animations = new Map<AnimationName, THREE.AnimationClip>();

  const loadPromises = Object.values(ANIMATION_NAMES).map(async (name) => {
    const clip = await loadFBXAnimation(name);
    if (clip) {
      animations.set(name, clip);
    }
  });

  await Promise.all(loadPromises);
  console.log(`Loaded ${animations.size} animations`);

  return animations;
}

/**
 * Get a cached animation clip
 */
export function getCachedAnimation(name: AnimationName): THREE.AnimationClip | undefined {
  return animationCache.get(name);
}

/**
 * Clear the animation cache
 */
export function clearAnimationCache(): void {
  animationCache.clear();
}
