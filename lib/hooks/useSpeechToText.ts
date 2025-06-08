import { useState, useRef, useCallback, useEffect, useMemo } from 'react';

export interface SpeechToTextState {
  isTranscribing: boolean;
  transcript: string;
  interimTranscript: string;
  finalTranscript: string;
  confidence: number;
  language: string;
  error: string | null;
  isSupported: boolean;
  isListening: boolean;
}

export interface SpeechToTextControls {
  startTranscription: (language?: string) => void;
  stopTranscription: () => void;
  clearTranscript: () => void;
  transcribeAudioBlob: (audioBlob: Blob, language?: string) => Promise<string>;
  setLanguage: (language: string) => void;
}

export interface UseSpeechToTextOptions {
  continuous?: boolean;
  interimResults?: boolean;
  language?: string;
  maxAlternatives?: number;
  onTranscriptionComplete?: (transcript: string, confidence: number) => void;
  onError?: (error: string) => void;
  onLanguageDetected?: (language: string) => void;
}

// Language codes for speech recognition
export const SUPPORTED_LANGUAGES = {
  he: 'he-IL', // Hebrew (Israel)
  en: 'en-US', // English (US)
  ar: 'ar-SA', // Arabic (Saudi Arabia)
  fr: 'fr-FR', // French (France)
  es: 'es-ES', // Spanish (Spain)
} as const;

