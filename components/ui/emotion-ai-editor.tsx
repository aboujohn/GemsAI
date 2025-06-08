'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { Progress } from '@/components/ui/progress';
import { EmotionTagSelector } from './emotion-tag-selector';
import {
  EmotionAnalysisResult,
  EmotionTag,
  EmotionCategory,
  EMOTION_CATEGORIES,
} from '@/lib/types/emotions';
import {
  Check,
  X,
  Edit3,
  RefreshCw,
  AlertCircle,
  ThumbsUp,
  ThumbsDown,
  Eye,
  EyeOff,
  ChevronLeft,
  ChevronRight,
  MoreHorizontal,
  Lightbulb,
  Zap,
  Brain,
  CheckCircle,
  XCircle,
  Clock,
  BarChart3,
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface AIEmotionSuggestion {
  id: string;
  emotion: EmotionTag;
  confidence: number;
  reasoning: string;
  keywords: string[];
  isAccepted?: boolean;
  isRejected?: boolean;
  isModified?: boolean;
  userFeedback?: string;
  originalEmotion?: EmotionTag;
}

interface EmotionAIEditorProps {
  storyId: string;
  originalText: string;
  aiSuggestions: AIEmotionSuggestion[];
  currentTags: EmotionTag[];
  onTagsUpdate: (tags: EmotionTag[]) => void;
  onFeedbackSubmit: (
    suggestionId: string,
    feedback: string,
    rating: 'positive' | 'negative'
  ) => void;
  onSuggestionsRegenerate?: () => void;
  className?: string;
  showConfidence?: boolean;
  allowBatchOperations?: boolean;
  isLoading?: boolean;
}

interface SuggestionReviewState {
  [suggestionId: string]: {
    status: 'pending' | 'accepted' | 'rejected' | 'modified';
    modifiedTag?: EmotionTag;
    feedback?: string;
    rating?: 'positive' | 'negative';
  };
}

export function EmotionAIEditor({
  storyId,
  originalText,
  aiSuggestions,
  currentTags,
  onTagsUpdate,
  onFeedbackSubmit,
  onSuggestionsRegenerate,
  className,
  showConfidence = true,
  allowBatchOperations = true,
  isLoading = false,
}: EmotionAIEditorProps) {
  const [activeView, setActiveView] = useState<'suggestions' | 'comparison' | 'feedback'>(
    'suggestions'
  );
  const [selectedSuggestion, setSelectedSuggestion] = useState<string | null>(null);
  const [reviewState, setReviewState] = useState<SuggestionReviewState>({});
  const [showDetails, setShowDetails] = useState<{ [key: string]: boolean }>({});
  const [batchMode, setBatchMode] = useState(false);
  const [selectedForBatch, setSelectedForBatch] = useState<Set<string>>(new Set());

  // Initialize review state
  useEffect(() => {
    const initialState: SuggestionReviewState = {};
    aiSuggestions.forEach(suggestion => {
      initialState[suggestion.id] = {
        status: suggestion.isAccepted
          ? 'accepted'
          : suggestion.isRejected
            ? 'rejected'
            : suggestion.isModified
              ? 'modified'
              : 'pending',
        modifiedTag: suggestion.originalEmotion || suggestion.emotion,
      };
    });
    setReviewState(initialState);
  }, [aiSuggestions]);

  // Statistics
  const stats = useMemo(() => {
    const total = aiSuggestions.length;
    const accepted = Object.values(reviewState).filter(r => r.status === 'accepted').length;
    const rejected = Object.values(reviewState).filter(r => r.status === 'rejected').length;
    const modified = Object.values(reviewState).filter(r => r.status === 'modified').length;
    const pending = total - accepted - rejected - modified;

    return { total, accepted, rejected, modified, pending };
  }, [aiSuggestions, reviewState]);

  const handleSuggestionAction = (
    suggestionId: string,
    action: 'accept' | 'reject' | 'modify',
    modifiedTag?: EmotionTag
  ) => {
    setReviewState(prev => ({
      ...prev,
      [suggestionId]: {
        ...prev[suggestionId],
        status: action === 'modify' ? 'modified' : action === 'accept' ? 'accepted' : 'rejected',
        modifiedTag: modifiedTag || prev[suggestionId]?.modifiedTag,
      },
    }));

    // Update current tags based on action
    const suggestion = aiSuggestions.find(s => s.id === suggestionId);
    if (!suggestion) return;

    const newTags = [...currentTags];
    const existingIndex = newTags.findIndex(tag => tag.id === suggestion.emotion.id);

    if (action === 'accept') {
      if (existingIndex === -1) {
        newTags.push(suggestion.emotion);
      }
    } else if (action === 'modify' && modifiedTag) {
      if (existingIndex >= 0) {
        newTags[existingIndex] = modifiedTag;
      } else {
        newTags.push(modifiedTag);
      }
    } else if (action === 'reject') {
      if (existingIndex >= 0) {
        newTags.splice(existingIndex, 1);
      }
    }

    onTagsUpdate(newTags);
  };

  const handleBatchAction = (action: 'accept' | 'reject') => {
    selectedForBatch.forEach(suggestionId => {
      handleSuggestionAction(suggestionId, action);
    });
    setSelectedForBatch(new Set());
  };

  const handleFeedback = (
    suggestionId: string,
    feedback: string,
    rating: 'positive' | 'negative'
  ) => {
    setReviewState(prev => ({
      ...prev,
      [suggestionId]: {
        ...prev[suggestionId],
        feedback,
        rating,
      },
    }));
    onFeedbackSubmit(suggestionId, feedback, rating);
  };

  const toggleBatchSelection = (suggestionId: string) => {
    const newSelection = new Set(selectedForBatch);
    if (newSelection.has(suggestionId)) {
      newSelection.delete(suggestionId);
    } else {
      newSelection.add(suggestionId);
    }
    setSelectedForBatch(newSelection);
  };

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 0.8) return 'text-green-600 bg-green-100';
    if (confidence >= 0.6) return 'text-yellow-600 bg-yellow-100';
    return 'text-red-600 bg-red-100';
  };

  const SuggestionCard = ({ suggestion }: { suggestion: AIEmotionSuggestion }) => {
    const state = reviewState[suggestion.id];
    const isSelected = selectedForBatch.has(suggestion.id);
    const showDetailState = showDetails[suggestion.id];

    return (
      <Card
        className={cn(
          'transition-all duration-200',
          state?.status === 'accepted' && 'border-green-500 bg-green-50',
          state?.status === 'rejected' && 'border-red-500 bg-red-50',
          state?.status === 'modified' && 'border-blue-500 bg-blue-50',
          isSelected && 'ring-2 ring-blue-400'
        )}
      >
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              {batchMode && (
                <input
                  type="checkbox"
                  checked={isSelected}
                  onChange={() => toggleBatchSelection(suggestion.id)}
                  className="w-4 h-4"
                />
              )}

              <div>
                <div className="flex items-center gap-2">
                  <Badge
                    variant="secondary"
                    style={{
                      backgroundColor: suggestion.emotion.color + '20',
                      color: suggestion.emotion.color,
                      borderColor: suggestion.emotion.color,
                    }}
                  >
                    {suggestion.emotion.name}
                  </Badge>

                  {showConfidence && (
                    <Badge
                      variant="outline"
                      className={cn('text-xs', getConfidenceColor(suggestion.confidence))}
                    >
                      {(suggestion.confidence * 100).toFixed(0)}%
                    </Badge>
                  )}

                  <Badge variant="outline" className="text-xs">
                    {suggestion.emotion.intensity}
                  </Badge>
                </div>

                {suggestion.keywords.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-2">
                    {suggestion.keywords.slice(0, 3).map((keyword, index) => (
                      <span key={index} className="text-xs bg-gray-100 px-2 py-1 rounded">
                        {keyword}
                      </span>
                    ))}
                    {suggestion.keywords.length > 3 && (
                      <span className="text-xs text-gray-500">
                        +{suggestion.keywords.length - 3} more
                      </span>
                    )}
                  </div>
                )}
              </div>
            </div>

            <div className="flex items-center gap-1">
              <Button
                variant="ghost"
                size="sm"
                onClick={() =>
                  setShowDetails(prev => ({ ...prev, [suggestion.id]: !showDetailState }))
                }
              >
                {showDetailState ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </Button>

              {state?.status === 'pending' && (
                <>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleSuggestionAction(suggestion.id, 'accept')}
                    className="text-green-600 hover:text-green-700 hover:bg-green-50"
                  >
                    <Check className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleSuggestionAction(suggestion.id, 'reject')}
                    className="text-red-600 hover:text-red-700 hover:bg-red-50"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </>
              )}

              {state?.status !== 'pending' && (
                <Badge
                  variant="outline"
                  className={cn(
                    'text-xs',
                    state.status === 'accepted' && 'text-green-600 border-green-600',
                    state.status === 'rejected' && 'text-red-600 border-red-600',
                    state.status === 'modified' && 'text-blue-600 border-blue-600'
                  )}
                >
                  {state.status}
                </Badge>
              )}
            </div>
          </div>
        </CardHeader>

        {showDetailState && (
          <CardContent>
            <div className="space-y-3">
              <div>
                <h4 className="text-sm font-medium mb-1">AI Reasoning:</h4>
                <p className="text-sm text-gray-600">{suggestion.reasoning}</p>
              </div>

              <Separator />

              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setSelectedSuggestion(suggestion.id)}
                >
                  <Edit3 className="h-4 w-4 mr-1" />
                  Modify
                </Button>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    // Open feedback modal
                  }}
                >
                  <ThumbsUp className="h-4 w-4 mr-1" />
                  Feedback
                </Button>
              </div>
            </div>
          </CardContent>
        )}
      </Card>
    );
  };

  return (
    <div className={cn('space-y-6', className)}>
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Brain className="h-6 w-6 text-blue-500" />
            AI Emotion Suggestions
          </h2>
          <p className="text-gray-600">Review and edit AI-generated emotion tags for your story</p>
        </div>

        <div className="flex gap-2">
          {allowBatchOperations && (
            <Button
              variant={batchMode ? 'default' : 'outline'}
              size="sm"
              onClick={() => {
                setBatchMode(!batchMode);
                setSelectedForBatch(new Set());
              }}
            >
              Batch Mode
            </Button>
          )}

          {onSuggestionsRegenerate && (
            <Button
              variant="outline"
              size="sm"
              onClick={onSuggestionsRegenerate}
              disabled={isLoading}
            >
              <RefreshCw className={cn('h-4 w-4', isLoading && 'animate-spin')} />
            </Button>
          )}
        </div>
      </div>

      {/* Statistics */}
      <Card>
        <CardContent className="p-4">
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <div className="text-center">
              <p className="text-2xl font-bold">{stats.total}</p>
              <p className="text-sm text-gray-600">Total</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-gray-600">{stats.pending}</p>
              <p className="text-sm text-gray-600">Pending</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-green-600">{stats.accepted}</p>
              <p className="text-sm text-gray-600">Accepted</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-red-600">{stats.rejected}</p>
              <p className="text-sm text-gray-600">Rejected</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-blue-600">{stats.modified}</p>
              <p className="text-sm text-gray-600">Modified</p>
            </div>
          </div>

          <div className="mt-4">
            <div className="flex justify-between text-sm text-gray-600 mb-1">
              <span>Progress</span>
              <span>
                {(((stats.accepted + stats.rejected + stats.modified) / stats.total) * 100).toFixed(
                  0
                )}
                %
              </span>
            </div>
            <Progress
              value={((stats.accepted + stats.rejected + stats.modified) / stats.total) * 100}
              className="h-2"
            />
          </div>
        </CardContent>
      </Card>

      {/* Batch Actions */}
      {batchMode && selectedForBatch.size > 0 && (
        <Card className="border-blue-200 bg-blue-50">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <span className="text-blue-800">
                {selectedForBatch.size} suggestion{selectedForBatch.size !== 1 ? 's' : ''} selected
              </span>
              <div className="flex gap-2">
                <Button
                  size="sm"
                  onClick={() => handleBatchAction('accept')}
                  className="bg-green-600 hover:bg-green-700"
                >
                  <Check className="h-4 w-4 mr-1" />
                  Accept All
                </Button>
                <Button size="sm" variant="destructive" onClick={() => handleBatchAction('reject')}>
                  <X className="h-4 w-4 mr-1" />
                  Reject All
                </Button>
                <Button size="sm" variant="outline" onClick={() => setSelectedForBatch(new Set())}>
                  Clear
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Main Content */}
      <Tabs value={activeView} onValueChange={(value: any) => setActiveView(value)}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="suggestions">Suggestions</TabsTrigger>
          <TabsTrigger value="comparison">Comparison</TabsTrigger>
          <TabsTrigger value="feedback">Feedback</TabsTrigger>
        </TabsList>

        <TabsContent value="suggestions" className="space-y-4">
          {isLoading ? (
            <div className="flex items-center justify-center p-8">
              <RefreshCw className="h-6 w-6 animate-spin mr-2" />
              <span>Generating emotion suggestions...</span>
            </div>
          ) : aiSuggestions.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center">
                <Lightbulb className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No suggestions available</h3>
                <p className="text-gray-600">
                  No AI emotion suggestions were generated for this story.
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4">
              {aiSuggestions.map(suggestion => (
                <SuggestionCard key={suggestion.id} suggestion={suggestion} />
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="comparison" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Original Story</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="prose prose-sm max-w-none">
                  <p className="text-gray-700 leading-relaxed">{originalText}</p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Current Tags</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {currentTags.length === 0 ? (
                    <p className="text-gray-500 italic">No tags applied yet</p>
                  ) : (
                    <div className="flex flex-wrap gap-2">
                      {currentTags.map(tag => (
                        <Badge
                          key={tag.id}
                          variant="secondary"
                          style={{
                            backgroundColor: tag.color + '20',
                            color: tag.color,
                            borderColor: tag.color,
                          }}
                        >
                          {tag.name}
                        </Badge>
                      ))}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="feedback" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Feedback Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {Object.entries(reviewState).map(([suggestionId, state]) => {
                  const suggestion = aiSuggestions.find(s => s.id === suggestionId);
                  if (!suggestion || !state.feedback) return null;

                  return (
                    <div key={suggestionId} className="border rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <Badge variant="secondary">{suggestion.emotion.name}</Badge>
                        <Badge variant={state.rating === 'positive' ? 'default' : 'destructive'}>
                          {state.rating === 'positive' ? (
                            <ThumbsUp className="h-3 w-3" />
                          ) : (
                            <ThumbsDown className="h-3 w-3" />
                          )}
                        </Badge>
                      </div>
                      <p className="text-sm text-gray-600">{state.feedback}</p>
                    </div>
                  );
                })}

                {Object.values(reviewState).every(state => !state.feedback) && (
                  <p className="text-gray-500 italic text-center py-8">No feedback submitted yet</p>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Loading Overlay */}
      {isLoading && (
        <div className="absolute inset-0 bg-white bg-opacity-75 flex items-center justify-center">
          <div className="flex items-center gap-3">
            <RefreshCw className="h-5 w-5 animate-spin" />
            <span>Processing...</span>
          </div>
        </div>
      )}
    </div>
  );
}
