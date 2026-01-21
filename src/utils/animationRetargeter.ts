import * as THREE from 'three';

/**
 * Mapping from Mixamo bone names to common bone names used in GLB models.
 * Mixamo uses names like "mixamorigHips" while GLB models may use "Hips" or other naming conventions.
 */
const MIXAMO_TO_STANDARD_BONE_MAP: Record<string, string[]> = {
  // Hips / Root
  'mixamorigHips': ['Hips', 'hips', 'pelvis', 'Pelvis', 'root', 'Root'],

  // Spine
  'mixamorigSpine': ['Spine', 'spine', 'Spine1'],
  'mixamorigSpine1': ['Spine1', 'spine1', 'Spine2', 'chest'],
  'mixamorigSpine2': ['Spine2', 'spine2', 'Chest', 'chest', 'UpperChest'],

  // Neck and Head
  'mixamorigNeck': ['Neck', 'neck'],
  'mixamorigHead': ['Head', 'head'],

  // Left Arm
  'mixamorigLeftShoulder': ['LeftShoulder', 'leftShoulder', 'shoulder_L', 'Shoulder.L'],
  'mixamorigLeftArm': ['LeftArm', 'leftArm', 'upperarm_L', 'UpperArm.L', 'Left_Arm'],
  'mixamorigLeftForeArm': ['LeftForeArm', 'leftForeArm', 'forearm_L', 'LowerArm.L', 'Left_ForeArm'],
  'mixamorigLeftHand': ['LeftHand', 'leftHand', 'hand_L', 'Hand.L', 'Left_Hand'],

  // Right Arm
  'mixamorigRightShoulder': ['RightShoulder', 'rightShoulder', 'shoulder_R', 'Shoulder.R'],
  'mixamorigRightArm': ['RightArm', 'rightArm', 'upperarm_R', 'UpperArm.R', 'Right_Arm'],
  'mixamorigRightForeArm': ['RightForeArm', 'rightForeArm', 'forearm_R', 'LowerArm.R', 'Right_ForeArm'],
  'mixamorigRightHand': ['RightHand', 'rightHand', 'hand_R', 'Hand.R', 'Right_Hand'],

  // Left Leg
  'mixamorigLeftUpLeg': ['LeftUpLeg', 'leftUpLeg', 'thigh_L', 'UpperLeg.L', 'Left_UpLeg'],
  'mixamorigLeftLeg': ['LeftLeg', 'leftLeg', 'calf_L', 'LowerLeg.L', 'Left_Leg'],
  'mixamorigLeftFoot': ['LeftFoot', 'leftFoot', 'foot_L', 'Foot.L', 'Left_Foot'],
  'mixamorigLeftToeBase': ['LeftToeBase', 'leftToeBase', 'toe_L', 'Toe.L'],

  // Right Leg
  'mixamorigRightUpLeg': ['RightUpLeg', 'rightUpLeg', 'thigh_R', 'UpperLeg.R', 'Right_UpLeg'],
  'mixamorigRightLeg': ['RightLeg', 'rightLeg', 'calf_R', 'LowerLeg.R', 'Right_Leg'],
  'mixamorigRightFoot': ['RightFoot', 'rightFoot', 'foot_R', 'Foot.R', 'Right_Foot'],
  'mixamorigRightToeBase': ['RightToeBase', 'rightToeBase', 'toe_R', 'Toe.R'],

  // Fingers - Left
  'mixamorigLeftHandThumb1': ['LeftHandThumb1', 'thumb_01_L'],
  'mixamorigLeftHandThumb2': ['LeftHandThumb2', 'thumb_02_L'],
  'mixamorigLeftHandThumb3': ['LeftHandThumb3', 'thumb_03_L'],
  'mixamorigLeftHandIndex1': ['LeftHandIndex1', 'index_01_L'],
  'mixamorigLeftHandIndex2': ['LeftHandIndex2', 'index_02_L'],
  'mixamorigLeftHandIndex3': ['LeftHandIndex3', 'index_03_L'],
  'mixamorigLeftHandMiddle1': ['LeftHandMiddle1', 'middle_01_L'],
  'mixamorigLeftHandMiddle2': ['LeftHandMiddle2', 'middle_02_L'],
  'mixamorigLeftHandMiddle3': ['LeftHandMiddle3', 'middle_03_L'],
  'mixamorigLeftHandRing1': ['LeftHandRing1', 'ring_01_L'],
  'mixamorigLeftHandRing2': ['LeftHandRing2', 'ring_02_L'],
  'mixamorigLeftHandRing3': ['LeftHandRing3', 'ring_03_L'],
  'mixamorigLeftHandPinky1': ['LeftHandPinky1', 'pinky_01_L'],
  'mixamorigLeftHandPinky2': ['LeftHandPinky2', 'pinky_02_L'],
  'mixamorigLeftHandPinky3': ['LeftHandPinky3', 'pinky_03_L'],

  // Fingers - Right
  'mixamorigRightHandThumb1': ['RightHandThumb1', 'thumb_01_R'],
  'mixamorigRightHandThumb2': ['RightHandThumb2', 'thumb_02_R'],
  'mixamorigRightHandThumb3': ['RightHandThumb3', 'thumb_03_R'],
  'mixamorigRightHandIndex1': ['RightHandIndex1', 'index_01_R'],
  'mixamorigRightHandIndex2': ['RightHandIndex2', 'index_02_R'],
  'mixamorigRightHandIndex3': ['RightHandIndex3', 'index_03_R'],
  'mixamorigRightHandMiddle1': ['RightHandMiddle1', 'middle_01_R'],
  'mixamorigRightHandMiddle2': ['RightHandMiddle2', 'middle_02_R'],
  'mixamorigRightHandMiddle3': ['RightHandMiddle3', 'middle_03_R'],
  'mixamorigRightHandRing1': ['RightHandRing1', 'ring_01_R'],
  'mixamorigRightHandRing2': ['RightHandRing2', 'ring_02_R'],
  'mixamorigRightHandRing3': ['RightHandRing3', 'ring_03_R'],
  'mixamorigRightHandPinky1': ['RightHandPinky1', 'pinky_01_R'],
  'mixamorigRightHandPinky2': ['RightHandPinky2', 'pinky_02_R'],
  'mixamorigRightHandPinky3': ['RightHandPinky3', 'pinky_03_R'],
};

