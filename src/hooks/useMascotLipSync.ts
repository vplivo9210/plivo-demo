import { useRef, useCallback, useEffect } from 'react';
import * as THREE from 'three';
import { Viseme } from '../types';

/**
 * Mapping from Oculus visemes to morph target names
 * Different models may use different naming conventions
 */
const VISEME_TO_MORPH_TARGET: Record<Viseme, string[]> = {
  'sil': ['viseme_sil', 'mouthClose', 'Neutral'],
  'PP': ['viseme_PP', 'mouthPucker', 'M_B_P'],
  'FF': ['viseme_FF', 'mouthFunnel', 'F_V'],
  'TH': ['viseme_TH', 'mouthOpen', 'Tongue'],
  'DD': ['viseme_DD', 'mouthSmile', 'T_D_N'],
  'kk': ['viseme_kk', 'mouthOpen', 'K_G_H'],
  'CH': ['viseme_CH', 'mouthShrugLower', 'CH_J_SH'],
  'SS': ['viseme_SS', 'mouthClose', 'S_Z'],
  'nn': ['viseme_nn', 'mouthLowerDownLeft', 'N_NG'],
  'RR': ['viseme_RR', 'mouthRollLower', 'R'],
  'aa': ['viseme_aa', 'mouthOpen', 'A'],
  'E': ['viseme_E', 'mouthSmile', 'E'],
  'I': ['viseme_I', 'mouthDimpleLeft', 'I'],
  'O': ['viseme_O', 'mouthFunnel', 'O'],
  'U': ['viseme_U', 'mouthPucker', 'U'],
};

/**
 * Viseme jaw rotation values (how much the jaw opens for each viseme)
 */
const VISEME_JAW_VALUES: Record<Viseme, number> = {
  'sil': 0,
  'PP': 0.05,
  'FF': 0.1,
  'TH': 0.15,
  'DD': 0.12,
  'kk': 0.2,
  'CH': 0.15,
  'SS': 0.08,
  'nn': 0.1,
  'RR': 0.12,
  'aa': 0.35,
  'E': 0.25,
  'I': 0.2,
  'O': 0.3,
  'U': 0.25,
};

interface UseMascotLipSyncOptions {
  smoothingFactor?: number; // 0-1, higher = smoother but more latency
  jawBoneName?: string; // Name of the jaw bone in the skeleton
}

interface UseMascotLipSyncReturn {
  updateLipSync: (viseme: Viseme, jawRotation: number) => void;
  setModel: (model: THREE.Object3D) => void;
  reset: () => void;
}

/**
 * Hook for controlling lip-sync on a GLB model
 * Supports both morph targets and jaw bone animation
 */
