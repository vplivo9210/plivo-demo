export type MouthShape = 'closed' | 'small' | 'medium' | 'wide';

export type TTSProvider = 'elevenlabs' | 'openai';

// Oculus-standard viseme set (15 shapes)
export type Viseme =
  | 'sil'  // Silence
  | 'PP'   // p, b, m
  | 'FF'   // f, v
  | 'TH'   // th (voiced and unvoiced)
  | 'DD'   // t, d
  | 'kk'   // k, g
  | 'CH'   // ch, j, sh, zh
  | 'SS'   // s, z
  | 'nn'   // n, l
  | 'RR'   // r
  | 'aa'   // a (father)
  | 'E'    // e (bet)
  | 'I'    // i (bit)
  | 'O'    // o (boat)
  | 'U';   // u (boot)

// A single viseme cue with timing information
export interface VisemeCue {
  viseme: Viseme;
  startTime: number;  // seconds
  endTime: number;    // seconds
}

// ElevenLabs alignment data from timestamps endpoint
export interface AlignmentData {
  characters: string[];
  character_start_times_seconds: number[];
  character_end_times_seconds: number[];
}

// Extended speech result with optional alignment
export interface SpeechResult {
  audioBlob: Blob;
  alignmentData?: AlignmentData;
  visemeCues?: VisemeCue[];
}

// Animation state for the character
export type AnimationState = 'idle' | 'speaking' | 'agitated';

// Sprite animation names for sprite-based avatar
export type SpriteAnimationName = 'idle' | 'walk' | 'jump' | 'talk' | 'run' | 'attack';

// Gesture types for expressive animation
export type GestureType =
  | 'armFlailLeft'
  | 'armFlailRight'
  | 'armFlailBoth'
  | 'headShake'
  | 'headNod'
  | 'pointLeft'
  | 'pointRight'
  | 'shrug'
  | 'leanForward'
  | 'leanBack';

export interface Gesture {
  type: GestureType;
  duration: number;     // seconds
  intensity: number;    // 0-1
  startTime?: number;   // when gesture started (for playback)
}

export interface TTSOptions {
  provider: TTSProvider;
  voice: string;
  text: string;
}

export interface VoiceOption {
  id: string;
  name: string;
  provider: TTSProvider;
}

export const ELEVENLABS_VOICES: VoiceOption[] = [
  { id: 'EXAVITQu4vr4xnSDxMaL', name: 'Bella (Female)', provider: 'elevenlabs' },
  { id: '21m00Tcm4TlvDq8ikWAM', name: 'Rachel (Female)', provider: 'elevenlabs' },
  { id: 'pNInz6obpgDQGcFmaJgB', name: 'Adam (Male)', provider: 'elevenlabs' },
  { id: 'yoZ06aMxZJJ28mfd3POQ', name: 'Sam (Male)', provider: 'elevenlabs' },
  { id: 'WySVe1CtggNuOwL8DkHv', name: 'Sprite', provider: 'elevenlabs' },
];

export const OPENAI_VOICES: VoiceOption[] = [
  { id: 'nova', name: 'Nova (Female)', provider: 'openai' },
  { id: 'alloy', name: 'Alloy (Neutral)', provider: 'openai' },
  { id: 'echo', name: 'Echo (Male)', provider: 'openai' },
  { id: 'fable', name: 'Fable (Expressive)', provider: 'openai' },
  { id: 'onyx', name: 'Onyx (Deep Male)', provider: 'openai' },
  { id: 'shimmer', name: 'Shimmer (Female)', provider: 'openai' },
];

export const ALL_VOICES: VoiceOption[] = [...ELEVENLABS_VOICES, ...OPENAI_VOICES];
