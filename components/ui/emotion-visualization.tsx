'use client';

import React, { useMemo, useState } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  Area,
  AreaChart,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  Legend,
  ScatterChart,
  Scatter,
} from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/badge';
import {
  ChevronDown,
  ChevronUp,
  Download,
  Share2,
  Filter,
  TrendingUp,
  Heart,
  BarChart3,
} from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { EmotionTag, EmotionCategory, EMOTION_CATEGORIES } from '@/lib/types/emotions';
import {
  EmotionAnalysisResult,
  EmotionProfile,
  EmotionTrend,
} from '@/lib/services/emotion-analysis';
import { cn } from '@/lib/utils';

interface EmotionData {
  category: EmotionCategory;
  value: number;
  confidence: number;
  count: number;
  color: string;
  intensity: 'low' | 'medium' | 'high';
}

interface TimeSeriesData {
  date: string;
  [key: string]: string | number; // Dynamic emotion categories
}

interface EmotionVisualizationProps {
  data: EmotionAnalysisResult[];
  profile?: EmotionProfile;
  className?: string;
  interactive?: boolean;
  showLegend?: boolean;
  chartType?: 'bar' | 'pie' | 'line' | 'area' | 'radar' | 'heatmap';
  timeRange?: 'week' | 'month' | 'quarter' | 'year';
  size?: 'sm' | 'md' | 'lg';
}

interface EmotionDistributionProps {
  emotions: EmotionData[];
  chartType: 'bar' | 'pie' | 'radar';
  interactive?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

interface EmotionTimelineProps {
  data: TimeSeriesData[];
  selectedEmotions: EmotionCategory[];
  chartType: 'line' | 'area';
  timeRange: string;
}

interface EmotionHeatmapProps {
  data: EmotionAnalysisResult[];
  weekRange?: number;
}

interface EmotionInsightsProps {
  profile: EmotionProfile;
  recentAnalyses: EmotionAnalysisResult[];
}

// Main emotion visualization component
export function EmotionVisualization({
  data,
  profile,
  className,
  interactive = true,
  showLegend = true,
  chartType = 'bar',
  timeRange = 'month',
  size = 'md',
}: EmotionVisualizationProps) {
  const [activeTab, setActiveTab] = useState('distribution');
  const [selectedEmotions, setSelectedEmotions] = useState<EmotionCategory[]>([]);
  const [currentChartType, setCurrentChartType] = useState(chartType);

  // Process emotion data for visualization
  const emotionData = useMemo(() => {
    const emotionCounts = new Map<
      EmotionCategory,
      { total: number; confidence: number; intensities: string[] }
    >();

    data.forEach(analysis => {
      const emotion = analysis.primaryEmotion.category;
      const current = emotionCounts.get(emotion) || { total: 0, confidence: 0, intensities: [] };

      emotionCounts.set(emotion, {
        total: current.total + 1,
        confidence: current.confidence + analysis.primaryEmotion.confidence,
        intensities: [...current.intensities, analysis.primaryEmotion.intensity],
      });

      // Also count secondary emotions
      analysis.secondaryEmotions.forEach(secEmotion => {
        const secCurrent = emotionCounts.get(secEmotion.category) || {
          total: 0,
          confidence: 0,
          intensities: [],
        };
        emotionCounts.set(secEmotion.category, {
          total: secCurrent.total + 0.5, // Weight secondary emotions less
          confidence: secCurrent.confidence + secEmotion.confidence * 0.5,
          intensities: [...secCurrent.intensities, secEmotion.intensity],
        });
      });
    });

    return Array.from(emotionCounts.entries())
      .map(([category, stats]) => ({
        category,
        value: stats.total,
        confidence: stats.confidence / stats.total,
        count: Math.floor(stats.total),
        color: EMOTION_CATEGORIES[category]?.color || '#6b7280',
        intensity: stats.intensities.includes('high')
          ? ('high' as const)
          : stats.intensities.includes('medium')
            ? ('medium' as const)
            : ('low' as const),
      }))
      .sort((a, b) => b.value - a.value);
  }, [data]);

  // Process timeline data
  const timelineData = useMemo(() => {
    if (!data.length) return [];

    const timePoints = new Map<string, Record<string, number>>();

    data.forEach(analysis => {
      const date = new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000); // Mock dates
      const dateKey = date.toISOString().split('T')[0];

      if (!timePoints.has(dateKey)) {
        timePoints.set(dateKey, {});
      }

      const point = timePoints.get(dateKey)!;
      const emotion = analysis.primaryEmotion.category;
      point[emotion] = (point[emotion] || 0) + analysis.primaryEmotion.confidence;
    });

    return Array.from(timePoints.entries())
      .map(([date, emotions]) => ({ date, ...emotions }))
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  }, [data]);

  const sizeClasses = {
    sm: 'h-64',
    md: 'h-80',
    lg: 'h-96',
  };

