import { useState, useCallback } from 'react';
import { ElevenLabsVoice, TTSResponse } from '@/lib/services/elevenlabs-tts';

export interface TTSState {
  isGenerating: boolean;
  audioUrl: string | null;
  audioBlob: Blob | null;
  error: string | null;
  voiceInfo: ElevenLabsVoice | null;
  duration: number | null;
  isPlaying: boolean;
}

export interface TTSControls {
  generateSpeech: (text: string, options?: TTSOptions) => Promise<void>;
  playAudio: () => void;
  pauseAudio: () => void;
  stopAudio: () => void;
  clearAudio: () => void;
  downloadAudio: (filename?: string) => void;
  getVoices: () => Promise<ElevenLabsVoice[]>;
  playSample: (voiceId: string, sampleText?: string) => Promise<void>;
}

export interface TTSOptions {
  language?: 'hebrew' | 'english' | 'arabic';
  voiceId?: string;
  gender?: 'male' | 'female';
  saveToStorage?: boolean;
}

export function useTextToSpeech(): [TTSState, TTSControls] {
  const [state, setState] = useState<TTSState>({
    isGenerating: false,
    audioUrl: null,
    audioBlob: null,
    error: null,
    voiceInfo: null,
    duration: null,
    isPlaying: false
  });

  const [audioElement, setAudioElement] = useState<HTMLAudioElement | null>(null);

  // Generate speech from text
  const generateSpeech = useCallback(async (text: string, options: TTSOptions = {}) => {
    if (!text || text.trim().length === 0) {
      setState(prev => ({ ...prev, error: 'Text is required' }));
      return;
    }

    setState(prev => ({ 
      ...prev, 
      isGenerating: true, 
      error: null,
      audioUrl: null,
      audioBlob: null
    }));

    try {
      const response = await fetch('/api/tts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          text: text.trim(),
          language: options.language || 'hebrew',
          voice_id: options.voiceId,
          gender: options.gender,
          save_to_storage: options.saveToStorage || false
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to generate speech');
      }

      const result = await response.json();

      if (!result.success) {
        throw new Error(result.error || 'Speech generation failed');
      }

      // Create audio element
      const audio = new Audio(result.audio_url);
      audio.addEventListener('loadedmetadata', () => {
        setState(prev => ({ ...prev, duration: audio.duration }));
      });
      
      audio.addEventListener('play', () => {
        setState(prev => ({ ...prev, isPlaying: true }));
      });
      
      audio.addEventListener('pause', () => {
        setState(prev => ({ ...prev, isPlaying: false }));
      });
      
      audio.addEventListener('ended', () => {
        setState(prev => ({ ...prev, isPlaying: false }));
      });

      setAudioElement(audio);

      setState(prev => ({
        ...prev,
        isGenerating: false,
        audioUrl: result.audio_url,
        voiceInfo: result.voice_info,
        error: null
      }));

      // If we need the blob for storage, fetch it
      if (options.saveToStorage) {
        try {
          const audioResponse = await fetch(result.audio_url);
          const blob = await audioResponse.blob();
          setState(prev => ({ ...prev, audioBlob: blob }));
        } catch (blobError) {
          console.warn('Failed to fetch audio blob:', blobError);
        }
      }

    } catch (error) {
      console.error('TTS Error:', error);
      setState(prev => ({
        ...prev,
        isGenerating: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      }));
    }
  }, []);

  // Play audio
  const playAudio = useCallback(() => {
    if (audioElement && state.audioUrl) {
      audioElement.play().catch(error => {
        console.error('Audio play error:', error);
        setState(prev => ({ ...prev, error: 'Failed to play audio' }));
      });
    }
  }, [audioElement, state.audioUrl]);

  // Pause audio
  const pauseAudio = useCallback(() => {
    if (audioElement) {
      audioElement.pause();
    }
  }, [audioElement]);

  // Stop audio
  const stopAudio = useCallback(() => {
    if (audioElement) {
      audioElement.pause();
      audioElement.currentTime = 0;
    }
  }, [audioElement]);

  // Clear audio
  const clearAudio = useCallback(() => {
    if (audioElement) {
      audioElement.pause();
      if (state.audioUrl) {
        URL.revokeObjectURL(state.audioUrl);
      }
    }
    setAudioElement(null);
    setState(prev => ({
      ...prev,
      audioUrl: null,
      audioBlob: null,
      voiceInfo: null,
      duration: null,
      isPlaying: false,
      error: null
    }));
  }, [audioElement, state.audioUrl]);

  // Download audio
  const downloadAudio = useCallback((filename?: string) => {
    if (!state.audioUrl) {
      setState(prev => ({ ...prev, error: 'No audio to download' }));
      return;
    }

    try {
      const link = document.createElement('a');
      link.href = state.audioUrl;
      link.download = filename || `voice_message_${Date.now()}.mp3`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error('Download error:', error);
      setState(prev => ({ ...prev, error: 'Failed to download audio' }));
    }
  }, [state.audioUrl]);

  // Get available voices
  const getVoices = useCallback(async (): Promise<ElevenLabsVoice[]> => {
    try {
      const response = await fetch('/api/tts?action=voices');
      if (!response.ok) {
        throw new Error('Failed to fetch voices');
      }
      const data = await response.json();
      return data.voices || [];
    } catch (error) {
      console.error('Error fetching voices:', error);
      setState(prev => ({ ...prev, error: 'Failed to load voices' }));
      return [];
    }
  }, []);

  // Play voice sample
  const playSample = useCallback(async (voiceId: string, sampleText?: string) => {
    setState(prev => ({ ...prev, isGenerating: true, error: null }));

    try {
      const params = new URLSearchParams({
        action: 'sample',
        voice_id: voiceId
      });
      
      if (sampleText) {
        params.append('text', sampleText);
      }

      const response = await fetch(`/api/tts?${params}`);
      if (!response.ok) {
        throw new Error('Failed to generate voice sample');
      }

      const result = await response.json();
      
      if (!result.success) {
        throw new Error(result.error || 'Sample generation failed');
      }

      // Play sample directly
      const audio = new Audio(result.audio_url);
      audio.play().catch(error => {
        console.error('Sample play error:', error);
      });

      setState(prev => ({ ...prev, isGenerating: false }));
    } catch (error) {
      console.error('Sample error:', error);
      setState(prev => ({
        ...prev,
        isGenerating: false,
        error: error instanceof Error ? error.message : 'Failed to play sample'
      }));
    }
  }, []);

  const controls: TTSControls = {
    generateSpeech,
    playAudio,
    pauseAudio,
    stopAudio,
    clearAudio,
    downloadAudio,
    getVoices,
    playSample
  };

  return [state, controls];
}

// Utility function to format duration
export function formatDuration(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}

// Utility function to estimate text reading time
export function estimateReadingTime(text: string, language: 'hebrew' | 'english' | 'arabic' = 'hebrew'): number {
  const wordsPerMinute = {
    hebrew: 150,
    english: 180,
    arabic: 140
  };

  const wordCount = text.split(/\s+/).length;
  return Math.ceil((wordCount / wordsPerMinute[language]) * 60);
}