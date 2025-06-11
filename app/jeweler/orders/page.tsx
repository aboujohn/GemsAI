'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/hooks/useAuth';
import { useTranslation } from '@/lib/hooks/useTranslation';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { DirectionalContainer } from '@/components/ui/DirectionalContainer';
import { DirectionalFlex } from '@/components/ui/DirectionalFlex';
import { Icons } from '@/components/ui/Icons';
import { Badge } from '@/components/ui/badge';
import { Select } from '@/components/ui/select';
import { Navigation } from '@/components/ui/navigation';
import { Tabs } from '@/components/ui/tabs';

interface Order {
  id: string;
  orderNumber: string;
  customer: {
    id: string;
    name: string;
    email: string;
    phone?: string;
  };
  product: {
    id: string;
    name: string;
    sku: string;
    images: string[];
  };
  story?: {
    id: string;
    emotion: string;
    content: string;
  };
  status: string;
  paymentStatus: string;
  totalAmount: number;
  currency: string;
  shippingAddress: any;
  billingAddress: any;
  trackingNumber?: string;
  estimatedDelivery?: string;
  actualDelivery?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

interface OrderStats {
  total: number;
  pending: number;
  inProgress: number;
  completed: number;
  revenue: number;
  averageValue: number;
}

export default function JewelerOrdersPage() {
  const { user, loading: authLoading } = useAuth();
  const { t, formatCurrency, formatDate } = useTranslation();
  
  const [orders, setOrders] = useState<Order[]>([]);
  const [stats, setStats] = useState<OrderStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [paymentFilter, setPaymentFilter] = useState('all');
  const [dateRange, setDateRange] = useState('all');
  
  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const itemsPerPage = 20;

  // Selected order for details
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [showOrderDetails, setShowOrderDetails] = useState(false);

  useEffect(() => {
    if (!authLoading && user) {
      fetchOrders();
      fetchOrderStats();
    }
  }, [user, authLoading, currentPage, statusFilter, paymentFilter, dateRange, searchTerm]);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      setError(null);

      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: itemsPerPage.toString(),
      });

      if (searchTerm) params.append('search', searchTerm);
      if (statusFilter !== 'all') params.append('status', statusFilter);
      if (paymentFilter !== 'all') params.append('paymentStatus', paymentFilter);
      if (dateRange !== 'all') params.append('dateRange', dateRange);

      const response = await fetch(`/api/jeweler/orders?${params}`, {
        headers: {
          'Authorization': `Bearer ${user?.token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch orders');
      }

      const data = await response.json();
      setOrders(data.orders);
      setTotalPages(data.pagination.totalPages);

    } catch (err) {
      console.error('Error fetching orders:', err);
      setError(err instanceof Error ? err.message : 'Failed to load orders');
    } finally {
      setLoading(false);
    }
  };

  const fetchOrderStats = async () => {
    try {
      const response = await fetch('/api/jeweler/orders/stats', {
        headers: {
          'Authorization': `Bearer ${user?.token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setStats(data);
      }
    } catch (err) {
      console.error('Error fetching order stats:', err);
    }
  };

  const updateOrderStatus = async (orderId: string, status: string) => {
    try {
      const response = await fetch(`/api/jeweler/orders/${orderId}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${user?.token}`,
        },
        body: JSON.stringify({ status }),
      });

      if (!response.ok) {
        throw new Error('Failed to update order status');
      }

      // Refresh orders
      await fetchOrders();
      await fetchOrderStats();
      
    } catch (error) {
      console.error('Error updating order status:', error);
      setError(error instanceof Error ? error.message : 'Failed to update order status');
    }
  };

  const addTrackingNumber = async (orderId: string, trackingNumber: string) => {
    try {
      const response = await fetch(`/api/jeweler/orders/${orderId}/tracking`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${user?.token}`,
        },
        body: JSON.stringify({ trackingNumber }),
      });

      if (!response.ok) {
        throw new Error('Failed to add tracking number');
      }

      await fetchOrders();
      
    } catch (error) {
      console.error('Error adding tracking number:', error);
      setError(error instanceof Error ? error.message : 'Failed to add tracking number');
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

  const getPaymentStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'processing':
        return 'bg-blue-100 text-blue-800';
      case 'failed':
        return 'bg-red-100 text-red-800';
      case 'refunded':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getNextStatus = (currentStatus: string) => {
    const statusFlow = {
      'pending': 'confirmed',
      'confirmed': 'in_progress',
      'in_progress': 'completed',
      'completed': 'shipped',
      'shipped': 'delivered',
    };
    return statusFlow[currentStatus as keyof typeof statusFlow];
  };

  if (authLoading || loading) {
    return (
      <DirectionalContainer className="min-h-screen bg-gray-50">
        <Navigation />
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
        </div>
      </DirectionalContainer>
    );
  }

  return (
    <DirectionalContainer className="min-h-screen bg-gray-50">
      <Navigation />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <DirectionalFlex className="justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              {t('jeweler.orders.title')}
            </h1>
            <p className="text-gray-600 mt-2">
              {t('jeweler.orders.subtitle')}
            </p>
          </div>
          <Button variant="outline" onClick={fetchOrders}>
            <Icons.RefreshCw className="h-4 w-4 mr-2" />
            {t('common.refresh')}
          </Button>
        </DirectionalFlex>

        {/* Statistics Cards */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-6 mb-8">
            <Card className="p-6">
              <DirectionalFlex className="items-center">
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-600">
                    {t('jeweler.orders.stats.total')}
                  </p>
                  <p className="text-2xl font-bold text-gray-900">
                    {stats.total}
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
                    {t('jeweler.orders.stats.pending')}
                  </p>
                  <p className="text-2xl font-bold text-yellow-600">
                    {stats.pending}
                  </p>
                </div>
                <div className="p-3 bg-yellow-100 rounded-full">
                  <Icons.Clock className="h-6 w-6 text-yellow-600" />
                </div>
              </DirectionalFlex>
            </Card>

            <Card className="p-6">
              <DirectionalFlex className="items-center">
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-600">
                    {t('jeweler.orders.stats.inProgress')}
                  </p>
                  <p className="text-2xl font-bold text-purple-600">
                    {stats.inProgress}
                  </p>
                </div>
                <div className="p-3 bg-purple-100 rounded-full">
                  <Icons.Settings className="h-6 w-6 text-purple-600" />
                </div>
              </DirectionalFlex>
            </Card>

            <Card className="p-6">
              <DirectionalFlex className="items-center">
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-600">
                    {t('jeweler.orders.stats.completed')}
                  </p>
                  <p className="text-2xl font-bold text-green-600">
                    {stats.completed}
                  </p>
                </div>
                <div className="p-3 bg-green-100 rounded-full">
                  <Icons.CheckCircle className="h-6 w-6 text-green-600" />
                </div>
              </DirectionalFlex>
            </Card>

            <Card className="p-6">
              <DirectionalFlex className="items-center">
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-600">
                    {t('jeweler.orders.stats.revenue')}
                  </p>
                  <p className="text-2xl font-bold text-green-900">
                    {formatCurrency(stats.revenue)}
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
                    {t('jeweler.orders.stats.avgValue')}
                  </p>
                  <p className="text-2xl font-bold text-indigo-600">
                    {formatCurrency(stats.averageValue)}
                  </p>
                </div>
                <div className="p-3 bg-indigo-100 rounded-full">
                  <Icons.TrendingUp className="h-6 w-6 text-indigo-600" />
                </div>
              </DirectionalFlex>
            </Card>
          </div>
        )}

        {/* Filters */}
        <Card className="p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <div>
              <Input
                placeholder={t('jeweler.orders.search')}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full"
              />
            </div>
            <div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <option value="all">{t('jeweler.orders.allStatuses')}</option>
                <option value="pending">{t('jeweler.orders.status.pending')}</option>
                <option value="confirmed">{t('jeweler.orders.status.confirmed')}</option>
                <option value="in_progress">{t('jeweler.orders.status.inProgress')}</option>
                <option value="completed">{t('jeweler.orders.status.completed')}</option>
                <option value="shipped">{t('jeweler.orders.status.shipped')}</option>
                <option value="delivered">{t('jeweler.orders.status.delivered')}</option>
                <option value="cancelled">{t('jeweler.orders.status.cancelled')}</option>
              </Select>
            </div>
            <div>
              <Select value={paymentFilter} onValueChange={setPaymentFilter}>
                <option value="all">{t('jeweler.orders.allPayments')}</option>
                <option value="pending">{t('jeweler.orders.payment.pending')}</option>
                <option value="completed">{t('jeweler.orders.payment.completed')}</option>
                <option value="failed">{t('jeweler.orders.payment.failed')}</option>
                <option value="refunded">{t('jeweler.orders.payment.refunded')}</option>
              </Select>
            </div>
            <div>
              <Select value={dateRange} onValueChange={setDateRange}>
                <option value="all">{t('jeweler.orders.allDates')}</option>
                <option value="today">{t('jeweler.orders.dateRange.today')}</option>
                <option value="week">{t('jeweler.orders.dateRange.thisWeek')}</option>
                <option value="month">{t('jeweler.orders.dateRange.thisMonth')}</option>
                <option value="quarter">{t('jeweler.orders.dateRange.thisQuarter')}</option>
              </Select>
            </div>
            <div>
              <Button variant="outline" onClick={() => {
                setSearchTerm('');
                setStatusFilter('all');
                setPaymentFilter('all');
                setDateRange('all');
                setCurrentPage(1);
              }}>
                <Icons.X className="h-4 w-4 mr-2" />
                {t('common.clearFilters')}
              </Button>
            </div>
          </div>
        </Card>

        {/* Orders Table */}
        <Card className="overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {t('jeweler.orders.table.order')}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {t('jeweler.orders.table.customer')}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {t('jeweler.orders.table.product')}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {t('jeweler.orders.table.amount')}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {t('jeweler.orders.table.status')}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {t('jeweler.orders.table.payment')}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {t('jeweler.orders.table.date')}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {t('jeweler.orders.table.actions')}
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {orders.map((order) => (
                  <tr key={order.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {order.orderNumber}
                        </div>
                        {order.trackingNumber && (
                          <div className="text-xs text-gray-500">
                            {t('jeweler.orders.tracking')}: {order.trackingNumber}
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {order.customer.name}
                        </div>
                        <div className="text-sm text-gray-500">
                          {order.customer.email}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <DirectionalFlex className="items-center">
                        <img
                          className="h-10 w-10 rounded-md object-cover mr-3"
                          src={order.product.images[0] || '/placeholder-product.jpg'}
                          alt={order.product.name}
                        />
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {order.product.name}
                          </div>
                          <div className="text-sm text-gray-500">
                            {order.product.sku}
                          </div>
                        </div>
                      </DirectionalFlex>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {formatCurrency(order.totalAmount, order.currency)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <Badge className={getStatusColor(order.status)}>
                        {t(`jeweler.orders.status.${order.status}`)}
                      </Badge>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <Badge className={getPaymentStatusColor(order.paymentStatus)}>
                        {t(`jeweler.orders.payment.${order.paymentStatus}`)}
                      </Badge>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatDate(order.createdAt)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <DirectionalFlex className="gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setSelectedOrder(order);
                            setShowOrderDetails(true);
                          }}
                        >
                          <Icons.Eye className="h-4 w-4" />
                        </Button>
                        {getNextStatus(order.status) && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => updateOrderStatus(order.id, getNextStatus(order.status)!)}
                          >
                            <Icons.ArrowRight className="h-4 w-4" />
                          </Button>
                        )}
                        {order.status === 'completed' && !order.trackingNumber && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              const tracking = prompt(t('jeweler.orders.enterTracking'));
                              if (tracking) {
                                addTrackingNumber(order.id, tracking);
                              }
                            }}
                          >
                            <Icons.Truck className="h-4 w-4" />
                          </Button>
                        )}
                      </DirectionalFlex>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="px-6 py-4 border-t border-gray-200">
              <DirectionalFlex className="justify-between items-center">
                <p className="text-sm text-gray-600">
                  {t('common.pagination.showing', {
                    from: (currentPage - 1) * itemsPerPage + 1,
                    to: Math.min(currentPage * itemsPerPage, orders.length),
                    total: orders.length,
                  })}
                </p>
                
                <DirectionalFlex className="gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={currentPage === 1}
                    onClick={() => setCurrentPage(currentPage - 1)}
                  >
                    <Icons.ChevronLeft className="h-4 w-4" />
                    {t('common.pagination.previous')}
                  </Button>
                  
                  <span className="px-3 py-1 text-sm bg-gray-100 rounded">
                    {currentPage} / {totalPages}
                  </span>
                  
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={currentPage === totalPages}
                    onClick={() => setCurrentPage(currentPage + 1)}
                  >
                    {t('common.pagination.next')}
                    <Icons.ChevronRight className="h-4 w-4" />
                  </Button>
                </DirectionalFlex>
              </DirectionalFlex>
            </div>
          )}
        </Card>

        {/* Empty State */}
        {orders.length === 0 && (
          <Card className="p-12 text-center mt-6">
            <Icons.ShoppingBag className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {t('jeweler.orders.noOrders')}
            </h3>
            <p className="text-gray-600">
              {t('jeweler.orders.noOrdersDescription')}
            </p>
          </Card>
        )}
      </div>
    </DirectionalContainer>
  );
}