export function useSpeechToText(
  options: UseSpeechToTextOptions = {}
): [SpeechToTextState, SpeechToTextControls] {
  const {
    continuous = true,
    interimResults = true,
    language = 'he-IL',
    maxAlternatives = 1,
    onTranscriptionComplete,
    onError,
    onLanguageDetected,
  } = options;

  // Check if we're in browser environment first
  const isSupported = useMemo(() => {
    if (typeof window === 'undefined') return false;
    return 'webkitSpeechRecognition' in window || 'SpeechRecognition' in window;
  }, []);

  const [state, setState] = useState<SpeechToTextState>({
    isTranscribing: false,
    transcript: '',
    interimTranscript: '',
    finalTranscript: '',
    confidence: 0,
    language,
    error: null,
    isSupported,
    isListening: false,
  });

  // Refs
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const isInitializedRef = useRef(false);

  // Initialize speech recognition
  const initializeSpeechRecognition = useCallback(() => {
    if (!isSupported || isInitializedRef.current) return;

    try {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      const recognition = new SpeechRecognition();

      recognition.continuous = continuous;
      recognition.interimResults = interimResults;
      recognition.lang = language;
      recognition.maxAlternatives = maxAlternatives;

      // Event handlers
      recognition.onstart = () => {
        setState(prev => ({
          ...prev,
          isListening: true,
          error: null,
          isTranscribing: true,
        }));
      };

      recognition.onend = () => {
        setState(prev => ({
          ...prev,
          isListening: false,
          isTranscribing: false,
        }));
      };

      recognition.onresult = event => {
        let interimTranscript = '';
        let finalTranscript = '';
        let confidence = 0;

        for (let i = event.resultIndex; i < event.results.length; i++) {
          const result = event.results[i];
          const transcript = result[0].transcript;

          if (result.isFinal) {
            finalTranscript += transcript;
            confidence = result[0].confidence;
          } else {
            interimTranscript += transcript;
          }
        }

        setState(prev => ({
          ...prev,
          transcript: prev.finalTranscript + finalTranscript + interimTranscript,
          interimTranscript,
          finalTranscript: prev.finalTranscript + finalTranscript,
          confidence,
        }));

        // Trigger completion callback for final results
        if (finalTranscript && onTranscriptionComplete) {
          onTranscriptionComplete(prev => prev.finalTranscript + finalTranscript, confidence);
        }
      };

      recognition.onerror = event => {
        const errorMessage = getErrorMessage(event.error);
        setState(prev => ({
          ...prev,
          error: errorMessage,
          isListening: false,
          isTranscribing: false,
        }));
        onError?.(errorMessage);
      };

      recognition.onnomatch = () => {
        const errorMessage = 'No speech was recognized';
        setState(prev => ({ ...prev, error: errorMessage }));
        onError?.(errorMessage);
      };

      recognitionRef.current = recognition;
      isInitializedRef.current = true;
    } catch (error) {
      const errorMessage = `Failed to initialize speech recognition: ${error instanceof Error ? error.message : 'Unknown error'}`;
      setState(prev => ({ ...prev, error: errorMessage }));
      onError?.(errorMessage);
    }
  }, [
    isSupported,
    continuous,
    interimResults,
    language,
    maxAlternatives,
    onTranscriptionComplete,
    onError,
  ]);

  // Get user-friendly error messages
  const getErrorMessage = (error: string): string => {
    switch (error) {
      case 'no-speech':
        return 'No speech was detected. Please try again.';
      case 'audio-capture':
        return 'Audio capture failed. Please check your microphone.';
      case 'not-allowed':
        return 'Microphone access was denied. Please allow microphone access and try again.';
      case 'network':
        return 'Network error occurred during transcription.';
      case 'language-not-supported':
        return 'Selected language is not supported for speech recognition.';
      case 'service-not-allowed':
        return 'Speech recognition service is not allowed.';
      default:
        return `Speech recognition error: ${error}`;
    }
  };

  // Detect language from transcript
  const detectLanguage = useCallback((text: string): string => {
    // Simple language detection based on character patterns
    const hebrewPattern = /[\u0590-\u05FF]/;
    const arabicPattern = /[\u0600-\u06FF]/;

    if (hebrewPattern.test(text)) {
      return 'he-IL';
    } else if (arabicPattern.test(text)) {
      return 'ar-SA';
    }
    return 'en-US'; // Default to English
  }, []);

  // Start transcription
  const startTranscription = useCallback(
    (lang?: string) => {
      if (!isSupported) {
        const error = 'Speech recognition is not supported in this browser';
        setState(prev => ({ ...prev, error }));
        onError?.(error);
        return;
      }

      initializeSpeechRecognition();

      if (recognitionRef.current) {
        try {
          // Update language if provided
          if (lang && lang !== recognitionRef.current.lang) {
            recognitionRef.current.lang = lang;
            setState(prev => ({ ...prev, language: lang }));
          }

          recognitionRef.current.start();
        } catch (error) {
          const errorMessage = `Failed to start transcription: ${error instanceof Error ? error.message : 'Unknown error'}`;
          setState(prev => ({ ...prev, error: errorMessage }));
          onError?.(errorMessage);
        }
      }
    },
    [isSupported, initializeSpeechRecognition, onError]
  );

  // Stop transcription
  const stopTranscription = useCallback(() => {
    if (recognitionRef.current && state.isListening) {
      recognitionRef.current.stop();
    }
  }, [state.isListening]);

  // Clear transcript
  const clearTranscript = useCallback(() => {
    setState(prev => ({
      ...prev,
      transcript: '',
      interimTranscript: '',
      finalTranscript: '',
      confidence: 0,
      error: null,
    }));
  }, []);

  // Set language
  const setLanguage = useCallback((lang: string) => {
    setState(prev => ({ ...prev, language: lang }));
    if (recognitionRef.current) {
      recognitionRef.current.lang = lang;
    }
  }, []);

  // Transcribe audio blob (for recorded audio)
  const transcribeAudioBlob = useCallback(
    async (audioBlob: Blob, lang?: string): Promise<string> => {
      // For now, we'll return a placeholder since Web Speech API doesn't support audio blobs directly
      // In a real implementation, you would send this to a server-side service like Google Cloud Speech-to-Text
      return new Promise((resolve, reject) => {
        setTimeout(() => {
          // Simulate transcription delay
          const mockTranscriptions = {
            'he-IL': 'זהו סיפור מרגש על תכשיט מיוחד שמסמל אהבה ונאמנות...',
            'en-US':
              'This is an emotional story about a special piece of jewelry that symbolizes love and commitment...',
            'ar-SA': 'هذه قصة عاطفية عن قطعة مجوهرات خاصة ترمز إلى الحب والالتزام...',
          };

          const detectedLang = lang || detectLanguage('');
          const transcript =
            mockTranscriptions[detectedLang as keyof typeof mockTranscriptions] ||
            mockTranscriptions['en-US'];

          resolve(transcript);
        }, 2000); // Simulate 2-second processing time
      });
    },
    [detectLanguage]
  );

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, []);

  const controls: SpeechToTextControls = {
    startTranscription,
    stopTranscription,
    clearTranscript,
    transcribeAudioBlob,
    setLanguage,
  };

  return [state, controls];
}

// Utility function to format confidence as percentage
export function formatConfidence(confidence: number): string {
  return `${Math.round(confidence * 100)}%`;
}

// Utility function to get language display name
export function getLanguageDisplayName(langCode: string): string {
  const languageNames: Record<string, string> = {
    'he-IL': 'עברית',
    'en-US': 'English',
    'ar-SA': 'العربية',
    'fr-FR': 'Français',
    'es-ES': 'Español',
  };

  return languageNames[langCode] || langCode;
}

// Add to window interface for TypeScript
declare global {
  interface Window {
    SpeechRecognition: typeof SpeechRecognition;
    webkitSpeechRecognition: typeof SpeechRecognition;
  }
}
