'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { VoiceRecorder, CompactVoiceRecorder } from '@/components/forms/VoiceRecorder';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Mic, Download, Upload } from 'lucide-react';
import { LanguageProvider } from '@/components/providers/LanguageProvider';

export default function VoiceDemoPage() {
  const [recordings, setRecordings] = useState<
    Array<{
      id: string;
      blob: Blob;
      duration: number;
      timestamp: Date;
      size: number;
    }>
  >([]);
  const [error, setError] = useState<string | null>(null);

  const handleRecordingComplete = (audioBlob: Blob, duration: number) => {
    const recording = {
      id: `recording-${Date.now()}`,
      blob: audioBlob,
      duration,
      timestamp: new Date(),
      size: audioBlob.size,
    };

    setRecordings(prev => [recording, ...prev]);
    setError(null);
  };

  const handleError = (errorMessage: string) => {
    setError(errorMessage);
  };

  const downloadRecording = (recording: (typeof recordings)[0]) => {
    const url = URL.createObjectURL(recording.blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `recording-${recording.timestamp.toISOString().split('T')[0]}.webm`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const clearAllRecordings = () => {
    recordings.forEach(recording => {
      const url = URL.createObjectURL(recording.blob);
      URL.revokeObjectURL(url);
    });
    setRecordings([]);
  };

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`;
    return `${Math.round(bytes / (1024 * 1024))} MB`;
  };

  return (
    <LanguageProvider>
      <div className="min-h-screen bg-background p-4">
        <div className="max-w-4xl mx-auto space-y-8">
          {/* Header */}
          <div className="text-center space-y-4">
            <h1 className="text-4xl font-bold tracking-tight">Voice Recorder Demo</h1>
            <p className="text-xl text-muted-foreground">
              Test voice recording functionality for GemsAI story capture
            </p>
          </div>

          {/* Error Display */}
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {/* Full Voice Recorder */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Mic className="h-5 w-5" />
                Full Voice Recorder
              </CardTitle>
              <CardDescription>
                Complete voice recording interface with visualization and controls
              </CardDescription>
            </CardHeader>
            <CardContent>
              <VoiceRecorder
                onRecordingComplete={handleRecordingComplete}
                onError={handleError}
                maxDuration={180} // 3 minutes for demo
                showAdvancedControls={true}
              />
            </CardContent>
          </Card>

          {/* Compact Voice Recorder */}
          <Card>
            <CardHeader>
              <CardTitle>Compact Voice Recorder</CardTitle>
              <CardDescription>
                Inline voice recording component for forms and smaller spaces
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <h4 className="text-sm font-medium">Medium Size:</h4>
                <CompactVoiceRecorder
                  onRecordingComplete={handleRecordingComplete}
                  onError={handleError}
                  size="md"
                  maxDuration={60} // 1 minute for demo
                />
              </div>

              <Separator />

              <div className="space-y-2">
                <h4 className="text-sm font-medium">Small Size:</h4>
                <CompactVoiceRecorder
                  onRecordingComplete={handleRecordingComplete}
                  onError={handleError}
                  size="sm"
                  maxDuration={60}
                />
              </div>
            </CardContent>
          </Card>

          {/* Recordings List */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Recorded Audio Files</CardTitle>
                  <CardDescription>Manage and download your recorded audio files</CardDescription>
                </div>
                {recordings.length > 0 && (
                  <Button variant="outline" onClick={clearAllRecordings}>
                    Clear All
                  </Button>
                )}
              </div>
            </CardHeader>
            <CardContent>
              {recordings.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Mic className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No recordings yet. Use the voice recorders above to create some!</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {recordings.map(recording => (
                    <div
                      key={recording.id}
                      className="flex items-center justify-between p-4 border rounded-lg"
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                          <Mic className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                          <div className="font-medium">
                            Recording {recording.timestamp.toLocaleTimeString()}
                          </div>
                          <div className="text-sm text-muted-foreground flex items-center gap-4">
                            <span>Duration: {formatDuration(recording.duration)}</span>
                            <span>Size: {formatFileSize(recording.size)}</span>
                            <Badge variant="outline">
                              {recording.timestamp.toLocaleDateString()}
                            </Badge>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <audio controls className="h-8" src={URL.createObjectURL(recording.blob)} />
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => downloadRecording(recording)}
                        >
                          <Download className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Features & Info */}
          <Card>
            <CardHeader>
              <CardTitle>Voice Recorder Features</CardTitle>
              <CardDescription>
                Comprehensive voice recording capabilities for story capture
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h4 className="font-semibold text-green-600">✅ Implemented Features:</h4>
                  <ul className="space-y-2 text-sm">
                    <li>• Web Audio API integration with real-time audio visualization</li>
                    <li>• Start, pause, resume, and stop recording controls</li>
                    <li>• Audio level monitoring with visual feedback</li>
                    <li>• Recording timer with maximum duration limits</li>
                    <li>• Playback functionality with audio controls</li>
                    <li>• Error handling for microphone permissions</li>
                    <li>• Browser compatibility detection</li>
                    <li>• Compressed audio format (WebM) for efficient storage</li>
                    <li>• RTL/LTR support for Hebrew interface</li>
                    <li>• Internationalization with Hebrew/English translations</li>
                  </ul>
                </div>

                <div className="space-y-4">
                  <h4 className="font-semibold text-blue-600">🔄 Next Steps (Task 7.3):</h4>
                  <ul className="space-y-2 text-sm">
                    <li>• Speech-to-text transcription integration</li>
                    <li>• Real-time transcription during recording</li>
                    <li>• Language detection (Hebrew/English)</li>
                    <li>• Transcription editing capabilities</li>
                    <li>• Integration with story submission workflow</li>
                    <li>• Audio upload to cloud storage (S3)</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </LanguageProvider>
  );
}
