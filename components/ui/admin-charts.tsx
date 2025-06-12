'use client';

import { useEffect, useRef, useState } from 'react';
import { useTranslation } from '@/lib/hooks/useTranslation';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { DirectionalFlex } from '@/components/ui/DirectionalFlex';
import { Icons } from '@/components/ui/Icons';

interface ChartData {
  timeRange: string;
  userMetrics: {
    totalUsers: number;
    activeUsers: number;
    newUsers: number;
    userGrowth: number[];
    usersByCountry: { country: string; users: number }[];
    usersByRole: { role: string; count: number }[];
  };
  orderMetrics: {
    totalOrders: number;
    totalRevenue: number;
    averageOrderValue: number;
    orderGrowth: number[];
    revenueGrowth: number[];
    ordersByStatus: { status: string; count: number }[];
  };
  contentMetrics: {
    totalStories: number;
    totalSketches: number;
    sketchSuccessRate: number;
    avgGenerationTime: number;
    storiesGrowth: number[];
    sketchesGrowth: number[];
  };
  engagementMetrics: {
    avgSessionDuration: number;
    bounceRate: number;
    pageViews: number;
    conversionRate: number;
    topPages: { page: string; views: number }[];
  };
}

interface AdminChartsProps {
  data: ChartData | null;
  selectedMetric: string;
  timeRange: string;
}

