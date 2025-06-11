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
import { JewelerProductForm } from '@/components/ui/jeweler-product-form';

interface Product {
  id: string;
  name: string;
  sku: string;
  price: number;
  currency: string;
  category: string;
  materials: string[];
  images: string[];
  is_available: boolean;
  inventory_count: number;
  lead_time_days: number;
  emotion_tags: string[];
  style_tags: string[];
  created_at: string;
  updated_at: string;
}

interface PaginationInfo {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export default function JewelerProductsPage() {
  const { user, loading: authLoading } = useAuth();
  const { t, formatCurrency } = useTranslation();
  
  const [products, setProducts] = useState<Product[]>([]);
  const [pagination, setPagination] = useState<PaginationInfo>({
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 0,
  });
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  
  // Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');

  useEffect(() => {
    if (!authLoading && user) {
      fetchProducts();
    }
  }, [user, authLoading, pagination.page, searchTerm, categoryFilter, statusFilter]);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      setError(null);

      const params = new URLSearchParams({
        page: pagination.page.toString(),
        limit: pagination.limit.toString(),
      });

      if (searchTerm) params.append('search', searchTerm);
      if (categoryFilter !== 'all') params.append('category', categoryFilter);
      if (statusFilter !== 'all') params.append('status', statusFilter);

      const response = await fetch(`/api/jeweler/products?${params}`, {
        headers: {
          'Authorization': `Bearer ${user?.token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch products');
      }

      const data = await response.json();
      setProducts(data.products);
      setPagination(data.pagination);

    } catch (err) {
      console.error('Error fetching products:', err);
      setError(err instanceof Error ? err.message : 'Failed to load products');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateProduct = async (formData: any) => {
    try {
      // Upload images first (this would typically go to your image upload endpoint)
      const imageUrls = await uploadImages(formData.images);

      const productData = {
        ...formData,
        images: imageUrls,
      };

      const response = await fetch('/api/jeweler/products', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${user?.token}`,
        },
        body: JSON.stringify(productData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create product');
      }

      setShowForm(false);
      await fetchProducts();
      
    } catch (error) {
      console.error('Error creating product:', error);
      throw error; // Re-throw to let the form handle the error
    }
  };

  const handleUpdateProduct = async (formData: any) => {
    if (!editingProduct) return;

    try {
      // Upload new images if any
      let imageUrls = editingProduct.images;
      if (formData.images && formData.images.length > 0) {
        imageUrls = await uploadImages(formData.images);
      }

      const productData = {
        ...formData,
        images: imageUrls,
      };

      const response = await fetch(`/api/jeweler/products/${editingProduct.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${user?.token}`,
        },
        body: JSON.stringify(productData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update product');
      }

      setEditingProduct(null);
      setShowForm(false);
      await fetchProducts();
      
    } catch (error) {
      console.error('Error updating product:', error);
      throw error;
    }
  };

  const handleDeleteProduct = async (product: Product) => {
    if (!confirm(t('jeweler.products.confirmDelete', { name: product.name }))) {
      return;
    }

    try {
      const response = await fetch(`/api/jeweler/products/${product.id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${user?.token}`,
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to delete product');
      }

      await fetchProducts();
      
    } catch (error) {
      console.error('Error deleting product:', error);
      setError(error instanceof Error ? error.message : 'Failed to delete product');
    }
  };

  const uploadImages = async (files: File[]): Promise<string[]> => {
    // This is a placeholder for image upload functionality
    // In a real implementation, you would upload to your storage service
    // For now, we'll simulate by returning placeholder URLs
    return files.map((_, index) => `https://placeholder.com/400x300?text=Product+Image+${index + 1}`);
  };

  const getStatusColor = (isAvailable: boolean, inventoryCount: number) => {
    if (!isAvailable) return 'bg-red-100 text-red-800';
    if (inventoryCount === 0) return 'bg-orange-100 text-orange-800';
    if (inventoryCount <= 5) return 'bg-yellow-100 text-yellow-800';
    return 'bg-green-100 text-green-800';
  };

