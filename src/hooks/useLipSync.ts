import { useState, useRef, useCallback, useEffect } from 'react';
import { MouthShape, Viseme, VisemeCue, SpeechResult } from '../types';
import { getVisemeAtTime, getInterpolatedJawRotation, findGestureTriggers } from '../utils/visemeTimeline';
import { VISEME_JAW_ROTATION, opennessToViseme } from '../utils/visemeMapper';

interface UseLipSyncReturn {
  mouthShape: MouthShape;
  mouthOpenness: number;       // 0-1 continuous value for smooth interpolation
  currentViseme: Viseme;       // Current viseme for precise lip-sync
  jawRotation: number;         // Direct jaw rotation value for Avatar3D
  isPlaying: boolean;
  amplitude: number;           // 0-100 normalized amplitude for body animation
  playbackTime: number;        // Current playback time in seconds
  gestureTriggers: { time: number; type: 'emphasis' | 'question' | 'exclaim' }[];
  playAudio: (speechResult: SpeechResult) => Promise<void>;
  stopAudio: () => void;
}

// Amplitude thresholds for mouth shapes (fallback mode)
const THRESHOLDS = {
  closed: 15,
  small: 35,
  medium: 60,
};

// Smoothing factor for momentum (0-1, higher = smoother but more latency)
const SMOOTHING_FACTOR = 0.3;