export function AdminCharts({ data, selectedMetric, timeRange }: AdminChartsProps) {
  const { t, formatCurrency } = useTranslation();
  const [chartType, setChartType] = useState<'line' | 'bar' | 'pie'>('line');
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Simple canvas-based chart rendering
  const drawLineChart = (canvas: HTMLCanvasElement, data: number[], labels: string[]) => {
    const ctx = canvas.getContext('2d');
    if (!ctx || !data.length) return;

    const width = canvas.width;
    const height = canvas.height;
    const padding = 40;
    const chartWidth = width - 2 * padding;
    const chartHeight = height - 2 * padding;

    // Clear canvas
    ctx.clearRect(0, 0, width, height);

    // Find min/max for scaling
    const maxValue = Math.max(...data);
    const minValue = Math.min(...data);
    const range = maxValue - minValue || 1;

    // Draw axes
    ctx.strokeStyle = '#e5e7eb';
    ctx.lineWidth = 1;
    
    // Y-axis
    ctx.beginPath();
    ctx.moveTo(padding, padding);
    ctx.lineTo(padding, height - padding);
    ctx.stroke();
    
    // X-axis
    ctx.beginPath();
    ctx.moveTo(padding, height - padding);
    ctx.lineTo(width - padding, height - padding);
    ctx.stroke();

    // Draw grid lines
    ctx.strokeStyle = '#f3f4f6';
    for (let i = 1; i <= 5; i++) {
      const y = padding + (chartHeight * i) / 5;
      ctx.beginPath();
      ctx.moveTo(padding, y);
      ctx.lineTo(width - padding, y);
      ctx.stroke();
    }

    // Draw data line
    ctx.strokeStyle = '#3b82f6';
    ctx.lineWidth = 2;
    ctx.beginPath();

    data.forEach((value, index) => {
      const x = padding + (chartWidth * index) / (data.length - 1);
      const y = height - padding - ((value - minValue) / range) * chartHeight;
      
      if (index === 0) {
        ctx.moveTo(x, y);
      } else {
        ctx.lineTo(x, y);
      }
    });
    
    ctx.stroke();

    // Draw data points
    ctx.fillStyle = '#3b82f6';
    data.forEach((value, index) => {
      const x = padding + (chartWidth * index) / (data.length - 1);
      const y = height - padding - ((value - minValue) / range) * chartHeight;
      
      ctx.beginPath();
      ctx.arc(x, y, 3, 0, 2 * Math.PI);
      ctx.fill();
    });

    // Draw labels
    ctx.fillStyle = '#6b7280';
    ctx.font = '12px system-ui';
    ctx.textAlign = 'center';
    
    // Y-axis labels
    for (let i = 0; i <= 5; i++) {
      const value = minValue + (range * i) / 5;
      const y = height - padding - (chartHeight * i) / 5;
      ctx.textAlign = 'right';
      ctx.fillText(Math.round(value).toString(), padding - 10, y + 4);
    }
  };

  const drawBarChart = (canvas: HTMLCanvasElement, data: { label: string; value: number }[]) => {
    const ctx = canvas.getContext('2d');
    if (!ctx || !data.length) return;

    const width = canvas.width;
    const height = canvas.height;
    const padding = 40;
    const chartWidth = width - 2 * padding;
    const chartHeight = height - 2 * padding;

    // Clear canvas
    ctx.clearRect(0, 0, width, height);

    const maxValue = Math.max(...data.map(d => d.value));
    const barWidth = chartWidth / data.length * 0.8;
    const barSpacing = chartWidth / data.length * 0.2;

    // Draw axes
    ctx.strokeStyle = '#e5e7eb';
    ctx.lineWidth = 1;
    
    // Y-axis
    ctx.beginPath();
    ctx.moveTo(padding, padding);
    ctx.lineTo(padding, height - padding);
    ctx.stroke();
    
    // X-axis
    ctx.beginPath();
    ctx.moveTo(padding, height - padding);
    ctx.lineTo(width - padding, height - padding);
    ctx.stroke();

    // Draw bars
    const colors = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];
    
    data.forEach((item, index) => {
      const barHeight = (item.value / maxValue) * chartHeight;
      const x = padding + (chartWidth / data.length) * index + barSpacing / 2;
      const y = height - padding - barHeight;

      ctx.fillStyle = colors[index % colors.length];
      ctx.fillRect(x, y, barWidth, barHeight);

      // Draw labels
      ctx.fillStyle = '#6b7280';
      ctx.font = '12px system-ui';
      ctx.textAlign = 'center';
      ctx.fillText(item.label, x + barWidth / 2, height - padding + 20);
      
      // Draw values
      ctx.fillStyle = '#374151';
      ctx.fillText(item.value.toString(), x + barWidth / 2, y - 5);
    });
  };

  const drawPieChart = (canvas: HTMLCanvasElement, data: { label: string; value: number }[]) => {
    const ctx = canvas.getContext('2d');
    if (!ctx || !data.length) return;

    const width = canvas.width;
    const height = canvas.height;
    const centerX = width / 2;
    const centerY = height / 2;
    const radius = Math.min(width, height) / 2 - 40;

    // Clear canvas
    ctx.clearRect(0, 0, width, height);

    const total = data.reduce((sum, item) => sum + item.value, 0);
    const colors = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4'];

    let currentAngle = -Math.PI / 2; // Start from top

    data.forEach((item, index) => {
      const sliceAngle = (item.value / total) * 2 * Math.PI;
      
      // Draw slice
      ctx.beginPath();
      ctx.moveTo(centerX, centerY);
      ctx.arc(centerX, centerY, radius, currentAngle, currentAngle + sliceAngle);
      ctx.closePath();
      ctx.fillStyle = colors[index % colors.length];
      ctx.fill();
      
      // Draw border
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 2;
      ctx.stroke();

      // Draw label
      const labelAngle = currentAngle + sliceAngle / 2;
      const labelX = centerX + Math.cos(labelAngle) * (radius * 0.7);
      const labelY = centerY + Math.sin(labelAngle) * (radius * 0.7);
      
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 12px system-ui';
      ctx.textAlign = 'center';
      ctx.fillText(`${Math.round((item.value / total) * 100)}%`, labelX, labelY);

      currentAngle += sliceAngle;
    });

    // Draw legend
    data.forEach((item, index) => {
      const legendY = 20 + index * 25;
      
      // Color box
      ctx.fillStyle = colors[index % colors.length];
      ctx.fillRect(10, legendY - 10, 15, 15);
      
      // Label
      ctx.fillStyle = '#374151';
      ctx.font = '12px system-ui';
      ctx.textAlign = 'left';
      ctx.fillText(`${item.label}: ${item.value}`, 30, legendY + 2);
    });
  };

  useEffect(() => {
    if (!data || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    canvas.style.width = rect.width + 'px';
    canvas.style.height = rect.height + 'px';
    
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.scale(dpr, dpr);
    }

    // Generate time labels based on time range
    const generateTimeLabels = (range: string, dataLength: number) => {
      const labels = [];
      for (let i = 0; i < dataLength; i++) {
        if (range === '24h') {
          labels.push(`${i}:00`);
        } else if (range === '7d') {
          const date = new Date();
          date.setDate(date.getDate() - (dataLength - 1 - i));
          labels.push(date.toLocaleDateString('en', { weekday: 'short' }));
        } else {
          labels.push(`Day ${i + 1}`);
        }
      }
      return labels;
    };

    if (selectedMetric === 'users') {
      if (chartType === 'line') {
        const labels = generateTimeLabels(timeRange, data.userMetrics.userGrowth.length);
        drawLineChart(canvas, data.userMetrics.userGrowth, labels);
      } else if (chartType === 'bar') {
        drawBarChart(canvas, data.userMetrics.usersByCountry.map(item => ({
          label: item.country,
          value: item.users
        })));
      } else if (chartType === 'pie') {
        drawPieChart(canvas, data.userMetrics.usersByRole.map(item => ({
          label: item.role,
          value: item.count
        })));
      }
    } else if (selectedMetric === 'orders') {
      if (chartType === 'line') {
        const labels = generateTimeLabels(timeRange, data.orderMetrics.orderGrowth.length);
        drawLineChart(canvas, data.orderMetrics.orderGrowth, labels);
      } else if (chartType === 'bar') {
        const labels = generateTimeLabels(timeRange, data.orderMetrics.revenueGrowth.length);
        drawLineChart(canvas, data.orderMetrics.revenueGrowth, labels);
      } else if (chartType === 'pie') {
        drawPieChart(canvas, data.orderMetrics.ordersByStatus.map(item => ({
          label: item.status,
          value: item.count
        })));
      }
    } else if (selectedMetric === 'content') {
      if (chartType === 'line') {
        const labels = generateTimeLabels(timeRange, data.contentMetrics.storiesGrowth?.length || 15);
        drawLineChart(canvas, data.contentMetrics.storiesGrowth || [], labels);
      } else if (chartType === 'bar') {
        drawBarChart(canvas, [
          { label: 'Stories', value: data.contentMetrics.totalStories },
          { label: 'Sketches', value: data.contentMetrics.totalSketches },
          { label: 'Success Rate', value: data.contentMetrics.sketchSuccessRate },
          { label: 'Avg Time (s)', value: data.contentMetrics.avgGenerationTime }
        ]);
      }
    } else if (selectedMetric === 'engagement') {
      if (chartType === 'bar') {
        drawBarChart(canvas, data.engagementMetrics.topPages.map(item => ({
          label: item.page.split('/').pop() || item.page,
          value: item.views
        })));
      } else if (chartType === 'pie') {
        drawPieChart(canvas, data.engagementMetrics.topPages.slice(0, 5).map(item => ({
          label: item.page.split('/').pop() || item.page,
          value: item.views
        })));
      }
    }
  }, [data, selectedMetric, timeRange, chartType]);

  if (!data) {
    return (
      <Card className="p-6">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="h-64 bg-gray-200 rounded"></div>
        </div>
      </Card>
    );
  }

  const getChartTitle = () => {
    const baseTitle = selectedMetric === 'users' ? 'User Analytics' :
                     selectedMetric === 'orders' ? 'Order Analytics' :
                     selectedMetric === 'content' ? 'Content Analytics' :
                     'Engagement Analytics';
    
    const chartTypeLabel = chartType === 'line' ? 'Trend' :
                          chartType === 'bar' ? 'Comparison' :
                          'Distribution';
    
    return `${baseTitle} - ${chartTypeLabel}`;
  };

  const getAvailableChartTypes = () => {
    if (selectedMetric === 'users') {
      return [
        { type: 'line' as const, label: 'Growth Trend', icon: Icons.TrendingUp },
        { type: 'bar' as const, label: 'By Country', icon: Icons.BarChart3 },
        { type: 'pie' as const, label: 'By Role', icon: Icons.PieChart }
      ];
    } else if (selectedMetric === 'orders') {
      return [
        { type: 'line' as const, label: 'Order Trend', icon: Icons.TrendingUp },
        { type: 'bar' as const, label: 'Revenue Trend', icon: Icons.BarChart3 },
        { type: 'pie' as const, label: 'By Status', icon: Icons.PieChart }
      ];
    } else if (selectedMetric === 'content') {
      return [
        { type: 'line' as const, label: 'Stories Trend', icon: Icons.TrendingUp },
        { type: 'bar' as const, label: 'Overview', icon: Icons.BarChart3 }
      ];
    } else {
      return [
        { type: 'bar' as const, label: 'Top Pages', icon: Icons.BarChart3 },
        { type: 'pie' as const, label: 'Page Distribution', icon: Icons.PieChart }
      ];
    }
  };

  const availableCharts = getAvailableChartTypes();

  return (
    <Card className="p-6">
      <DirectionalFlex className="justify-between items-center mb-6">
        <div>
          <h3 className="text-lg font-medium text-gray-900">{getChartTitle()}</h3>
          <p className="text-sm text-gray-500 mt-1">
            Data visualization for {timeRange.replace('d', ' days').replace('h', ' hours').replace('y', ' year')}
          </p>
        </div>
        
        <DirectionalFlex className="items-center gap-2">
          {availableCharts.map((chart) => {
            const Icon = chart.icon;
            return (
              <Button
                key={chart.type}
                variant={chartType === chart.type ? "default" : "outline"}
                size="sm"
                onClick={() => setChartType(chart.type)}
                className="flex items-center gap-2"
              >
                <Icon className="h-4 w-4" />
                {chart.label}
              </Button>
            );
          })}
        </DirectionalFlex>
      </DirectionalFlex>
      
      <div className="relative">
        <canvas
          ref={canvasRef}
          className="w-full h-64 border border-gray-200 rounded-lg"
          style={{ maxWidth: '100%' }}
        />
        
        {/* Chart Info Overlay */}
        <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm rounded-lg p-3 shadow-sm">
          <div className="text-xs text-gray-600">
            <div>Time Range: {timeRange}</div>
            <div>Chart Type: {chartType}</div>
            <div>Last Updated: {new Date().toLocaleTimeString()}</div>
          </div>
        </div>
      </div>
      
      {/* Chart Description */}
      <div className="mt-4 p-4 bg-gray-50 rounded-lg">
        <h4 className="font-medium text-gray-900 mb-2">Chart Insights</h4>
        <div className="text-sm text-gray-600 space-y-1">
          {selectedMetric === 'users' && chartType === 'line' && (
            <p>User growth trend over time showing registration patterns and user acquisition.</p>
          )}
          {selectedMetric === 'users' && chartType === 'bar' && (
            <p>Geographic distribution of users showing market penetration by country.</p>
          )}
          {selectedMetric === 'users' && chartType === 'pie' && (
            <p>User role distribution showing the balance between regular users, jewelers, and admins.</p>
          )}
          {selectedMetric === 'orders' && chartType === 'line' && (
            <p>Order volume trend indicating business growth and seasonal patterns.</p>
          )}
          {selectedMetric === 'orders' && chartType === 'bar' && (
            <p>Revenue trend showing financial performance over the selected time period.</p>
          )}
          {selectedMetric === 'orders' && chartType === 'pie' && (
            <p>Order status distribution showing completion rates and processing efficiency.</p>
          )}
          {selectedMetric === 'content' && chartType === 'line' && (
            <p>Story creation trend showing user engagement with content generation features.</p>
          )}
          {selectedMetric === 'content' && chartType === 'bar' && (
            <p>Content overview showing story creation, sketch generation success, and processing performance.</p>
          )}
          {selectedMetric === 'engagement' && chartType === 'bar' && (
            <p>Most popular pages showing user navigation patterns and feature usage.</p>
          )}
          {selectedMetric === 'engagement' && chartType === 'pie' && (
            <p>Page view distribution showing relative popularity of different platform features.</p>
          )}
        </div>
      </div>
    </Card>
  );
}