  return (
    <div className={cn('space-y-6', className)}>
      {/* Header with controls */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold">Emotion Analysis</h2>
          <p className="text-gray-600">
            Visualizing {data.length} emotional expressions across {emotionData.length} categories
          </p>
        </div>

        <div className="flex gap-2">
          <Select
            value={currentChartType}
            onValueChange={(value: any) => setCurrentChartType(value)}
          >
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="bar">Bar Chart</SelectItem>
              <SelectItem value="pie">Pie Chart</SelectItem>
              <SelectItem value="line">Line Chart</SelectItem>
              <SelectItem value="radar">Radar Chart</SelectItem>
            </SelectContent>
          </Select>

          <Button variant="outline" size="sm">
            <Download className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Main visualization tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="distribution">Distribution</TabsTrigger>
          <TabsTrigger value="timeline">Timeline</TabsTrigger>
          <TabsTrigger value="heatmap">Heatmap</TabsTrigger>
          <TabsTrigger value="insights">Insights</TabsTrigger>
        </TabsList>

        <TabsContent value="distribution" className="space-y-4">
          <EmotionDistribution
            emotions={emotionData}
            chartType={currentChartType as any}
            interactive={interactive}
            size={size}
          />
        </TabsContent>

        <TabsContent value="timeline" className="space-y-4">
          <EmotionTimeline
            data={timelineData}
            selectedEmotions={selectedEmotions}
            chartType="area"
            timeRange={timeRange}
          />
        </TabsContent>

        <TabsContent value="heatmap" className="space-y-4">
          <EmotionHeatmap data={data} />
        </TabsContent>

        <TabsContent value="insights" className="space-y-4">
          {profile && <EmotionInsights profile={profile} recentAnalyses={data.slice(-10)} />}
        </TabsContent>
      </Tabs>
    </div>
  );
}

// Emotion distribution charts
function EmotionDistribution({ emotions, chartType, interactive, size }: EmotionDistributionProps) {
  const [selectedEmotion, setSelectedEmotion] = useState<string | null>(null);

  const sizeClasses = {
    sm: 'h-64',
    md: 'h-80',
    lg: 'h-96',
  };

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-white p-3 border rounded-lg shadow-lg">
          <p className="font-medium" style={{ color: data.color }}>
            {data.category}
          </p>
          <p className="text-sm">Count: {data.count}</p>
          <p className="text-sm">Confidence: {(data.confidence * 100).toFixed(1)}%</p>
          <p className="text-sm">Intensity: {data.intensity}</p>
        </div>
      );
    }
    return null;
  };

  if (chartType === 'pie') {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Emotion Distribution
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className={sizeClasses[size!]}>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={emotions}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ category, value }) => `${category}: ${value.toFixed(1)}`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                  onClick={interactive ? data => setSelectedEmotion(data.category) : undefined}
                >
                  {emotions.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={entry.color}
                      stroke={selectedEmotion === entry.category ? '#000' : 'none'}
                      strokeWidth={selectedEmotion === entry.category ? 2 : 0}
                    />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (chartType === 'radar') {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Emotion Radar
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className={sizeClasses[size!]}>
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart data={emotions}>
                <PolarGrid />
                <PolarAngleAxis dataKey="category" />
                <PolarRadiusAxis angle={90} domain={[0, 'dataMax']} />
                <Radar
                  name="Intensity"
                  dataKey="value"
                  stroke="#3b82f6"
                  fill="#3b82f6"
                  fillOpacity={0.3}
                />
                <Radar
                  name="Confidence"
                  dataKey="confidence"
                  stroke="#ef4444"
                  fill="#ef4444"
                  fillOpacity={0.2}
                />
                <Tooltip content={<CustomTooltip />} />
                <Legend />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Default bar chart
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <BarChart3 className="h-5 w-5" />
          Emotion Frequency
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className={sizeClasses[size!]}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={emotions} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="category" angle={-45} textAnchor="end" height={80} />
              <YAxis />
              <Tooltip content={<CustomTooltip />} />
              <Bar
                dataKey="value"
                onClick={interactive ? data => setSelectedEmotion(data.category) : undefined}
                cursor={interactive ? 'pointer' : 'default'}
              >
                {emotions.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={entry.color}
                    stroke={selectedEmotion === entry.category ? '#000' : 'none'}
                    strokeWidth={selectedEmotion === entry.category ? 2 : 0}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}

// Timeline visualization
function EmotionTimeline({ data, selectedEmotions, chartType, timeRange }: EmotionTimelineProps) {
  const emotions = Object.keys(EMOTION_CATEGORIES);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <BarChart3 className="h-5 w-5" />
          Emotion Timeline - {timeRange}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            {chartType === 'area' ? (
              <AreaChart data={data}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                {emotions.map((emotion, index) => (
                  <Area
                    key={emotion}
                    type="monotone"
                    dataKey={emotion}
                    stackId="1"
                    stroke={EMOTION_CATEGORIES[emotion as EmotionCategory]?.color}
                    fill={EMOTION_CATEGORIES[emotion as EmotionCategory]?.color}
                    fillOpacity={0.6}
                  />
                ))}
                <Legend />
              </AreaChart>
            ) : (
              <LineChart data={data}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                {emotions.map((emotion, index) => (
                  <Line
                    key={emotion}
                    type="monotone"
                    dataKey={emotion}
                    stroke={EMOTION_CATEGORIES[emotion as EmotionCategory]?.color}
                    strokeWidth={2}
                  />
                ))}
                <Legend />
              </LineChart>
            )}
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}

// Heatmap visualization
function EmotionHeatmap({ data, weekRange = 12 }: EmotionHeatmapProps) {
  const heatmapData = useMemo(() => {
    // Create a grid of days and emotions
    const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    const weeks = Array.from({ length: weekRange }, (_, i) => i);

    return weeks
      .map(week =>
        days.map(day => ({
          week,
          day,
          value: Math.random() * 10, // Mock data - replace with actual analysis
          emotion:
            Object.keys(EMOTION_CATEGORIES)[
              Math.floor(Math.random() * Object.keys(EMOTION_CATEGORIES).length)
            ],
        }))
      )
      .flat();
  }, [weekRange, data]);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Emotion Activity Heatmap</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-7 gap-1">
          {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(day => (
            <div key={day} className="text-xs text-center py-2 font-medium">
              {day}
            </div>
          ))}

          {heatmapData.map((cell, index) => (
            <div
              key={index}
              className="aspect-square rounded border"
              style={{
                backgroundColor: `rgba(59, 130, 246, ${cell.value / 10})`,
              }}
              title={`${cell.day} Week ${cell.week}: ${cell.value.toFixed(1)}`}
            />
          ))}
        </div>

        <div className="flex justify-between items-center mt-4 text-xs text-gray-500">
          <span>Less</span>
          <div className="flex gap-1">
            {[0, 0.2, 0.4, 0.6, 0.8, 1].map(opacity => (
              <div
                key={opacity}
                className="w-3 h-3 rounded border"
                style={{ backgroundColor: `rgba(59, 130, 246, ${opacity})` }}
              />
            ))}
          </div>
          <span>More</span>
        </div>
      </CardContent>
    </Card>
  );
}

// Insights and analytics
function EmotionInsights({ profile, recentAnalyses }: EmotionInsightsProps) {
  const insights = useMemo(() => {
    const dominant = profile.dominantEmotions[0];
    const trend = profile.intensityPattern;
    const diversity = profile.emotionalRange;

    return {
      dominantEmotion: dominant,
      trend,
      diversity: diversity > 0.7 ? 'high' : diversity > 0.4 ? 'medium' : 'low',
      recentChange: recentAnalyses.length > 2 ? 'increasing' : 'stable',
    };
  }, [profile, recentAnalyses]);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Dominant Emotion</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-3">
            <div
              className="w-12 h-12 rounded-full"
              style={{ backgroundColor: EMOTION_CATEGORIES[insights.dominantEmotion]?.color }}
            />
            <div>
              <p className="font-medium capitalize">{insights.dominantEmotion}</p>
              <p className="text-sm text-gray-600">Most frequent emotion</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            {insights.recentChange === 'increasing' ? (
              <TrendingUp className="h-4 w-4 text-green-500" />
            ) : (
              <TrendingUp className="h-4 w-4 text-blue-500" />
            )}
            Trend Pattern
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Badge variant="secondary" className="capitalize">
            {insights.trend}
          </Badge>
          <p className="text-sm text-gray-600 mt-2">Emotional intensity is {insights.trend}</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Emotional Diversity</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-2">
            <div
              className={cn(
                'px-2 py-1 rounded text-sm font-medium',
                insights.diversity === 'high'
                  ? 'bg-green-100 text-green-800'
                  : insights.diversity === 'medium'
                    ? 'bg-yellow-100 text-yellow-800'
                    : 'bg-gray-100 text-gray-800'
              )}
            >
              {insights.diversity}
            </div>
          </div>
          <p className="text-sm text-gray-600 mt-2">Range of emotional expressions</p>
        </CardContent>
      </Card>

      <Card className="md:col-span-2 lg:col-span-3">
        <CardHeader>
          <CardTitle>Recent Trends</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {profile.trends.slice(0, 3).map((trend, index) => (
              <div key={index} className="text-center">
                <div
                  className="w-8 h-8 rounded-full mx-auto mb-2"
                  style={{ backgroundColor: EMOTION_CATEGORIES[trend.emotion]?.color }}
                />
                <p className="font-medium capitalize">{trend.emotion}</p>
                <p className="text-sm text-gray-600">{trend.frequency} occurrences</p>
                <p className="text-xs text-gray-500">
                  Avg intensity: {(trend.averageIntensity * 100).toFixed(0)}%
                </p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
