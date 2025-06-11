'use client';

import React, { useState } from 'react';
import { useTranslation } from 'next-i18next';
import { Mic, MicOff, Play, Pause, Square, Trash2, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card, CardContent } from '@/components/ui/Card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import {
  AudioVisualizer,
  AudioLevelIndicator,
  RecordingTimer,
} from '@/components/ui/AudioVisualizer';
import { useVoiceRecorder } from '@/lib/hooks/useVoiceRecorder';
import { useRTL } from '@/lib/hooks/useRTL';
import { cn } from '@/lib/utils';

interface VoiceRecorderProps {
  onRecordingComplete?: (audioBlob: Blob, duration: number) => void;
  onError?: (error: string) => void;
  maxDuration?: number;
  className?: string;
  disabled?: boolean;
  showAdvancedControls?: boolean;
}

export function VoiceRecorder({
  onRecordingComplete,
  onError,
  maxDuration = 300, // 5 minutes
  className,
  disabled = false,
  showAdvancedControls = true,
}: VoiceRecorderProps) {
  const { t } = useTranslation('story');
  const { isRTL } = useRTL();
  const [isPlaying, setIsPlaying] = useState(false);

  const [state, controls] = useVoiceRecorder({
    maxDuration,
    onRecordingComplete: (blob, duration) => {
      onRecordingComplete?.(blob, duration);
    },
    onError: error => {
      onError?.(error);
    },
  });

  const {
    isRecording,
    isPaused,
    recordingTime,
    audioLevel,
    error,
    audioBlob,
    audioUrl,
    isSupported,
  } = state;

  const {
    startRecording,
    stopRecording,
    pauseRecording,
    resumeRecording,
    clearRecording,
    playRecording,
    pausePlayback,
  } = controls;

  // Handle playback state
  const handlePlayRecording = () => {
    if (isPlaying) {
      pausePlayback();
      setIsPlaying(false);
    } else {
      playRecording();
      setIsPlaying(true);
    }
  };

  // Browser support check
  if (!isSupported) {
    return (
      <Alert className={className}>
        <AlertDescription>
          {t(
            'voiceRecorder.notSupported',
            'Voice recording is not supported in this browser. Please use a modern browser with microphone support.'
          )}
        </AlertDescription>
      </Alert>
    );
  }

  // Recording status
  const getRecordingStatus = () => {
    if (isRecording && isPaused) {
      return { text: t('voiceRecorder.paused', 'Paused'), variant: 'secondary' as const };
    }
    if (isRecording) {
      return { text: t('voiceRecorder.recording', 'Recording'), variant: 'destructive' as const };
    }
    if (audioBlob) {
      return {
        text: t('voiceRecorder.completed', 'Recording Complete'),
        variant: 'default' as const,
      };
    }
    return { text: t('voiceRecorder.ready', 'Ready to Record'), variant: 'outline' as const };
  };

  const status = getRecordingStatus();

  return (
    <Card className={cn('w-full', className)}>
      <CardContent className="p-6">
        {/* Header with status */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Mic className="h-5 w-5 text-muted-foreground" />
            <h3 className="text-lg font-semibold">{t('voiceRecorder.title', 'Voice Recording')}</h3>
          </div>
          <Badge variant={status.variant}>{status.text}</Badge>
        </div>

        {/* Error display */}
        {error && (
          <Alert variant="destructive" className="mb-4">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Main recording interface */}
        <div className="space-y-6">
          {/* Audio visualization */}
          <div className="flex flex-col items-center space-y-4">
            <AudioVisualizer
              audioLevel={audioLevel}
              isRecording={isRecording}
              isPaused={isPaused}
              style="circle"
              size="lg"
              className="mb-2"
            />

            {/* Recording timer */}
            {(isRecording || audioBlob) && (
              <RecordingTimer
                seconds={recordingTime}
                maxDuration={maxDuration}
                className="text-center"
              />
            )}
          </div>

          {/* Audio level indicator */}
          {isRecording && (
            <AudioLevelIndicator level={audioLevel} isActive={!isPaused} className="mx-4" />
          )}

          {/* Control buttons */}
          <div className="flex flex-wrap items-center justify-center gap-3">
            {!isRecording && !audioBlob && (
              <Button
                size="lg"
                onClick={startRecording}
                disabled={disabled}
                className={cn(
                  'flex items-center gap-2 px-6 py-3 rounded-full',
                  'bg-red-500 hover:bg-red-600 text-white'
                )}
              >
                <Mic className="h-5 w-5" />
                {t('voiceRecorder.startRecording', 'Start Recording')}
              </Button>
            )}

            {isRecording && (
              <>
                {!isPaused ? (
                  <Button
                    size="lg"
                    variant="outline"
                    onClick={pauseRecording}
                    className="flex items-center gap-2 px-4 py-3 rounded-full"
                  >
                    <Pause className="h-5 w-5" />
                    {t('voiceRecorder.pause', 'Pause')}
                  </Button>
                ) : (
                  <Button
                    size="lg"
                    onClick={resumeRecording}
                    className="flex items-center gap-2 px-4 py-3 rounded-full bg-green-500 hover:bg-green-600 text-white"
                  >
                    <Play className="h-5 w-5" />
                    {t('voiceRecorder.resume', 'Resume')}
                  </Button>
                )}

                <Button
                  size="lg"
                  variant="outline"
                  onClick={stopRecording}
                  className="flex items-center gap-2 px-4 py-3 rounded-full"
                >
                  <Square className="h-4 w-4" />
                  {t('voiceRecorder.stop', 'Stop')}
                </Button>
              </>
            )}

            {audioBlob && !isRecording && (
              <>
                <Button
                  size="lg"
                  variant="outline"
                  onClick={handlePlayRecording}
                  className="flex items-center gap-2 px-4 py-3 rounded-full"
                >
                  {isPlaying ? (
                    <>
                      <Pause className="h-5 w-5" />
                      {t('voiceRecorder.pausePlayback', 'Pause Playback')}
                    </>
                  ) : (
                    <>
                      <Play className="h-5 w-5" />
                      {t('voiceRecorder.playback', 'Play Recording')}
                    </>
                  )}
                </Button>

                <Button
                  size="lg"
                  variant="outline"
                  onClick={() => {
                    startRecording();
                  }}
                  className="flex items-center gap-2 px-4 py-3 rounded-full"
                >
                  <RotateCcw className="h-5 w-5" />
                  {t('voiceRecorder.recordAgain', 'Record Again')}
                </Button>

                {showAdvancedControls && (
                  <Button
                    size="lg"
                    variant="ghost"
                    onClick={clearRecording}
                    className="flex items-center gap-2 px-4 py-3 rounded-full text-muted-foreground hover:text-destructive"
                  >
                    <Trash2 className="h-4 w-4" />
                    {t('voiceRecorder.clear', 'Clear')}
                  </Button>
                )}
              </>
            )}
          </div>

          {/* Recording info */}
          {(isRecording || audioBlob) && (
            <div className="text-center text-sm text-muted-foreground space-y-1">
              {isRecording && (
                <p>
                  {t(
                    'voiceRecorder.recordingTip',
                    'Speak clearly into your microphone. Click stop when finished.'
                  )}
                </p>
              )}
              {audioBlob && (
                <p>
                  {t(
                    'voiceRecorder.completeTip',
                    'Recording saved. You can play it back or record again.'
                  )}
                </p>
              )}
            </div>
          )}

          {/* Advanced controls */}
          {showAdvancedControls && (isRecording || audioBlob) && (
            <div className="border-t pt-4 mt-6">
              <div className="flex flex-wrap items-center justify-center gap-2 text-xs text-muted-foreground">
                <span>
                  {t('voiceRecorder.maxDuration', 'Max duration: {{duration}}', {
                    duration: `${Math.floor(maxDuration / 60)}:${String(maxDuration % 60).padStart(2, '0')}`,
                  })}
                </span>
                {audioBlob && (
                  <>
                    <span>•</span>
                    <span>
                      {t('voiceRecorder.fileSize', 'Size: {{size}}', {
                        size: `${Math.round(audioBlob.size / 1024)}KB`,
                      })}
                    </span>
                  </>
                )}
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

// Compact voice recorder for inline use
interface CompactVoiceRecorderProps extends Omit<VoiceRecorderProps, 'showAdvancedControls'> {
  size?: 'sm' | 'md';
}

export function CompactVoiceRecorder({
  onRecordingComplete,
  onError,
  maxDuration = 300,
  className,
  disabled = false,
  size = 'md',
}: CompactVoiceRecorderProps) {
  const { t } = useTranslation('story');

  const [state, controls] = useVoiceRecorder({
    maxDuration,
    onRecordingComplete,
    onError,
  });

  const { isRecording, isPaused, recordingTime, audioLevel, error, audioBlob, isSupported } = state;
  const { startRecording, stopRecording, pauseRecording, resumeRecording } = controls;

  if (!isSupported) {
    return (
      <div className={cn('text-sm text-muted-foreground', className)}>
        {t('voiceRecorder.notSupported', 'Voice recording not supported')}
      </div>
    );
  }

  const buttonSize = size === 'sm' ? 'sm' : 'default';
  const iconSize = size === 'sm' ? 'h-4 w-4' : 'h-5 w-5';

  return (
    <div className={cn('flex items-center gap-2', className)}>
      {error && (
        <Alert variant="destructive" className="mb-2">
          <AlertDescription className="text-xs">{error}</AlertDescription>
        </Alert>
      )}

      <div className="flex items-center gap-2">
        {!isRecording && !audioBlob && (
          <Button size={buttonSize} onClick={startRecording} disabled={disabled}>
            <Mic className={iconSize} />
          </Button>
        )}

        {isRecording && (
          <>
            {!isPaused ? (
              <Button size={buttonSize} variant="outline" onClick={pauseRecording}>
                <Pause className={iconSize} />
              </Button>
            ) : (
              <Button size={buttonSize} onClick={resumeRecording}>
                <Play className={iconSize} />
              </Button>
            )}

            <Button size={buttonSize} variant="outline" onClick={stopRecording}>
              <Square className={cn(iconSize, 'h-3 w-3')} />
            </Button>
          </>
        )}

        {(isRecording || audioBlob) && (
          <div className="flex items-center gap-2">
            <AudioVisualizer
              audioLevel={audioLevel}
              isRecording={isRecording}
              isPaused={isPaused}
              style="bars"
              size={size}
            />

            <RecordingTimer seconds={recordingTime} maxDuration={maxDuration} className="text-xs" />
          </div>
        )}
      </div>
    </div>
  );
}
