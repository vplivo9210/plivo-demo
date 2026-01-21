import { useState } from 'react';
import { Avatar } from './components/Avatar';
import { MascotAvatar } from './components/MascotAvatar';
import { SpriteAvatar } from './components/SpriteAvatar';
import { SvgAnimatedCharacter } from './components/SvgAnimatedCharacter';
import { ScriptInput } from './components/ScriptInput';
import { useLipSync } from './hooks/useLipSync';
import { useAnimationState } from './hooks/useAnimationState';
import { generateSpeech } from './services/tts';
import { VoiceOption, SpriteAnimationName } from './types';

function App() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [avatarMode, setAvatarMode] = useState<'2d' | 'sprite' | '3d' | 'animated'>('2d');
  const [currentAnimatedAnimation, setCurrentAnimatedAnimation] = useState<string | null>(null);
  const [currentScript, setCurrentScript] = useState<string>('');
  const [currentSpriteAnimation, setCurrentSpriteAnimation] = useState<SpriteAnimationName | null>(null);

  const {
    mouthShape,
    mouthOpenness,
    currentViseme,
    jawRotation,
    isPlaying,
    amplitude,
    playbackTime,
    gestureTriggers,
    playAudio,
    stopAudio
  } = useLipSync();

  // Animation state machine with gesture support
  const {
    animationState,
    activeGesture,
  } = useAnimationState(isPlaying, amplitude, playbackTime, gestureTriggers);

  const handleSpeak = async (text: string, voice: VoiceOption) => {
    setIsLoading(true);
    setError(null);
    setCurrentScript(text); // Track current script for animation selection

    try {
      // generateSpeech now returns SpeechResult with optional alignment data
      const speechResult = await generateSpeech(text, voice.id, voice.provider);
      await playAudio(speechResult);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to generate speech';
      setError(message);
      console.error('Speech generation error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-8 gap-8">
      <header className="text-center">
        <h1 className="text-4xl font-bold text-white mb-2">Plivo Buddy</h1>
        <p className="text-white/70">Your friendly talking avatar with precise lip-sync</p>
      </header>

      {/* Avatar Mode Toggle */}
      <div className="flex items-center gap-2 bg-white/10 rounded-full px-3 py-2">
        <button
          onClick={() => setAvatarMode('2d')}
          className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all ${
            avatarMode === '2d'
              ? 'bg-white text-gray-900'
              : 'text-white/70 hover:text-white'
          }`}
        >
          2D
        </button>
        <button
          onClick={() => setAvatarMode('sprite')}
          className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all ${
            avatarMode === 'sprite'
              ? 'bg-white text-gray-900'
              : 'text-white/70 hover:text-white'
          }`}
        >
          Sprite
        </button>
        <button
          onClick={() => setAvatarMode('3d')}
          className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all ${
            avatarMode === '3d'
              ? 'bg-white text-gray-900'
              : 'text-white/70 hover:text-white'
          }`}
        >
          3D
        </button>
        <button
          onClick={() => setAvatarMode('animated')}
          className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all ${
            avatarMode === 'animated'
              ? 'bg-white text-gray-900'
              : 'text-white/70 hover:text-white'
          }`}
        >
          garbage with good lips
        </button>
      </div>

      <main className="flex flex-col lg:flex-row items-center gap-12">
        <div className="flex-shrink-0">
          {avatarMode === '3d' ? (
            <MascotAvatar
              currentViseme={currentViseme}
              jawRotation={jawRotation}
              isPlaying={isPlaying}
              amplitude={amplitude}
            />
          ) : avatarMode === 'animated' ? (
            <SvgAnimatedCharacter
              currentViseme={currentViseme}
              isPlaying={isPlaying}
              amplitude={amplitude}
              script={currentScript}
              onAnimationChange={setCurrentAnimatedAnimation}
            />
          ) : avatarMode === 'sprite' ? (
            <SpriteAvatar
              mouthShape={mouthShape}
              mouthOpenness={mouthOpenness}
              currentViseme={currentViseme}
              amplitude={amplitude}
              isPlaying={isPlaying}
              script={currentScript}
              onAnimationChange={setCurrentSpriteAnimation}
            />
          ) : (
            <Avatar
              mouthShape={mouthShape}
              mouthOpenness={mouthOpenness}
              amplitude={amplitude}
              isPlaying={isPlaying}
            />
          )}
        </div>

        <div className="w-full max-w-md">
          <ScriptInput
            onSpeak={handleSpeak}
            isLoading={isLoading}
            isPlaying={isPlaying}
            onStop={stopAudio}
          />

          {/* Animation State Debug Info */}
          {isPlaying && (
            <div className="mt-4 p-3 bg-white/5 rounded-lg text-xs text-white/60 space-y-1">
              <div className="flex justify-between">
                <span>Viseme:</span>
                <span className="font-mono text-green-400">{currentViseme}</span>
              </div>
              <div className="flex justify-between">
                <span>Jaw:</span>
                <span className="font-mono">{jawRotation.toFixed(3)}</span>
              </div>
              <div className="flex justify-between">
                <span>State:</span>
                <span className="font-mono text-yellow-400">{animationState}</span>
              </div>
              <div className="flex justify-between">
                <span>Amplitude:</span>
                <span className="font-mono">{amplitude.toFixed(1)}%</span>
              </div>
              {avatarMode === 'animated' && currentAnimatedAnimation && (
                <div className="flex justify-between">
                  <span>Animation:</span>
                  <span className="font-mono text-purple-400">{currentAnimatedAnimation}</span>
                </div>
              )}
              {avatarMode === 'sprite' && currentSpriteAnimation && (
                <div className="flex justify-between">
                  <span>Animation:</span>
                  <span className="font-mono text-purple-400">{currentSpriteAnimation}</span>
                </div>
              )}
              {avatarMode === '2d' && activeGesture && (
                <div className="flex justify-between">
                  <span>Gesture:</span>
                  <span className="font-mono text-purple-400">{activeGesture.type}</span>
                </div>
              )}
            </div>
          )}

          {error && (
            <div className="mt-4 p-4 bg-red-500/20 border border-red-500/50 rounded-lg text-white text-sm">
              <p className="font-medium">Error</p>
              <p className="text-white/80">{error}</p>
            </div>
          )}
        </div>
      </main>

      <footer className="text-white/50 text-sm">
        Powered by ElevenLabs (with visemes) & OpenAI TTS (amplitude fallback)
      </footer>
    </div>
  );
}

export default App;
