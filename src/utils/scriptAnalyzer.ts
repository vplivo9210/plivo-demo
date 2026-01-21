import { ANIMATION_NAMES, AnimationName } from './animationLoader';

/**
 * Keyword patterns for animation selection
 */
const ANIMATION_KEYWORDS: Record<AnimationName, string[]> = {
  [ANIMATION_NAMES.LAUGHING]: [
    'haha', 'hehe', 'lol', 'lmao', 'rofl', 'funny', 'laugh',
    'joke', 'hilarious', 'comedy', 'humor', 'amusing', 'giggle',
    'chuckle', 'crack up', 'cracking up'
  ],
  [ANIMATION_NAMES.CLAP]: [
    'great', 'awesome', 'congrats', 'congratulations', 'amazing',
    'wonderful', 'celebrate', 'celebration', 'excellent', 'fantastic',
    'bravo', 'well done', 'good job', 'nice work', 'applause',
    'clap', 'cheers', 'hooray', 'yay', 'woohoo', 'incredible',
    'outstanding', 'brilliant', 'superb', 'magnificent'
  ],
  [ANIMATION_NAMES.DANCE]: [
    'dance', 'dancing', 'party', 'groove', 'groovy', 'music',
    'let\'s go', 'get moving', 'move it', 'boogie', 'disco',
    'rhythm', 'beat', 'funk', 'jam', 'vibe', 'vibes', 'festival'
  ],
  [ANIMATION_NAMES.WAVING]: [], // Default animation, no specific keywords
};

/**
 * Result of script analysis
 */
export interface ScriptAnalysisResult {
  animation: AnimationName;
  matchedKeywords: string[];
  confidence: number; // 0-1 based on number of matches
}

/**
 * Analyze script text and determine the best animation to play
 */
export function analyzeScript(script: string): ScriptAnalysisResult {
  const lowerScript = script.toLowerCase();

  let bestAnimation: AnimationName = ANIMATION_NAMES.WAVING;
  let bestMatches: string[] = [];
  let maxMatches = 0;

  // Check each animation's keywords
  for (const [animation, keywords] of Object.entries(ANIMATION_KEYWORDS)) {
    if (keywords.length === 0) continue; // Skip default animation

    const matches: string[] = [];

    for (const keyword of keywords) {
      // Use word boundary matching for better accuracy
      const regex = new RegExp(`\\b${escapeRegex(keyword)}\\b`, 'gi');
      if (regex.test(lowerScript)) {
        matches.push(keyword);
      }
    }

    if (matches.length > maxMatches) {
      maxMatches = matches.length;
      bestAnimation = animation as AnimationName;
      bestMatches = matches;
    }
  }

  // Calculate confidence based on matches
  const confidence = maxMatches > 0
    ? Math.min(1, maxMatches / 3) // 3+ matches = full confidence
    : 0;

  return {
    animation: bestAnimation,
    matchedKeywords: bestMatches,
    confidence,
  };
}

/**
 * Escape special regex characters in a string
 */
function escapeRegex(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/**
 * Check if script contains any keywords for a specific animation
 */
export function hasAnimationKeywords(script: string, animation: AnimationName): boolean {
  const keywords = ANIMATION_KEYWORDS[animation];
  if (!keywords || keywords.length === 0) return false;

  const lowerScript = script.toLowerCase();
  return keywords.some(keyword => {
    const regex = new RegExp(`\\b${escapeRegex(keyword)}\\b`, 'gi');
    return regex.test(lowerScript);
  });
}

/**
 * Get all keywords for a specific animation
 */
export function getAnimationKeywords(animation: AnimationName): string[] {
  return ANIMATION_KEYWORDS[animation] || [];
}

/**
 * Get the default animation name
 */
export function getDefaultAnimation(): AnimationName {
  return ANIMATION_NAMES.WAVING;
}
