import { AlignmentData, Viseme, VisemeCue } from '../types';
import { charToViseme, VISEME_JAW_ROTATION } from './visemeMapper';

/**
 * Generate a timeline of viseme cues from ElevenLabs alignment data.
 * Merges consecutive identical visemes and adds smooth transitions.
 */
export function generateVisemeTimeline(alignment: AlignmentData): VisemeCue[] {
  const { characters, character_start_times_seconds, character_end_times_seconds } = alignment;

  if (!characters || characters.length === 0) {
    return [];
  }

  const rawCues: VisemeCue[] = [];

  // Convert each character to a viseme cue
  for (let i = 0; i < characters.length; i++) {
    const char = characters[i];
    const startTime = character_start_times_seconds[i];
    const endTime = character_end_times_seconds[i];

    // Skip if timing data is invalid
    if (startTime === undefined || endTime === undefined || startTime >= endTime) {
      continue;
    }

    const viseme = charToViseme(char);
    rawCues.push({ viseme, startTime, endTime });
  }

  // Merge consecutive identical visemes
  const mergedCues: VisemeCue[] = [];
  for (const cue of rawCues) {
    const lastCue = mergedCues[mergedCues.length - 1];

    if (lastCue && lastCue.viseme === cue.viseme && Math.abs(lastCue.endTime - cue.startTime) < 0.05) {
      // Extend the previous cue
      lastCue.endTime = cue.endTime;
    } else {
      mergedCues.push({ ...cue });
    }
  }

  // Add silence at the beginning if needed
  if (mergedCues.length > 0 && mergedCues[0].startTime > 0) {
    mergedCues.unshift({
      viseme: 'sil',
      startTime: 0,
      endTime: mergedCues[0].startTime,
    });
  }

  // Add silence at gaps between cues
  const filledCues: VisemeCue[] = [];
  for (let i = 0; i < mergedCues.length; i++) {
    const cue = mergedCues[i];
    const prevCue = filledCues[filledCues.length - 1];

    // Add silence to fill gap
    if (prevCue && cue.startTime > prevCue.endTime + 0.01) {
      filledCues.push({
        viseme: 'sil',
        startTime: prevCue.endTime,
        endTime: cue.startTime,
      });
    }

    filledCues.push(cue);
  }

  return filledCues;
}

/**
 * Get the viseme at a specific time in the timeline
 * @param cues Array of viseme cues
 * @param time Current playback time in seconds
 * @returns The active viseme and interpolation progress
 */
export function getVisemeAtTime(
  cues: VisemeCue[],
  time: number
): { viseme: Viseme; progress: number; nextViseme: Viseme | null } {
  if (cues.length === 0) {
    return { viseme: 'sil', progress: 1, nextViseme: null };
  }

  // Find the current cue
  for (let i = 0; i < cues.length; i++) {
    const cue = cues[i];

    if (time >= cue.startTime && time < cue.endTime) {
      const duration = cue.endTime - cue.startTime;
      const elapsed = time - cue.startTime;
      const progress = duration > 0 ? elapsed / duration : 1;

      // Get next viseme for smooth transition
      const nextCue = cues[i + 1];
      const nextViseme = nextCue ? nextCue.viseme : null;

      return { viseme: cue.viseme, progress, nextViseme };
    }
  }

  // Time is past all cues
  const lastCue = cues[cues.length - 1];
  if (time >= lastCue.endTime) {
    return { viseme: 'sil', progress: 1, nextViseme: null };
  }

  // Time is before first cue
  return { viseme: 'sil', progress: 1, nextViseme: cues[0]?.viseme || null };
}

/**
 * Calculate interpolated jaw rotation between current and next viseme
 * Provides smooth transitions between mouth shapes
 */
export function getInterpolatedJawRotation(
  currentViseme: Viseme,
  nextViseme: Viseme | null,
  progress: number,
  transitionStart: number = 0.7 // Start blending at 70% through current viseme
): number {
  const currentRotation = VISEME_JAW_ROTATION[currentViseme];

  if (!nextViseme || progress < transitionStart) {
    return currentRotation;
  }

  // Smoothly transition to next viseme in the last portion
  const nextRotation = VISEME_JAW_ROTATION[nextViseme];
  const transitionProgress = (progress - transitionStart) / (1 - transitionStart);

  // Ease out for natural movement
  const easedProgress = 1 - Math.pow(1 - transitionProgress, 2);

  return currentRotation + (nextRotation - currentRotation) * easedProgress;
}

/**
 * Binary search to find the cue index at a given time
 * More efficient for large timelines
 */
export function findCueIndexAtTime(cues: VisemeCue[], time: number): number {
  if (cues.length === 0) return -1;

  let low = 0;
  let high = cues.length - 1;

  while (low <= high) {
    const mid = Math.floor((low + high) / 2);
    const cue = cues[mid];

    if (time >= cue.startTime && time < cue.endTime) {
      return mid;
    } else if (time < cue.startTime) {
      high = mid - 1;
    } else {
      low = mid + 1;
    }
  }

  return -1;
}

/**
 * Get total duration of the viseme timeline
 */
export function getTimelineDuration(cues: VisemeCue[]): number {
  if (cues.length === 0) return 0;
  return cues[cues.length - 1].endTime;
}

/**
 * Analyze text for gesture trigger points
 * Returns timestamps where gestures should be triggered based on punctuation
 */
export function findGestureTriggers(
  alignment: AlignmentData
): { time: number; type: 'emphasis' | 'question' | 'exclaim' }[] {
  const triggers: { time: number; type: 'emphasis' | 'question' | 'exclaim' }[] = [];
  const { characters, character_start_times_seconds } = alignment;

  for (let i = 0; i < characters.length; i++) {
    const char = characters[i];
    const time = character_start_times_seconds[i];

    if (char === '!') {
      triggers.push({ time, type: 'exclaim' });
    } else if (char === '?') {
      triggers.push({ time, type: 'question' });
    } else if (char === '.' && i > 0) {
      // Period followed by capital letter or end might indicate emphasis
      triggers.push({ time, type: 'emphasis' });
    }
  }

  return triggers;
}
