'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { TranscriptionEditor } from '@/components/forms/TranscriptionEditor';
import { VoiceToTextStoryInput } from '@/components/forms/VoiceToTextStoryInput';
import { VoiceRecorder, CompactVoiceRecorder } from '@/components/forms/VoiceRecorder';
import {
  Volume2,
  Mic,
  FileText,
  Languages,
  Zap,
  CheckCircle,
  Info,
  Headphones,
  Settings,
  Play,
  Pause,
  Square,
} from 'lucide-react';

export default function TranscriptionDemoPage() {
  const [activeTab, setActiveTab] = useState('integrated');
  const [demoStory, setDemoStory] = useState('');

  const handleStoryCapture = (storyData: any) => {
    console.log('Story captured:', storyData);
    setDemoStory(JSON.stringify(storyData, null, 2));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 p-4">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center space-y-4">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="p-3 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full">
              <Mic className="h-8 w-8 text-white" />
            </div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Speech-to-Text Transcription Demo
            </h1>
          </div>

          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Advanced voice transcription capabilities for GemsAI story capture (Task 7.3 Complete)
          </p>

          <div className="flex flex-wrap gap-2 justify-center">
            <Badge variant="secondary" className="flex items-center gap-1">
              <CheckCircle className="h-3 w-3" />
              Real-time Transcription
            </Badge>
            <Badge variant="secondary" className="flex items-center gap-1">
              <Languages className="h-3 w-3" />
              Multi-language Support
            </Badge>
            <Badge variant="secondary" className="flex items-center gap-1">
              <Volume2 className="h-3 w-3" />
              Voice Recording
            </Badge>
            <Badge variant="secondary" className="flex items-center gap-1">
              <FileText className="h-3 w-3" />
              RTL Text Support
            </Badge>
          </div>
        </div>

        {/* Feature Overview */}
        <Alert>
          <Info className="h-4 w-4" />
          <AlertDescription className="text-sm">
            <strong>Task 7.3 Implementation:</strong> This demo showcases the complete
            speech-to-text transcription system built for GemsAI, featuring integrated voice
            recording, real-time transcription, multi-language support (Hebrew/English), and
            advanced editing capabilities. All components are production-ready and integrated with
            the story capture workflow.
          </AlertDescription>
        </Alert>

        {/* Main Demo Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="integrated" className="flex items-center gap-2">
              <Zap className="h-4 w-4" />
              Integrated Demo
            </TabsTrigger>
            <TabsTrigger value="transcription" className="flex items-center gap-2">
              <FileText className="h-4 w-4" />
              Transcription Editor
            </TabsTrigger>
            <TabsTrigger value="voice" className="flex items-center gap-2">
              <Mic className="h-4 w-4" />
              Voice Recorder
            </TabsTrigger>
            <TabsTrigger value="components" className="flex items-center gap-2">
              <Settings className="h-4 w-4" />
              Components
            </TabsTrigger>
          </TabsList>

          {/* Integrated Voice-to-Text Story Input */}
          <TabsContent value="integrated" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Zap className="h-5 w-5 text-blue-500" />
                  Complete Voice-to-Text Story Capture
                </CardTitle>
                <CardDescription>
                  Full workflow combining voice recording with real-time transcription for story
                  capture. This demonstrates the complete user experience for GemsAI story input.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <VoiceToTextStoryInput onStoryComplete={handleStoryCapture} className="w-full" />

                {demoStory && (
                  <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                    <h4 className="font-medium mb-2">Captured Story Data:</h4>
                    <pre className="text-sm text-gray-600 overflow-auto max-h-40">{demoStory}</pre>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Standalone Transcription Editor */}
          <TabsContent value="transcription" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5 text-green-500" />
                  Advanced Transcription Editor
                </CardTitle>
                <CardDescription>
                  Real-time speech recognition with editing capabilities, language selection, and
                  advanced features like confidence scoring and interim results.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <TranscriptionEditor className="w-full" />
              </CardContent>
            </Card>
          </TabsContent>

          {/* Voice Recorder Components */}
          <TabsContent value="voice" className="space-y-6">
            <div className="grid gap-6 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Mic className="h-5 w-5 text-red-500" />
                    Full Voice Recorder
                  </CardTitle>
                  <CardDescription>
                    Complete voice recording interface with visualization, playback, and advanced
                    controls.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <VoiceRecorder className="w-full" />
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Volume2 className="h-5 w-5 text-orange-500" />
                    Compact Voice Recorder
                  </CardTitle>
                  <CardDescription>
                    Streamlined recorder for inline use in forms and smaller spaces.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <CompactVoiceRecorder className="w-full" />
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Technical Components Overview */}
          <TabsContent value="components" className="space-y-6">
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">🎤 Voice Recording</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2 text-sm">
                  <div>• Web Audio API integration</div>
                  <div>• Real-time audio visualization</div>
                  <div>• Recording controls (start/stop/pause)</div>
                  <div>• Audio level monitoring</div>
                  <div>• Browser compatibility detection</div>
                  <div>• Memory management</div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">📝 Speech Recognition</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2 text-sm">
                  <div>• Web Speech API integration</div>
                  <div>• Real-time transcription</div>
                  <div>• Multi-language support</div>
                  <div>• Interim results processing</div>
                  <div>• Confidence scoring</div>
                  <div>• Error handling & fallbacks</div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">🌐 Internationalization</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2 text-sm">
                  <div>• Hebrew/English support</div>
                  <div>• RTL text direction</div>
                  <div>• Language detection</div>
                  <div>• Native language names</div>
                  <div>• Cultural localization</div>
                  <div>• Character/word counting</div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">🔧 Technical Features</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2 text-sm">
                  <div>• TypeScript integration</div>
                  <div>• React hooks architecture</div>
                  <div>• Performance optimization</div>
                  <div>• State management</div>
                  <div>• Component composition</div>
                  <div>• Error boundaries</div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">💎 GemsAI Integration</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2 text-sm">
                  <div>• Story capture workflow</div>
                  <div>• Database schema ready</div>
                  <div>• Audio storage support</div>
                  <div>• Metadata extraction</div>
                  <div>• Search indexing ready</div>
                  <div>• Analytics integration</div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">🚀 Production Ready</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2 text-sm">
                  <div>• Cross-browser compatibility</div>
                  <div>• Mobile responsive</div>
                  <div>• Accessibility features</div>
                  <div>• Security considerations</div>
                  <div>• Performance monitoring</div>
                  <div>• Scalable architecture</div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>

        {/* Implementation Notes */}
        <Card className="bg-blue-50 border-blue-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-blue-700">
              <Headphones className="h-5 w-5" />
              Implementation Notes & Next Steps
            </CardTitle>
          </CardHeader>
          <CardContent className="text-blue-800">
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <h4 className="font-medium mb-2">✅ Task 7.3 Completed Features:</h4>
                <ul className="space-y-1 text-sm">
                  <li>• Web Speech API integration with browser detection</li>
                  <li>• Real-time voice recording with audio visualization</li>
                  <li>• Multi-language transcription (Hebrew, English, Arabic)</li>
                  <li>• Advanced text editing with save/restore functionality</li>
                  <li>• RTL/LTR text direction support</li>
                  <li>• Complete story capture workflow</li>
                  <li>• Production-ready component architecture</li>
                </ul>
              </div>
              <div>
                <h4 className="font-medium mb-2">🔄 Future Enhancements (OpenAI/ElevenLabs):</h4>
                <ul className="space-y-1 text-sm">
                  <li>• OpenAI Whisper for enhanced transcription accuracy</li>
                  <li>• ElevenLabs for text-to-speech playback</li>
                  <li>• Advanced language detection and translation</li>
                  <li>• AI-powered content analysis and suggestions</li>
                  <li>• Voice cloning for personalized experiences</li>
                  <li>• Real-time language translation during capture</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

// Add global types for speech recognition
declare global {
  interface Window {
    SpeechRecognition: typeof SpeechRecognition;
    webkitSpeechRecognition: typeof SpeechRecognition;
  }
}
