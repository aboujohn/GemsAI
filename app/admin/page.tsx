'use client';

import { useEffect, useState } from 'react';
import { useTranslation } from '@/lib/hooks/useTranslation';
import { AdminHeader } from '@/components/ui/admin-header';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { DirectionalContainer } from '@/components/ui/DirectionalContainer';
import { DirectionalFlex } from '@/components/ui/DirectionalFlex';
import { Icons } from '@/components/ui/Icons';
import { Badge } from '@/components/ui/badge';

interface DashboardStats {
  users: {
    total: number;
    active: number;
    newToday: number;
    growth: number;
  };
  orders: {
    total: number;
    pending: number;
    completed: number;
    revenue: number;
  };
  sketches: {
    total: number;
    generating: number;
    completed: number;
    failed: number;
  };
  system: {
    uptime: string;
    queueHealth: 'healthy' | 'warning' | 'error';
    errorRate: number;
    responseTime: number;
  };
}

export default function AdminDashboard() {
  const { t, formatCurrency } = useTranslation();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchDashboardStats();
    
    // Set up real-time updates every 30 seconds
    const interval = setInterval(fetchDashboardStats, 30000);
    return () => clearInterval(interval);
  }, []);

  const fetchDashboardStats = async () => {
    try {
      const response = await fetch('/api/admin/dashboard/stats');
      if (!response.ok) {
        throw new Error('Failed to fetch dashboard stats');
      }
      const data = await response.json();
      setStats(data);
      setError(null);
    } catch (err) {
      console.error('Failed to fetch dashboard stats:', err);
      setError(err instanceof Error ? err.message : 'Unknown error');
      
      // Use mock data for demo
      setStats({
        users: {
          total: 1247,
          active: 892,
          newToday: 23,
          growth: 12.5,
        },
        orders: {
          total: 456,
          pending: 12,
          completed: 428,
          revenue: 125430,
        },
        sketches: {
          total: 2834,
          generating: 5,
          completed: 2801,
          failed: 28,
        },
        system: {
          uptime: '99.9%',
          queueHealth: 'healthy',
          errorRate: 0.2,
          responseTime: 145,
        },
      });
    } finally {
      setLoading(false);
    }
  };

  const getSystemHealthColor = (health: string) => {
    switch (health) {
      case 'healthy':
        return 'bg-green-100 text-green-800';
      case 'warning':
        return 'bg-yellow-100 text-yellow-800';
      case 'error':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatPercentage = (value: number) => {
    return `${value > 0 ? '+' : ''}${value.toFixed(1)}%`;
  };

  if (loading) {
    return (
      <div className="flex-1">
        <AdminHeader title={t('admin.dashboard.title')} subtitle={t('admin.dashboard.subtitle')} />
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
        title={t('admin.dashboard.title')} 
        subtitle={t('admin.dashboard.subtitle')}
        actions={
          <Button onClick={fetchDashboardStats} variant="outline" size="sm">
            <Icons.RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        }
      />
      
      <DirectionalContainer className="p-6 space-y-6">
        {error && (
          <Card className="p-4 bg-yellow-50 border-yellow-200">
            <DirectionalFlex className="items-center gap-2">
              <Icons.AlertTriangle className="h-5 w-5 text-yellow-600" />
              <span className="text-yellow-800">
                Using demo data - API endpoint not available: {error}
              </span>
            </DirectionalFlex>
          </Card>
        )}

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Users */}
          <Card className="p-6">
            <DirectionalFlex className="items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Users</p>
                <p className="text-2xl font-bold text-gray-900">{stats?.users.total.toLocaleString()}</p>
                <DirectionalFlex className="items-center gap-1 mt-1">
                  <Icons.TrendingUp className="h-3 w-3 text-green-500" />
                  <span className="text-xs text-green-600">
                    {formatPercentage(stats?.users.growth || 0)}
                  </span>
                </DirectionalFlex>
              </div>
              <div className="p-3 bg-blue-100 rounded-full">
                <Icons.Users className="h-6 w-6 text-blue-600" />
              </div>
            </DirectionalFlex>
          </Card>

          {/* Orders */}
          <Card className="p-6">
            <DirectionalFlex className="items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Orders</p>
                <p className="text-2xl font-bold text-gray-900">{stats?.orders.total.toLocaleString()}</p>
                <p className="text-xs text-gray-500 mt-1">
                  {stats?.orders.pending} pending
                </p>
              </div>
              <div className="p-3 bg-green-100 rounded-full">
                <Icons.ShoppingBag className="h-6 w-6 text-green-600" />
              </div>
            </DirectionalFlex>
          </Card>

          {/* Revenue */}
          <Card className="p-6">
            <DirectionalFlex className="items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Revenue</p>
                <p className="text-2xl font-bold text-gray-900">
                  {formatCurrency(stats?.orders.revenue || 0, 'ILS')}
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  This month
                </p>
              </div>
              <div className="p-3 bg-yellow-100 rounded-full">
                <Icons.DollarSign className="h-6 w-6 text-yellow-600" />
              </div>
            </DirectionalFlex>
          </Card>

          {/* Sketches */}
          <Card className="p-6">
            <DirectionalFlex className="items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">AI Sketches</p>
                <p className="text-2xl font-bold text-gray-900">{stats?.sketches.total.toLocaleString()}</p>
                <p className="text-xs text-gray-500 mt-1">
                  {stats?.sketches.generating} generating
                </p>
              </div>
              <div className="p-3 bg-purple-100 rounded-full">
                <Icons.Image className="h-6 w-6 text-purple-600" />
              </div>
            </DirectionalFlex>
          </Card>
        </div>

        {/* System Health */}
        <Card className="p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">System Health</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="text-center">
              <p className="text-sm text-gray-600">Uptime</p>
              <p className="text-xl font-bold text-gray-900">{stats?.system.uptime}</p>
            </div>
            
            <div className="text-center">
              <p className="text-sm text-gray-600">Queue Health</p>
              <Badge className={getSystemHealthColor(stats?.system.queueHealth || 'healthy')}>
                {stats?.system.queueHealth || 'healthy'}
              </Badge>
            </div>
            
            <div className="text-center">
              <p className="text-sm text-gray-600">Error Rate</p>
              <p className="text-xl font-bold text-gray-900">{stats?.system.errorRate}%</p>
            </div>
            
            <div className="text-center">
              <p className="text-sm text-gray-600">Response Time</p>
              <p className="text-xl font-bold text-gray-900">{stats?.system.responseTime}ms</p>
            </div>
          </div>
        </Card>

        {/* Quick Actions */}
        <Card className="p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Quick Actions</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Button
              variant="outline"
              className="justify-start h-auto p-4"
              onClick={() => window.location.href = '/admin/users'}
            >
              <div className="text-left">
                <DirectionalFlex className="items-center gap-2 mb-1">
                  <Icons.Users className="h-4 w-4" />
                  <span className="font-medium">Manage Users</span>
                </DirectionalFlex>
                <p className="text-xs text-gray-500">
                  View and manage user accounts
                </p>
              </div>
            </Button>
            
            <Button
              variant="outline"
              className="justify-start h-auto p-4"
              onClick={() => window.location.href = '/admin/content'}
            >
              <div className="text-left">
                <DirectionalFlex className="items-center gap-2 mb-1">
                  <Icons.FileText className="h-4 w-4" />
                  <span className="font-medium">Review Content</span>
                </DirectionalFlex>
                <p className="text-xs text-gray-500">
                  Moderate stories and sketches
                </p>
              </div>
            </Button>
            
            <Button
              variant="outline"
              className="justify-start h-auto p-4"
              onClick={() => window.location.href = '/admin/monitoring'}
            >
              <div className="text-left">
                <DirectionalFlex className="items-center gap-2 mb-1">
                  <Icons.Activity className="h-4 w-4" />
                  <span className="font-medium">System Monitor</span>
                </DirectionalFlex>
                <p className="text-xs text-gray-500">
                  Check system health and logs
                </p>
              </div>
            </Button>
          </div>
        </Card>
      </DirectionalContainer>
    </div>
  );
}