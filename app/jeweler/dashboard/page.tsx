'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/hooks/useAuth';
import { useTranslation } from '@/lib/hooks/useTranslation';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { DirectionalContainer } from '@/components/ui/DirectionalContainer';
import { DirectionalFlex } from '@/components/ui/DirectionalFlex';
import { Icons } from '@/components/ui/Icons';
import { Badge } from '@/components/ui/badge';
import { Tabs } from '@/components/ui/tabs';
import { Navigation } from '@/components/ui/navigation';

interface DashboardMetrics {
  totalOrders: number;
  pendingOrders: number;
  completedOrders: number;
  totalRevenue: number;
  monthlyRevenue: number;
  activeProducts: number;
  totalProducts: number;
  averageRating: number;
  totalReviews: number;
  inventoryAlerts: number;
}

interface RecentOrder {
  id: string;
  orderNumber: string;
  customerName: string;
  productName: string;
  amount: number;
  status: string;
  createdAt: string;
}

interface InventoryAlert {
  id: string;
  productName: string;
  currentStock: number;
  minStock: number;
  type: 'low_stock' | 'out_of_stock';
}

export default function JewelerDashboard() {
  const { user, loading: authLoading } = useAuth();
  const { t, formatCurrency, formatDate } = useTranslation();
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
  const [recentOrders, setRecentOrders] = useState<RecentOrder[]>([]);
  const [inventoryAlerts, setInventoryAlerts] = useState<InventoryAlert[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!authLoading && user) {
      fetchDashboardData();
    }
  }, [user, authLoading]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch dashboard metrics
      const metricsResponse = await fetch('/api/jeweler/metrics', {
        headers: {
          'Authorization': `Bearer ${user?.token}`,
        },
      });

      if (!metricsResponse.ok) {
        throw new Error('Failed to fetch metrics');
      }

      const metricsData = await metricsResponse.json();
      setMetrics(metricsData);

      // Fetch recent orders
      const ordersResponse = await fetch('/api/jeweler/orders/recent?limit=10', {
        headers: {
          'Authorization': `Bearer ${user?.token}`,
        },
      });

      if (ordersResponse.ok) {
        const ordersData = await ordersResponse.json();
        setRecentOrders(ordersData);
      }

      // Fetch inventory alerts
      const alertsResponse = await fetch('/api/jeweler/inventory/alerts', {
        headers: {
          'Authorization': `Bearer ${user?.token}`,
        },
      });

      if (alertsResponse.ok) {
        const alertsData = await alertsResponse.json();
        setInventoryAlerts(alertsData);
      }

    } catch (err) {
      console.error('Error fetching dashboard data:', err);
      setError(err instanceof Error ? err.message : 'Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'confirmed':
        return 'bg-blue-100 text-blue-800';
      case 'in_progress':
        return 'bg-purple-100 text-purple-800';
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'shipped':
        return 'bg-indigo-100 text-indigo-800';
      case 'delivered':
        return 'bg-emerald-100 text-emerald-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (authLoading || loading) {
    return (
      <DirectionalContainer className="min-h-screen bg-gray-50">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
        </div>
      </DirectionalContainer>
    );
  }

  if (error) {
    return (
      <DirectionalContainer className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Card className="p-6 text-center">
            <Icons.AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <h2 className="text-lg font-semibold text-gray-900 mb-2">
              {t('common.error')}
            </h2>
            <p className="text-gray-600 mb-4">{error}</p>
            <Button onClick={fetchDashboardData}>
              {t('common.tryAgain')}
            </Button>
          </Card>
        </div>
      </DirectionalContainer>
    );
  }

  if (!metrics) {
    return null;
  }

  return (
    <DirectionalContainer className="min-h-screen bg-gray-50">
      <Navigation />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            {t('jeweler.dashboard.title')}
          </h1>
          <p className="text-gray-600 mt-2">
            {t('jeweler.dashboard.subtitle')}
          </p>
        </div>

        {/* Metrics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="p-6">
            <DirectionalFlex className="items-center">
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-600">
                  {t('jeweler.metrics.totalOrders')}
                </p>
                <p className="text-2xl font-bold text-gray-900">
                  {metrics.totalOrders}
                </p>
              </div>
              <div className="p-3 bg-blue-100 rounded-full">
                <Icons.ShoppingBag className="h-6 w-6 text-blue-600" />
              </div>
            </DirectionalFlex>
          </Card>

          <Card className="p-6">
            <DirectionalFlex className="items-center">
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-600">
                  {t('jeweler.metrics.monthlyRevenue')}
                </p>
                <p className="text-2xl font-bold text-gray-900">
                  {formatCurrency(metrics.monthlyRevenue)}
                </p>
              </div>
              <div className="p-3 bg-green-100 rounded-full">
                <Icons.DollarSign className="h-6 w-6 text-green-600" />
              </div>
            </DirectionalFlex>
          </Card>

          <Card className="p-6">
            <DirectionalFlex className="items-center">
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-600">
                  {t('jeweler.metrics.activeProducts')}
                </p>
                <p className="text-2xl font-bold text-gray-900">
                  {metrics.activeProducts}
                </p>
              </div>
              <div className="p-3 bg-purple-100 rounded-full">
                <Icons.Package className="h-6 w-6 text-purple-600" />
              </div>
            </DirectionalFlex>
          </Card>

          <Card className="p-6">
            <DirectionalFlex className="items-center">
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-600">
                  {t('jeweler.metrics.averageRating')}
                </p>
                <DirectionalFlex className="items-center gap-2">
                  <p className="text-2xl font-bold text-gray-900">
                    {metrics.averageRating.toFixed(1)}
                  </p>
                  <Icons.Star className="h-5 w-5 text-yellow-500 fill-current" />
                </DirectionalFlex>
              </div>
              <div className="p-3 bg-yellow-100 rounded-full">
                <Icons.Star className="h-6 w-6 text-yellow-600" />
              </div>
            </DirectionalFlex>
          </Card>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Recent Orders */}
          <div className="lg:col-span-2">
            <Card className="p-6">
              <DirectionalFlex className="justify-between items-center mb-6">
                <h2 className="text-lg font-semibold text-gray-900">
                  {t('jeweler.orders.recent')}
                </h2>
                <Button variant="outline" size="sm">
                  {t('jeweler.orders.viewAll')}
                </Button>
              </DirectionalFlex>

              {recentOrders.length === 0 ? (
                <div className="text-center py-8">
                  <Icons.ShoppingBag className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500">
                    {t('jeweler.orders.noOrders')}
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {recentOrders.map((order) => (
                    <div
                      key={order.id}
                      className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
                    >
                      <div className="flex-1">
                        <DirectionalFlex className="items-center gap-3 mb-2">
                          <p className="font-medium text-gray-900">
                            {order.orderNumber}
                          </p>
                          <Badge className={getStatusColor(order.status)}>
                            {t(`jeweler.orders.status.${order.status}`)}
                          </Badge>
                        </DirectionalFlex>
                        <p className="text-sm text-gray-600">
                          {order.customerName} • {order.productName}
                        </p>
                        <p className="text-xs text-gray-500">
                          {formatDate(order.createdAt)}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-gray-900">
                          {formatCurrency(order.amount)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Quick Actions */}
            <Card className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                {t('jeweler.quickActions.title')}
              </h3>
              <div className="space-y-3">
                <Button className="w-full justify-start" variant="outline">
                  <Icons.Plus className="h-4 w-4 mr-2" />
                  {t('jeweler.products.addNew')}
                </Button>
                <Button className="w-full justify-start" variant="outline">
                  <Icons.Package className="h-4 w-4 mr-2" />
                  {t('jeweler.inventory.manage')}
                </Button>
                <Button className="w-full justify-start" variant="outline">
                  <Icons.BarChart3 className="h-4 w-4 mr-2" />
                  {t('jeweler.analytics.view')}
                </Button>
                <Button className="w-full justify-start" variant="outline">
                  <Icons.Settings className="h-4 w-4 mr-2" />
                  {t('jeweler.profile.settings')}
                </Button>
              </div>
            </Card>

            {/* Inventory Alerts */}
            {inventoryAlerts.length > 0 && (
              <Card className="p-6">
                <DirectionalFlex className="items-center gap-2 mb-4">
                  <Icons.AlertTriangle className="h-5 w-5 text-orange-500" />
                  <h3 className="text-lg font-semibold text-gray-900">
                    {t('jeweler.inventory.alerts')}
                  </h3>
                </DirectionalFlex>
                <div className="space-y-3">
                  {inventoryAlerts.slice(0, 5).map((alert) => (
                    <div
                      key={alert.id}
                      className="p-3 bg-orange-50 border border-orange-200 rounded-lg"
                    >
                      <p className="text-sm font-medium text-orange-900">
                        {alert.productName}
                      </p>
                      <p className="text-xs text-orange-700">
                        {alert.type === 'out_of_stock'
                          ? t('jeweler.inventory.outOfStock')
                          : t('jeweler.inventory.lowStock', {
                              current: alert.currentStock,
                              min: alert.minStock,
                            })}
                      </p>
                    </div>
                  ))}
                  {inventoryAlerts.length > 5 && (
                    <Button variant="link" size="sm" className="p-0">
                      {t('jeweler.inventory.viewAllAlerts', {
                        count: inventoryAlerts.length - 5,
                      })}
                    </Button>
                  )}
                </div>
              </Card>
            )}

            {/* Performance Summary */}
            <Card className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                {t('jeweler.performance.title')}
              </h3>
              <div className="space-y-4">
                <div>
                  <DirectionalFlex className="justify-between text-sm mb-1">
                    <span className="text-gray-600">
                      {t('jeweler.performance.orderCompletion')}
                    </span>
                    <span className="font-medium">
                      {Math.round((metrics.completedOrders / metrics.totalOrders) * 100)}%
                    </span>
                  </DirectionalFlex>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-green-600 h-2 rounded-full"
                      style={{
                        width: `${Math.round((metrics.completedOrders / metrics.totalOrders) * 100)}%`,
                      }}
                    ></div>
                  </div>
                </div>
                <div>
                  <DirectionalFlex className="justify-between text-sm mb-1">
                    <span className="text-gray-600">
                      {t('jeweler.performance.productCatalog')}
                    </span>
                    <span className="font-medium">
                      {metrics.activeProducts}/{metrics.totalProducts}
                    </span>
                  </DirectionalFlex>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-blue-600 h-2 rounded-full"
                      style={{
                        width: `${Math.round((metrics.activeProducts / metrics.totalProducts) * 100)}%`,
                      }}
                    ></div>
                  </div>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </DirectionalContainer>
  );
}