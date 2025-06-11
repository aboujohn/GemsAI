// ElevenLabs Text-to-Speech Integration for Hebrew Voice Messages

interface ElevenLabsVoice {
  voice_id: string;
  name: string;
  category: string;
  description: string;
  accent?: string;
  age?: string;
  gender?: string;
  use_case?: string;
  language?: string;
}

interface TTSRequest {
  text: string;
  voice_id?: string;
  language?: 'hebrew' | 'english' | 'arabic';
  model_id?: string;
  voice_settings?: {
    stability: number;
    similarity_boost: number;
    style?: number;
    use_speaker_boost?: boolean;
  };
}

interface TTSResponse {
  success: boolean;
  audio_url?: string;
  audio_blob?: Blob;
  error?: string;
  voice_info?: ElevenLabsVoice;
}

// Default Hebrew voices (these would be actual ElevenLabs voice IDs)
const HEBREW_VOICES: Record<string, ElevenLabsVoice> = {
  // Male voices
  'david_hebrew': {
    voice_id: 'pNInz6obpgDQGcFmaJgB', // Example voice ID
    name: 'David (Hebrew)',
    category: 'premade',
    description: 'Clear, mature Hebrew male voice',
    accent: 'Israeli',
    age: 'middle_aged',
    gender: 'male',
    use_case: 'narration',
    language: 'hebrew'
  },
  'yosef_hebrew': {
    voice_id: 'EXAVITQu4vr4xnSDxMaL', // Example voice ID
    name: 'Yosef (Hebrew)',
    category: 'premade',
    description: 'Warm, friendly Hebrew male voice',
    accent: 'Israeli',
    age: 'young',
    gender: 'male',
    use_case: 'conversational',
    language: 'hebrew'
  },
  
  // Female voices
  'sarah_hebrew': {
    voice_id: 'ThT5KcBeYPX3keUQqHPh', // Example voice ID
    name: 'Sarah (Hebrew)',
    category: 'premade',
    description: 'Gentle, warm Hebrew female voice',
    accent: 'Israeli',
    age: 'young',
    gender: 'female',
    use_case: 'conversational',
    language: 'hebrew'
  },
  'rachel_hebrew': {
    voice_id: 'AZnzlk1XvdvUeBnXmlld', // Example voice ID
    name: 'Rachel (Hebrew)',
    category: 'premade',
    description: 'Professional, clear Hebrew female voice',
    accent: 'Israeli',
    age: 'middle_aged',
    gender: 'female',
    use_case: 'narration',
    language: 'hebrew'
  }
};

// English voices for fallback
const ENGLISH_VOICES: Record<string, ElevenLabsVoice> = {
  'bella': {
    voice_id: 'EXAVITQu4vr4xnSDxMaL',
    name: 'Bella',
    category: 'premade',
    description: 'American female voice',
    gender: 'female',
    use_case: 'narration'
  },
  'adam': {
    voice_id: 'pNInz6obpgDQGcFmaJgB',
    name: 'Adam',
    category: 'premade',
    description: 'American male voice',
    gender: 'male',
    use_case: 'narration'
  }
};

class ElevenLabsTTSService {
  private apiKey: string;
  private baseUrl: string = 'https://api.elevenlabs.io/v1';

  constructor(apiKey?: string) {
    this.apiKey = apiKey || process.env.ELEVENLABS_API_KEY || '';
    
    if (!this.apiKey) {
      console.warn('ElevenLabs API key not found. TTS functionality will be limited.');
    }
  }