  const getStatusText = (isAvailable: boolean, inventoryCount: number) => {
    if (!isAvailable) return t('jeweler.products.status.unavailable');
    if (inventoryCount === 0) return t('jeweler.products.status.outOfStock');
    if (inventoryCount <= 5) return t('jeweler.products.status.lowStock');
    return t('jeweler.products.status.available');
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

  if (showForm) {
    return (
      <DirectionalContainer className="min-h-screen bg-gray-50">
        <Navigation />
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <JewelerProductForm
            onSubmit={editingProduct ? handleUpdateProduct : handleCreateProduct}
            onCancel={() => {
              setShowForm(false);
              setEditingProduct(null);
            }}
            initialData={editingProduct || undefined}
          />
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
              {t('jeweler.products.title')}
            </h1>
            <p className="text-gray-600 mt-2">
              {t('jeweler.products.subtitle')}
            </p>
          </div>
          <Button onClick={() => setShowForm(true)}>
            <Icons.Plus className="h-4 w-4 mr-2" />
            {t('jeweler.products.addNew')}
          </Button>
        </DirectionalFlex>

        {/* Filters */}
        <Card className="p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <Input
                placeholder={t('jeweler.products.search')}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full"
              />
            </div>
            <div>
              <Select
                value={categoryFilter}
                onValueChange={setCategoryFilter}
              >
                <option value="all">{t('jeweler.products.allCategories')}</option>
                <option value="rings">{t('jeweler.products.categories.rings')}</option>
                <option value="necklaces">{t('jeweler.products.categories.necklaces')}</option>
                <option value="earrings">{t('jeweler.products.categories.earrings')}</option>
                <option value="bracelets">{t('jeweler.products.categories.bracelets')}</option>
                <option value="watches">{t('jeweler.products.categories.watches')}</option>
              </Select>
            </div>
            <div>
              <Select
                value={statusFilter}
                onValueChange={setStatusFilter}
              >
                <option value="all">{t('jeweler.products.allStatuses')}</option>
                <option value="available">{t('jeweler.products.status.available')}</option>
                <option value="unavailable">{t('jeweler.products.status.unavailable')}</option>
              </Select>
            </div>
            <div>
              <Button variant="outline" onClick={fetchProducts}>
                <Icons.RefreshCw className="h-4 w-4 mr-2" />
                {t('common.refresh')}
              </Button>
            </div>
          </div>
        </Card>

        {/* Error Message */}
        {error && (
          <Card className="p-6 mb-6 bg-red-50 border border-red-200">
            <DirectionalFlex className="items-center">
              <Icons.AlertCircle className="h-5 w-5 text-red-500 mr-2" />
              <p className="text-red-700">{error}</p>
            </DirectionalFlex>
          </Card>
        )}

        {/* Products Grid */}
        {products.length === 0 ? (
          <Card className="p-12 text-center">
            <Icons.Package className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {t('jeweler.products.noProducts')}
            </h3>
            <p className="text-gray-600 mb-6">
              {t('jeweler.products.noProductsDescription')}
            </p>
            <Button onClick={() => setShowForm(true)}>
              <Icons.Plus className="h-4 w-4 mr-2" />
              {t('jeweler.products.addFirstProduct')}
            </Button>
          </Card>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
              {products.map((product) => (
                <Card key={product.id} className="overflow-hidden">
                  <div className="aspect-w-16 aspect-h-9">
                    <img
                      src={product.images[0] || '/placeholder-product.jpg'}
                      alt={product.name}
                      className="w-full h-48 object-cover"
                    />
                  </div>
                  
                  <div className="p-6">
                    <DirectionalFlex className="justify-between items-start mb-2">
                      <h3 className="text-lg font-semibold text-gray-900 truncate">
                        {product.name}
                      </h3>
                      <Badge className={getStatusColor(product.is_available, product.inventory_count)}>
                        {getStatusText(product.is_available, product.inventory_count)}
                      </Badge>
                    </DirectionalFlex>
                    
                    <p className="text-sm text-gray-600 mb-2">
                      {t('jeweler.products.sku')}: {product.sku}
                    </p>
                    
                    <p className="text-xl font-bold text-gray-900 mb-4">
                      {formatCurrency(product.price, product.currency)}
                    </p>
                    
                    <div className="flex flex-wrap gap-1 mb-4">
                      {product.emotion_tags.slice(0, 3).map((tag) => (
                        <Badge key={tag} variant="secondary" className="text-xs">
                          {t(`emotions.${tag}`)}
                        </Badge>
                      ))}
                      {product.emotion_tags.length > 3 && (
                        <Badge variant="secondary" className="text-xs">
                          +{product.emotion_tags.length - 3}
                        </Badge>
                      )}
                    </div>
                    
                    <DirectionalFlex className="justify-between text-sm text-gray-600 mb-4">
                      <span>
                        {t('jeweler.products.inventory')}: {product.inventory_count}
                      </span>
                      <span>
                        {t('jeweler.products.leadTime')}: {product.lead_time_days}d
                      </span>
                    </DirectionalFlex>
                    
                    <DirectionalFlex className="justify-end gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setEditingProduct(product);
                          setShowForm(true);
                        }}
                      >
                        <Icons.Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDeleteProduct(product)}
                        className="text-red-600 hover:text-red-700 hover:border-red-300"
                      >
                        <Icons.Trash2 className="h-4 w-4" />
                      </Button>
                    </DirectionalFlex>
                  </div>
                </Card>
              ))}
            </div>

            {/* Pagination */}
            {pagination.totalPages > 1 && (
              <Card className="p-4">
                <DirectionalFlex className="justify-between items-center">
                  <p className="text-sm text-gray-600">
                    {t('common.pagination.showing', {
                      from: (pagination.page - 1) * pagination.limit + 1,
                      to: Math.min(pagination.page * pagination.limit, pagination.total),
                      total: pagination.total,
                    })}
                  </p>
                  
                  <DirectionalFlex className="gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={pagination.page === 1}
                      onClick={() => setPagination(prev => ({ ...prev, page: prev.page - 1 }))}
                    >
                      <Icons.ChevronLeft className="h-4 w-4" />
                      {t('common.pagination.previous')}
                    </Button>
                    
                    <span className="px-3 py-1 text-sm bg-gray-100 rounded">
                      {pagination.page} / {pagination.totalPages}
                    </span>
                    
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={pagination.page === pagination.totalPages}
                      onClick={() => setPagination(prev => ({ ...prev, page: prev.page + 1 }))}
                    >
                      {t('common.pagination.next')}
                      <Icons.ChevronRight className="h-4 w-4" />
                    </Button>
                  </DirectionalFlex>
                </DirectionalFlex>
              </Card>
            )}
          </>
        )}
      </div>
    </DirectionalContainer>
  );
}