export function useMascotLipSync(options: UseMascotLipSyncOptions = {}): UseMascotLipSyncReturn {
  const { smoothingFactor = 0.3 } = options;

  const modelRef = useRef<THREE.Object3D | null>(null);
  const meshesRef = useRef<THREE.SkinnedMesh[]>([]);
  const jawBoneRef = useRef<THREE.Bone | null>(null);
  const morphTargetMapRef = useRef<Map<Viseme, { mesh: THREE.SkinnedMesh; index: number }[]>>(new Map());
  const currentValuesRef = useRef<Map<string, number>>(new Map());
  const targetValuesRef = useRef<Map<string, number>>(new Map());
  const currentJawRotationRef = useRef(0);

  /**
   * Set the model and find all meshes with morph targets and jaw bone
   */
  const setModel = useCallback((model: THREE.Object3D) => {
    modelRef.current = model;
    meshesRef.current = [];
    jawBoneRef.current = null;
    morphTargetMapRef.current.clear();
    currentValuesRef.current.clear();
    targetValuesRef.current.clear();

    // Find all skinned meshes with morph targets
    model.traverse((child) => {
      if (child instanceof THREE.SkinnedMesh && child.morphTargetDictionary) {
        meshesRef.current.push(child);

        // Map visemes to morph target indices
        for (const [viseme, morphNames] of Object.entries(VISEME_TO_MORPH_TARGET)) {
          for (const morphName of morphNames) {
            const index = child.morphTargetDictionary[morphName];
            if (index !== undefined) {
              if (!morphTargetMapRef.current.has(viseme as Viseme)) {
                morphTargetMapRef.current.set(viseme as Viseme, []);
              }
              morphTargetMapRef.current.get(viseme as Viseme)!.push({ mesh: child, index });
              break; // Use first matching morph target name
            }
          }
        }
      }

      // Find jaw bone
      if (child instanceof THREE.Bone && child.name.toLowerCase().includes('jaw')) {
        jawBoneRef.current = child;
      }
    });

    // Log what we found
    console.log(`LipSync: Found ${meshesRef.current.length} skinned meshes`);
    console.log(`LipSync: Mapped ${morphTargetMapRef.current.size} visemes to morph targets`);
    const jawBone = jawBoneRef.current as THREE.Bone | null;
    console.log(`LipSync: Jaw bone ${jawBone ? 'found: ' + jawBone.name : 'not found, using head rotation fallback'}`);

    // If no jaw bone found, try to find head bone for fallback
    if (!jawBone) {
      model.traverse((child) => {
        if (child instanceof THREE.Bone && child.name.toLowerCase().includes('head')) {
          jawBoneRef.current = child;
          console.log(`LipSync: Using head bone for jaw movement: ${child.name}`);
        }
      });
    }
  }, []);

  /**
   * Update lip-sync based on current viseme and jaw rotation
   */
  const updateLipSync = useCallback((viseme: Viseme, jawRotation: number) => {
    // Update morph targets if available
    const morphTargets = morphTargetMapRef.current.get(viseme);
    if (morphTargets && morphTargets.length > 0) {
      // First, set all viseme morph targets to 0
      for (const targets of morphTargetMapRef.current.values()) {
        for (const { mesh, index } of targets) {
          if (mesh.morphTargetInfluences) {
            const key = `${mesh.uuid}-${index}`;
            targetValuesRef.current.set(key, 0);
          }
        }
      }

      // Set current viseme morph target to 1
      for (const { mesh, index } of morphTargets) {
        if (mesh.morphTargetInfluences) {
          const key = `${mesh.uuid}-${index}`;
          targetValuesRef.current.set(key, 1);
        }
      }

      // Apply smoothed values
      for (const [key, targetValue] of targetValuesRef.current) {
        const currentValue = currentValuesRef.current.get(key) || 0;
        const smoothedValue = currentValue * smoothingFactor + targetValue * (1 - smoothingFactor);
        currentValuesRef.current.set(key, smoothedValue);

        // Parse key to get mesh and index
        const [meshUuid, indexStr] = key.split('-');
        const index = parseInt(indexStr, 10);
        const mesh = meshesRef.current.find(m => m.uuid === meshUuid);
        if (mesh && mesh.morphTargetInfluences) {
          mesh.morphTargetInfluences[index] = smoothedValue;
        }
      }
    }

    // Update jaw bone rotation (fallback or additional)
    if (jawBoneRef.current) {
      // Smooth the jaw rotation
      const targetJaw = VISEME_JAW_VALUES[viseme] || jawRotation;
      currentJawRotationRef.current =
        currentJawRotationRef.current * smoothingFactor +
        targetJaw * (1 - smoothingFactor);

      // Apply rotation to jaw bone (typically around X axis for opening mouth)
      jawBoneRef.current.rotation.x = currentJawRotationRef.current;
    }
  }, [smoothingFactor]);

  /**
   * Reset lip-sync to neutral state
   */
  const reset = useCallback(() => {
    // Reset all morph targets to 0
    for (const mesh of meshesRef.current) {
      if (mesh.morphTargetInfluences) {
        for (let i = 0; i < mesh.morphTargetInfluences.length; i++) {
          mesh.morphTargetInfluences[i] = 0;
        }
      }
    }

    // Reset jaw rotation
    if (jawBoneRef.current) {
      jawBoneRef.current.rotation.x = 0;
    }

    currentValuesRef.current.clear();
    targetValuesRef.current.clear();
    currentJawRotationRef.current = 0;
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      reset();
    };
  }, [reset]);

  return {
    updateLipSync,
    setModel,
    reset,
  };
}
