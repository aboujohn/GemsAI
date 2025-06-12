'use client';

import { useTranslation } from '@/lib/hooks/useTranslation';
import { Card } from '@/components/ui/Card';
import { DirectionalFlex } from '@/components/ui/DirectionalFlex';
import { Icons } from '@/components/ui/Icons';
import { Badge } from '@/components/ui/badge';

interface MetricsData {
  userMetrics: {
    totalUsers: number;
    activeUsers: number;
    newUsers: number;
    userGrowth: number[];
  };
  orderMetrics: {
    totalOrders: number;
    totalRevenue: number;
    averageOrderValue: number;
    orderGrowth: number[];
    revenueGrowth: number[];
  };
  contentMetrics: {
    totalStories: number;
    totalSketches: number;
    sketchSuccessRate: number;
    avgGenerationTime: number;
  };
  engagementMetrics: {
    avgSessionDuration: number;
    bounceRate: number;
    pageViews: number;
    conversionRate: number;
  };
}

interface AdminMetricsDashboardProps {
  data: MetricsData | null;
  selectedMetric: string;
}

export function AdminMetricsDashboard({ data, selectedMetric }: AdminMetricsDashboardProps) {
  const { t, formatCurrency } = useTranslation();

  if (!data) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[...Array(4)].map((_, i) => (
          <Card key={i} className="p-6 animate-pulse">
            <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
            <div className="h-8 bg-gray-200 rounded w-1/2 mb-2"></div>
            <div className="h-3 bg-gray-200 rounded w-1/4"></div>
          </Card>
        ))}
      </div>
    );
  }

  const calculateGrowth = (data: number[]) => {
    if (data.length < 2) return 0;
    const current = data[data.length - 1];
    const previous = data[data.length - 2];
    return previous > 0 ? ((current - previous) / previous) * 100 : 0;
  };

  const formatDuration = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}m ${remainingSeconds}s`;
  };

  const getGrowthIcon = (growth: number) => {
    if (growth > 0) return <Icons.TrendingUp className="h-3 w-3 text-green-500" />;
    if (growth < 0) return <Icons.TrendingDown className="h-3 w-3 text-red-500" />;
    return <Icons.Minus className="h-3 w-3 text-gray-500" />;
  };

  const getGrowthColor = (growth: number) => {
    if (growth > 0) return 'text-green-600';
    if (growth < 0) return 'text-red-600';
    return 'text-gray-600';
  };

  const formatGrowth = (growth: number) => {
    const sign = growth > 0 ? '+' : '';
    return `${sign}${growth.toFixed(1)}%`;
  };

  if (selectedMetric === 'users') {
    const userGrowth = calculateGrowth(data.userMetrics.userGrowth);
    
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="p-6">
          <DirectionalFlex className="items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Users</p>
              <p className="text-2xl font-bold text-gray-900">
                {data.userMetrics.totalUsers.toLocaleString()}
              </p>
              <DirectionalFlex className="items-center gap-1 mt-1">
                {getGrowthIcon(userGrowth)}
                <span className={`text-xs ${getGrowthColor(userGrowth)}`}>
                  {formatGrowth(userGrowth)}
                </span>
              </DirectionalFlex>
            </div>
            <div className="p-3 bg-blue-100 rounded-full">
              <Icons.Users className="h-6 w-6 text-blue-600" />
            </div>
          </DirectionalFlex>
        </Card>

        <Card className="p-6">
          <DirectionalFlex className="items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Active Users</p>
              <p className="text-2xl font-bold text-gray-900">
                {data.userMetrics.activeUsers.toLocaleString()}
              </p>
              <p className="text-xs text-gray-500 mt-1">
                {((data.userMetrics.activeUsers / data.userMetrics.totalUsers) * 100).toFixed(1)}% of total
              </p>
            </div>
            <div className="p-3 bg-green-100 rounded-full">
              <Icons.UserCheck className="h-6 w-6 text-green-600" />
            </div>
          </DirectionalFlex>
        </Card>

        <Card className="p-6">
          <DirectionalFlex className="items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">New Users</p>
              <p className="text-2xl font-bold text-gray-900">
                {data.userMetrics.newUsers.toLocaleString()}
              </p>
              <p className="text-xs text-gray-500 mt-1">
                This period
              </p>
            </div>
            <div className="p-3 bg-purple-100 rounded-full">
              <Icons.UserPlus className="h-6 w-6 text-purple-600" />
            </div>
          </DirectionalFlex>
        </Card>

        <Card className="p-6">
          <DirectionalFlex className="items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Growth Rate</p>
              <p className="text-2xl font-bold text-gray-900">
                {formatGrowth(userGrowth)}
              </p>
              <p className="text-xs text-gray-500 mt-1">
                vs previous period
              </p>
            </div>
            <div className="p-3 bg-yellow-100 rounded-full">
              <Icons.TrendingUp className="h-6 w-6 text-yellow-600" />
            </div>
          </DirectionalFlex>
        </Card>
      </div>
    );
  }

  if (selectedMetric === 'orders') {
    const orderGrowth = calculateGrowth(data.orderMetrics.orderGrowth);
    const revenueGrowth = calculateGrowth(data.orderMetrics.revenueGrowth);
    
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="p-6">
          <DirectionalFlex className="items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Orders</p>
              <p className="text-2xl font-bold text-gray-900">
                {data.orderMetrics.totalOrders.toLocaleString()}
              </p>
              <DirectionalFlex className="items-center gap-1 mt-1">
                {getGrowthIcon(orderGrowth)}
                <span className={`text-xs ${getGrowthColor(orderGrowth)}`}>
                  {formatGrowth(orderGrowth)}
                </span>
              </DirectionalFlex>
            </div>
            <div className="p-3 bg-blue-100 rounded-full">
              <Icons.ShoppingBag className="h-6 w-6 text-blue-600" />
            </div>
          </DirectionalFlex>
        </Card>

        <Card className="p-6">
          <DirectionalFlex className="items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Revenue</p>
              <p className="text-2xl font-bold text-gray-900">
                {formatCurrency(data.orderMetrics.totalRevenue, 'ILS')}
              </p>
              <DirectionalFlex className="items-center gap-1 mt-1">
                {getGrowthIcon(revenueGrowth)}
                <span className={`text-xs ${getGrowthColor(revenueGrowth)}`}>
                  {formatGrowth(revenueGrowth)}
                </span>
              </DirectionalFlex>
            </div>
            <div className="p-3 bg-green-100 rounded-full">
              <Icons.DollarSign className="h-6 w-6 text-green-600" />
            </div>
          </DirectionalFlex>
        </Card>

        <Card className="p-6">
          <DirectionalFlex className="items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Avg Order Value</p>
              <p className="text-2xl font-bold text-gray-900">
                {formatCurrency(data.orderMetrics.averageOrderValue, 'ILS')}
              </p>
              <p className="text-xs text-gray-500 mt-1">
                Per order
              </p>
            </div>
            <div className="p-3 bg-purple-100 rounded-full">
              <Icons.Calculator className="h-6 w-6 text-purple-600" />
            </div>
          </DirectionalFlex>
        </Card>

        <Card className="p-6">
          <DirectionalFlex className="items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Conversion Rate</p>
              <p className="text-2xl font-bold text-gray-900">
                {data.engagementMetrics.conversionRate}%
              </p>
              <p className="text-xs text-gray-500 mt-1">
                Visitors to orders
              </p>
            </div>
            <div className="p-3 bg-yellow-100 rounded-full">
              <Icons.Target className="h-6 w-6 text-yellow-600" />
            </div>
          </DirectionalFlex>
        </Card>
      </div>
    );
  }

  if (selectedMetric === 'content') {
    const storyGrowth = calculateGrowth(data.contentMetrics.storiesGrowth || []);
    const sketchGrowth = calculateGrowth(data.contentMetrics.sketchesGrowth || []);
    
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="p-6">
          <DirectionalFlex className="items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Stories</p>
              <p className="text-2xl font-bold text-gray-900">
                {data.contentMetrics.totalStories.toLocaleString()}
              </p>
              <DirectionalFlex className="items-center gap-1 mt-1">
                {getGrowthIcon(storyGrowth)}
                <span className={`text-xs ${getGrowthColor(storyGrowth)}`}>
                  {formatGrowth(storyGrowth)}
                </span>
              </DirectionalFlex>
            </div>
            <div className="p-3 bg-blue-100 rounded-full">
              <Icons.FileText className="h-6 w-6 text-blue-600" />
            </div>
          </DirectionalFlex>
        </Card>

        <Card className="p-6">
          <DirectionalFlex className="items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">AI Sketches</p>
              <p className="text-2xl font-bold text-gray-900">
                {data.contentMetrics.totalSketches.toLocaleString()}
              </p>
              <DirectionalFlex className="items-center gap-1 mt-1">
                {getGrowthIcon(sketchGrowth)}
                <span className={`text-xs ${getGrowthColor(sketchGrowth)}`}>
                  {formatGrowth(sketchGrowth)}
                </span>
              </DirectionalFlex>
            </div>
            <div className="p-3 bg-green-100 rounded-full">
              <Icons.Image className="h-6 w-6 text-green-600" />
            </div>
          </DirectionalFlex>
        </Card>

        <Card className="p-6">
          <DirectionalFlex className="items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Success Rate</p>
              <p className="text-2xl font-bold text-gray-900">
                {data.contentMetrics.sketchSuccessRate}%
              </p>
              <p className="text-xs text-gray-500 mt-1">
                Sketch generation
              </p>
            </div>
            <div className="p-3 bg-purple-100 rounded-full">
              <Icons.CheckCircle className="h-6 w-6 text-purple-600" />
            </div>
          </DirectionalFlex>
        </Card>

        <Card className="p-6">
          <DirectionalFlex className="items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Avg Generation Time</p>
              <p className="text-2xl font-bold text-gray-900">
                {data.contentMetrics.avgGenerationTime}s
              </p>
              <p className="text-xs text-gray-500 mt-1">
                AI processing
              </p>
            </div>
            <div className="p-3 bg-yellow-100 rounded-full">
              <Icons.Clock className="h-6 w-6 text-yellow-600" />
            </div>
          </DirectionalFlex>
        </Card>
      </div>
    );
  }

  if (selectedMetric === 'engagement') {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="p-6">
          <DirectionalFlex className="items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Page Views</p>
              <p className="text-2xl font-bold text-gray-900">
                {data.engagementMetrics.pageViews.toLocaleString()}
              </p>
              <p className="text-xs text-gray-500 mt-1">
                This period
              </p>
            </div>
            <div className="p-3 bg-blue-100 rounded-full">
              <Icons.Eye className="h-6 w-6 text-blue-600" />
            </div>
          </DirectionalFlex>
        </Card>

        <Card className="p-6">
          <DirectionalFlex className="items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Session Duration</p>
              <p className="text-2xl font-bold text-gray-900">
                {formatDuration(data.engagementMetrics.avgSessionDuration)}
              </p>
              <p className="text-xs text-gray-500 mt-1">
                Average
              </p>
            </div>
            <div className="p-3 bg-green-100 rounded-full">
              <Icons.Clock className="h-6 w-6 text-green-600" />
            </div>
          </DirectionalFlex>
        </Card>

        <Card className="p-6">
          <DirectionalFlex className="items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Bounce Rate</p>
              <p className="text-2xl font-bold text-gray-900">
                {data.engagementMetrics.bounceRate}%
              </p>
              <Badge variant={data.engagementMetrics.bounceRate < 30 ? "default" : "destructive"} className="mt-1">
                {data.engagementMetrics.bounceRate < 30 ? 'Good' : 'Needs Improvement'}
              </Badge>
            </div>
            <div className="p-3 bg-purple-100 rounded-full">
              <Icons.MousePointer className="h-6 w-6 text-purple-600" />
            </div>
          </DirectionalFlex>
        </Card>

        <Card className="p-6">
          <DirectionalFlex className="items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Conversion Rate</p>
              <p className="text-2xl font-bold text-gray-900">
                {data.engagementMetrics.conversionRate}%
              </p>
              <p className="text-xs text-gray-500 mt-1">
                Visitors to customers
              </p>
            </div>
            <div className="p-3 bg-yellow-100 rounded-full">
              <Icons.Target className="h-6 w-6 text-yellow-600" />
            </div>
          </DirectionalFlex>
        </Card>
      </div>
    );
  }

  return null;
}