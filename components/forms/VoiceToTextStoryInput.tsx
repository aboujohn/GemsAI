'use client';

import React, { useState, useCallback, useRef } from 'react';
import { useTranslation } from 'next-i18next';
import { Mic, MicOff, FileText, Volume2, Settings, Save, Trash2, Play } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { VoiceRecorder } from '@/components/forms/VoiceRecorder';
import { TranscriptionEditor, TranscriptDisplay } from '@/components/forms/TranscriptionEditor';
import { AudioVisualizer } from '@/components/ui/AudioVisualizer';
import {
  useSpeechToText,
  SUPPORTED_LANGUAGES,
  getLanguageDisplayName,
} from '@/lib/hooks/useSpeechToText';
import { useVoiceRecorder } from '@/lib/hooks/useVoiceRecorder';
import { useRTL } from '@/lib/hooks/useRTL';
import { cn } from '@/lib/utils';

interface VoiceToTextStoryInputProps {
  onStoryComplete?: (story: {
    audioBlob?: Blob;
    transcript: string;
    language: string;
    confidence: number;
    duration?: number;
  }) => void;
  onDraftSave?: (story: {
    audioBlob?: Blob;
    transcript: string;
    language: string;
    confidence: number;
  }) => void;
  initialTranscript?: string;
  initialLanguage?: string;
  maxRecordingDuration?: number;
  maxTranscriptLength?: number;
  className?: string;
  disabled?: boolean;
}

