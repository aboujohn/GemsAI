import { useState, useRef, useCallback, useEffect } from 'react';

export interface VoiceRecorderState {
  isRecording: boolean;
  isPaused: boolean;
  recordingTime: number;
  audioLevel: number;
  error: string | null;
  audioBlob: Blob | null;
  audioUrl: string | null;
  isSupported: boolean;
}

export interface VoiceRecorderControls {
  startRecording: () => Promise<void>;
  stopRecording: () => void;
  pauseRecording: () => void;
  resumeRecording: () => void;
  clearRecording: () => void;
  playRecording: () => void;
  pausePlayback: () => void;
}

export interface UseVoiceRecorderOptions {
  maxDuration?: number; // in seconds
  audioFormat?: string;
  sampleRate?: number;
  onRecordingComplete?: (audioBlob: Blob, duration: number) => void;
  onError?: (error: string) => void;
}

export function useVoiceRecorder(
  options: UseVoiceRecorderOptions = {}
): [VoiceRecorderState, VoiceRecorderControls] {
  const {
    maxDuration = 300, // 5 minutes default
    audioFormat = 'audio/webm',
    sampleRate = 44100,
    onRecordingComplete,
    onError,
  } = options;

  // State
  const [state, setState] = useState<VoiceRecorderState>({
    isRecording: false,
    isPaused: false,
    recordingTime: 0,
    audioLevel: 0,
    error: null,
    audioBlob: null,
    audioUrl: null,
    isSupported: typeof navigator !== 'undefined' && !!navigator.mediaDevices?.getUserMedia,
  });

  // Refs
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const animationRef = useRef<number | null>(null);
  const audioElementRef = useRef<HTMLAudioElement | null>(null);

  // Audio level monitoring
  const monitorAudioLevel = useCallback(() => {
    if (!analyserRef.current) return;

    const dataArray = new Uint8Array(analyserRef.current.frequencyBinCount);
    analyserRef.current.getByteFrequencyData(dataArray);

    const average = dataArray.reduce((sum, value) => sum + value, 0) / dataArray.length;
    const normalizedLevel = Math.min(average / 128, 1);

    setState(prev => ({ ...prev, audioLevel: normalizedLevel }));

    if (state.isRecording && !state.isPaused) {
      animationRef.current = requestAnimationFrame(monitorAudioLevel);
    }
  }, [state.isRecording, state.isPaused]);

  // Start recording timer
  const startTimer = useCallback(() => {
    timerRef.current = setInterval(() => {
      setState(prev => {
        const newTime = prev.recordingTime + 1;

        // Auto-stop if max duration reached
        if (newTime >= maxDuration) {
          return prev;
        }

        return { ...prev, recordingTime: newTime };
      });
    }, 1000);
  }, [maxDuration]);

  // Stop timer
  const stopTimer = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  // Cleanup audio resources
  const cleanupAudio = useCallback(() => {
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
      animationRef.current = null;
    }

    if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
      audioContextRef.current.close();
    }

    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }

    stopTimer();
  }, [stopTimer]);

  // Error handler
  const handleError = useCallback(
    (error: string) => {
      setState(prev => ({ ...prev, error, isRecording: false, isPaused: false }));
      cleanupAudio();
      onError?.(error);
    },
    [cleanupAudio, onError]
  );

  // Start recording
  const startRecording = useCallback(async () => {
    if (!state.isSupported) {
      handleError('Audio recording is not supported in this browser');
      return;
    }

    try {
      setState(prev => ({ ...prev, error: null, recordingTime: 0 }));

      // Get user media
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          sampleRate,
          channelCount: 1,
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        },
      });

      streamRef.current = stream;

      // Set up audio context for visualization
      audioContextRef.current = new AudioContext({ sampleRate });
      const source = audioContextRef.current.createMediaStreamSource(stream);
      analyserRef.current = audioContextRef.current.createAnalyser();
      analyserRef.current.fftSize = 256;
      source.connect(analyserRef.current);

      // Set up media recorder
      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: MediaRecorder.isTypeSupported(audioFormat) ? audioFormat : 'audio/webm',
      });

      mediaRecorderRef.current = mediaRecorder;
      chunksRef.current = [];

      mediaRecorder.ondataavailable = event => {
        if (event.data.size > 0) {
          chunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(chunksRef.current, { type: audioFormat });
        const audioUrl = URL.createObjectURL(audioBlob);

        setState(prev => ({
          ...prev,
          audioBlob,
          audioUrl,
          isRecording: false,
          isPaused: false,
          audioLevel: 0,
        }));

        onRecordingComplete?.(audioBlob, state.recordingTime);
        cleanupAudio();
      };

      mediaRecorder.onerror = event => {
        handleError(`Recording error: ${event.error?.message || 'Unknown error'}`);
      };

      // Start recording
      mediaRecorder.start(1000); // Collect data every second
      setState(prev => ({ ...prev, isRecording: true, isPaused: false }));

      startTimer();
      monitorAudioLevel();
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to start recording';
      handleError(`Microphone access denied or not available: ${message}`);
    }
  }, [
    state.isSupported,
    sampleRate,
    audioFormat,
    handleError,
    startTimer,
    monitorAudioLevel,
    onRecordingComplete,
    state.recordingTime,
    cleanupAudio,
  ]);

  // Stop recording
  const stopRecording = useCallback(() => {
    if (mediaRecorderRef.current && state.isRecording) {
      mediaRecorderRef.current.stop();
      stopTimer();
    }
  }, [state.isRecording, stopTimer]);

  // Pause recording
  const pauseRecording = useCallback(() => {
    if (mediaRecorderRef.current && state.isRecording && !state.isPaused) {
      mediaRecorderRef.current.pause();
      setState(prev => ({ ...prev, isPaused: true }));
      stopTimer();
    }
  }, [state.isRecording, state.isPaused, stopTimer]);

  // Resume recording
  const resumeRecording = useCallback(() => {
    if (mediaRecorderRef.current && state.isRecording && state.isPaused) {
      mediaRecorderRef.current.resume();
      setState(prev => ({ ...prev, isPaused: false }));
      startTimer();
      monitorAudioLevel();
    }
  }, [state.isRecording, state.isPaused, startTimer, monitorAudioLevel]);

  // Clear recording
  const clearRecording = useCallback(() => {
    if (state.audioUrl) {
      URL.revokeObjectURL(state.audioUrl);
    }

    setState(prev => ({
      ...prev,
      audioBlob: null,
      audioUrl: null,
      recordingTime: 0,
      error: null,
    }));
  }, [state.audioUrl]);

  // Play recording
  const playRecording = useCallback(() => {
    if (state.audioUrl && !audioElementRef.current) {
      audioElementRef.current = new Audio(state.audioUrl);
      audioElementRef.current.play().catch(error => {
        handleError(`Playback error: ${error.message}`);
      });
    }
  }, [state.audioUrl, handleError]);

  // Pause playback
  const pausePlayback = useCallback(() => {
    if (audioElementRef.current) {
      audioElementRef.current.pause();
      audioElementRef.current = null;
    }
  }, []);

  // Auto-stop when max duration reached
  useEffect(() => {
    if (state.recordingTime >= maxDuration && state.isRecording) {
      stopRecording();
    }
  }, [state.recordingTime, maxDuration, state.isRecording, stopRecording]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      cleanupAudio();
      if (state.audioUrl) {
        URL.revokeObjectURL(state.audioUrl);
      }
    };
  }, [cleanupAudio, state.audioUrl]);

  const controls: VoiceRecorderControls = {
    startRecording,
    stopRecording,
    pauseRecording,
    resumeRecording,
    clearRecording,
    playRecording,
    pausePlayback,
  };

  return [state, controls];
}
