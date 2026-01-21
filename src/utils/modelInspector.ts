import * as THREE from 'three';

export interface ModelCapabilities {
  // Morph targets for lip sync
  morphTargets: {
    mesh: THREE.Mesh | null;
    dictionary: { [key: string]: number } | null;
    mouthIndices: { [key: string]: number };
  };
  // Bones for skeletal animation
  bones: {
    all: { [key: string]: THREE.Bone };
    jaw: THREE.Bone | null;
    head: THREE.Bone | null;
    spine: THREE.Bone | null;
    leftArm: THREE.Bone | null;
    rightArm: THREE.Bone | null;
  };
  // Recommended lip sync method
  lipSyncMethod: 'morph' | 'jaw' | 'overlay';
}

// Common names for mouth-related morph targets
const MOUTH_MORPH_NAMES = [
  'mouthOpen',
  'jawOpen',
  'viseme_aa',
  'viseme_O',
  'viseme_E',
  'viseme_U',
  'mouth_open',
  'Mouth_Open',
  'jaw_open',
  'Jaw_Open',
  'A',
  'O',
  'E',
  'I',
  'U',
];

// Common bone name patterns
const JAW_BONE_PATTERNS = ['jaw', 'Jaw', 'chin', 'Chin', 'mouth', 'Mouth', 'mandible'];
const HEAD_BONE_PATTERNS = ['head', 'Head', 'mixamorigHead'];
const SPINE_BONE_PATTERNS = ['spine', 'Spine', 'mixamorigSpine', 'torso', 'Torso'];
const LEFT_ARM_PATTERNS = ['leftArm', 'LeftArm', 'mixamorigLeftArm', 'left_arm', 'L_Arm'];
const RIGHT_ARM_PATTERNS = ['rightArm', 'RightArm', 'mixamorigRightArm', 'right_arm', 'R_Arm'];

function findBoneByPatterns(bones: { [key: string]: THREE.Bone }, patterns: string[]): THREE.Bone | null {
  for (const pattern of patterns) {
    for (const [name, bone] of Object.entries(bones)) {
      if (name.toLowerCase().includes(pattern.toLowerCase())) {
        return bone;
      }
    }
  }
  return null;
}

export function inspectModel(scene: THREE.Group | THREE.Object3D): ModelCapabilities {
  const capabilities: ModelCapabilities = {
    morphTargets: {
      mesh: null,
      dictionary: null,
      mouthIndices: {},
    },
    bones: {
      all: {},
      jaw: null,
      head: null,
      spine: null,
      leftArm: null,
      rightArm: null,
    },
    lipSyncMethod: 'overlay', // Default fallback
  };

  // Traverse the scene to find morph targets and bones
  scene.traverse((child) => {
    // Check for morph targets
    if (child instanceof THREE.Mesh && child.morphTargetDictionary) {
      const dict = child.morphTargetDictionary;

      // Store the mesh and dictionary
      if (!capabilities.morphTargets.mesh) {
        capabilities.morphTargets.mesh = child;
        capabilities.morphTargets.dictionary = dict;
      }

      // Find mouth-related morph targets
      for (const morphName of MOUTH_MORPH_NAMES) {
        if (dict[morphName] !== undefined) {
          capabilities.morphTargets.mouthIndices[morphName] = dict[morphName];
        }
      }
    }

    // Check for bones
    if (child instanceof THREE.Bone) {
      capabilities.bones.all[child.name] = child;
    }
  });

  // Find specific bones
  const allBones = capabilities.bones.all;
  capabilities.bones.jaw = findBoneByPatterns(allBones, JAW_BONE_PATTERNS);
  capabilities.bones.head = findBoneByPatterns(allBones, HEAD_BONE_PATTERNS);
  capabilities.bones.spine = findBoneByPatterns(allBones, SPINE_BONE_PATTERNS);
  capabilities.bones.leftArm = findBoneByPatterns(allBones, LEFT_ARM_PATTERNS);
  capabilities.bones.rightArm = findBoneByPatterns(allBones, RIGHT_ARM_PATTERNS);

  // Determine best lip sync method
  const hasMouthMorphs = Object.keys(capabilities.morphTargets.mouthIndices).length > 0;
  const hasJawBone = capabilities.bones.jaw !== null;

  if (hasMouthMorphs) {
    capabilities.lipSyncMethod = 'morph';
  } else if (hasJawBone) {
    capabilities.lipSyncMethod = 'jaw';
  } else {
    capabilities.lipSyncMethod = 'overlay';
  }

  // Log capabilities for debugging
  console.log('=== Model Capabilities ===');
  console.log('Morph targets found:', Object.keys(capabilities.morphTargets.mouthIndices));
  console.log('Bones found:', Object.keys(allBones));
  console.log('Jaw bone:', capabilities.bones.jaw?.name || 'Not found');
  console.log('Head bone:', capabilities.bones.head?.name || 'Not found');
  console.log('Recommended lip sync method:', capabilities.lipSyncMethod);
  console.log('========================');

  return capabilities;
}

// Get the primary mouth morph index (first available)
export function getPrimaryMouthMorphIndex(capabilities: ModelCapabilities): number | null {
  const indices = capabilities.morphTargets.mouthIndices;
  const preferredOrder = ['mouthOpen', 'jawOpen', 'viseme_aa', 'mouth_open', 'A'];

  for (const name of preferredOrder) {
    if (indices[name] !== undefined) {
      return indices[name];
    }
  }

  // Return first available if no preferred found
  const values = Object.values(indices);
  return values.length > 0 ? values[0] : null;
}
