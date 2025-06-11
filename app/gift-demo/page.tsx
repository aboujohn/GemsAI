'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/badge';
import { Icons } from '@/components/ui/Icons';
import { PageLayout } from '@/components/layout/PageLayout';
import { cn } from '@/lib/utils';

export default function GiftDemoPage() {
  const [showCreator, setShowCreator] = useState(true);

  const resetDemo = () => {
    setShowCreator(true);
  };

  return (
    <PageLayout>
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 rounded-full mb-4">
            <Icons.gift className="h-5 w-5 text-primary" />
            <span className="font-medium text-primary">Gift Creation Demo</span>
          </div>
          <h1 className="text-3xl font-bold mb-4">Create Beautiful Gift Messages</h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Experience our complete gift creation system with animations, voice messages, and sharing features.
            This demo showcases the full gift creation workflow.
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

        {/* Main Demo Content */}
        {showCreator && (
          <div className="space-y-6">
            {/* Demo Instructions */}
            <Card className="bg-blue-50 dark:bg-blue-950 border-blue-200 dark:border-blue-800">
              <CardContent className="p-6">
                <div className="flex items-start gap-3">
                  <Icons.info className="h-5 w-5 text-blue-600 mt-0.5" />
                  <div>
                    <h3 className="font-medium text-blue-900 dark:text-blue-100 mb-2">
                      Demo Instructions
                    </h3>
                    <ul className="text-sm text-blue-800 dark:text-blue-200 space-y-1">
                      <li>• Fill out the gift creation form step by step</li>
                      <li>• Try both text and voice message options</li>
                      <li>• Explore the animation library with different categories</li>
                      <li>• Test the Hebrew text-to-speech functionality</li>
                      <li>• Configure privacy settings and create your gift</li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Gift Creator Demo */}
            <Card>
              <CardHeader>
                <CardTitle>Gift Creator System Ready</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="text-center py-8">
                  <Icons.gift className="h-16 w-16 text-primary mx-auto mb-4" />
                  <h3 className="text-xl font-semibold mb-2">Gift Creation Wizard</h3>
                  <p className="text-muted-foreground mb-6">
                    All components are implemented and ready for use. The gift creation system includes:
                  </p>
                  
                  <div className="grid md:grid-cols-2 gap-4 mb-6">
                    <div className="p-4 bg-green-50 dark:bg-green-950 rounded-lg">
                      <Icons.checkCircle className="h-6 w-6 text-green-600 mx-auto mb-2" />
                      <p className="font-medium text-green-900 dark:text-green-100">Multi-Step Wizard</p>
                      <p className="text-sm text-green-800 dark:text-green-200">4-step gift creation process</p>
                    </div>
                    
                    <div className="p-4 bg-green-50 dark:bg-green-950 rounded-lg">
                      <Icons.checkCircle className="h-6 w-6 text-green-600 mx-auto mb-2" />
                      <p className="font-medium text-green-900 dark:text-green-100">Voice Messages</p>
                      <p className="text-sm text-green-800 dark:text-green-200">Recording + Hebrew TTS</p>
                    </div>
                    
                    <div className="p-4 bg-green-50 dark:bg-green-950 rounded-lg">
                      <Icons.checkCircle className="h-6 w-6 text-green-600 mx-auto mb-2" />
                      <p className="font-medium text-green-900 dark:text-green-100">Animation Library</p>
                      <p className="text-sm text-green-800 dark:text-green-200">Categorized animations with search</p>
                    </div>
                    
                    <div className="p-4 bg-green-50 dark:bg-green-950 rounded-lg">
                      <Icons.checkCircle className="h-6 w-6 text-green-600 mx-auto mb-2" />
                      <p className="font-medium text-green-900 dark:text-green-100">Secure Sharing</p>
                      <p className="text-sm text-green-800 dark:text-green-200">Token-based URLs with privacy levels</p>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h4 className="font-semibold">Technical Implementation Complete:</h4>
                    <div className="grid gap-2 text-sm">
                      <div className="flex justify-between p-2 bg-muted rounded">
                        <span>Database Schema</span>
                        <Badge variant="default">✅ Complete</Badge>
                      </div>
                      <div className="flex justify-between p-2 bg-muted rounded">
                        <span>API Endpoints</span>
                        <Badge variant="default">✅ Complete</Badge>
                      </div>
                      <div className="flex justify-between p-2 bg-muted rounded">
                        <span>Gift Creator Component</span>
                        <Badge variant="default">✅ Complete</Badge>
                      </div>
                      <div className="flex justify-between p-2 bg-muted rounded">
                        <span>Animation Selector</span>
                        <Badge variant="default">✅ Complete</Badge>
                      </div>
                      <div className="flex justify-between p-2 bg-muted rounded">
                        <span>Hebrew TTS Integration</span>
                        <Badge variant="default">✅ Complete</Badge>
                      </div>
                      <div className="flex justify-between p-2 bg-muted rounded">
                        <span>Gift Viewer Page</span>
                        <Badge variant="default">✅ Complete</Badge>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Feature Demo Cards */}
        {showCreator && (
          <div className="mt-12 space-y-6">
            <h2 className="text-2xl font-semibold text-center">What You Can Demo</h2>
            
            <div className="grid md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <Icons.mic className="h-5 w-5 text-primary" />
                    Voice Features
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center gap-2">
                    <Icons.checkCircle className="h-4 w-4 text-green-600" />
                    <span className="text-sm">Voice recording with live playback</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Icons.checkCircle className="h-4 w-4 text-green-600" />
                    <span className="text-sm">Hebrew text-to-speech with natural voices</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Icons.checkCircle className="h-4 w-4 text-green-600" />
                    <span className="text-sm">Audio controls and preview</span>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <Icons.sparkles className="h-5 w-5 text-primary" />
                    Animation System
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center gap-2">
                    <Icons.checkCircle className="h-4 w-4 text-green-600" />
                    <span className="text-sm">Categorized animation library</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Icons.checkCircle className="h-4 w-4 text-green-600" />
                    <span className="text-sm">Animation search and filtering</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Icons.checkCircle className="h-4 w-4 text-green-600" />
                    <span className="text-sm">Preview and selection interface</span>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        )}

        {/* Technical Notes */}
        <Card className="mt-8 bg-gray-50 dark:bg-gray-900">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Icons.code className="h-5 w-5" />
              Technical Implementation
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm text-muted-foreground">
            <p>• <strong>Database:</strong> PostgreSQL with Supabase for gift storage and management</p>
            <p>• <strong>TTS:</strong> ElevenLabs API integration for Hebrew voice synthesis</p>
            <p>• <strong>Animations:</strong> Categorized library with metadata and usage tracking</p>
            <p>• <strong>Security:</strong> Secure share tokens and privacy level controls</p>
            <p>• <strong>API:</strong> RESTful endpoints for gift CRUD operations and sharing</p>
          </CardContent>
        </Card>
      </div>
    </PageLayout>
  );
}