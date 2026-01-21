import { Viseme } from '../types';

// Sprite sheet configuration - using transparent sprite sheet
export const SPRITE_SHEET = {
  path: '/assets/mascot/sprites/sprite-sheet-3-transparent.png',
  width: 1794,
  height: 2000,
};

// Frame dimensions based on sprite sheet analysis
// Body frames: 224px wide (8 fit across), 220px tall
// Face frames: 299px wide (6 fit across), 225px tall
const FULL_BODY_FRAME_WIDTH = 224;
const FULL_BODY_ROW_HEIGHT = 220;
const FACE_FRAME_WIDTH = 299;
const FACE_ROW_HEIGHT = 225;

// Face rows start after 5 body rows
const FACE_ROW_START = FULL_BODY_ROW_HEIGHT * 5; // 1100px

// Fixed display dimensions for consistent rendering
// Use face frame dimensions since they're larger
export const SPRITE_DISPLAY = {
  width: FACE_FRAME_WIDTH,   // 299px (face frames are widest)
  height: FACE_ROW_HEIGHT,   // 225px (face rows are tallest)
};

// Frame coordinate type
export interface FrameCoord {
  x: number;
  y: number;
  w: number;
  h: number;
}

// Animation types available in the sprite sheet
export type SpriteAnimationName = 'idle' | 'walk' | 'jump' | 'talk' | 'run' | 'attack';

// Animation configuration with frame coordinates
export interface SpriteAnimationConfig {
  frames: FrameCoord[];
  fps: number;
  loop: boolean;
}

// Helper to generate frame coordinates for full body animations
function generateFullBodyFrames(row: number, frameCount: number): FrameCoord[] {
  const frames: FrameCoord[] = [];
  const y = row * FULL_BODY_ROW_HEIGHT;
  for (let i = 0; i < frameCount; i++) {
    frames.push({
      x: i * FULL_BODY_FRAME_WIDTH,
      y,
      w: FULL_BODY_FRAME_WIDTH,
      h: FULL_BODY_ROW_HEIGHT,
    });
  }
  return frames;
}

// Animation definitions with manual frame coordinates
// Sprite sheet layout:
// Row 0: Idle (6 frames)
// Row 1: Walk (8 frames)
// Row 2: Head turns (6 frames)
// Row 3: Sitting poses (6 frames)
// Row 4: Run + fall (8 frames)
// Rows 5-8: Face expressions (6 per row, row 8 has 5)
export const SPRITE_ANIMATIONS: Record<SpriteAnimationName, SpriteAnimationConfig> = {
  idle: {
    frames: generateFullBodyFrames(0, 6),
    fps: 8,
    loop: true,
  },
  walk: {
    frames: generateFullBodyFrames(1, 8),
    fps: 10,
    loop: true,
  },
  jump: {
    frames: generateFullBodyFrames(2, 6), // Head turns
    fps: 12,
    loop: false,
  },
  talk: {
    frames: generateFullBodyFrames(3, 6), // Sitting poses
    fps: 15,
    loop: false,
  },
  run: {
    frames: generateFullBodyFrames(4, 8), // Run + fall
    fps: 12,
    loop: true,
  },
  attack: {
    frames: generateFullBodyFrames(4, 8), // Reuse run row
    fps: 10,
    loop: false,
  },
};

// Face expression type for lip-sync
// Based on actual sprite sheet layout analysis
export type FaceExpression =
  // Row 5: Basic mouth shapes for lip sync
  | 'neutral'       // Col 0: Closed/line mouth
  | 'slight_open'   // Col 1: Mouth slightly open
  | 'a'             // Col 2: Wide open A mouth
  | 'o'             // Col 3: Round O mouth
  | 'u'             // Col 4: Pursed U mouth
  | 'grin'          // Col 5: Grin showing teeth (E/I sounds)
  // Row 6: More expressions
  | 'happy'         // Col 0: Big open smile
  | 'teeth'         // Col 1: Teeth showing (F/V sounds)
  | 'neutral2'      // Col 2: Another neutral
  | 'surprised'     // Col 3: Small O, eyebrows up
  | 'tongue'        // Col 4: Tongue out (TH sound)
  | 'gritted'       // Col 5: Gritted teeth (S/Z sounds)
  // Row 7: Emotions
  | 'smile'         // Col 0
  | 'sad'           // Col 1
  | 'surprised2'    // Col 2
  | 'angry'         // Col 3
  | 'angry_talk'    // Col 4
  | 'gritted2'      // Col 5
  // Row 8: More expressions
  | 'laugh'         // Col 0
  | 'wink'          // Col 1
  | 'blink'         // Col 2
  | 'closed'        // Col 3: Closed lips (M/B/P sounds)
  | 'smirk';        // Col 4

