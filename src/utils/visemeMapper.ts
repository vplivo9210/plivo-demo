import { Viseme } from '../types';

/**
 * Maps characters to visemes using phonetic approximation.
 * This is a simplified mapping that works well for English text.
 *
 * The mapping prioritizes the most distinctive mouth shapes for each sound.
 */

// Character to viseme mapping (lowercase)
// Based on common English pronunciation patterns
const CHAR_TO_VISEME: Record<string, Viseme> = {
  // Bilabial consonants - lips pressed together
  'p': 'PP',
  'b': 'PP',
  'm': 'PP',

  // Labiodental consonants - teeth on lip
  'f': 'FF',
  'v': 'FF',

  // Dental/Interdental - tongue between teeth
  // (handled specially for 'th' digraph)

  // Alveolar stops - tongue touches roof
  't': 'DD',
  'd': 'DD',

  // Velar stops - back of tongue
  'k': 'kk',
  'g': 'kk',
  'c': 'kk', // usually /k/ sound
  'q': 'kk',
  'x': 'kk', // /ks/

  // Palato-alveolar - ch, sh, j sounds
  'j': 'CH',

  // Fricatives - hissing sounds
  's': 'SS',
  'z': 'SS',

  // Nasals and liquids
  'n': 'nn',
  'l': 'nn',

  // R sound
  'r': 'RR',

  // Vowels - open mouth shapes
  'a': 'aa',
  'e': 'E',
  'i': 'I',
  'o': 'O',
  'u': 'U',

  // Semi-vowels and special
  'w': 'U',   // rounded lips like 'oo'
  'y': 'I',   // like 'ee'
  'h': 'sil', // just breath, minimal mouth movement

  // Silent/minimal
  ' ': 'sil',
  '.': 'sil',
  ',': 'sil',
  '!': 'sil',
  '?': 'sil',
  '-': 'sil',
  '"': 'sil',
  "'": 'sil',
  '\n': 'sil',
  '\t': 'sil',
};

// Common digraphs (two-letter combinations) with special visemes
const DIGRAPH_TO_VISEME: Record<string, Viseme> = {
  'th': 'TH',
  'sh': 'CH',
  'ch': 'CH',
  'zh': 'CH',
  'ng': 'kk',
  'ph': 'FF',
  'wh': 'U',
  'ck': 'kk',
  'qu': 'kk',

  // Common vowel digraphs
  'ee': 'I',
  'ea': 'I',
  'oo': 'U',
  'ou': 'O',
  'ow': 'O',
  'ai': 'E',
  'ay': 'E',
  'oi': 'O',
  'oy': 'O',
  'au': 'aa',
  'aw': 'aa',
};

/**
 * Get the viseme for a character or digraph at a given position
 * @param text Full text string
 * @param index Current character index
 * @returns Object with viseme and whether we consumed a digraph
 */
export function getVisemeAtIndex(text: string, index: number): { viseme: Viseme; consumedDigraph: boolean } {
  const char = text[index]?.toLowerCase() || '';
  const nextChar = text[index + 1]?.toLowerCase() || '';
  const digraph = char + nextChar;

  // Check for digraph first
  if (DIGRAPH_TO_VISEME[digraph]) {
    return { viseme: DIGRAPH_TO_VISEME[digraph], consumedDigraph: true };
  }

  // Single character mapping
  const viseme = CHAR_TO_VISEME[char];
  if (viseme) {
    return { viseme, consumedDigraph: false };
  }

  // Unknown character - treat as silence
  return { viseme: 'sil', consumedDigraph: false };
}

/**
 * Map a single character to a viseme (simpler version without digraph handling)
 * Use this when processing pre-separated characters from alignment data
 */
export function charToViseme(char: string): Viseme {
  const lower = char.toLowerCase();
  return CHAR_TO_VISEME[lower] || 'sil';
}

/**
 * Jaw rotation values for each viseme
 * Higher values = more open mouth
 */
export const VISEME_JAW_ROTATION: Record<Viseme, number> = {
  'sil': 0,      // Closed
  'PP': 0.02,    // Lips pressed, minimal jaw
  'FF': 0.05,    // Lower lip tucked, slight jaw
  'TH': 0.08,    // Tongue out, moderate jaw
  'DD': 0.12,    // Tongue tap, moderate jaw
  'kk': 0.15,    // Back tongue, moderate jaw
  'CH': 0.18,    // Wide fricative
  'SS': 0.10,    // Teeth close, slight opening
  'nn': 0.08,    // Nasal, moderate jaw
  'RR': 0.12,    // R sound, moderate jaw
  'aa': 0.35,    // Wide open (ah)
  'E': 0.25,     // Mid-open (eh)
  'I': 0.15,     // Narrow (ee)
  'O': 0.30,     // Rounded open (oh)
  'U': 0.20,     // Rounded (oo)
};

/**
 * Get the recommended transition time between two visemes
 * Some transitions are naturally faster (e.g., vowel to vowel)
 * Others need more time (e.g., closed lips to open)
 */
export function getVisemeTransitionTime(from: Viseme, to: Viseme): number {
  const fromJaw = VISEME_JAW_ROTATION[from];
  const toJaw = VISEME_JAW_ROTATION[to];
  const jawDelta = Math.abs(toJaw - fromJaw);

  // Base transition time with adjustment for jaw movement
  const baseTime = 0.03; // 30ms minimum
  const additionalTime = jawDelta * 0.15; // Scale with movement amount

  return baseTime + additionalTime;
}

/**
 * Convert a mouth openness value (0-1) to a viseme
 * Useful for amplitude-based fallback
 */
export function opennessToViseme(openness: number): Viseme {
  if (openness < 0.1) return 'sil';
  if (openness < 0.2) return 'SS';
  if (openness < 0.35) return 'I';
  if (openness < 0.5) return 'E';
  if (openness < 0.7) return 'O';
  return 'aa';
}
