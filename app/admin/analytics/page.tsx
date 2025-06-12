'use client';

import { useEffect, useState } from 'react';
import { useTranslation } from '@/lib/hooks/useTranslation';
import { AdminHeader } from '@/components/ui/admin-header';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Select } from '@/components/ui/select';
import { DirectionalContainer } from '@/components/ui/DirectionalContainer';
import { DirectionalFlex } from '@/components/ui/DirectionalFlex';
import { Icons } from '@/components/ui/Icons';
import { AdminMetricsDashboard } from '@/components/ui/admin-metrics-dashboard';
import { AdminCharts } from '@/components/ui/admin-charts';

interface AnalyticsData {
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

export default function AdminAnalytics() {
  const { t, formatCurrency } = useTranslation();
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState('7d');
  const [selectedMetric, setSelectedMetric] = useState('users');

  useEffect(() => {
    fetchAnalyticsData();
  }, [timeRange]);

  const fetchAnalyticsData = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/admin/analytics?range=${timeRange}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch analytics data');
      }
      
      const analyticsData = await response.json();
      setData(analyticsData);
    } catch (error) {
      console.error('Failed to fetch analytics:', error);
      
      // Use mock data for demo
      setData({
        timeRange,
        userMetrics: {
          totalUsers: 1247,
          activeUsers: 892,
          newUsers: 156,
          userGrowth: [120, 134, 145, 167, 189, 201, 234, 245, 289, 312, 334, 356, 378, 392, 412],
          usersByCountry: [
            { country: 'Israel', users: 734 },
            { country: 'United States', users: 198 },
            { country: 'United Kingdom', users: 89 },
            { country: 'Germany', users: 67 },
            { country: 'France', users: 54 },
          ],
          usersByRole: [
            { role: 'user', count: 1098 },
            { role: 'jeweler', count: 147 },
            { role: 'admin', count: 2 },
          ],
        },
        orderMetrics: {
          totalOrders: 456,
          totalRevenue: 125430,
          averageOrderValue: 275,
          orderGrowth: [23, 29, 31, 37, 42, 38, 45, 51, 48, 56, 62, 59, 67, 71, 69],
          revenueGrowth: [5600, 7200, 8100, 9400, 11200, 9800, 12300, 13900, 12800, 15200, 16800, 15900, 18200, 19600, 18900],
          ordersByStatus: [
            { status: 'completed', count: 398 },
            { status: 'pending', count: 23 },
            { status: 'processing', count: 18 },
            { status: 'cancelled', count: 17 },
          ],
        },
        contentMetrics: {
          totalStories: 2834,
          totalSketches: 2654,
          sketchSuccessRate: 93.6,
          avgGenerationTime: 45,
          storiesGrowth: [89, 102, 94, 118, 127, 134, 142, 156, 148, 167, 179, 185, 198, 203, 215],
          sketchesGrowth: [82, 96, 88, 109, 118, 125, 132, 145, 138, 155, 167, 172, 184, 189, 201],
        },
        engagementMetrics: {
          avgSessionDuration: 342,
          bounceRate: 24.3,
          pageViews: 15420,
          conversionRate: 3.7,
          topPages: [
            { page: '/story/new', views: 3420 },
            { page: '/dashboard', views: 2890 },
            { page: '/products', views: 2340 },
            { page: '/gift/create', views: 1890 },
            { page: '/auth/login', views: 1560 },
          ],
        },
      });
    } finally {
      setLoading(false);
    }
  };

  const timeRangeOptions = [
    { value: '24h', label: 'Last 24 Hours' },
    { value: '7d', label: 'Last 7 Days' },
    { value: '30d', label: 'Last 30 Days' },
    { value: '90d', label: 'Last 90 Days' },
    { value: '1y', label: 'Last Year' },
  ];

  const metricOptions = [
    { value: 'users', label: 'User Analytics' },
    { value: 'orders', label: 'Order Analytics' },
    { value: 'content', label: 'Content Analytics' },
    { value: 'engagement', label: 'Engagement Analytics' },
  ];

  const exportData = async () => {
    try {
      const response = await fetch(`/api/admin/analytics/export?range=${timeRange}&format=csv`);
      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `analytics-${timeRange}-${new Date().toISOString().split('T')[0]}.csv`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      }
    } catch (error) {
      console.error('Export failed:', error);
    }
  };

  if (loading) {
    return (
      <div className="flex-1">
        <AdminHeader title="Analytics Dashboard" subtitle="System metrics and insights" />
        <DirectionalContainer className="p-6">
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        </DirectionalContainer>
      </div>
    );
  }

  return (
    <div className="flex-1">
      <AdminHeader 
        title="Analytics Dashboard" 
        subtitle="System metrics and insights"
        actions={
          <DirectionalFlex className="items-center gap-3">
            <Select value={timeRange} onValueChange={setTimeRange}>
              {timeRangeOptions.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </Select>
            
            <Select value={selectedMetric} onValueChange={setSelectedMetric}>
              {metricOptions.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </Select>
            
            <Button onClick={exportData} variant="outline" size="sm">
              <Icons.Download className="h-4 w-4 mr-2" />
              Export
            </Button>
            
            <Button onClick={fetchAnalyticsData} variant="outline" size="sm">
              <Icons.RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </Button>
          </DirectionalFlex>
        }
      />
      
      <DirectionalContainer className="p-6 space-y-6">
        {/* Metrics Dashboard */}
        <AdminMetricsDashboard data={data} selectedMetric={selectedMetric} />
        
        {/* Charts Section */}
        <AdminCharts data={data} selectedMetric={selectedMetric} timeRange={timeRange} />
        
        {/* Detailed Analytics by Category */}
        {selectedMetric === 'users' && data && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Users by Country</h3>
              <div className="space-y-3">
                {data.userMetrics.usersByCountry.map((item, index) => (
                  <DirectionalFlex key={index} className="justify-between items-center">
                    <span className="text-gray-600">{item.country}</span>
                    <div className="flex items-center gap-2">
                      <div className="w-24 h-2 bg-gray-200 rounded-full">
                        <div 
                          className="h-2 bg-blue-500 rounded-full" 
                          style={{ 
                            width: `${(item.users / data.userMetrics.totalUsers) * 100}%` 
                          }}
                        />
                      </div>
                      <span className="font-medium text-gray-900 w-12 text-right">
                        {item.users}
                      </span>
                    </div>
                  </DirectionalFlex>
                ))}
              </div>
            </Card>
            
            <Card className="p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Users by Role</h3>
              <div className="space-y-3">
                {data.userMetrics.usersByRole.map((item, index) => (
                  <DirectionalFlex key={index} className="justify-between items-center">
                    <span className="text-gray-600 capitalize">{item.role}</span>
                    <div className="flex items-center gap-2">
                      <div className="w-24 h-2 bg-gray-200 rounded-full">
                        <div 
                          className="h-2 bg-green-500 rounded-full" 
                          style={{ 
                            width: `${(item.count / data.userMetrics.totalUsers) * 100}%` 
                          }}
                        />
                      </div>
                      <span className="font-medium text-gray-900 w-12 text-right">
                        {item.count}
                      </span>
                    </div>
                  </DirectionalFlex>
                ))}
              </div>
            </Card>
          </div>
        )}
        
        {selectedMetric === 'orders' && data && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Orders by Status</h3>
              <div className="space-y-3">
                {data.orderMetrics.ordersByStatus.map((item, index) => (
                  <DirectionalFlex key={index} className="justify-between items-center">
                    <span className="text-gray-600 capitalize">{item.status}</span>
                    <div className="flex items-center gap-2">
                      <div className="w-24 h-2 bg-gray-200 rounded-full">
                        <div 
                          className="h-2 bg-yellow-500 rounded-full" 
                          style={{ 
                            width: `${(item.count / data.orderMetrics.totalOrders) * 100}%` 
                          }}
                        />
                      </div>
                      <span className="font-medium text-gray-900 w-12 text-right">
                        {item.count}
                      </span>
                    </div>
                  </DirectionalFlex>
                ))}
              </div>
            </Card>
            
            <Card className="p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Revenue Insights</h3>
              <div className="space-y-4">
                <div>
                  <p className="text-sm text-gray-600">Total Revenue</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {formatCurrency(data.orderMetrics.totalRevenue, 'ILS')}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Average Order Value</p>
                  <p className="text-xl font-semibold text-gray-900">
                    {formatCurrency(data.orderMetrics.averageOrderValue, 'ILS')}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Conversion Rate</p>
                  <p className="text-xl font-semibold text-gray-900">
                    {data.engagementMetrics.conversionRate}%
                  </p>
                </div>
              </div>
            </Card>
          </div>
        )}
        
        {selectedMetric === 'engagement' && data && (
          <Card className="p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Top Pages</h3>
            <div className="space-y-3">
              {data.engagementMetrics.topPages.map((item, index) => (
                <DirectionalFlex key={index} className="justify-between items-center">
                  <span className="text-gray-600 font-mono text-sm">{item.page}</span>
                  <div className="flex items-center gap-2">
                    <div className="w-32 h-2 bg-gray-200 rounded-full">
                      <div 
                        className="h-2 bg-purple-500 rounded-full" 
                        style={{ 
                          width: `${(item.views / data.engagementMetrics.topPages[0].views) * 100}%` 
                        }}
                      />
                    </div>
                    <span className="font-medium text-gray-900 w-16 text-right">
                      {item.views.toLocaleString()}
                    </span>
                  </div>
                </DirectionalFlex>
              ))}
            </div>
          </Card>
        )}
      </DirectionalContainer>
    </div>
  );
}