/**
 * Build a bone name mapping for a specific skeleton
 */
export function buildBoneMapping(skeleton: THREE.Skeleton): Map<string, string> {
  const mapping = new Map<string, string>();
  const boneNames = new Set(skeleton.bones.map(bone => bone.name));
  const boneNamesArray = Array.from(boneNames);

  // DEBUG: Log all skeleton bone names
  console.log('=== SKELETON BONE MAPPING DEBUG ===');
  console.log('GLB Skeleton bone names:', boneNamesArray);
  console.log('Total bones in skeleton:', boneNamesArray.length);

  const matchedBones: string[] = [];
  const unmatchedMixamoBones: string[] = [];

  // For each Mixamo bone name, find the corresponding bone in the skeleton
  for (const [mixamoBone, candidates] of Object.entries(MIXAMO_TO_STANDARD_BONE_MAP)) {
    let found = false;
    for (const candidate of candidates) {
      if (boneNames.has(candidate)) {
        mapping.set(mixamoBone, candidate);
        matchedBones.push(`${mixamoBone} -> ${candidate}`);
        found = true;
        break;
      }
    }
    if (!found) {
      unmatchedMixamoBones.push(mixamoBone);
    }
  }

  // Also add direct mappings for bones that already match
  for (const boneName of boneNames) {
    if (!mapping.has(boneName)) {
      mapping.set(boneName, boneName);
    }
  }

  // DEBUG: Log mapping results
  console.log('Matched Mixamo bones:', matchedBones.length);
  matchedBones.forEach(m => console.log('  ', m));

  if (unmatchedMixamoBones.length > 0) {
    console.warn('Unmatched Mixamo bones (no GLB equivalent found):', unmatchedMixamoBones.length);
    unmatchedMixamoBones.forEach(b => console.warn('  ', b));
  }

  console.log('=== END BONE MAPPING DEBUG ===');

  return mapping;
}

/**
 * Retarget an animation clip from Mixamo bones to target skeleton bones
 */
