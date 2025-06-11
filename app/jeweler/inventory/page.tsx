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

interface InventoryItem {
  id: string;
  name: string;
  sku: string;
  category: string;
  currentStock: number;
  minStock: number;
  maxStock: number;
  price: number;
  currency: string;
  lastUpdated: string;
  isAvailable: boolean;
  leadTimeDays: number;
  materials: string[];
}

interface InventoryAlert {
  id: string;
  productId: string;
  productName: string;
  currentStock: number;
  minStock: number;
  type: 'low_stock' | 'out_of_stock' | 'overstock';
  severity: 'high' | 'medium' | 'low';
}

interface InventoryStats {
  totalProducts: number;
  totalValue: number;
  lowStockItems: number;
  outOfStockItems: number;
  averageTurnover: number;
}

export default function JewelerInventoryPage() {
  const { user, loading: authLoading } = useAuth();
  const { t, formatCurrency } = useTranslation();
  
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [alerts, setAlerts] = useState<InventoryAlert[]>([]);
  const [stats, setStats] = useState<InventoryStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Filters and search
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [sortBy, setSortBy] = useState('name');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');

  // Bulk update modal
  const [showBulkUpdate, setShowBulkUpdate] = useState(false);
  const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set());
  const [bulkUpdateData, setBulkUpdateData] = useState({
    minStock: '',
    maxStock: '',
    isAvailable: true,
  });

  useEffect(() => {
    if (!authLoading && user) {
      fetchInventoryData();
    }
  }, [user, authLoading]);

  const fetchInventoryData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch inventory, alerts, and stats in parallel
      const [inventoryResponse, alertsResponse, statsResponse] = await Promise.all([
        fetch('/api/jeweler/inventory', {
          headers: { 'Authorization': `Bearer ${user?.token}` },
        }),
        fetch('/api/jeweler/inventory/alerts', {
          headers: { 'Authorization': `Bearer ${user?.token}` },
        }),
        fetch('/api/jeweler/inventory/stats', {
          headers: { 'Authorization': `Bearer ${user?.token}` },
        }),
      ]);

      if (!inventoryResponse.ok) {
        throw new Error('Failed to fetch inventory data');
      }

      const inventoryData = await inventoryResponse.json();
      setInventory(inventoryData);

      if (alertsResponse.ok) {
        const alertsData = await alertsResponse.json();
        setAlerts(alertsData);
      }

      if (statsResponse.ok) {
        const statsData = await statsResponse.json();
        setStats(statsData);
      }

    } catch (err) {
      console.error('Error fetching inventory data:', err);
      setError(err instanceof Error ? err.message : 'Failed to load inventory data');
    } finally {
      setLoading(false);
    }
  };

  const updateInventoryItem = async (itemId: string, updates: Partial<InventoryItem>) => {
    try {
      const response = await fetch(`/api/jeweler/products/${itemId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${user?.token}`,
        },
        body: JSON.stringify({
          inventoryCount: updates.currentStock,
          isAvailable: updates.isAvailable,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to update inventory item');
      }

      // Refresh data
      await fetchInventoryData();
      
    } catch (error) {
      console.error('Error updating inventory item:', error);
      setError(error instanceof Error ? error.message : 'Failed to update inventory item');
    }
  };

  const handleBulkUpdate = async () => {
    try {
      const updates = Array.from(selectedItems).map(itemId => ({
        id: itemId,
        ...bulkUpdateData,
      }));

      await Promise.all(
        updates.map(update =>
          updateInventoryItem(update.id, {
            currentStock: parseInt(update.minStock) || undefined,
            isAvailable: update.isAvailable,
          } as any)
        )
      );

      setShowBulkUpdate(false);
      setSelectedItems(new Set());
      setBulkUpdateData({ minStock: '', maxStock: '', isAvailable: true });
      
    } catch (error) {
      console.error('Error performing bulk update:', error);
    }
  };

  const filteredAndSortedInventory = inventory
    .filter(item => {
      const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           item.sku.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = categoryFilter === 'all' || item.category === categoryFilter;
      const matchesStatus = statusFilter === 'all' ||
                           (statusFilter === 'available' && item.isAvailable) ||
                           (statusFilter === 'unavailable' && !item.isAvailable) ||
                           (statusFilter === 'low_stock' && item.currentStock <= item.minStock) ||
                           (statusFilter === 'out_of_stock' && item.currentStock === 0);
      
      return matchesSearch && matchesCategory && matchesStatus;
    })
    .sort((a, b) => {
      let aValue: any = a[sortBy as keyof InventoryItem];
      let bValue: any = b[sortBy as keyof InventoryItem];
      
      if (typeof aValue === 'string') {
        aValue = aValue.toLowerCase();
        bValue = bValue.toLowerCase();
      }
      
      if (sortOrder === 'asc') {
        return aValue < bValue ? -1 : aValue > bValue ? 1 : 0;
      } else {
        return aValue > bValue ? -1 : aValue < bValue ? 1 : 0;
      }
    });

  const getStockStatus = (item: InventoryItem) => {
    if (!item.isAvailable) return { status: 'unavailable', color: 'bg-gray-100 text-gray-800' };
    if (item.currentStock === 0) return { status: 'out_of_stock', color: 'bg-red-100 text-red-800' };
    if (item.currentStock <= item.minStock) return { status: 'low_stock', color: 'bg-yellow-100 text-yellow-800' };
    if (item.currentStock >= item.maxStock) return { status: 'overstock', color: 'bg-blue-100 text-blue-800' };
    return { status: 'in_stock', color: 'bg-green-100 text-green-800' };
  };

  const getAlertSeverityColor = (severity: string) => {
    switch (severity) {
      case 'high': return 'bg-red-100 text-red-800 border-red-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low': return 'bg-blue-100 text-blue-800 border-blue-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
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
              {t('jeweler.inventory.title')}
            </h1>
            <p className="text-gray-600 mt-2">
              {t('jeweler.inventory.subtitle')}
            </p>
          </div>
          <DirectionalFlex className="gap-3">
            <Button variant="outline" onClick={fetchInventoryData}>
              <Icons.RefreshCw className="h-4 w-4 mr-2" />
              {t('common.refresh')}
            </Button>
            {selectedItems.size > 0 && (
              <Button onClick={() => setShowBulkUpdate(true)}>
                <Icons.Edit className="h-4 w-4 mr-2" />
                {t('jeweler.inventory.bulkUpdate')} ({selectedItems.size})
              </Button>
            )}
          </DirectionalFlex>
        </DirectionalFlex>

        {/* Statistics Cards */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
            <Card className="p-6">
              <DirectionalFlex className="items-center">
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-600">
                    {t('jeweler.inventory.stats.totalProducts')}
                  </p>
                  <p className="text-2xl font-bold text-gray-900">
                    {stats.totalProducts}
                  </p>
                </div>
                <div className="p-3 bg-blue-100 rounded-full">
                  <Icons.Package className="h-6 w-6 text-blue-600" />
                </div>
              </DirectionalFlex>
            </Card>

            <Card className="p-6">
              <DirectionalFlex className="items-center">
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-600">
                    {t('jeweler.inventory.stats.totalValue')}
                  </p>
                  <p className="text-2xl font-bold text-gray-900">
                    {formatCurrency(stats.totalValue)}
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
                    {t('jeweler.inventory.stats.lowStock')}
                  </p>
                  <p className="text-2xl font-bold text-yellow-600">
                    {stats.lowStockItems}
                  </p>
                </div>
                <div className="p-3 bg-yellow-100 rounded-full">
                  <Icons.AlertTriangle className="h-6 w-6 text-yellow-600" />
                </div>
              </DirectionalFlex>
            </Card>

            <Card className="p-6">
              <DirectionalFlex className="items-center">
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-600">
                    {t('jeweler.inventory.stats.outOfStock')}
                  </p>
                  <p className="text-2xl font-bold text-red-600">
                    {stats.outOfStockItems}
                  </p>
                </div>
                <div className="p-3 bg-red-100 rounded-full">
                  <Icons.XCircle className="h-6 w-6 text-red-600" />
                </div>
              </DirectionalFlex>
            </Card>

            <Card className="p-6">
              <DirectionalFlex className="items-center">
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-600">
                    {t('jeweler.inventory.stats.avgTurnover')}
                  </p>
                  <p className="text-2xl font-bold text-purple-600">
                    {stats.averageTurnover}%
                  </p>
                </div>
                <div className="p-3 bg-purple-100 rounded-full">
                  <Icons.TrendingUp className="h-6 w-6 text-purple-600" />
                </div>
              </DirectionalFlex>
            </Card>
          </div>
        )}

        {/* Alerts */}
        {alerts.length > 0 && (
          <Card className="p-6 mb-8">
            <DirectionalFlex className="items-center gap-2 mb-4">
              <Icons.AlertTriangle className="h-5 w-5 text-orange-500" />
              <h2 className="text-lg font-semibold text-gray-900">
                {t('jeweler.inventory.alerts.title')} ({alerts.length})
              </h2>
            </DirectionalFlex>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {alerts.slice(0, 6).map((alert) => (
                <div
                  key={alert.id}
                  className={`p-3 rounded-lg border ${getAlertSeverityColor(alert.severity)}`}
                >
                  <p className="font-medium">{alert.productName}</p>
                  <p className="text-sm">
                    {alert.type === 'out_of_stock'
                      ? t('jeweler.inventory.alerts.outOfStock')
                      : t('jeweler.inventory.alerts.lowStock', {
                          current: alert.currentStock,
                          min: alert.minStock,
                        })}
                  </p>
                </div>
              ))}
            </div>
            {alerts.length > 6 && (
              <p className="text-sm text-gray-600 mt-4">
                {t('jeweler.inventory.alerts.andMore', { count: alerts.length - 6 })}
              </p>
            )}
          </Card>
        )}

        {/* Filters */}
        <Card className="p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
            <div className="md:col-span-2">
              <Input
                placeholder={t('jeweler.inventory.search')}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full"
              />
            </div>
            <div>
              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <option value="all">{t('jeweler.inventory.allCategories')}</option>
                <option value="rings">{t('jeweler.products.categories.rings')}</option>
                <option value="necklaces">{t('jeweler.products.categories.necklaces')}</option>
                <option value="earrings">{t('jeweler.products.categories.earrings')}</option>
                <option value="bracelets">{t('jeweler.products.categories.bracelets')}</option>
              </Select>
            </div>
            <div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <option value="all">{t('jeweler.inventory.allStatuses')}</option>
                <option value="available">{t('jeweler.inventory.status.available')}</option>
                <option value="low_stock">{t('jeweler.inventory.status.lowStock')}</option>
                <option value="out_of_stock">{t('jeweler.inventory.status.outOfStock')}</option>
                <option value="unavailable">{t('jeweler.inventory.status.unavailable')}</option>
              </Select>
            </div>
            <div>
              <Select value={sortBy} onValueChange={setSortBy}>
                <option value="name">{t('jeweler.inventory.sortBy.name')}</option>
                <option value="currentStock">{t('jeweler.inventory.sortBy.stock')}</option>
                <option value="price">{t('jeweler.inventory.sortBy.price')}</option>
                <option value="lastUpdated">{t('jeweler.inventory.sortBy.updated')}</option>
              </Select>
            </div>
            <div>
              <Button
                variant="outline"
                onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                className="w-full"
              >
                {sortOrder === 'asc' ? (
                  <Icons.ArrowUp className="h-4 w-4 mr-2" />
                ) : (
                  <Icons.ArrowDown className="h-4 w-4 mr-2" />
                )}
                {sortOrder === 'asc' ? t('common.ascending') : t('common.descending')}
              </Button>
            </div>
          </div>
        </Card>

        {/* Inventory Table */}
        <Card className="overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    <input
                      type="checkbox"
                      checked={selectedItems.size === filteredAndSortedInventory.length}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedItems(new Set(filteredAndSortedInventory.map(item => item.id)));
                        } else {
                          setSelectedItems(new Set());
                        }
                      }}
                    />
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {t('jeweler.inventory.table.product')}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {t('jeweler.inventory.table.stock')}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {t('jeweler.inventory.table.status')}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {t('jeweler.inventory.table.price')}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {t('jeweler.inventory.table.actions')}
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredAndSortedInventory.map((item) => {
                  const stockStatus = getStockStatus(item);
                  return (
                    <tr key={item.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <input
                          type="checkbox"
                          checked={selectedItems.has(item.id)}
                          onChange={(e) => {
                            const newSelected = new Set(selectedItems);
                            if (e.target.checked) {
                              newSelected.add(item.id);
                            } else {
                              newSelected.delete(item.id);
                            }
                            setSelectedItems(newSelected);
                          }}
                        />
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-medium text-gray-900">{item.name}</div>
                          <div className="text-sm text-gray-500">SKU: {item.sku}</div>
                          <div className="text-sm text-gray-500">{t(`jeweler.products.categories.${item.category}`)}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {item.currentStock} / {item.maxStock}
                        </div>
                        <div className="text-xs text-gray-500">
                          {t('jeweler.inventory.minStock')}: {item.minStock}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <Badge className={stockStatus.color}>
                          {t(`jeweler.inventory.status.${stockStatus.status}`)}
                        </Badge>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {formatCurrency(item.price, item.currency)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <DirectionalFlex className="gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              const newStock = prompt(
                                t('jeweler.inventory.updateStock'),
                                item.currentStock.toString()
                              );
                              if (newStock !== null) {
                                updateInventoryItem(item.id, {
                                  currentStock: parseInt(newStock),
                                });
                              }
                            }}
                          >
                            <Icons.Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              updateInventoryItem(item.id, {
                                isAvailable: !item.isAvailable,
                              });
                            }}
                            className={item.isAvailable ? 'text-red-600' : 'text-green-600'}
                          >
                            {item.isAvailable ? (
                              <Icons.EyeOff className="h-4 w-4" />
                            ) : (
                              <Icons.Eye className="h-4 w-4" />
                            )}
                          </Button>
                        </DirectionalFlex>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </Card>

        {/* Empty State */}
        {filteredAndSortedInventory.length === 0 && (
          <Card className="p-12 text-center mt-6">
            <Icons.Package className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {t('jeweler.inventory.noItems')}
            </h3>
            <p className="text-gray-600">
              {t('jeweler.inventory.noItemsDescription')}
            </p>
          </Card>
        )}
      </div>
    </DirectionalContainer>
  );
}