  /**
   * Get available voices
   */
  async getVoices(): Promise<ElevenLabsVoice[]> {
    if (!this.apiKey) {
      // Return mock voices if no API key
      return Object.values({ ...HEBREW_VOICES, ...ENGLISH_VOICES });
    }

    try {
      const response = await fetch(`${this.baseUrl}/voices`, {
        headers: {
          'xi-api-key': this.apiKey
        }
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch voices: ${response.statusText}`);
      }

      const data = await response.json();
      return data.voices || [];
    } catch (error) {
      console.error('Error fetching voices:', error);
      return Object.values({ ...HEBREW_VOICES, ...ENGLISH_VOICES });
    }
  }

  /**
   * Get the best voice for a given language
   */
  getBestVoice(language: 'hebrew' | 'english' | 'arabic' = 'hebrew', gender?: 'male' | 'female'): ElevenLabsVoice {
    let voices: Record<string, ElevenLabsVoice>;
    
    switch (language) {
      case 'hebrew':
        voices = HEBREW_VOICES;
        break;
      case 'english':
        voices = ENGLISH_VOICES;
        break;
      default:
        voices = HEBREW_VOICES; // Default to Hebrew
    }

    // Filter by gender if specified
    const voiceList = Object.values(voices);
    if (gender) {
      const filteredVoices = voiceList.filter(voice => voice.gender === gender);
      if (filteredVoices.length > 0) {
        return filteredVoices[0];
      }
    }

    return voiceList[0];
  }

  /**
   * Generate speech from text
   */
  async generateSpeech(request: TTSRequest): Promise<TTSResponse> {
    const {
      text,
      voice_id,
      language = 'hebrew',
      model_id = 'eleven_multilingual_v2',
      voice_settings = {
        stability: 0.5,
        similarity_boost: 0.8,
        style: 0.5,
        use_speaker_boost: true
      }
    } = request;

    // Validate input
    if (!text || text.trim().length === 0) {
      return {
        success: false,
        error: 'Text is required for speech generation'
      };
    }

    if (text.length > 5000) {
      return {
        success: false,
        error: 'Text is too long. Maximum 5000 characters allowed.'
      };
    }

    // Get voice
    const selectedVoice = voice_id 
      ? { voice_id, name: 'Custom Voice' } as ElevenLabsVoice
      : this.getBestVoice(language);

    // If no API key, return mock response
    if (!this.apiKey) {
      return this.generateMockSpeech(text, selectedVoice, language);
    }

    try {
      const response = await fetch(`${this.baseUrl}/text-to-speech/${selectedVoice.voice_id}`, {
        method: 'POST',
        headers: {
          'Accept': 'audio/mpeg',
          'Content-Type': 'application/json',
          'xi-api-key': this.apiKey
        },
        body: JSON.stringify({
          text,
          model_id,
          voice_settings
        })
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`ElevenLabs API error: ${response.status} - ${errorText}`);
      }

      const audioBlob = await response.blob();
      
      // Create a URL for the audio blob
      const audioUrl = URL.createObjectURL(audioBlob);

      return {
        success: true,
        audio_url: audioUrl,
        audio_blob: audioBlob,
        voice_info: selectedVoice
      };
    } catch (error) {
      console.error('Error generating speech:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      };
    }
  }

  /**
   * Generate mock speech for development/demo purposes
   */
  private async generateMockSpeech(
    text: string, 
    voice: ElevenLabsVoice, 
    language: string
  ): Promise<TTSResponse> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Create a simple mock audio blob (silence)
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    const duration = Math.min(text.length * 0.1, 30); // Estimate duration based on text length
    const sampleRate = audioContext.sampleRate;
    const numSamples = duration * sampleRate;
    
    const audioBuffer = audioContext.createBuffer(1, numSamples, sampleRate);
    const channelData = audioBuffer.getChannelData(0);
    
    // Generate simple tone instead of silence for demo
    for (let i = 0; i < numSamples; i++) {
      channelData[i] = Math.sin(2 * Math.PI * 440 * i / sampleRate) * 0.1;
    }

    // Convert to blob (this is a simplified version)
    const audioUrl = 'data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmUdBDSG0fLNeSsFJ3nI8N2QQAoUXrTp66hVFApGn+DyvmUdBDSG0fLNeSsFJ3nI8N2QQAoUXrTp66hVFApGn+DyvmUdBDSG0fLNeSsFJ3nI8N2QQAoUXrTp66hVFApGn+DyvmUdBDSG0fLNeSsFJ3nI8N2QQAoUXrTp66hVFApGn+DyvmUdBDSG0fLNeSsFJ3nI8N2QQAoUXrTp66hVFApGn+DyvmUdBDSG0fLNeSsFJ3nI8N2QQAoUXrTp66hVFApGn+DyvmUdBDSG0fLNeSsFJ3nI8N2QQAoUXrTp66hVFApGn+DyvmUdBDSG0fLNeSsFJ3nI8N2QQAoUXrTp66hVFApGn+DyvmUdBDSG0fLNeSsFJ3nI8N2QQAoUXrTp66hVFA==';

    return {
      success: true,
      audio_url: audioUrl,
      voice_info: voice
    };
  }

  /**
   * Upload audio file to storage (for saving TTS results)
   */
  async uploadAudioToStorage(audioBlob: Blob, fileName: string): Promise<string | null> {
    try {
      // This would integrate with your storage service (AWS S3, etc.)
      // For now, return a mock URL
      const mockUrl = `https://storage.gemsai.com/audio/${fileName}`;
      console.log('Mock audio upload:', mockUrl);
      return mockUrl;
    } catch (error) {
      console.error('Error uploading audio:', error);
      return null;
    }
  }

  /**
   * Detect language from text
   */
  detectLanguage(text: string): 'hebrew' | 'english' | 'arabic' {
    // Hebrew Unicode range
    const hebrewPattern = /[\u0590-\u05FF]/;
    // Arabic Unicode range
    const arabicPattern = /[\u0600-\u06FF]/;

    if (hebrewPattern.test(text)) {
      return 'hebrew';
    } else if (arabicPattern.test(text)) {
      return 'arabic';
    }
    return 'english';
  }

  /**
   * Get voice samples for preview
   */
  async getVoiceSample(voiceId: string, sampleText?: string): Promise<TTSResponse> {
    const defaultSamples = {
      hebrew: 'שלום, זה דוגמה של הקול שלי',
      english: 'Hello, this is a sample of my voice',
      arabic: 'مرحبا، هذه عينة من صوتي'
    };

    return this.generateSpeech({
      text: sampleText || defaultSamples.hebrew,
      voice_id: voiceId,
      language: 'hebrew'
    });
  }
}

// Singleton instance
export const elevenLabsTTS = new ElevenLabsTTSService();

// Utility functions
export function formatTextForTTS(text: string): string {
  // Clean up text for better TTS pronunciation
  return text
    .replace(/\s+/g, ' ') // Normalize whitespace
    .replace(/[^\w\s\u0590-\u05FF\u0600-\u06FF.,!?]/g, '') // Keep only letters, spaces, and basic punctuation
    .trim();
}

export function estimateAudioDuration(text: string): number {
  // Rough estimate: 150 words per minute for Hebrew, 180 for English
  const wordsPerMinute = text.match(/[\u0590-\u05FF]/) ? 150 : 180;
  const wordCount = text.split(/\s+/).length;
  return Math.ceil((wordCount / wordsPerMinute) * 60); // Duration in seconds
}

export function getOptimalVoiceSettings(language: 'hebrew' | 'english' | 'arabic' = 'hebrew') {
  const settings = {
    hebrew: {
      stability: 0.6,
      similarity_boost: 0.8,
      style: 0.4,
      use_speaker_boost: true
    },
    english: {
      stability: 0.5,
      similarity_boost: 0.75,
      style: 0.5,
      use_speaker_boost: true
    },
    arabic: {
      stability: 0.65,
      similarity_boost: 0.85,
      style: 0.3,
      use_speaker_boost: true
    }
  };

  return settings[language];
}

// Types export
export type {
  ElevenLabsVoice,
  TTSRequest,
  TTSResponse
};