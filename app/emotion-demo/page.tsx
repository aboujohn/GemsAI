'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { EmotionTagSelector } from '@/components/ui/emotion-tag-selector';
import { EmotionVisualization } from '@/components/ui/emotion-visualization';
import { EmotionAnalyticsDashboard } from '@/components/ui/emotion-analytics-dashboard';
import { EmotionAIEditor } from '@/components/ui/emotion-ai-editor';
import { toast } from 'sonner';
import {
  Brain,
  Sparkles,
  BarChart3,
  Tags,
  Lightbulb,
  Play,
  RefreshCw,
  CheckCircle,
  Eye,
  Settings,
  Palette,
} from 'lucide-react';
import { cn } from '@/lib/utils';

// Mock data and types
import {
  EmotionTag,
  EmotionCategory,
  EMOTION_CATEGORIES,
  EmotionAnalysisResult,
} from '@/lib/types/emotions';

interface DemoState {
  storyText: string;
  isAnalyzing: boolean;
  analysisResult: EmotionAnalysisResult | null;
  currentTags: EmotionTag[];
  aiSuggestions: any[];
  selectedLanguage: 'en' | 'he' | 'ar';
}

// Sample stories for testing
const SAMPLE_STORIES = {
  en: {
    romantic:
      "When I first saw her walking down the aisle, my heart stopped. The way the light caught her grandmother's pearl necklace made me realize that this moment, this love, was meant to be eternal. I knew I wanted to give her something just as timeless.",
    nostalgic:
      "My mother's wedding ring has been passed down through three generations. Each time I look at it, I remember the strength and love of the women who wore it before me. I want to create something that honors their memory while starting my own legacy.",
    celebration:
      "After graduating medical school, I finally felt ready to propose. The joy and accomplishment we've shared throughout this journey deserves to be celebrated with something as brilliant as our future together.",
  },
  he: {
    romantic:
      'כשראיתי אותה לראשונה בהליכה לחופה, הלב שלי פסק לפעום. הדרך שבה האור נפל על שרשרת הפנינים של סבתא שלה גרמה לי להבין שהרגע הזה, האהבה הזו, נועדו להיות נצחיים.',
    nostalgic:
      'טבעת הנישואין של אמא שלי עברה דרך שלושה דורות. בכל פעם שאני מסתכלת עליה, אני זוכרת את החוזק והאהבה של הנשים שלבשו אותה לפני.',
    celebration:
      'אחרי שסיימתי בית ספר לרפואה, סוף סוף הרגשתי מוכנה להציע נישואין. השמחה וההישגים שחלקנו במהלך המסע הזה ראויים להיחגג עם משהו מבריק כמו העתיד שלנו יחד.',
  },
};