export function useLipSync(): UseLipSyncReturn {
  const [mouthShape, setMouthShape] = useState<MouthShape>('closed');
  const [mouthOpenness, setMouthOpenness] = useState(0);
  const [currentViseme, setCurrentViseme] = useState<Viseme>('sil');
  const [jawRotation, setJawRotation] = useState(0);
  const [amplitude, setAmplitude] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [playbackTime, setPlaybackTime] = useState(0);
  const [gestureTriggers, setGestureTriggers] = useState<{ time: number; type: 'emphasis' | 'question' | 'exclaim' }[]>([]);

  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const sourceRef = useRef<AudioBufferSourceNode | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const isPlayingRef = useRef(false);
  const smoothedAmplitudeRef = useRef(0);
  const startTimeRef = useRef(0);
  const visemeCuesRef = useRef<VisemeCue[] | null>(null);
  const previousJawRotationRef = useRef(0);

  const getMouthShapeFromAmplitude = (amplitude: number): MouthShape => {
    if (amplitude < THRESHOLDS.closed) return 'closed';
    if (amplitude < THRESHOLDS.small) return 'small';
    if (amplitude < THRESHOLDS.medium) return 'medium';
    return 'wide';
  };

  const analyzeAudio = useCallback(() => {
    if (!analyserRef.current || !audioContextRef.current) return;

    const dataArray = new Uint8Array(analyserRef.current.frequencyBinCount);
    analyserRef.current.getByteFrequencyData(dataArray);

    // Calculate average amplitude from frequency data
    const sum = dataArray.reduce((acc, val) => acc + val, 0);
    const average = sum / dataArray.length;

    // Normalize to 0-100 range
    const rawAmplitude = (average / 255) * 100;

    // Apply smoothing/momentum for less jarring transitions
    smoothedAmplitudeRef.current =
      smoothedAmplitudeRef.current * SMOOTHING_FACTOR +
      rawAmplitude * (1 - SMOOTHING_FACTOR);

    const smoothedAmplitude = smoothedAmplitudeRef.current;

    // Set amplitude for body animation
    setAmplitude(smoothedAmplitude);

    // Calculate current playback time
    const currentTime = audioContextRef.current.currentTime - startTimeRef.current;
    setPlaybackTime(currentTime);

    // Determine lip-sync method: viseme-based or amplitude fallback
    if (visemeCuesRef.current && visemeCuesRef.current.length > 0) {
      // VISEME-BASED LIP-SYNC (precise)
      const { viseme, progress, nextViseme } = getVisemeAtTime(visemeCuesRef.current, currentTime);
      setCurrentViseme(viseme);

      // Get interpolated jaw rotation for smooth transitions
      const targetJaw = getInterpolatedJawRotation(viseme, nextViseme, progress);

      // Additional smoothing for jaw movement
      const smoothedJaw = previousJawRotationRef.current * 0.3 + targetJaw * 0.7;
      previousJawRotationRef.current = smoothedJaw;
      setJawRotation(smoothedJaw);

      // Also set mouth openness for compatibility
      const openness = Math.min(1, smoothedJaw / 0.35);
      setMouthOpenness(openness);
      setMouthShape(getMouthShapeFromAmplitude(openness * 80));
    } else {
      // AMPLITUDE-BASED FALLBACK
      const shape = getMouthShapeFromAmplitude(smoothedAmplitude);
      setMouthShape(shape);

      // Set continuous openness value (0-1)
      const openness = Math.min(1, Math.max(0, smoothedAmplitude / 80));
      setMouthOpenness(openness);

      // Convert amplitude to viseme and jaw rotation
      const viseme = opennessToViseme(openness);
      setCurrentViseme(viseme);
      setJawRotation(VISEME_JAW_ROTATION[viseme]);
    }

    // Use ref to avoid stale closure - isPlaying state would capture old value
    if (isPlayingRef.current) {
      animationFrameRef.current = requestAnimationFrame(analyzeAudio);
    }
  }, []);

  const playAudio = useCallback(async (speechResult: SpeechResult) => {
    const { audioBlob, visemeCues, alignmentData } = speechResult;

    // Clean up any existing playback
    if (sourceRef.current) {
      sourceRef.current.stop();
      sourceRef.current.disconnect();
    }
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
    }

    // Store viseme cues for playback
    visemeCuesRef.current = visemeCues || null;

    // Extract gesture triggers if we have alignment data
    if (alignmentData) {
      const triggers = findGestureTriggers(alignmentData);
      setGestureTriggers(triggers);
    } else {
      setGestureTriggers([]);
    }

    // Create or resume audio context
    if (!audioContextRef.current) {
      audioContextRef.current = new AudioContext();
    }

    if (audioContextRef.current.state === 'suspended') {
      await audioContextRef.current.resume();
    }

    // Create analyser (still needed for amplitude/body animation)
    analyserRef.current = audioContextRef.current.createAnalyser();
    analyserRef.current.fftSize = 256;
    analyserRef.current.smoothingTimeConstant = 0.5;

    // Decode audio
    const arrayBuffer = await audioBlob.arrayBuffer();
    const audioBuffer = await audioContextRef.current.decodeAudioData(arrayBuffer);

    // Create source
    sourceRef.current = audioContextRef.current.createBufferSource();
    sourceRef.current.buffer = audioBuffer;

    // Connect nodes
    sourceRef.current.connect(analyserRef.current);
    analyserRef.current.connect(audioContextRef.current.destination);

    // Handle playback end
    sourceRef.current.onended = () => {
      isPlayingRef.current = false;
      smoothedAmplitudeRef.current = 0;
      previousJawRotationRef.current = 0;
      visemeCuesRef.current = null;
      setIsPlaying(false);
      setMouthShape('closed');
      setMouthOpenness(0);
      setCurrentViseme('sil');
      setJawRotation(0);
      setAmplitude(0);
      setPlaybackTime(0);
      setGestureTriggers([]);
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };

    // Start playback and analysis
    isPlayingRef.current = true;
    startTimeRef.current = audioContextRef.current.currentTime;
    setIsPlaying(true);
    sourceRef.current.start(0);
    animationFrameRef.current = requestAnimationFrame(analyzeAudio);
  }, [analyzeAudio]);

  const stopAudio = useCallback(() => {
    if (sourceRef.current) {
      sourceRef.current.stop();
      sourceRef.current.disconnect();
      sourceRef.current = null;
    }
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }
    isPlayingRef.current = false;
    smoothedAmplitudeRef.current = 0;
    previousJawRotationRef.current = 0;
    visemeCuesRef.current = null;
    setIsPlaying(false);
    setMouthShape('closed');
    setMouthOpenness(0);
    setCurrentViseme('sil');
    setJawRotation(0);
    setAmplitude(0);
    setPlaybackTime(0);
    setGestureTriggers([]);
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopAudio();
      if (audioContextRef.current) {
        audioContextRef.current.close();
      }
    };
  }, [stopAudio]);

  return {
    mouthShape,
    mouthOpenness,
    currentViseme,
    jawRotation,
    isPlaying,
    amplitude,
    playbackTime,
    gestureTriggers,
    playAudio,
    stopAudio,
  };
}
