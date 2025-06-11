'use client';

import * as React from 'react';
import { useState, useCallback, useRef, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { Card, CardContent, CardHeader, CardTitle } from './Card';
import { Button } from './Button';
import { Badge } from './badge';
import { Progress } from './progress';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './dialog';
import { Textarea } from './textarea';
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

export function SketchViewer({
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
  const [zoom, setZoom] = useState(1);
  const [showFeedbackDialog, setShowFeedbackDialog] = useState(false);
  const [feedbackRating, setFeedbackRating] = useState(0);
  const [feedbackComment, setFeedbackComment] = useState('');
  const [showShareDialog, setShowShareDialog] = useState(false);
  const [currentSketchForFeedback, setCurrentSketchForFeedback] = useState<Sketch | null>(null);
  
  const imageRef = useRef<HTMLImageElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  // Fetch sketch status
  const fetchStatus = useCallback(async () => {
    if (!jobId) return;
    
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch(`/api/sketch/status?jobId=${jobId}`);
      if (!response.ok) {
        throw new Error('Failed to fetch sketch status');
      }
      
      const data: SketchStatus = await response.json();
      setStatus(data);
      
      // If completed and sketches available, select first sketch by default
      if (data.status === 'completed' && data.sketches && data.sketches.length > 0 && !selectedSketch) {
        setSelectedSketch(data.sketches[0]);
        onSketchSelect?.(data.sketches[0]);
      }
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  }, [jobId, selectedSketch, onSketchSelect]);

  // Auto-refresh effect
  useEffect(() => {
    if (!jobId || !autoRefresh) return;

    const startPolling = () => {
      fetchStatus();
      
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
      
      intervalRef.current = setInterval(() => {
        fetchStatus();
      }, refreshInterval);
    };

    startPolling();

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [jobId, autoRefresh, refreshInterval, fetchStatus]);

  // Stop polling when completed or failed
  useEffect(() => {
    if (status && (status.status === 'completed' || status.status === 'failed')) {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    }
  }, [status]);

  // Handle sketch selection
  const handleSketchSelect = (sketch: Sketch) => {
    setSelectedSketch(sketch);
    setZoom(1); // Reset zoom when selecting new sketch
    onSketchSelect?.(sketch);
  };

  // Handle zoom
  const handleZoomIn = () => setZoom(prev => Math.min(prev + 0.25, 3));
  const handleZoomOut = () => setZoom(prev => Math.max(prev - 0.25, 0.25));
  const handleZoomReset = () => setZoom(1);

  // Handle feedback
  const handleFeedbackSubmit = () => {
    if (currentSketchForFeedback && feedbackRating > 0) {
      onFeedbackSubmit?.(currentSketchForFeedback.id, feedbackRating, feedbackComment);
      setShowFeedbackDialog(false);
      setFeedbackRating(0);
      setFeedbackComment('');
      setCurrentSketchForFeedback(null);
    }
  };

  const openFeedbackDialog = (sketch: Sketch) => {
    setCurrentSketchForFeedback(sketch);
    setShowFeedbackDialog(true);
  };

  // Handle sharing
  const handleShare = async (sketch: Sketch) => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'AI Generated Sketch',
          text: `Check out this AI-generated sketch based on emotions: ${emotionContext?.tags.join(', ')}`,
          url: sketch.url,
        });
      } catch (err) {
        // Fallback to copy URL
        navigator.clipboard.writeText(sketch.url);
      }
    } else {
      // Fallback for browsers that don't support Web Share API
      navigator.clipboard.writeText(sketch.url);
    }
    onShare?.(sketch);
  };

  // Loading skeleton component
  const SketchSkeleton = () => (
    <div className="animate-pulse">
      <div className="aspect-square bg-muted rounded-lg mb-4"></div>
      <div className="space-y-2">
        <div className="h-4 bg-muted rounded w-3/4"></div>
        <div className="h-3 bg-muted rounded w-1/2"></div>
      </div>
    </div>
  );

  if (!jobId) {
    return (
      <Card className={cn('p-8 text-center', className)}>
        <CardContent>
          <Icons.palette className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold mb-2">No Sketch Generation in Progress</h3>
          <p className="text-muted-foreground">
            Start generating sketches to view them here.
          </p>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className={cn('p-8 text-center border-destructive', className)}>
        <CardContent>
          <Icons.alertCircle className="mx-auto h-12 w-12 text-destructive mb-4" />
          <h3 className="text-lg font-semibold mb-2 text-destructive">Error Loading Sketches</h3>
          <p className="text-muted-foreground mb-4">{error}</p>
          <Button onClick={fetchStatus} variant="outline">
            <Icons.refreshCw className="mr-2 h-4 w-4" />
            Try Again
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className={cn('space-y-6', className)}>
      {/* Status and Progress */}
      {status && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Icons.palette className="h-5 w-5" />
              Sketch Generation Status
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">
                  Status: <Badge variant={status.status === 'completed' ? 'default' : 'secondary'}>
                    {status.status}
                  </Badge>
                </span>
                <span className="text-sm text-muted-foreground">
                  Job ID: {status.jobId}
                </span>
              </div>
              
              {status.progress !== undefined && (
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Progress</span>
                    <span>{status.progress}%</span>
                  </div>
                  <Progress value={status.progress} className="h-2" />
                </div>
              )}
              
              {status.message && (
                <p className="text-sm text-muted-foreground">{status.message}</p>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Emotion Context Display */}
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
                    <Badge key={index} variant="outline" className="flex items-center gap-1">
                      <Icons.heart className="h-3 w-3" />
                      {tag}
                    </Badge>
                  ))}
                </div>
              </div>
              
              {emotionContext.style && (
                <div>
                  <h4 className="text-sm font-medium mb-2">Style</h4>
                  <Badge variant="secondary">{emotionContext.style}</Badge>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Sketch Variants Selector */}
      {status?.sketches && status.sketches.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Icons.image className="h-5 w-5" />
              Available Sketches
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {status.sketches.map((sketch) => (
                <div
                  key={sketch.id}
                  className={cn(
                    "relative cursor-pointer group rounded-lg border overflow-hidden transition-all hover:shadow-md",
                    selectedSketch?.id === sketch.id && "ring-2 ring-primary"
                  )}
                  onClick={() => handleSketchSelect(sketch)}
                >
                  <div className="aspect-square relative">
                    <img
                      src={sketch.url}
                      alt={`Sketch variant ${sketch.variant}`}
                      className="w-full h-full object-cover transition-transform group-hover:scale-105"
                    />
                    {selectedSketch?.id === sketch.id && (
                      <div className="absolute inset-0 bg-primary/10 flex items-center justify-center">
                        <Icons.check className="h-6 w-6 text-primary" />
                      </div>
                    )}
                  </div>
                  <div className="p-2">
                    <p className="text-xs font-medium">Variant {sketch.variant}</p>
                    <p className="text-xs text-muted-foreground">{sketch.style}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Main Sketch Viewer */}
      {selectedSketch && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Icons.eye className="h-5 w-5" />
                Sketch Viewer
              </CardTitle>
              <div className="flex items-center gap-2">
                {/* Zoom Controls */}
                <div className="flex items-center gap-1 border rounded-md">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleZoomOut}
                    disabled={zoom <= 0.25}
                  >
                    <Icons.zoomOut className="h-4 w-4" />
                  </Button>
                  <span className="px-2 text-sm font-medium min-w-[3rem] text-center">
                    {Math.round(zoom * 100)}%
                  </span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleZoomIn}
                    disabled={zoom >= 3}
                  >
                    <Icons.zoomIn className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleZoomReset}
                  >
                    <Icons.rotateCcw className="h-4 w-4" />
                  </Button>
                </div>

                {/* Action Buttons */}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => openFeedbackDialog(selectedSketch)}
                >
                  <Icons.messageSquare className="h-4 w-4 mr-1" />
                  Feedback
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleShare(selectedSketch)}
                >
                  <Icons.share2 className="h-4 w-4 mr-1" />
                  Share
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {/* Image Display */}
              <div
                ref={containerRef}
                className="relative overflow-auto border rounded-lg bg-muted/20 flex items-center justify-center min-h-[400px]"
              >
                <img
                  ref={imageRef}
                  src={selectedSketch.url}
                  alt={`Generated sketch - ${selectedSketch.metadata.prompt}`}
                  className="max-w-none transition-transform duration-200"
                  style={{
                    transform: `scale(${zoom})`,
                    transformOrigin: 'center center',
                  }}
                  onLoad={() => {
                    // Add animation for sketch reveal
                    if (imageRef.current) {
                      imageRef.current.style.opacity = '0';
                      setTimeout(() => {
                        if (imageRef.current) {
                          imageRef.current.style.transition = 'opacity 0.5s ease-in-out';
                          imageRef.current.style.opacity = '1';
                        }
                      }, 100);
                    }
                  }}
                />
              </div>

              {/* Sketch Metadata */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div>
                  <h4 className="font-medium mb-1">Generation Details</h4>
                  <div className="space-y-1 text-muted-foreground">
                    <p>Model: {selectedSketch.metadata.model}</p>
                    <p>Style: {selectedSketch.style}</p>
                    <p>Variant: {selectedSketch.variant}</p>
                    <p>Generated: {new Date(selectedSketch.metadata.generatedAt).toLocaleString()}</p>
                  </div>
                </div>
                <div>
                  <h4 className="font-medium mb-1">Prompt Used</h4>
                  <p className="text-muted-foreground text-xs leading-relaxed">
                    {selectedSketch.metadata.prompt}
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Loading State for Pending/Processing */}
      {status && ['queued', 'processing'].includes(status.status) && (
        <Card>
          <CardHeader>
            <CardTitle>Generating Sketches...</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {Array.from({ length: 3 }).map((_, index) => (
                <SketchSkeleton key={index} />
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Feedback Dialog */}
      <Dialog open={showFeedbackDialog} onOpenChange={setShowFeedbackDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Provide Feedback</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium">Rating</label>
              <div className="flex gap-2 mt-2">
                {[1, 2, 3, 4, 5].map((rating) => (
                  <Button
                    key={rating}
                    variant={feedbackRating >= rating ? "default" : "outline"}
                    size="sm"
                    onClick={() => setFeedbackRating(rating)}
                  >
                    <Icons.star className="h-4 w-4" />
                  </Button>
                ))}
              </div>
            </div>
            <div>
              <label className="text-sm font-medium">Comment (optional)</label>
              <Textarea
                value={feedbackComment}
                onChange={(e) => setFeedbackComment(e.target.value)}
                placeholder="Share your thoughts about this sketch..."
                className="mt-2"
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button
                variant="outline"
                onClick={() => setShowFeedbackDialog(false)}
              >
                Cancel
              </Button>
              <Button
                onClick={handleFeedbackSubmit}
                disabled={feedbackRating === 0}
              >
                Submit Feedback
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
} 