export default function EmotionDemoPage() {
  const [demoState, setDemoState] = useState<DemoState>({
    storyText: '',
    isAnalyzing: false,
    analysisResult: null,
    currentTags: [],
    aiSuggestions: [],
    selectedLanguage: 'en',
  });

  const [activeTab, setActiveTab] = useState('input');
  const [selectedSampleType, setSelectedSampleType] =
    useState<keyof typeof SAMPLE_STORIES.en>('romantic');

  // Available emotion tags (mock data)
  const availableTags: EmotionTag[] = Object.entries(EMOTION_CATEGORIES).map(([key, value]) => ({
    id: key,
    name: key.charAt(0).toUpperCase() + key.slice(1),
    category: key as EmotionCategory,
    color: value.color,
    intensity: 'medium' as const,
    isCustom: false,
    metadata: {
      usageCount: Math.floor(Math.random() * 100),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      isActive: true,
    },
  }));

  // Load sample story
  const loadSampleStory = () => {
    const stories = SAMPLE_STORIES[demoState.selectedLanguage];
    const sampleText = stories[selectedSampleType];
    setDemoState(prev => ({ ...prev, storyText: sampleText }));
  };

  // Simulate AI emotion analysis
  const analyzeStory = async () => {
    if (!demoState.storyText.trim()) {
      toast.error('Please enter some text to analyze');
      return;
    }

    setDemoState(prev => ({ ...prev, isAnalyzing: true }));

    try {
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Mock emotion analysis result
      const mockResult: EmotionAnalysisResult = {
        id: `analysis-${Date.now()}`,
        text: demoState.storyText,
        primaryEmotion: {
          category: 'love' as EmotionCategory,
          confidence: 0.85,
          intensity: 'high' as const,
          keywords: ['heart', 'eternal', 'timeless'],
        },
        secondaryEmotions: [
          {
            category: 'joy' as EmotionCategory,
            confidence: 0.72,
            intensity: 'medium' as const,
            keywords: ['brilliant', 'celebration'],
          },
          {
            category: 'nostalgia' as EmotionCategory,
            confidence: 0.68,
            intensity: 'medium' as const,
            keywords: ['memory', 'legacy'],
          },
        ],
        culturalContext: {
          language: demoState.selectedLanguage,
          culturalMarkers: ['family', 'tradition'],
          religiousContext: demoState.selectedLanguage === 'he' ? 'jewish' : 'universal',
          significance: 'high',
        },
        jewelryMapping: {
          suggestedStyles: ['classic', 'vintage', 'romantic'],
          metals: ['gold', 'platinum'],
          gemstones: ['diamond', 'pearl', 'sapphire'],
          occasion: 'engagement',
        },
        confidence: 0.82,
        processedAt: new Date(),
        metadata: {
          model: 'gpt-4o',
          version: '1.0',
          processingTime: 1850,
        },
      };

      // Mock AI suggestions
      const mockSuggestions = [
        {
          id: 'suggestion-1',
          emotion: availableTags.find(t => t.category === 'love')!,
          confidence: 0.85,
          reasoning:
            'The text contains strong romantic language with words like "heart stopped" and "meant to be eternal", indicating deep love and commitment.',
          keywords: ['heart', 'eternal', 'timeless', 'love'],
        },
        {
          id: 'suggestion-2',
          emotion: availableTags.find(t => t.category === 'joy')!,
          confidence: 0.72,
          reasoning:
            'References to celebration, brightness, and future happiness suggest underlying joy and excitement.',
          keywords: ['brilliant', 'celebration', 'joy'],
        },
        {
          id: 'suggestion-3',
          emotion: availableTags.find(t => t.category === 'nostalgia')!,
          confidence: 0.68,
          reasoning:
            'Mentions of generational traditions and family heirlooms indicate nostalgic sentiment.',
          keywords: ['generations', 'memory', 'legacy'],
        },
      ];

      setDemoState(prev => ({
        ...prev,
        analysisResult: mockResult,
        aiSuggestions: mockSuggestions,
        currentTags: [mockSuggestions[0].emotion], // Auto-accept highest confidence
      }));

      setActiveTab('analysis');
      toast.success('Emotion analysis completed!');
    } catch (error) {
      toast.error('Failed to analyze emotions');
      console.error('Analysis error:', error);
    } finally {
      setDemoState(prev => ({ ...prev, isAnalyzing: false }));
    }
  };

  // Handle tag updates
  const handleTagsUpdate = (newTags: EmotionTag[]) => {
    setDemoState(prev => ({ ...prev, currentTags: newTags }));
  };

  // Handle AI feedback
  const handleAIFeedback = (
    suggestionId: string,
    feedback: string,
    rating: 'positive' | 'negative'
  ) => {
    toast.success(`Feedback submitted for suggestion ${suggestionId}`);
    console.log('AI Feedback:', { suggestionId, feedback, rating });
  };

  // Regenerate AI suggestions
  const regenerateSuggestions = async () => {
    toast.info('Regenerating AI suggestions...');
    // In a real app, this would call the AI service again
    await analyzeStory();
  };

  return (
    <div className="container mx-auto py-8 px-4 max-w-7xl">
      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold mb-4 flex items-center justify-center gap-3">
          <Brain className="h-8 w-8 text-blue-500" />
          Emotion Detection System
          <Sparkles className="h-8 w-8 text-yellow-500" />
        </h1>
        <p className="text-xl text-gray-600 max-w-3xl mx-auto">
          Experience the complete emotion detection and tagging system for jewelry stories.
          AI-powered analysis with human oversight and comprehensive visualization.
        </p>
      </div>

      {/* Main Content */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="input" className="flex items-center gap-2">
            <Settings className="h-4 w-4" />
            Input
          </TabsTrigger>
          <TabsTrigger value="analysis" className="flex items-center gap-2">
            <Brain className="h-4 w-4" />
            Analysis
          </TabsTrigger>
          <TabsTrigger value="editing" className="flex items-center gap-2">
            <Tags className="h-4 w-4" />
            Editing
          </TabsTrigger>
          <TabsTrigger value="visualization" className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4" />
            Visualization
          </TabsTrigger>
          <TabsTrigger value="dashboard" className="flex items-center gap-2">
            <Eye className="h-4 w-4" />
            Dashboard
          </TabsTrigger>
        </TabsList>

        {/* Input Tab */}
        <TabsContent value="input" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Lightbulb className="h-5 w-5" />
                Story Input & Configuration
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">Language</label>
                  <Select
                    value={demoState.selectedLanguage}
                    onValueChange={(value: any) =>
                      setDemoState(prev => ({ ...prev, selectedLanguage: value }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="en">English</SelectItem>
                      <SelectItem value="he">עברית (Hebrew)</SelectItem>
                      <SelectItem value="ar">العربية (Arabic)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="text-sm font-medium mb-2 block">Sample Story Type</label>
                  <Select
                    value={selectedSampleType}
                    onValueChange={(value: any) => setSelectedSampleType(value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="romantic">Romantic</SelectItem>
                      <SelectItem value="nostalgic">Nostalgic</SelectItem>
                      <SelectItem value="celebration">Celebration</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="flex gap-2">
                <Button onClick={loadSampleStory} variant="outline">
                  Load Sample Story
                </Button>
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">Story Text</label>
                <Textarea
                  placeholder="Enter your jewelry story here..."
                  value={demoState.storyText}
                  onChange={e => setDemoState(prev => ({ ...prev, storyText: e.target.value }))}
                  className="min-h-[200px]"
                  dir={
                    demoState.selectedLanguage === 'he' || demoState.selectedLanguage === 'ar'
                      ? 'rtl'
                      : 'ltr'
                  }
                />
              </div>

              <Button
                onClick={analyzeStory}
                disabled={demoState.isAnalyzing || !demoState.storyText.trim()}
                className="w-full"
                size="lg"
              >
                {demoState.isAnalyzing ? (
                  <>
                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                    Analyzing Emotions...
                  </>
                ) : (
                  <>
                    <Play className="h-4 w-4 mr-2" />
                    Analyze Emotions
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Analysis Tab */}
        <TabsContent value="analysis" className="space-y-6">
          {demoState.analysisResult ? (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Analysis Results</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <h4 className="font-medium mb-2">Primary Emotion</h4>
                    <Badge
                      variant="secondary"
                      className="text-lg px-3 py-2"
                      style={{
                        backgroundColor:
                          EMOTION_CATEGORIES[demoState.analysisResult.primaryEmotion.category]
                            ?.color + '20',
                        color:
                          EMOTION_CATEGORIES[demoState.analysisResult.primaryEmotion.category]
                            ?.color,
                      }}
                    >
                      {demoState.analysisResult.primaryEmotion.category}
                      <span className="ml-2 text-sm">
                        ({(demoState.analysisResult.primaryEmotion.confidence * 100).toFixed(0)}%)
                      </span>
                    </Badge>
                  </div>

                  <div>
                    <h4 className="font-medium mb-2">Secondary Emotions</h4>
                    <div className="flex flex-wrap gap-2">
                      {demoState.analysisResult.secondaryEmotions.map((emotion, index) => (
                        <Badge
                          key={index}
                          variant="outline"
                          style={{
                            borderColor: EMOTION_CATEGORIES[emotion.category]?.color,
                            color: EMOTION_CATEGORIES[emotion.category]?.color,
                          }}
                        >
                          {emotion.category} ({(emotion.confidence * 100).toFixed(0)}%)
                        </Badge>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h4 className="font-medium mb-2">Keywords</h4>
                    <div className="flex flex-wrap gap-1">
                      {demoState.analysisResult.primaryEmotion.keywords.map((keyword, index) => (
                        <span key={index} className="text-xs bg-gray-100 px-2 py-1 rounded">
                          {keyword}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h4 className="font-medium mb-2">Jewelry Suggestions</h4>
                    <div className="space-y-2 text-sm">
                      <p>
                        <strong>Styles:</strong>{' '}
                        {demoState.analysisResult.jewelryMapping.suggestedStyles.join(', ')}
                      </p>
                      <p>
                        <strong>Metals:</strong>{' '}
                        {demoState.analysisResult.jewelryMapping.metals.join(', ')}
                      </p>
                      <p>
                        <strong>Gemstones:</strong>{' '}
                        {demoState.analysisResult.jewelryMapping.gemstones.join(', ')}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Cultural Context</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <h4 className="font-medium mb-2">Language & Culture</h4>
                    <div className="space-y-2 text-sm">
                      <p>
                        <strong>Language:</strong>{' '}
                        {demoState.analysisResult.culturalContext.language}
                      </p>
                      <p>
                        <strong>Religious Context:</strong>{' '}
                        {demoState.analysisResult.culturalContext.religiousContext}
                      </p>
                      <p>
                        <strong>Cultural Significance:</strong>{' '}
                        {demoState.analysisResult.culturalContext.significance}
                      </p>
                    </div>
                  </div>

                  <div>
                    <h4 className="font-medium mb-2">Cultural Markers</h4>
                    <div className="flex flex-wrap gap-1">
                      {demoState.analysisResult.culturalContext.culturalMarkers.map(
                        (marker, index) => (
                          <span
                            key={index}
                            className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded"
                          >
                            {marker}
                          </span>
                        )
                      )}
                    </div>
                  </div>

                  <div>
                    <h4 className="font-medium mb-2">Analysis Metadata</h4>
                    <div className="space-y-1 text-sm text-gray-600">
                      <p>Model: {demoState.analysisResult.metadata.model}</p>
                      <p>Processing Time: {demoState.analysisResult.metadata.processingTime}ms</p>
                      <p>
                        Overall Confidence: {(demoState.analysisResult.confidence * 100).toFixed(1)}
                        %
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          ) : (
            <Card>
              <CardContent className="p-8 text-center">
                <Brain className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No Analysis Available</h3>
                <p className="text-gray-600">
                  Run emotion analysis on the Input tab to see results here.
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Editing Tab */}
        <TabsContent value="editing" className="space-y-6">
          {demoState.aiSuggestions.length > 0 ? (
            <EmotionAIEditor
              storyId="demo-story"
              originalText={demoState.storyText}
              aiSuggestions={demoState.aiSuggestions}
              currentTags={demoState.currentTags}
              onTagsUpdate={handleTagsUpdate}
              onFeedbackSubmit={handleAIFeedback}
              onSuggestionsRegenerate={regenerateSuggestions}
              showConfidence={true}
              allowBatchOperations={true}
              isLoading={demoState.isAnalyzing}
            />
          ) : (
            <Card>
              <CardContent className="p-8 text-center">
                <Tags className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No AI Suggestions</h3>
                <p className="text-gray-600">
                  Run emotion analysis first to generate AI suggestions for editing.
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Visualization Tab */}
        <TabsContent value="visualization" className="space-y-6">
          {demoState.analysisResult ? (
            <EmotionVisualization
              data={[demoState.analysisResult]}
              interactive={true}
              showLegend={true}
              size="lg"
            />
          ) : (
            <Card>
              <CardContent className="p-8 text-center">
                <BarChart3 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No Data to Visualize</h3>
                <p className="text-gray-600">
                  Run emotion analysis to generate visualization data.
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Dashboard Tab */}
        <TabsContent value="dashboard" className="space-y-6">
          <EmotionAnalyticsDashboard
            userId="demo-user"
            timeRange="month"
            showFilters={true}
            showExport={true}
            autoRefresh={false}
          />
        </TabsContent>
      </Tabs>

      {/* Footer */}
      <div className="mt-12 text-center text-gray-500">
        <p className="mb-4">🎯 Complete Emotion Detection System Demo</p>
        <div className="flex justify-center gap-4 text-sm">
          <span className="flex items-center gap-1">
            <CheckCircle className="h-4 w-4 text-green-500" />
            AI Analysis
          </span>
          <span className="flex items-center gap-1">
            <CheckCircle className="h-4 w-4 text-green-500" />
            Tag Management
          </span>
          <span className="flex items-center gap-1">
            <CheckCircle className="h-4 w-4 text-green-500" />
            Visualization
          </span>
          <span className="flex items-center gap-1">
            <CheckCircle className="h-4 w-4 text-green-500" />
            AI Editing
          </span>
          <span className="flex items-center gap-1">
            <CheckCircle className="h-4 w-4 text-green-500" />
            Analytics
          </span>
        </div>
      </div>
    </div>
  );
}
