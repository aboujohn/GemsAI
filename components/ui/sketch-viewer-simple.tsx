'use client';

import * as React from 'react';
import { useState, useCallback, useRef, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { Card, CardContent, CardHeader, CardTitle } from './Card';
import { Button } from './Button';
import { Icons } from './Icons';

// Types for sketch data
interface Sketch {
  id: string;
  url: string;
  style: string;
  variant: number;
  metadata: {
    prompt: string;
    model: string;
    generatedAt: string;
  };
}

interface SketchStatus {
  jobId: string;
  status: 'queued' | 'processing' | 'completed' | 'failed';
  progress?: number;
  message?: string;
  sketches?: Sketch[];
  error?: string;
}

interface EmotionContext {
  tags: string[];
  storyText: string;
  style?: string;
}

interface SketchViewerProps {
  jobId?: string;
  emotionContext?: EmotionContext;
  className?: string;
  autoRefresh?: boolean;
  refreshInterval?: number;
  onSketchSelect?: (sketch: Sketch) => void;
  onFeedbackSubmit?: (sketchId: string, rating: number, comment: string) => void;
  onShare?: (sketch: Sketch) => void;
}

export function SketchViewerSimple({
  jobId,
  emotionContext,
  className,
  autoRefresh = true,
  refreshInterval = 3000,
  onSketchSelect,
  onFeedbackSubmit,
  onShare
}: SketchViewerProps) {
  const [status, setStatus] = useState<SketchStatus | null>(null);
  const [selectedSketch, setSelectedSketch] = useState<Sketch | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  return (
    <div className={cn("space-y-6", className)}>
      {/* No Job ID State */}
      {!jobId && (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Icons.palette className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No Sketch Selected</h3>
            <p className="text-muted-foreground text-center max-w-sm">
              Generate a new sketch or provide a job ID to view generated artwork.
            </p>
          </CardContent>
        </Card>
      )}

      {/* Emotional Context Display */}
      {emotionContext && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Icons.palette className="h-5 w-5" />
              Emotional Context
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <h4 className="text-sm font-medium mb-2">Story</h4>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {emotionContext.storyText}
                </p>
              </div>
              
              <div>
                <h4 className="text-sm font-medium mb-2">Emotion Tags</h4>
                <div className="flex flex-wrap gap-2">
                  {emotionContext.tags.map((tag, index) => (
                    <span key={index} className="inline-flex items-center gap-1 px-2 py-1 bg-gray-100 rounded text-sm">
                      <Icons.heart className="h-3 w-3" />
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
              
              {emotionContext.style && (
                <div>
                  <h4 className="text-sm font-medium mb-2">Style</h4>
                  <span className="px-2 py-1 bg-gray-200 rounded text-sm">{emotionContext.style}</span>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardContent className="p-8 text-center">
          <p>Simplified SketchViewer test component</p>
          <p className="text-sm text-muted-foreground mt-2">
            Job ID: {jobId || 'None'}
          </p>
        </CardContent>
      </Card>
    </div>
  );
} 