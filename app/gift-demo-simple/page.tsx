'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/badge';
import { Icons } from '@/components/ui/Icons';
import { PageLayout } from '@/components/layout/PageLayout';

export default function GiftDemoSimplePage() {
  const [step, setStep] = useState(1);

  return (
    <PageLayout>
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 rounded-full mb-4">
            <Icons.gift className="h-5 w-5 text-primary" />
            <span className="font-medium text-primary">Gift Creation Demo</span>
          </div>
          <h1 className="text-3xl font-bold mb-4">Create Beautiful Gift Messages</h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Experience our complete gift creation system with animations, voice messages, and sharing features.
          </p>
        </div>

        {/* Demo Features */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardHeader className="text-center">
              <Icons.sparkles className="h-8 w-8 text-primary mx-auto mb-2" />
              <CardTitle className="text-lg">Beautiful Animations</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground text-center">
                Choose from a library of categorized animations to make your gift special
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="text-center">
              <Icons.volume2 className="h-8 w-8 text-primary mx-auto mb-2" />
              <CardTitle className="text-lg">Voice Messages</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground text-center">
                Record your voice or use AI text-to-speech in Hebrew with natural voices
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="text-center">
              <Icons.share className="h-8 w-8 text-primary mx-auto mb-2" />
              <CardTitle className="text-lg">Secure Sharing</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground text-center">
                Generate secure shareable links with privacy controls and reaction features
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Simple Demo */}
        <Card>
          <CardHeader>
            <CardTitle>Gift Creation System Demo</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="text-center py-8">
              <Icons.gift className="h-16 w-16 text-primary mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">Gift System Components</h3>
              <p className="text-muted-foreground mb-6">
                All components have been implemented and are ready for integration
              </p>
              
              <div className="grid md:grid-cols-2 gap-4">
                <div className="p-4 bg-green-50 dark:bg-green-950 rounded-lg">
                  <Icons.checkCircle className="h-6 w-6 text-green-600 mx-auto mb-2" />
                  <p className="font-medium text-green-900 dark:text-green-100">Database Schema</p>
                  <p className="text-sm text-green-800 dark:text-green-200">Complete PostgreSQL schema with tables, indexes, and security</p>
                </div>
                
                <div className="p-4 bg-green-50 dark:bg-green-950 rounded-lg">
                  <Icons.checkCircle className="h-6 w-6 text-green-600 mx-auto mb-2" />
                  <p className="font-medium text-green-900 dark:text-green-100">API Routes</p>
                  <p className="text-sm text-green-800 dark:text-green-200">RESTful APIs for gifts, animations, reactions, and TTS</p>
                </div>
                
                <div className="p-4 bg-green-50 dark:bg-green-950 rounded-lg">
                  <Icons.checkCircle className="h-6 w-6 text-green-600 mx-auto mb-2" />
                  <p className="font-medium text-green-900 dark:text-green-100">Animation System</p>
                  <p className="text-sm text-green-800 dark:text-green-200">Categorized animation library with search and filtering</p>
                </div>
                
                <div className="p-4 bg-green-50 dark:bg-green-950 rounded-lg">
                  <Icons.checkCircle className="h-6 w-6 text-green-600 mx-auto mb-2" />
                  <p className="font-medium text-green-900 dark:text-green-100">Hebrew TTS</p>
                  <p className="text-sm text-green-800 dark:text-green-200">ElevenLabs integration for natural Hebrew voice synthesis</p>
                </div>
                
                <div className="p-4 bg-green-50 dark:bg-green-950 rounded-lg">
                  <Icons.checkCircle className="h-6 w-6 text-green-600 mx-auto mb-2" />
                  <p className="font-medium text-green-900 dark:text-green-100">Gift Viewer</p>
                  <p className="text-sm text-green-800 dark:text-green-200">Beautiful recipient experience with reactions and sharing</p>
                </div>
                
                <div className="p-4 bg-green-50 dark:bg-green-950 rounded-lg">
                  <Icons.checkCircle className="h-6 w-6 text-green-600 mx-auto mb-2" />
                  <p className="font-medium text-green-900 dark:text-green-100">Security & Privacy</p>
                  <p className="text-sm text-green-800 dark:text-green-200">Token-based sharing with multiple privacy levels</p>
                </div>
              </div>
            </div>

            {/* API Endpoints */}
            <div className="space-y-4">
              <h4 className="font-semibold">Available API Endpoints:</h4>
              <div className="grid gap-2 text-sm font-mono">
                <div className="flex justify-between p-2 bg-muted rounded">
                  <span>POST /api/gifts</span>
                  <Badge variant="outline">Create Gift</Badge>
                </div>
                <div className="flex justify-between p-2 bg-muted rounded">
                  <span>GET /api/gifts/share/[token]</span>
                  <Badge variant="outline">View Gift</Badge>
                </div>
                <div className="flex justify-between p-2 bg-muted rounded">
                  <span>GET /api/gifts/animations</span>
                  <Badge variant="outline">Animation Library</Badge>
                </div>
                <div className="flex justify-between p-2 bg-muted rounded">
                  <span>POST /api/tts</span>
                  <Badge variant="outline">Text-to-Speech</Badge>
                </div>
                <div className="flex justify-between p-2 bg-muted rounded">
                  <span>POST /api/gifts/reactions</span>
                  <Badge variant="outline">Gift Reactions</Badge>
                </div>
              </div>
            </div>

            {/* Sample Gift URL */}
            <div className="space-y-2">
              <h4 className="font-semibold">Sample Gift Sharing URL:</h4>
              <div className="p-3 bg-muted rounded font-mono text-sm break-all">
                https://your-domain.com/gift/ABC123XYZ789
              </div>
              <p className="text-xs text-muted-foreground">
                Recipients can view gifts, react with emotions, and add to favorites
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Technical Implementation */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Icons.code className="h-5 w-5" />
              Technical Implementation Summary
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <h5 className="font-medium mb-2">Backend Components:</h5>
                <ul className="space-y-1 text-muted-foreground">
                  <li>• Enhanced PostgreSQL schema with RLS</li>
                  <li>• RESTful API with authentication</li>
                  <li>• ElevenLabs TTS integration</li>
                  <li>• Secure token-based sharing</li>
                  <li>• Real-time reaction system</li>
                </ul>
              </div>
              <div>
                <h5 className="font-medium mb-2">Frontend Components:</h5>
                <ul className="space-y-1 text-muted-foreground">
                  <li>• Multi-step gift creation wizard</li>
                  <li>• Animation selection interface</li>
                  <li>• Voice recording & TTS UI</li>
                  <li>• Beautiful gift viewer page</li>
                  <li>• Reaction and sharing system</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </PageLayout>
  );
}