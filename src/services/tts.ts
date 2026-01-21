import { TTSProvider, SpeechResult, AlignmentData } from '../types';
import { generateVisemeTimeline } from '../utils/visemeTimeline';

const ELEVENLABS_API_KEY = import.meta.env.VITE_ELEVENLABS_API_KEY;
const OPENAI_API_KEY = import.meta.env.VITE_OPENAI_API_KEY;

/**
 * Generate speech with optional viseme alignment data.
 * ElevenLabs returns alignment data for precise lip-sync.
 * OpenAI falls back to amplitude-based lip-sync.
 */
export async function generateSpeech(
  text: string,
  voiceId: string,
  provider: TTSProvider
): Promise<SpeechResult> {
  if (provider === 'elevenlabs') {
    return generateElevenLabsSpeechWithTimestamps(text, voiceId);
  } else {
    const audioBlob = await generateOpenAISpeech(text, voiceId);
    return { audioBlob };
  }
}

/**
 * Legacy function for backward compatibility
 */
export async function generateSpeechBlob(
  text: string,
  voiceId: string,
  provider: TTSProvider
): Promise<Blob> {
  const result = await generateSpeech(text, voiceId, provider);
  return result.audioBlob;
}

/**
 * ElevenLabs TTS with timestamps for precise lip-sync.
 * Uses the /with-timestamps endpoint to get character-level timing data.
 */
async function generateElevenLabsSpeechWithTimestamps(
  text: string,
  voiceId: string
): Promise<SpeechResult> {
  if (!ELEVENLABS_API_KEY) {
    throw new Error('ElevenLabs API key not configured. Please add VITE_ELEVENLABS_API_KEY to your .env file.');
  }

  const response = await fetch(
    `https://api.elevenlabs.io/v1/text-to-speech/${voiceId}/with-timestamps`,
    {
      method: 'POST',
      headers: {
        'xi-api-key': ELEVENLABS_API_KEY,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        text,
        model_id: 'eleven_multilingual_v2',
        voice_settings: {
          stability: 0.3,
          similarity_boost: 0.8,
        },
      }),
    }
  );

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`ElevenLabs API error: ${error}`);
  }

  // The /with-timestamps endpoint returns JSON with audio_base64 and alignment
  const data = await response.json();

  // Decode base64 audio to Blob
  const audioBase64 = data.audio_base64;
  const audioBytes = atob(audioBase64);
  const audioArray = new Uint8Array(audioBytes.length);
  for (let i = 0; i < audioBytes.length; i++) {
    audioArray[i] = audioBytes.charCodeAt(i);
  }
  const audioBlob = new Blob([audioArray], { type: 'audio/mpeg' });

  // Extract alignment data
  const alignmentData: AlignmentData | undefined = data.alignment
    ? {
        characters: data.alignment.characters || [],
        character_start_times_seconds: data.alignment.character_start_times_seconds || [],
        character_end_times_seconds: data.alignment.character_end_times_seconds || [],
      }
    : undefined;

  // Generate viseme timeline from alignment data
  const visemeCues = alignmentData ? generateVisemeTimeline(alignmentData) : undefined;

  return {
    audioBlob,
    alignmentData,
    visemeCues,
  };
}


async function generateOpenAISpeech(text: string, voice: string): Promise<Blob> {
  if (!OPENAI_API_KEY) {
    throw new Error('OpenAI API key not configured. Please add VITE_OPENAI_API_KEY to your .env file.');
  }

  const response = await fetch('https://api.openai.com/v1/audio/speech', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${OPENAI_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'tts-1',
      input: text,
      voice: voice,
      response_format: 'mp3',
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`OpenAI API error: ${error}`);
  }

  return response.blob();
}