// Face expression coordinates - mapped to actual sprite positions
export const FACE_EXPRESSIONS: Record<FaceExpression, FrameCoord> = {
  // Row 5 (y = 1100): Basic lip sync shapes
  neutral:     { x: FACE_FRAME_WIDTH * 0, y: FACE_ROW_START, w: FACE_FRAME_WIDTH, h: FACE_ROW_HEIGHT },
  slight_open: { x: FACE_FRAME_WIDTH * 1, y: FACE_ROW_START, w: FACE_FRAME_WIDTH, h: FACE_ROW_HEIGHT },
  a:           { x: FACE_FRAME_WIDTH * 2, y: FACE_ROW_START, w: FACE_FRAME_WIDTH, h: FACE_ROW_HEIGHT },
  o:           { x: FACE_FRAME_WIDTH * 3, y: FACE_ROW_START, w: FACE_FRAME_WIDTH, h: FACE_ROW_HEIGHT },
  u:           { x: FACE_FRAME_WIDTH * 4, y: FACE_ROW_START, w: FACE_FRAME_WIDTH, h: FACE_ROW_HEIGHT },
  grin:        { x: FACE_FRAME_WIDTH * 5, y: FACE_ROW_START, w: FACE_FRAME_WIDTH, h: FACE_ROW_HEIGHT },

  // Row 6 (y = 1325): More expressions
  happy:       { x: FACE_FRAME_WIDTH * 0, y: FACE_ROW_START + FACE_ROW_HEIGHT, w: FACE_FRAME_WIDTH, h: FACE_ROW_HEIGHT },
  teeth:       { x: FACE_FRAME_WIDTH * 1, y: FACE_ROW_START + FACE_ROW_HEIGHT, w: FACE_FRAME_WIDTH, h: FACE_ROW_HEIGHT },
  neutral2:    { x: FACE_FRAME_WIDTH * 2, y: FACE_ROW_START + FACE_ROW_HEIGHT, w: FACE_FRAME_WIDTH, h: FACE_ROW_HEIGHT },
  surprised:   { x: FACE_FRAME_WIDTH * 3, y: FACE_ROW_START + FACE_ROW_HEIGHT, w: FACE_FRAME_WIDTH, h: FACE_ROW_HEIGHT },
  tongue:      { x: FACE_FRAME_WIDTH * 4, y: FACE_ROW_START + FACE_ROW_HEIGHT, w: FACE_FRAME_WIDTH, h: FACE_ROW_HEIGHT },
  gritted:     { x: FACE_FRAME_WIDTH * 5, y: FACE_ROW_START + FACE_ROW_HEIGHT, w: FACE_FRAME_WIDTH, h: FACE_ROW_HEIGHT },

  // Row 7 (y = 1550): Emotions
  smile:       { x: FACE_FRAME_WIDTH * 0, y: FACE_ROW_START + FACE_ROW_HEIGHT * 2, w: FACE_FRAME_WIDTH, h: FACE_ROW_HEIGHT },
  sad:         { x: FACE_FRAME_WIDTH * 1, y: FACE_ROW_START + FACE_ROW_HEIGHT * 2, w: FACE_FRAME_WIDTH, h: FACE_ROW_HEIGHT },
  surprised2:  { x: FACE_FRAME_WIDTH * 2, y: FACE_ROW_START + FACE_ROW_HEIGHT * 2, w: FACE_FRAME_WIDTH, h: FACE_ROW_HEIGHT },
  angry:       { x: FACE_FRAME_WIDTH * 3, y: FACE_ROW_START + FACE_ROW_HEIGHT * 2, w: FACE_FRAME_WIDTH, h: FACE_ROW_HEIGHT },
  angry_talk:  { x: FACE_FRAME_WIDTH * 4, y: FACE_ROW_START + FACE_ROW_HEIGHT * 2, w: FACE_FRAME_WIDTH, h: FACE_ROW_HEIGHT },
  gritted2:    { x: FACE_FRAME_WIDTH * 5, y: FACE_ROW_START + FACE_ROW_HEIGHT * 2, w: FACE_FRAME_WIDTH, h: FACE_ROW_HEIGHT },

  // Row 8 (y = 1775): More expressions
  laugh:       { x: FACE_FRAME_WIDTH * 0, y: FACE_ROW_START + FACE_ROW_HEIGHT * 3, w: FACE_FRAME_WIDTH, h: FACE_ROW_HEIGHT },
  wink:        { x: FACE_FRAME_WIDTH * 1, y: FACE_ROW_START + FACE_ROW_HEIGHT * 3, w: FACE_FRAME_WIDTH, h: FACE_ROW_HEIGHT },
  blink:       { x: FACE_FRAME_WIDTH * 2, y: FACE_ROW_START + FACE_ROW_HEIGHT * 3, w: FACE_FRAME_WIDTH, h: FACE_ROW_HEIGHT },
  closed:      { x: FACE_FRAME_WIDTH * 3, y: FACE_ROW_START + FACE_ROW_HEIGHT * 3, w: FACE_FRAME_WIDTH, h: FACE_ROW_HEIGHT },
  smirk:       { x: FACE_FRAME_WIDTH * 4, y: FACE_ROW_START + FACE_ROW_HEIGHT * 3, w: FACE_FRAME_WIDTH, h: FACE_ROW_HEIGHT },
};

