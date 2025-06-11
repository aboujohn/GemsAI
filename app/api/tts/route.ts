import { NextRequest, NextResponse } from 'next/server';
import { elevenLabsTTS, formatTextForTTS, getOptimalVoiceSettings } from '@/lib/services/elevenlabs-tts';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      text,
      language = 'hebrew',
      voice_id,
      gender,
      save_to_storage = false
    } = body;

    // Validate input
    if (!text || typeof text !== 'string') {
      return NextResponse.json({ error: 'Text is required' }, { status: 400 });
    }

    if (text.length > 5000) {
      return NextResponse.json({ 
        error: 'Text is too long. Maximum 5000 characters allowed.' 
      }, { status: 400 });
    }

    // Clean and format text for TTS
    const formattedText = formatTextForTTS(text);
    
    if (formattedText.length === 0) {
      return NextResponse.json({ error: 'No valid text found after formatting' }, { status: 400 });
    }

    // Get optimal voice settings for the language
    const voiceSettings = getOptimalVoiceSettings(language);

    // Generate speech
    const result = await elevenLabsTTS.generateSpeech({
      text: formattedText,
      voice_id,
      language,
      voice_settings
    });

    if (!result.success) {
      return NextResponse.json({ 
        error: result.error || 'Failed to generate speech' 
      }, { status: 500 });
    }

    // Optionally save to storage
    let permanentUrl: string | null = null;
    if (save_to_storage && result.audio_blob) {
      const fileName = `tts_${Date.now()}_${Math.random().toString(36).substr(2, 9)}.mp3`;
      permanentUrl = await elevenLabsTTS.uploadAudioToStorage(result.audio_blob, fileName);
    }

    return NextResponse.json({
      success: true,
      audio_url: result.audio_url,
      permanent_url: permanentUrl,
      voice_info: result.voice_info,
      text_length: formattedText.length,
      estimated_duration: Math.ceil(formattedText.length * 0.1), // Rough estimate
      language_detected: elevenLabsTTS.detectLanguage(formattedText)
    });
  } catch (error) {
    console.error('TTS API Error:', error);
    return NextResponse.json({ 
      error: 'Internal server error' 
    }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const action = searchParams.get('action');

    switch (action) {
      case 'voices':
        // Get available voices
        const voices = await elevenLabsTTS.getVoices();
        return NextResponse.json({ voices });

      case 'sample':
        // Get voice sample
        const voiceId = searchParams.get('voice_id');
        const sampleText = searchParams.get('text');
        
        if (!voiceId) {
          return NextResponse.json({ error: 'Voice ID is required' }, { status: 400 });
        }

        const sample = await elevenLabsTTS.getVoiceSample(voiceId, sampleText || undefined);
        return NextResponse.json(sample);

      default:
        return NextResponse.json({ 
          error: 'Invalid action. Supported actions: voices, sample' 
        }, { status: 400 });
    }
  } catch (error) {
    console.error('TTS API Error:', error);
    return NextResponse.json({ 
      error: 'Internal server error' 
    }, { status: 500 });
  }
}