export function retargetAnimation(
  clip: THREE.AnimationClip,
  targetSkeleton: THREE.Skeleton,
  boneMapping?: Map<string, string>
): THREE.AnimationClip {
  // Build mapping if not provided
  const mapping = boneMapping || buildBoneMapping(targetSkeleton);

  // Create new tracks with remapped bone names
  const newTracks: THREE.KeyframeTrack[] = [];

  // DEBUG: Track bone mapping success/failure
  const skippedTracks: string[] = [];
  const mappedTracks: string[] = [];
  const uniqueBoneNames = new Set<string>();

  for (const track of clip.tracks) {
    // Track names are like "mixamorigHips.position" or "mixamorigHips.quaternion"
    const [boneName, property] = track.name.split('.');
    uniqueBoneNames.add(boneName);

    // Find the target bone name
    let targetBoneName = mapping.get(boneName);

    // If no mapping found, try removing "mixamorig" prefix
    if (!targetBoneName && boneName.startsWith('mixamorig')) {
      const shortName = boneName.replace('mixamorig', '');
      if (targetSkeleton.bones.some(b => b.name === shortName)) {
        targetBoneName = shortName;
      }
    }

    // Skip if we can't find a target bone
    if (!targetBoneName) {
      skippedTracks.push(`${boneName}.${property}`);
      continue;
    }

    // Clone the track with the new bone name
    const newTrackName = `${targetBoneName}.${property}`;
    const newTrack = track.clone();
    newTrack.name = newTrackName;
    newTracks.push(newTrack);
    mappedTracks.push(`${boneName} -> ${targetBoneName} (${property})`);
  }

  // Create new clip with retargeted tracks
  const newClip = new THREE.AnimationClip(
    clip.name,
    clip.duration,
    newTracks,
    clip.blendMode
  );

  // DEBUG: Enhanced logging
  console.log(`=== ANIMATION RETARGET DEBUG: "${clip.name}" ===`);
  console.log(`Original tracks: ${clip.tracks.length}, Retargeted tracks: ${newTracks.length}`);
  console.log(`Unique bone names in FBX animation:`, Array.from(uniqueBoneNames));

  if (skippedTracks.length > 0) {
    console.warn(`Skipped tracks (no target bone found): ${skippedTracks.length}`);
    // Only log first 10 to avoid console spam
    skippedTracks.slice(0, 10).forEach(t => console.warn('  Skipped:', t));
    if (skippedTracks.length > 10) {
      console.warn(`  ... and ${skippedTracks.length - 10} more`);
    }
  }

  if (newTracks.length === 0) {
    console.error(`WARNING: Animation "${clip.name}" has 0 tracks after retargeting!`);
    console.error('This animation will NOT play. Check bone name mapping.');
    console.error('FBX bone names:', Array.from(uniqueBoneNames).slice(0, 10));
    console.error('Target skeleton bones:', targetSkeleton.bones.map(b => b.name).slice(0, 10));
  }

  console.log(`=== END RETARGET DEBUG ===`);

  return newClip;
}

/**
 * Get all bone names from a skeleton
 */
export function getSkeletonBoneNames(skeleton: THREE.Skeleton): string[] {
  return skeleton.bones.map(bone => bone.name);
}

/**
 * Find the root bone of a skeleton
 */
export function findRootBone(skeleton: THREE.Skeleton): THREE.Bone | null {
  // The root bone is typically the one without a parent bone in the skeleton
  for (const bone of skeleton.bones) {
    const parentIsBone = skeleton.bones.some(b => b === bone.parent);
    if (!parentIsBone) {
      return bone;
    }
  }
  return skeleton.bones[0] || null;
}

/**
 * Debug: Print skeleton hierarchy
 */
export function printSkeletonHierarchy(skeleton: THREE.Skeleton): void {
  console.log('Skeleton hierarchy:');
  const root = findRootBone(skeleton);
  if (root) {
    printBoneHierarchy(root, 0);
  }
}

function printBoneHierarchy(bone: THREE.Bone, depth: number): void {
  const indent = '  '.repeat(depth);
  console.log(`${indent}${bone.name}`);
  for (const child of bone.children) {
    if (child instanceof THREE.Bone) {
      printBoneHierarchy(child, depth + 1);
    }
  }
}
