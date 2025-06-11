'use client';

import { useState } from 'react';
import { SketchViewerSimple } from '@/components/ui/sketch-viewer-simple';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Icons } from '@/components/ui/Icons';

export default function SketchViewerDemo() {
  const [jobId, setJobId] = useState<string | null>(null);
  const [generating, setGenerating] = useState(false);

  // Mock emotion context data
  const emotionContext = {
    tags: ['love', 'romance', 'hope', 'joy', 'passion'],
    storyText: 'A beautiful love story about two souls meeting under the moonlight.',
    style: 'modern'
  };

  const handleGenerateSketch = async () => {
    try {
      setGenerating(true);
      const response = await fetch('/api/sketch/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          storyText: emotionContext.storyText,
          emotionTags: emotionContext.tags,
          style: emotionContext.style,
          variants: 3,
        }),
      });

      if (!response.ok) throw new Error('Failed to generate sketches');
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
    alert(`Feedback submitted!\nSketch: ${sketchId}\nRating: ${rating} stars\nComment: ${comment}`);
  };

  const handleShare = (sketch: any) => {
    console.log('Sharing sketch:', sketch);
    alert(`Sketch shared successfully!\nSketch ID: ${sketch.id}\nURL: ${sketch.url}`);
  };

  const demoJobIds = [
    'sketch_1703123456789_demo1',
    'sketch_1703123456790_demo2', 
    'sketch_1703123456791_demo3'
  ];

  return (
    <div className="container mx-auto py-8 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Sketch Viewer Demo - Task 14 Implementation</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="p-4 bg-blue-50 rounded-lg border">
              <h3 className="font-semibold mb-2">✅ Task 14 Complete</h3>
              <p className="text-sm">Sketch viewer with all required features.</p>
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-2">Story Context</h3>
              <p className="mb-3">{emotionContext.storyText}</p>
              
              <div className="flex flex-wrap gap-2 mb-4">
                {emotionContext.tags.map((tag, index) => (
                  <span key={index} className="px-2 py-1 bg-gray-100 rounded text-sm">
                    {tag}
                  </span>
                ))}
              </div>
            </div>

            <Button onClick={handleGenerateSketch} disabled={generating}>
              {generating ? 'Generating...' : 'Generate Sketches'}
            </Button>
          </div>
        </CardContent>
      </Card>

      <SketchViewerSimple
        jobId={jobId || undefined}
        emotionContext={emotionContext}
        autoRefresh={true}
        refreshInterval={3000}
      />

      {/* Features Documentation */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Icons.checkCircle className="h-5 w-5 text-green-500" />
            Implemented Features (Task 14)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-semibold mb-3 text-green-700 dark:text-green-300">Core Features</h4>
              <ul className="space-y-2 text-sm">
                <li className="flex items-center gap-2">
                  <Icons.check className="h-4 w-4 text-green-500" />
                  Responsive layout design
                </li>
                <li className="flex items-center gap-2">
                  <Icons.check className="h-4 w-4 text-green-500" />
                  Sketch loading with placeholder/skeleton
                </li>
                <li className="flex items-center gap-2">
                  <Icons.check className="h-4 w-4 text-green-500" />
                  Emotional context display alongside sketch
                </li>
                <li className="flex items-center gap-2">
                  <Icons.check className="h-4 w-4 text-green-500" />
                  Sketch variant selector
                </li>
                <li className="flex items-center gap-2">
                  <Icons.check className="h-4 w-4 text-green-500" />
                  Feedback mechanism (rating, comments)
                </li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold mb-3 text-green-700 dark:text-green-300">Advanced Features</h4>
              <ul className="space-y-2 text-sm">
                <li className="flex items-center gap-2">
                  <Icons.check className="h-4 w-4 text-green-500" />
                  Sketch sharing functionality
                </li>
                <li className="flex items-center gap-2">
                  <Icons.check className="h-4 w-4 text-green-500" />
                  Zoom/pan controls for sketch viewing
                </li>
                <li className="flex items-center gap-2">
                  <Icons.check className="h-4 w-4 text-green-500" />
                  Animation for sketch reveal
                </li>
                <li className="flex items-center gap-2">
                  <Icons.check className="h-4 w-4 text-green-500" />
                  Loading states during generation
                </li>
                <li className="flex items-center gap-2">
                  <Icons.check className="h-4 w-4 text-green-500" />
                  Error handling for failed loading
                </li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 