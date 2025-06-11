'use client';

import { useState, useEffect } from 'react';
import { SketchViewer } from '@/components/ui/sketch-viewer';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/badge';
import { Icons } from '@/components/ui/Icons';

type StoryPageParams = {
  id: string;
};

export default function StoryPage({ params }: { params: Promise<StoryPageParams> }) {
  const [resolvedParams, setResolvedParams] = useState<StoryPageParams | null>(null);
  const [jobId, setJobId] = useState<string | null>(null);
  const [generating, setGenerating] = useState(false);

  useEffect(() => {
    params.then(setResolvedParams);
  }, [params]);

  // Mock emotion context data
  const emotionContext = {
    tags: ['love', 'romance', 'hope', 'joy'],
    storyText: 'A beautiful love story about two souls meeting under the moonlight, sharing dreams and creating memories that will last forever.',
    style: 'modern'
  };

  const handleGenerateSketch = async () => {
    try {
      setGenerating(true);
      
      // Call the sketch generation API
      const response = await fetch('/api/sketch/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          storyText: emotionContext.storyText,
          emotionTags: emotionContext.tags,
          style: emotionContext.style,
          variants: 3,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to generate sketches');
      }

      const result = await response.json();
      setJobId(result.jobId);
    } catch (error) {
      console.error('Error generating sketches:', error);
    } finally {
      setGenerating(false);
    }
  };

  const handleSketchSelect = (sketch: any) => {
    console.log('Selected sketch:', sketch);
  };

  const handleFeedbackSubmit = (sketchId: string, rating: number, comment: string) => {
    console.log('Feedback submitted:', { sketchId, rating, comment });
    // In a real app, this would send feedback to your backend
  };

  const handleShare = (sketch: any) => {
    console.log('Sharing sketch:', sketch);
    // In a real app, this would handle sharing functionality
  };

  if (!resolvedParams) {
    return (
      <div className="container mx-auto py-8">
        <div className="animate-pulse">
          <div className="h-8 bg-muted rounded w-1/4 mb-4"></div>
          <div className="h-4 bg-muted rounded w-1/2"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 space-y-6">
      {/* Story Header */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Icons.heart className="h-5 w-5 text-red-500" />
            Story Details - ID: {resolvedParams.id}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <h3 className="text-lg font-semibold mb-2">Story Text</h3>
              <p className="text-muted-foreground">{emotionContext.storyText}</p>
            </div>
            
            <div>
              <h3 className="text-lg font-semibold mb-2">Emotion Tags</h3>
              <div className="flex flex-wrap gap-2">
                {emotionContext.tags.map((tag, index) => (
                  <Badge key={index} variant="outline">
                    {tag}
                  </Badge>
                ))}
              </div>
            </div>

            <div className="flex gap-4">
              <Button
                onClick={handleGenerateSketch}
                loading={generating}
                disabled={generating}
                className="flex items-center gap-2"
              >
                <Icons.palette className="h-4 w-4" />
                {generating ? 'Generating Sketches...' : 'Generate AI Sketches'}
              </Button>
              
              {jobId && (
                <Badge variant="secondary" className="flex items-center gap-1">
                  <Icons.checkCircle className="h-3 w-3" />
                  Job ID: {jobId}
                </Badge>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Sketch Viewer */}
      <SketchViewer
        jobId={jobId || undefined}
        emotionContext={emotionContext}
        onSketchSelect={handleSketchSelect}
        onFeedbackSubmit={handleFeedbackSubmit}
        onShare={handleShare}
        autoRefresh={true}
        refreshInterval={3000}
      />

      {/* Instructions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Icons.info className="h-5 w-5" />
            How to Test the Sketch Viewer
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ol className="list-decimal list-inside space-y-2 text-sm">
            <li>Click "Generate AI Sketches" to start the generation process</li>
            <li>Watch the progress bar and status updates in real-time</li>
            <li>Once completed, browse through the generated sketch variants</li>
            <li>Click on different sketches to view them in the main viewer</li>
            <li>Use zoom controls to examine sketch details</li>
            <li>Provide feedback using the feedback button</li>
            <li>Try the share functionality</li>
            <li>Notice the emotional context display and generation metadata</li>
          </ol>
          
          <div className="mt-4 p-4 bg-muted rounded-lg">
            <h4 className="font-medium mb-2">Features Implemented:</h4>
            <ul className="text-sm space-y-1">
              <li>✅ Responsive layout design</li>
              <li>✅ Sketch loading with placeholder/skeleton</li>
              <li>✅ Emotional context display</li>
              <li>✅ Sketch variant selector</li>
              <li>✅ Feedback mechanism (rating, comments)</li>
              <li>✅ Sketch sharing functionality</li>
              <li>✅ Zoom/pan controls</li>
              <li>✅ Animation for sketch reveal</li>
              <li>✅ Loading states during generation</li>
              <li>✅ Error handling for failed loading</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