export function VoiceToTextStoryInput({
  onStoryComplete,
  onDraftSave,
  initialTranscript = '',
  initialLanguage = 'he-IL',
  maxRecordingDuration = 600, // 10 minutes
  maxTranscriptLength = 5000,
  className,
  disabled = false,
}: VoiceToTextStoryInputProps) {
  const { t } = useTranslation('story');
  const { isRTL } = useRTL();

  // State
  const [activeTab, setActiveTab] = useState<'voice' | 'text'>('voice');
  const [currentTranscript, setCurrentTranscript] = useState(initialTranscript);
  const [transcriptConfidence, setTranscriptConfidence] = useState(0);
  const [selectedLanguage, setSelectedLanguage] = useState(initialLanguage);
  const [recordedAudio, setRecordedAudio] = useState<Blob | null>(null);
  const [recordingDuration, setRecordingDuration] = useState(0);
  const [isRecordingWithTranscription, setIsRecordingWithTranscription] = useState(false);

  // Voice recorder hook
  const [recorderState, recorderControls] = useVoiceRecorder({
    maxDuration: maxRecordingDuration,
    onRecordingComplete: (audioBlob, duration) => {
      setRecordedAudio(audioBlob);
      setRecordingDuration(duration);
      // Auto-switch to transcription tab after recording
      setActiveTab('text');
    },
    onError: error => {
      console.error('Recording error:', error);
    },
  });

  // Speech-to-text hook for real-time transcription
  const [speechState, speechControls] = useSpeechToText({
    language: selectedLanguage,
    continuous: true,
    interimResults: true,
    onTranscriptionComplete: (transcript, confidence) => {
      setCurrentTranscript(transcript);
      setTranscriptConfidence(confidence);
    },
    onError: error => {
      console.error('Speech recognition error:', error);
    },
  });

  // Handle transcript changes
  const handleTranscriptChange = useCallback((transcript: string, confidence: number) => {
    setCurrentTranscript(transcript);
    setTranscriptConfidence(confidence);
  }, []);

  // Handle language change
  const handleLanguageChange = useCallback((language: string) => {
    setSelectedLanguage(language);
  }, []);

  // Start recording with real-time transcription
  const startRecordingWithTranscription = useCallback(async () => {
    setIsRecordingWithTranscription(true);

    // Start both recording and transcription
    await recorderControls.startRecording();
    speechControls.startTranscription(selectedLanguage);
  }, [recorderControls, speechControls, selectedLanguage]);

  // Stop recording and transcription
  const stopRecordingWithTranscription = useCallback(() => {
    setIsRecordingWithTranscription(false);

    // Stop both recording and transcription
    recorderControls.stopRecording();
    speechControls.stopTranscription();
  }, [recorderControls, speechControls]);

  // Save story draft
  const saveDraft = useCallback(() => {
    if (!currentTranscript.trim()) return;

    const storyData = {
      audioBlob: recordedAudio,
      transcript: currentTranscript,
      language: selectedLanguage,
      confidence: transcriptConfidence,
    };

    onDraftSave?.(storyData);
  }, [currentTranscript, recordedAudio, selectedLanguage, transcriptConfidence, onDraftSave]);

  // Complete story
  const completeStory = useCallback(() => {
    if (!currentTranscript.trim()) return;

    const storyData = {
      audioBlob: recordedAudio,
      transcript: currentTranscript,
      language: selectedLanguage,
      confidence: transcriptConfidence,
      duration: recordingDuration,
    };

    onStoryComplete?.(storyData);
  }, [
    currentTranscript,
    recordedAudio,
    selectedLanguage,
    transcriptConfidence,
    recordingDuration,
    onStoryComplete,
  ]);

  // Clear everything
  const clearAll = useCallback(() => {
    setCurrentTranscript('');
    setTranscriptConfidence(0);
    setRecordedAudio(null);
    setRecordingDuration(0);
    recorderControls.clearRecording();
    speechControls.clearTranscript();
  }, [recorderControls, speechControls]);

  // Get current status
  const getCurrentStatus = () => {
    if (isRecordingWithTranscription || recorderState.isRecording) {
      return {
        text: t('voiceToText.recording', 'Recording & Transcribing'),
        variant: 'destructive' as const,
        icon: Mic,
      };
    }
    if (speechState.isTranscribing && !recorderState.isRecording) {
      return {
        text: t('voiceToText.listening', 'Live Transcription'),
        variant: 'secondary' as const,
        icon: Volume2,
      };
    }
    if (currentTranscript) {
      return {
        text: t('voiceToText.ready', 'Story Ready'),
        variant: 'default' as const,
        icon: FileText,
      };
    }
    return {
      text: t('voiceToText.waiting', 'Ready to Start'),
      variant: 'outline' as const,
      icon: MicOff,
    };
  };

  const status = getCurrentStatus();
  const StatusIcon = status.icon;

  return (
    <Card className={cn('w-full', className)}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <StatusIcon className="h-5 w-5" />
            {t('voiceToText.title', 'Voice-to-Text Story Input')}
          </CardTitle>
          <div className="flex items-center gap-2">
            <Badge variant={status.variant}>{status.text}</Badge>
            {selectedLanguage && (
              <Badge variant="outline">{getLanguageDisplayName(selectedLanguage)}</Badge>
            )}
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Quick Action Bar */}
        <div className="flex flex-wrap items-center justify-center gap-3 p-4 bg-muted/30 rounded-lg">
          {!isRecordingWithTranscription && !recorderState.isRecording ? (
            <Button
              size="lg"
              onClick={startRecordingWithTranscription}
              disabled={disabled}
              className="flex items-center gap-2 px-6 py-3 rounded-full bg-red-500 hover:bg-red-600 text-white"
            >
              <Mic className="h-5 w-5" />
              {t('voiceToText.startRecording', 'Start Recording & Transcription')}
            </Button>
          ) : (
            <Button
              size="lg"
              onClick={stopRecordingWithTranscription}
              variant="outline"
              className="flex items-center gap-2 px-6 py-3 rounded-full"
            >
              <MicOff className="h-5 w-5" />
              {t('voiceToText.stopRecording', 'Stop Recording')}
            </Button>
          )}

          {currentTranscript && (
            <>
              <Button
                size="lg"
                onClick={saveDraft}
                variant="outline"
                className="flex items-center gap-2"
              >
                <Save className="h-4 w-4" />
                {t('voiceToText.saveDraft', 'Save Draft')}
              </Button>

              <Button size="lg" onClick={completeStory} className="flex items-center gap-2">
                <FileText className="h-4 w-4" />
                {t('voiceToText.completeStory', 'Complete Story')}
              </Button>
            </>
          )}

          {(currentTranscript || recordedAudio) && (
            <Button
              size="lg"
              onClick={clearAll}
              variant="ghost"
              className="flex items-center gap-2 text-muted-foreground hover:text-destructive"
            >
              <Trash2 className="h-4 w-4" />
              {t('voiceToText.clearAll', 'Clear All')}
            </Button>
          )}
        </div>

        {/* Real-time Audio Visualization */}
        {(isRecordingWithTranscription || recorderState.isRecording) && (
          <div className="flex flex-col items-center space-y-4 p-6 bg-gradient-to-br from-primary/5 to-secondary/5 rounded-lg">
            <AudioVisualizer
              audioLevel={recorderState.audioLevel}
              isRecording={recorderState.isRecording}
              isPaused={recorderState.isPaused}
              style="circle"
              size="lg"
            />

            <div className="text-center space-y-2">
              <div className="font-mono text-2xl font-bold">
                {Math.floor(recorderState.recordingTime / 60)}:
                {String(recorderState.recordingTime % 60).padStart(2, '0')}
              </div>
              <div className="text-sm text-muted-foreground">
                {t('voiceToText.recordingProgress', 'Recording in progress...')}
              </div>
            </div>
          </div>
        )}

        {/* Live Transcript Preview */}
        {(speechState.transcript || speechState.interimTranscript) && (
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Volume2 className="h-4 w-4 text-primary" />
              <span className="text-sm font-medium">
                {t('voiceToText.liveTranscript', 'Live Transcript')}
              </span>
            </div>
            <div
              className={cn(
                'p-4 bg-primary/5 border border-primary/20 rounded-lg',
                isRTL && 'text-right'
              )}
              dir={isRTL ? 'rtl' : 'ltr'}
            >
              <span className="text-foreground">{speechState.transcript}</span>
              {speechState.interimTranscript && (
                <span className="text-muted-foreground italic ml-1">
                  {speechState.interimTranscript}
                </span>
              )}
            </div>
          </div>
        )}

        <Separator />

        {/* Tabbed Interface */}
        <Tabs value={activeTab} onValueChange={value => setActiveTab(value as 'voice' | 'text')}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="voice" className="flex items-center gap-2">
              <Mic className="h-4 w-4" />
              {t('voiceToText.voiceTab', 'Voice Recording')}
            </TabsTrigger>
            <TabsTrigger value="text" className="flex items-center gap-2">
              <FileText className="h-4 w-4" />
              {t('voiceToText.textTab', 'Transcript & Editing')}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="voice" className="space-y-4">
            <VoiceRecorder
              onRecordingComplete={(audioBlob, duration) => {
                setRecordedAudio(audioBlob);
                setRecordingDuration(duration);
              }}
              maxDuration={maxRecordingDuration}
              showAdvancedControls={true}
              disabled={disabled}
            />

            {recordedAudio && (
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">
                    {t('voiceToText.recordedAudio', 'Recorded Audio')}
                  </span>
                  <Badge variant="outline">
                    {Math.floor(recordingDuration / 60)}:
                    {String(recordingDuration % 60).padStart(2, '0')}
                  </Badge>
                </div>
                <audio controls src={URL.createObjectURL(recordedAudio)} className="w-full h-10" />
              </div>
            )}
          </TabsContent>

          <TabsContent value="text" className="space-y-4">
            <TranscriptionEditor
              onTranscriptChange={handleTranscriptChange}
              onLanguageChange={handleLanguageChange}
              initialTranscript={currentTranscript}
              initialLanguage={selectedLanguage}
              audioBlob={recordedAudio}
              maxLength={maxTranscriptLength}
              showLanguageSelector={true}
              showConfidence={true}
            />
          </TabsContent>
        </Tabs>

        {/* Story Summary */}
        {currentTranscript && (
          <div className="space-y-4 p-4 bg-muted/30 rounded-lg">
            <div className="flex items-center justify-between">
              <h4 className="font-semibold">{t('voiceToText.storySummary', 'Story Summary')}</h4>
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <span>
                  {currentTranscript.length} {t('voiceToText.characters', 'characters')}
                </span>
                <span>•</span>
                <span>
                  {
                    currentTranscript
                      .trim()
                      .split(/\s+/)
                      .filter(w => w.length > 0).length
                  }{' '}
                  {t('voiceToText.words', 'words')}
                </span>
                {recordingDuration > 0 && (
                  <>
                    <span>•</span>
                    <span>
                      {Math.floor(recordingDuration / 60)}:
                      {String(recordingDuration % 60).padStart(2, '0')}{' '}
                      {t('voiceToText.duration', 'duration')}
                    </span>
                  </>
                )}
              </div>
            </div>

            <TranscriptDisplay
              transcript={currentTranscript}
              confidence={transcriptConfidence}
              language={selectedLanguage}
              showConfidence={true}
            />
          </div>
        )}

        {/* Advanced Settings Dialog */}
        <div className="flex justify-center">
          <Dialog>
            <DialogTrigger asChild>
              <Button variant="ghost" size="sm" className="flex items-center gap-2">
                <Settings className="h-4 w-4" />
                {t('voiceToText.advancedSettings', 'Advanced Settings')}
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>{t('voiceToText.settings', 'Voice-to-Text Settings')}</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div className="text-sm text-muted-foreground">
                  {t(
                    'voiceToText.settingsDesc',
                    'Advanced settings for voice recording and transcription will be available here.'
                  )}
                </div>
                {/* Add advanced settings here in future iterations */}
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </CardContent>
    </Card>
  );
}

export default VoiceToTextStoryInput;
