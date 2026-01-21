import { useState, FormEvent } from 'react';
import { VoiceOption, ALL_VOICES, TTSProvider } from '../types';

interface ScriptInputProps {
  onSpeak: (text: string, voice: VoiceOption) => void;
  isLoading: boolean;
  isPlaying: boolean;
  onStop: () => void;
}

export function ScriptInput({ onSpeak, isLoading, isPlaying, onStop }: ScriptInputProps) {
  const [script, setScript] = useState(
    "Hello! Welcome to Plivo. I'm your friendly mascot, here to show you our amazing communication platform!"
  );
  const [selectedVoice, setSelectedVoice] = useState<VoiceOption>(ALL_VOICES[0]);
  const [provider, setProvider] = useState<TTSProvider>('elevenlabs');

  const filteredVoices = ALL_VOICES.filter(v => v.provider === provider);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (script.trim() && !isLoading && !isPlaying) {
      onSpeak(script, selectedVoice);
    }
  };

  const handleProviderChange = (newProvider: TTSProvider) => {
    setProvider(newProvider);
    // Select first voice of new provider
    const firstVoice = ALL_VOICES.find(v => v.provider === newProvider);
    if (firstVoice) {
      setSelectedVoice(firstVoice);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-md space-y-4">
      <div>
        <label htmlFor="script" className="block text-sm font-medium text-white mb-2">
          Script
        </label>
        <textarea
          id="script"
          value={script}
          onChange={(e) => setScript(e.target.value)}
          rows={4}
          className="w-full px-4 py-3 rounded-lg bg-white/10 backdrop-blur-sm border border-white/20 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-white/50 resize-none"
          placeholder="Enter the script for the mascot to speak..."
          disabled={isLoading || isPlaying}
        />
        <p className="mt-1 text-xs text-white/60">
          {script.length} characters
        </p>
      </div>

      <div className="flex gap-4">
        <div className="flex-1">
          <label htmlFor="provider" className="block text-sm font-medium text-white mb-2">
            TTS Provider
          </label>
          <select
            id="provider"
            value={provider}
            onChange={(e) => handleProviderChange(e.target.value as TTSProvider)}
            className="w-full px-4 py-2 rounded-lg bg-white/10 backdrop-blur-sm border border-white/20 text-white focus:outline-none focus:ring-2 focus:ring-white/50"
            disabled={isLoading || isPlaying}
          >
            <option value="elevenlabs" className="text-gray-900">ElevenLabs</option>
            <option value="openai" className="text-gray-900">OpenAI</option>
          </select>
        </div>

        <div className="flex-1">
          <label htmlFor="voice" className="block text-sm font-medium text-white mb-2">
            Voice
          </label>
          <select
            id="voice"
            value={selectedVoice.id}
            onChange={(e) => {
              const voice = filteredVoices.find(v => v.id === e.target.value);
              if (voice) setSelectedVoice(voice);
            }}
            className="w-full px-4 py-2 rounded-lg bg-white/10 backdrop-blur-sm border border-white/20 text-white focus:outline-none focus:ring-2 focus:ring-white/50"
            disabled={isLoading || isPlaying}
          >
            {filteredVoices.map(voice => (
              <option key={voice.id} value={voice.id} className="text-gray-900">
                {voice.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="flex gap-3">
        <button
          type="submit"
          disabled={isLoading || isPlaying || !script.trim()}
          className="flex-1 px-6 py-3 bg-white text-purple-700 font-semibold rounded-lg hover:bg-white/90 focus:outline-none focus:ring-2 focus:ring-white/50 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
        >
          {isLoading ? (
            <>
              <svg className="w-5 h-5 spinner" viewBox="0 0 24 24" fill="none">
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                />
              </svg>
              Generating...
            </>
          ) : (
            <>
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Speak
            </>
          )}
        </button>

        {isPlaying && (
          <button
            type="button"
            onClick={onStop}
            className="px-6 py-3 bg-red-500 text-white font-semibold rounded-lg hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-500/50 transition-all flex items-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 10a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 01-1-1v-4z" />
            </svg>
            Stop
          </button>
        )}
      </div>
    </form>
  );
}
