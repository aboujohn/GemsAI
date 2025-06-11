'use client';

import React, { useState, useCallback, useEffect } from 'react';
import { useTranslation } from 'next-i18next';
import {
  Mic,
  MicOff,
  Edit3,
  Save,
  RotateCcw,
  Volume2,
  Languages,
  CheckCircle,
  AlertCircle,
  Loader2,
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Progress } from '@/components/ui/progress';
import {
  useSpeechToText,
  SUPPORTED_LANGUAGES,
  formatConfidence,
  getLanguageDisplayName,
} from '@/lib/hooks/useSpeechToText';
import { useRTL } from '@/lib/hooks/useRTL';
import { cn } from '@/lib/utils';

interface TranscriptionEditorProps {
  onTranscriptChange?: (transcript: string, confidence: number) => void;
  onLanguageChange?: (language: string) => void;
  initialTranscript?: string;
  initialLanguage?: string;
  audioBlob?: Blob | null;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
  showLanguageSelector?: boolean;
  showConfidence?: boolean;
  maxLength?: number;
}

export function TranscriptionEditor({
  onTranscriptChange,
  onLanguageChange,
  initialTranscript = '',
  initialLanguage = 'he-IL',
  audioBlob,
  placeholder,
  className,
  disabled = false,
  showLanguageSelector = true,
  showConfidence = true,
  maxLength = 5000,
}: TranscriptionEditorProps) {
  const { t } = useTranslation('story');
  const { isRTL } = useRTL();

  // Local state
  const [isEditing, setIsEditing] = useState(false);
  const [editedTranscript, setEditedTranscript] = useState(initialTranscript);
  const [isProcessingAudio, setIsProcessingAudio] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState(initialLanguage);

  // Speech-to-text hook
  const [speechState, speechControls] = useSpeechToText({
    language: selectedLanguage,
    continuous: true,
    interimResults: true,
    onTranscriptionComplete: (transcript, confidence) => {
      setEditedTranscript(prev => prev + ' ' + transcript);
      onTranscriptChange?.(editedTranscript + ' ' + transcript, confidence);
    },
    onError: error => {
      console.error('Speech recognition error:', error);
    },
  });

  const {
    isTranscribing,
    transcript,
    interimTranscript,
    finalTranscript,
    confidence,
    error,
    isSupported,
    isListening,
  } = speechState;

  const {
    startTranscription,
    stopTranscription,
    clearTranscript,
    transcribeAudioBlob,
    setLanguage,
  } = speechControls;

  // Handle language change
  const handleLanguageChange = useCallback(
    (newLanguage: string) => {
      setSelectedLanguage(newLanguage);
      setLanguage(newLanguage);
      onLanguageChange?.(newLanguage);
    },
    [setLanguage, onLanguageChange]
  );

  // Handle transcript editing
  const handleTranscriptEdit = useCallback(
    (value: string) => {
      setEditedTranscript(value);
      if (isEditing) {
        onTranscriptChange?.(value, confidence);
      }
    },
    [isEditing, confidence, onTranscriptChange]
  );

  // Save edited transcript
  const saveTranscript = useCallback(() => {
    setIsEditing(false);
    onTranscriptChange?.(editedTranscript, confidence);
  }, [editedTranscript, confidence, onTranscriptChange]);

  // Start real-time transcription
  const startRealTimeTranscription = useCallback(() => {
    clearTranscript();
    startTranscription(selectedLanguage);
  }, [clearTranscript, startTranscription, selectedLanguage]);

  // Process audio blob transcription
  const processAudioTranscription = useCallback(async () => {
    if (!audioBlob) return;

    setIsProcessingAudio(true);
    try {
      const transcript = await transcribeAudioBlob(audioBlob, selectedLanguage);
      setEditedTranscript(transcript);
      onTranscriptChange?.(transcript, 0.95); // Mock high confidence for demo
    } catch (error) {
      console.error('Audio transcription error:', error);
    } finally {
      setIsProcessingAudio(false);
    }
  }, [audioBlob, selectedLanguage, transcribeAudioBlob, onTranscriptChange]);

  // Update edited transcript when speech recognition provides results
  useEffect(() => {
    if (transcript && !isEditing) {
      setEditedTranscript(transcript);
    }
  }, [transcript, isEditing]);

  // Auto-process audio blob when it changes
  useEffect(() => {
    if (audioBlob && !editedTranscript) {
      processAudioTranscription();
    }
  }, [audioBlob, editedTranscript, processAudioTranscription]);

  // Get transcript status
  const getTranscriptStatus = () => {
    if (isProcessingAudio) {
      return {
        text: t('transcription.processing', 'Processing Audio'),
        variant: 'secondary' as const,
        icon: Loader2,
      };
    }
    if (isTranscribing && isListening) {
      return {
        text: t('transcription.listening', 'Listening'),
        variant: 'destructive' as const,
        icon: Mic,
      };
    }
    if (editedTranscript) {
      return {
        text: t('transcription.ready', 'Transcription Ready'),
        variant: 'default' as const,
        icon: CheckCircle,
      };
    }
    return {
      text: t('transcription.noTranscript', 'No Transcript'),
      variant: 'outline' as const,
      icon: MicOff,
    };
  };

  const status = getTranscriptStatus();
  const StatusIcon = status.icon;

  // Calculate character and word counts
  const charCount = editedTranscript.length;
  const wordCount = editedTranscript
    .trim()
    .split(/\s+/)
    .filter(word => word.length > 0).length;

  return (
    <Card className={cn('w-full', className)}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Volume2 className="h-5 w-5" />
            {t('transcription.title', 'Speech Transcription')}
          </CardTitle>
          <Badge variant={status.variant} className="flex items-center gap-1">
            <StatusIcon className={cn('h-3 w-3', isProcessingAudio && 'animate-spin')} />
            {status.text}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Language Selector */}
        {showLanguageSelector && (
          <div className="flex items-center gap-2">
            <Languages className="h-4 w-4 text-muted-foreground" />
            <Select value={selectedLanguage} onValueChange={handleLanguageChange}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder={t('transcription.selectLanguage', 'Select Language')} />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(SUPPORTED_LANGUAGES).map(([key, value]) => (
                  <SelectItem key={key} value={value}>
                    {getLanguageDisplayName(value)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}

        {/* Error Display */}
        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Browser Support Check */}
        {!isSupported && (
          <Alert>
            <AlertDescription>
              {t(
                'transcription.notSupported',
                'Speech recognition is not supported in this browser. You can still edit the transcript manually.'
              )}
            </AlertDescription>
          </Alert>
        )}

        {/* Audio Processing Progress */}
        {isProcessingAudio && (
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span>{t('transcription.processingAudio', 'Processing audio file...')}</span>
            </div>
            <Progress value={undefined} className="w-full" />
          </div>
        )}

        {/* Real-time Transcription Controls */}
        {isSupported && !audioBlob && (
          <div className="flex items-center gap-2">
            {!isTranscribing ? (
              <Button
                onClick={startRealTimeTranscription}
                disabled={disabled}
                className="flex items-center gap-2"
              >
                <Mic className="h-4 w-4" />
                {t('transcription.startListening', 'Start Listening')}
              </Button>
            ) : (
              <Button
                onClick={stopTranscription}
                variant="outline"
                className="flex items-center gap-2"
              >
                <MicOff className="h-4 w-4" />
                {t('transcription.stopListening', 'Stop Listening')}
              </Button>
            )}

            {isSupported && audioBlob && (
              <Button
                onClick={processAudioTranscription}
                disabled={isProcessingAudio}
                variant="outline"
                className="flex items-center gap-2"
              >
                <Volume2 className="h-4 w-4" />
                {t('transcription.transcribeAudio', 'Transcribe Audio')}
              </Button>
            )}
          </div>
        )}

        {/* Transcript Display/Editor */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium">
              {t('transcription.transcript', 'Transcript')}
            </label>
            <div className="flex items-center gap-2">
              {showConfidence && confidence > 0 && (
                <Badge variant="outline" className="text-xs">
                  {t('transcription.confidence', 'Confidence')}: {formatConfidence(confidence)}
                </Badge>
              )}
              {!isEditing ? (
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => setIsEditing(true)}
                  className="flex items-center gap-1"
                >
                  <Edit3 className="h-3 w-3" />
                  {t('transcription.edit', 'Edit')}
                </Button>
              ) : (
                <div className="flex items-center gap-1">
                  <Button size="sm" onClick={saveTranscript} className="flex items-center gap-1">
                    <Save className="h-3 w-3" />
                    {t('transcription.save', 'Save')}
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => {
                      setIsEditing(false);
                      setEditedTranscript(transcript || initialTranscript);
                    }}
                  >
                    <RotateCcw className="h-3 w-3" />
                  </Button>
                </div>
              )}
            </div>
          </div>

          <div className="relative">
            <Textarea
              value={editedTranscript}
              onChange={e => handleTranscriptEdit(e.target.value)}
              placeholder={
                placeholder ||
                t('transcription.placeholder', 'Your transcribed text will appear here...')
              }
              className={cn(
                'min-h-32 resize-none',
                isRTL && 'text-right',
                isTranscribing && 'ring-2 ring-primary ring-opacity-50',
                !isEditing && 'cursor-default'
              )}
              readOnly={!isEditing}
              maxLength={maxLength}
              dir={isRTL ? 'rtl' : 'ltr'}
            />

            {/* Interim transcript overlay */}
            {isTranscribing && interimTranscript && (
              <div
                className={cn(
                  'absolute bottom-2 left-2 right-2 p-2 bg-primary/10 rounded text-sm text-muted-foreground italic',
                  isRTL && 'text-right'
                )}
                dir={isRTL ? 'rtl' : 'ltr'}
              >
                {interimTranscript}
              </div>
            )}
          </div>

          {/* Character/Word Count */}
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <div className="flex items-center gap-4">
              <span>
                {t('transcription.characters', '{{count}} characters', { count: charCount })}
              </span>
              <span>{t('transcription.words', '{{count}} words', { count: wordCount })}</span>
            </div>
            {maxLength && (
              <span className={cn(charCount > maxLength * 0.9 && 'text-warning')}>
                {charCount}/{maxLength}
              </span>
            )}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-between pt-2 border-t">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              setEditedTranscript('');
              clearTranscript();
              onTranscriptChange?.('', 0);
            }}
            className="text-muted-foreground"
          >
            <RotateCcw className="h-4 w-4 mr-1" />
            {t('transcription.clear', 'Clear')}
          </Button>

          <div className="text-xs text-muted-foreground">
            {isTranscribing
              ? t('transcription.listeningTip', 'Speak clearly for better accuracy')
              : editedTranscript
                ? t('transcription.editTip', 'Click Edit to modify the transcript')
                : t('transcription.startTip', 'Start speaking or upload audio to begin')}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// Compact transcription display component
interface TranscriptDisplayProps {
  transcript: string;
  confidence?: number;
  language?: string;
  className?: string;
  showConfidence?: boolean;
}

export function TranscriptDisplay({
  transcript,
  confidence,
  language,
  className,
  showConfidence = true,
}: TranscriptDisplayProps) {
  const { t } = useTranslation('story');
  const { isRTL } = useRTL();

  if (!transcript) {
    return (
      <div className={cn('text-muted-foreground text-sm italic', className)}>
        {t('transcription.noTranscript', 'No transcript available')}
      </div>
    );
  }

  return (
    <div className={cn('space-y-2', className)}>
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium">{t('transcription.transcript', 'Transcript')}</span>
        <div className="flex items-center gap-2">
          {language && (
            <Badge variant="outline" className="text-xs">
              {getLanguageDisplayName(language)}
            </Badge>
          )}
          {showConfidence && confidence && confidence > 0 && (
            <Badge variant="outline" className="text-xs">
              {formatConfidence(confidence)}
            </Badge>
          )}
        </div>
      </div>
      <div
        className={cn('p-3 bg-muted/50 rounded-md text-sm', isRTL && 'text-right')}
        dir={isRTL ? 'rtl' : 'ltr'}
      >
        {transcript}
      </div>
    </div>
  );
}