// Map visemes to face expressions for lip-sync
// Visemes are phoneme groups that produce similar mouth shapes
const VISEME_TO_FACE: Record<Viseme, FaceExpression> = {
  sil: 'neutral',      // Silence -> closed mouth
  PP: 'closed',        // p, b, m -> lips pressed together (row 8 col 3)
  FF: 'teeth',         // f, v -> teeth on lower lip (row 6 col 1)
  TH: 'tongue',        // th -> tongue between teeth (row 6 col 4)
  DD: 'slight_open',   // t, d -> tongue behind teeth, slight opening
  kk: 'slight_open',   // k, g -> back of tongue, slight opening
  CH: 'gritted',       // ch, j, sh -> teeth close, lips rounded (row 6 col 5)
  SS: 'grin',          // s, z -> teeth together, lips spread (row 5 col 5)
  nn: 'slight_open',   // n, l -> tongue up, slight opening
  RR: 'u',             // r -> lips rounded (row 5 col 4)
  aa: 'a',             // a (father) -> wide open (row 5 col 2)
  E: 'grin',           // e (bet) -> lips spread, teeth visible (row 5 col 5)
  I: 'grin',           // i (bit) -> similar to e, lips spread
  O: 'o',              // o (boat) -> round lips (row 5 col 3)
  U: 'u',              // u (boot) -> pursed lips (row 5 col 4)
};

/**
 * Get the face expression from viseme data (ElevenLabs with viseme support)
 */
export function getFaceFromViseme(viseme: Viseme): FaceExpression {
  return VISEME_TO_FACE[viseme] ?? 'neutral';
}

/**
 * Get the face expression from mouth openness (OpenAI fallback without viseme data)
 * Maps openness (0-1) to appropriate face expressions
 */
export function getFaceFromOpenness(openness: number): FaceExpression {
  if (openness < 0.15) return 'neutral';
  if (openness < 0.30) return 'slight_open';
  if (openness < 0.50) return 'grin';
  if (openness < 0.70) return 'o';
  return 'a';
}

/**
 * Get frame coordinates for a specific animation frame
 */
export function getAnimationFrame(animation: SpriteAnimationName, frameIndex: number): FrameCoord {
  const config = SPRITE_ANIMATIONS[animation];
  const clampedFrame = Math.max(0, Math.min(frameIndex, config.frames.length - 1));
  return config.frames[clampedFrame];
}

/**
 * Get frame coordinates for a face expression
 */
export function getFaceFrame(expression: FaceExpression): FrameCoord {
  return FACE_EXPRESSIONS[expression];
}

/**
 * Calculate CSS background position for a frame coordinate (for full sprite sheet display)
 */
export function getFrameBackgroundPosition(frame: FrameCoord): string {
  return `${-frame.x}px ${-frame.y}px`;
}

/**
 * Calculate centering offsets for a frame within the fixed display area
 */
export function getFrameCenterOffset(frame: FrameCoord): { x: number; y: number } {
  return {
    x: (SPRITE_DISPLAY.width - frame.w) / 2,
    y: (SPRITE_DISPLAY.height - frame.h) / 2,
  };
}
