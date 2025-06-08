'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/Input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { EmotionVisualization } from './emotion-visualization';
import { EmotionTagSelector } from './emotion-tag-selector';
import {
  EmotionAnalysisResult,
  EmotionProfile,
  EmotionTrend,
  processEmotionAnalysis,
} from '@/lib/services/emotion-analysis';
import { EmotionTag, EmotionCategory, EMOTION_CATEGORIES } from '@/lib/types/emotions';
import {
  Filter,
  Download,
  RefreshCw,
  Calendar,
  BarChart3,
  TrendingUp,
  Users,
  Heart,
  Activity,
  Settings,
  Eye,
  PieChart,
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface EmotionAnalyticsDashboardProps {
  userId?: string;
  storyId?: string;
  timeRange?: 'week' | 'month' | 'quarter' | 'year' | 'all';
  className?: string;
  showFilters?: boolean;
  showExport?: boolean;
  autoRefresh?: boolean;
  refreshInterval?: number; // in seconds
}

interface DashboardFilters {
  dateRange: [Date | null, Date | null];
  emotions: EmotionCategory[];
  minConfidence: number;
  includeSecondary: boolean;
  groupBy: 'day' | 'week' | 'month';
  sortBy: 'date' | 'confidence' | 'frequency';
  sortOrder: 'asc' | 'desc';
}

interface DashboardStats {
  totalAnalyses: number;
  uniqueEmotions: number;
  averageConfidence: number;
  dominantEmotion: EmotionCategory;
  emotionalDiversity: number;
  trendDirection: 'up' | 'down' | 'stable';
  weeklyGrowth: number;
}

export function EmotionAnalyticsDashboard({
  userId,
  storyId,
  timeRange = 'month',
  className,
  showFilters = true,
  showExport = true,
  autoRefresh = false,
  refreshInterval = 30,
}: EmotionAnalyticsDashboardProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [data, setData] = useState<EmotionAnalysisResult[]>([]);
  const [profile, setProfile] = useState<EmotionProfile | null>(null);
  const [availableTags, setAvailableTags] = useState<EmotionTag[]>([]);
  const [selectedView, setSelectedView] = useState<'overview' | 'detailed' | 'trends'>('overview');
  const [lastRefresh, setLastRefresh] = useState<Date>(new Date());

  const [filters, setFilters] = useState<DashboardFilters>({
    dateRange: [null, null],
    emotions: [],
    minConfidence: 0.5,
    includeSecondary: true,
    groupBy: 'day',
    sortBy: 'date',
    sortOrder: 'desc',
  });

  // Mock data - in production, this would come from your API
  const mockData: EmotionAnalysisResult[] = useMemo(() => {
    return Array.from({ length: 50 }, (_, i) => ({
      id: `analysis-${i}`,
      text: `Story analysis ${i}`,
      primaryEmotion: {
        category: Object.keys(EMOTION_CATEGORIES)[
          Math.floor(Math.random() * Object.keys(EMOTION_CATEGORIES).length)
        ] as EmotionCategory,
        confidence: 0.7 + Math.random() * 0.3,
        intensity: ['low', 'medium', 'high'][Math.floor(Math.random() * 3)] as
          | 'low'
          | 'medium'
          | 'high',
        keywords: ['love', 'memory', 'family'],
      },
      secondaryEmotions: [
        {
          category: Object.keys(EMOTION_CATEGORIES)[
            Math.floor(Math.random() * Object.keys(EMOTION_CATEGORIES).length)
          ] as EmotionCategory,
          confidence: 0.4 + Math.random() * 0.4,
          intensity: ['low', 'medium', 'high'][Math.floor(Math.random() * 3)] as
            | 'low'
            | 'medium'
            | 'high',
          keywords: ['joy', 'happiness'],
        },
      ],
      culturalContext: {
        language: 'he',
        culturalMarkers: ['family', 'tradition'],
        religiousContext: 'jewish',
        significance: 'high',
      },
      jewelryMapping: {
        suggestedStyles: ['classic', 'vintage'],
        metals: ['gold', 'silver'],
        gemstones: ['diamond', 'pearl'],
        occasion: 'anniversary',
      },
      confidence: 0.8 + Math.random() * 0.2,
      processedAt: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000),
      metadata: {
        model: 'gpt-4o',
        version: '1.0',
        processingTime: Math.floor(Math.random() * 5000),
      },
    }));
  }, []);

  // Calculate dashboard statistics
  const stats = useMemo((): DashboardStats => {
    if (!data.length) {
      return {
        totalAnalyses: 0,
        uniqueEmotions: 0,
        averageConfidence: 0,
        dominantEmotion: 'love' as EmotionCategory,
        emotionalDiversity: 0,
        trendDirection: 'stable',
        weeklyGrowth: 0,
      };
    }

    const emotionCounts = new Map<EmotionCategory, number>();
    let totalConfidence = 0;

    data.forEach(analysis => {
      const emotion = analysis.primaryEmotion.category;
      emotionCounts.set(emotion, (emotionCounts.get(emotion) || 0) + 1);
      totalConfidence += analysis.primaryEmotion.confidence;
    });

    const sortedEmotions = Array.from(emotionCounts.entries()).sort((a, b) => b[1] - a[1]);
    const uniqueEmotions = emotionCounts.size;
    const averageConfidence = totalConfidence / data.length;
    const emotionalDiversity = uniqueEmotions / Object.keys(EMOTION_CATEGORIES).length;

    return {
      totalAnalyses: data.length,
      uniqueEmotions,
      averageConfidence,
      dominantEmotion: sortedEmotions[0]?.[0] || 'love',
      emotionalDiversity,
      trendDirection: Math.random() > 0.5 ? 'up' : 'down',
      weeklyGrowth: (Math.random() - 0.5) * 40, // -20% to +20%
    };
  }, [data]);

  // Filter data based on current filters
  const filteredData = useMemo(() => {
    let filtered = [...data];

    // Apply emotion filter
    if (filters.emotions.length > 0) {
      filtered = filtered.filter(
        analysis =>
          filters.emotions.includes(analysis.primaryEmotion.category) ||
          (filters.includeSecondary &&
            analysis.secondaryEmotions.some(emotion => filters.emotions.includes(emotion.category)))
      );
    }

    // Apply confidence filter
    filtered = filtered.filter(
      analysis => analysis.primaryEmotion.confidence >= filters.minConfidence
    );

    // Apply date range filter
    if (filters.dateRange[0] && filters.dateRange[1]) {
      filtered = filtered.filter(analysis => {
        const date = new Date(analysis.processedAt);
        return date >= filters.dateRange[0]! && date <= filters.dateRange[1]!;
      });
    }

    // Apply sorting
    filtered.sort((a, b) => {
      let comparison = 0;
      switch (filters.sortBy) {
        case 'date':
          comparison = new Date(a.processedAt).getTime() - new Date(b.processedAt).getTime();
          break;
        case 'confidence':
          comparison = a.primaryEmotion.confidence - b.primaryEmotion.confidence;
          break;
        case 'frequency':
          // This would need more complex logic in a real implementation
          comparison = 0;
          break;
      }
      return filters.sortOrder === 'desc' ? -comparison : comparison;
    });

    return filtered;
  }, [data, filters]);

  // Load data effect
  useEffect(() => {
    loadData();
  }, [userId, storyId, timeRange]);

  // Auto-refresh effect
  useEffect(() => {
    if (!autoRefresh) return;

    const interval = setInterval(() => {
      loadData(true);
    }, refreshInterval * 1000);

    return () => clearInterval(interval);
  }, [autoRefresh, refreshInterval]);

  const loadData = async (silent = false) => {
    if (!silent) setIsLoading(true);

    try {
      // In production, fetch from your API
      // const response = await fetchEmotionAnalyses({ userId, storyId, timeRange });
      // setData(response.data);
      // setProfile(response.profile);

      // For now, use mock data
      await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate API call
      setData(mockData);
      setLastRefresh(new Date());
    } catch (error) {
      console.error('Failed to load emotion data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleFilterChange = (newFilters: Partial<DashboardFilters>) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
  };

  const handleExport = (format: 'csv' | 'json' | 'pdf') => {
    // Implement export functionality
    console.log(`Exporting data as ${format}`);
  };

  const resetFilters = () => {
    setFilters({
      dateRange: [null, null],
      emotions: [],
      minConfidence: 0.5,
      includeSecondary: true,
      groupBy: 'day',
      sortBy: 'date',
      sortOrder: 'desc',
    });
  };

  return (
    <div className={cn('space-y-6', className)}>
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold">Emotion Analytics</h1>
          <p className="text-gray-600">Last updated: {lastRefresh.toLocaleTimeString()}</p>
        </div>

        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => loadData()} disabled={isLoading}>
            <RefreshCw className={cn('h-4 w-4', isLoading && 'animate-spin')} />
          </Button>

          {showExport && (
            <Select onValueChange={(format: any) => handleExport(format)}>
              <SelectTrigger asChild>
                <Button variant="outline" size="sm">
                  <Download className="h-4 w-4" />
                </Button>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="csv">Export CSV</SelectItem>
                <SelectItem value="json">Export JSON</SelectItem>
                <SelectItem value="pdf">Export PDF</SelectItem>
              </SelectContent>
            </Select>
          )}
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Analyses</p>
                <p className="text-2xl font-bold">{stats.totalAnalyses}</p>
              </div>
              <BarChart3 className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Unique Emotions</p>
                <p className="text-2xl font-bold">{stats.uniqueEmotions}</p>
              </div>
              <Heart className="h-8 w-8 text-red-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Avg Confidence</p>
                <p className="text-2xl font-bold">{(stats.averageConfidence * 100).toFixed(1)}%</p>
              </div>
              <Activity className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Weekly Growth</p>
                <p
                  className={cn(
                    'text-2xl font-bold',
                    stats.weeklyGrowth >= 0 ? 'text-green-600' : 'text-red-600'
                  )}
                >
                  {stats.weeklyGrowth >= 0 ? '+' : ''}
                  {stats.weeklyGrowth.toFixed(1)}%
                </p>
              </div>
              <TrendingUp
                className={cn(
                  'h-8 w-8',
                  stats.weeklyGrowth >= 0 ? 'text-green-500' : 'text-red-500'
                )}
              />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      {showFilters && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Filter className="h-5 w-5" />
              Filters
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
              <div>
                <label className="text-sm font-medium">Emotions</label>
                <EmotionTagSelector
                  selectedTags={filters.emotions.map(emotion => ({
                    id: emotion,
                    name: emotion,
                    category: emotion,
                    color: EMOTION_CATEGORIES[emotion]?.color || '#6b7280',
                    intensity: 'medium' as const,
                    isCustom: false,
                    metadata: {
                      usageCount: 0,
                      createdAt: new Date().toISOString(),
                      updatedAt: new Date().toISOString(),
                      isActive: true,
                    },
                  }))}
                  onTagsChange={tags =>
                    handleFilterChange({
                      emotions: tags.map(tag => tag.category),
                    })
                  }
                  availableTags={Object.keys(EMOTION_CATEGORIES).map(emotion => ({
                    id: emotion,
                    name: emotion,
                    category: emotion as EmotionCategory,
                    color: EMOTION_CATEGORIES[emotion as EmotionCategory]?.color || '#6b7280',
                    intensity: 'medium' as const,
                    isCustom: false,
                    metadata: {
                      usageCount: 0,
                      createdAt: new Date().toISOString(),
                      updatedAt: new Date().toISOString(),
                      isActive: true,
                    },
                  }))}
                  variant="compact"
                  maxTags={5}
                />
              </div>

              <div>
                <label className="text-sm font-medium">Min Confidence</label>
                <Select
                  value={filters.minConfidence.toString()}
                  onValueChange={value => handleFilterChange({ minConfidence: parseFloat(value) })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="0">0% (All)</SelectItem>
                    <SelectItem value="0.3">30%</SelectItem>
                    <SelectItem value="0.5">50%</SelectItem>
                    <SelectItem value="0.7">70%</SelectItem>
                    <SelectItem value="0.9">90%</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm font-medium">Group By</label>
                <Select
                  value={filters.groupBy}
                  onValueChange={(value: any) => handleFilterChange({ groupBy: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="day">Day</SelectItem>
                    <SelectItem value="week">Week</SelectItem>
                    <SelectItem value="month">Month</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm font-medium">Sort By</label>
                <Select
                  value={`${filters.sortBy}-${filters.sortOrder}`}
                  onValueChange={value => {
                    const [sortBy, sortOrder] = value.split('-');
                    handleFilterChange({ sortBy: sortBy as any, sortOrder: sortOrder as any });
                  }}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="date-desc">Date (Newest)</SelectItem>
                    <SelectItem value="date-asc">Date (Oldest)</SelectItem>
                    <SelectItem value="confidence-desc">Confidence (High)</SelectItem>
                    <SelectItem value="confidence-asc">Confidence (Low)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="flex justify-between items-center">
              <Badge variant="secondary">
                {filteredData.length} of {data.length} analyses
              </Badge>
              <Button variant="ghost" size="sm" onClick={resetFilters}>
                Reset Filters
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Main Content */}
      <Tabs value={selectedView} onValueChange={(value: any) => setSelectedView(value)}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="detailed">Detailed</TabsTrigger>
          <TabsTrigger value="trends">Trends</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <EmotionVisualization
            data={filteredData}
            profile={profile || undefined}
            interactive={true}
            size="lg"
            timeRange={timeRange}
          />
        </TabsContent>

        <TabsContent value="detailed" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <EmotionVisualization
              data={filteredData}
              chartType="bar"
              size="md"
              timeRange={timeRange}
            />
            <EmotionVisualization
              data={filteredData}
              chartType="pie"
              size="md"
              timeRange={timeRange}
            />
          </div>
          <EmotionVisualization
            data={filteredData}
            chartType="line"
            size="lg"
            timeRange={timeRange}
          />
        </TabsContent>

        <TabsContent value="trends" className="space-y-6">
          <EmotionVisualization
            data={filteredData}
            profile={profile || undefined}
            chartType="radar"
            size="lg"
            timeRange={timeRange}
          />
        </TabsContent>
      </Tabs>

      {/* Loading State */}
      {isLoading && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <Card className="p-6">
            <div className="flex items-center gap-3">
              <RefreshCw className="h-5 w-5 animate-spin" />
              <span>Loading emotion data...</span>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}
