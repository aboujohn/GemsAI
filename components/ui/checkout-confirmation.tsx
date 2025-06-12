'use client';

import React, { useEffect, useState } from 'react';
import { useTranslation } from '@/lib/hooks/useTranslation';
import { useCart } from '@/contexts/CartContext';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { DirectionalContainer } from '@/components/ui/DirectionalContainer';
import { DirectionalFlex } from '@/components/ui/DirectionalFlex';
import { Icons } from '@/components/ui/Icons';
import { Badge } from '@/components/ui/badge';
import { CheckoutState } from '@/lib/types/cart';
import { orderService, Order } from '@/lib/services/order-service';

interface CheckoutConfirmationProps {
  checkoutState: CheckoutState;
}

export function CheckoutConfirmation({ checkoutState }: CheckoutConfirmationProps) {
  const { t, formatCurrency, formatDate } = useTranslation();
  const { clearCart } = useCart();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (checkoutState.orderId) {
      loadOrderDetails();
      // Clear cart after successful order
      clearCart();
    }
  }, [checkoutState.orderId]);

  const loadOrderDetails = async () => {
    if (!checkoutState.orderId) return;

    try {
      const orderData = await orderService.getOrder(checkoutState.orderId);
      setOrder(orderData);
    } catch (error) {
      console.error('Failed to load order details:', error);
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

  if (loading) {
    return (
      <Card className="p-12 text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <p className="text-gray-600">{t('common.loading')}</p>
      </Card>
    );
  }

  return (
    <DirectionalContainer className="space-y-6">
      {/* Success Header */}
      <Card className="p-8 text-center bg-green-50 border-green-200">
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <Icons.CheckCircle className="h-8 w-8 text-green-600" />
        </div>
        <h2 className="text-2xl font-bold text-green-900 mb-2">
          {t('checkout.confirmation.title')}
        </h2>
        <p className="text-green-800 mb-4">
          {t('checkout.confirmation.thankYou')}
        </p>
        {checkoutState.orderId && (
          <div className="bg-white p-3 rounded border border-green-200">
            <span className="text-sm font-medium text-gray-600">
              {t('checkout.confirmation.orderId')}:
            </span>
            <span className="ml-2 font-mono text-lg text-gray-900">
              {order?.orderNumber || checkoutState.orderId}
            </span>
          </div>
        )}
      </Card>

      {/* Order Details */}
      {order && (
        <>
          <Card className="p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              {t('checkout.confirmation.orderDetails.title')}
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-medium text-gray-900 mb-2">Order Status</h4>
                <DirectionalFlex className="items-center gap-2">
                  <Badge className={getStatusColor(order.status)}>
                    {order.status}
                  </Badge>
                  <Badge className={getPaymentStatusColor(order.paymentStatus)}>
                    Payment: {order.paymentStatus}
                  </Badge>
                </DirectionalFlex>
              </div>
              
              <div>
                <h4 className="font-medium text-gray-900 mb-2">Order Date</h4>
                <p className="text-gray-600">{formatDate(order.createdAt)}</p>
              </div>
            </div>
          </Card>

          {/* Order Items */}
          <Card className="p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              {t('checkout.confirmation.orderDetails.items')}
            </h3>
            
            <div className="space-y-4">
              {order.items.map((item) => (
                <div key={item.id} className="border-b border-gray-200 pb-4 last:border-b-0">
                  <DirectionalFlex className="justify-between items-start">
                    <div className="flex-1">
                      <h4 className="font-medium text-gray-900">{item.productName}</h4>
                      <p className="text-sm text-gray-500">SKU: {item.productSku}</p>
                      <p className="text-sm text-gray-600">
                        Quantity: {item.quantity} × {formatCurrency(item.unitPrice, order.currency)}
                      </p>
                      {item.customization && (
                        <div className="mt-1">
                          <p className="text-xs text-gray-500">
                            Customizations: {JSON.stringify(item.customization)}
                          </p>
                        </div>
                      )}
                    </div>
                    <div className="text-right">
                      <p className="font-medium text-gray-900">
                        {formatCurrency(item.totalPrice, order.currency)}
                      </p>
                    </div>
                  </DirectionalFlex>
                </div>
              ))}
            </div>
            
            <div className="mt-6 pt-4 border-t border-gray-200">
              <DirectionalFlex className="justify-between items-center">
                <span className="text-lg font-medium text-gray-900">Total</span>
                <span className="text-xl font-bold text-gray-900">
                  {formatCurrency(order.totalAmount, order.currency)}
                </span>
              </DirectionalFlex>
            </div>
          </Card>

          {/* Shipping Address */}
          <Card className="p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              {t('checkout.confirmation.orderDetails.shipping')}
            </h3>
            
            <div className="text-gray-600">
              <p>{order.shippingAddress.firstName} {order.shippingAddress.lastName}</p>
              {order.shippingAddress.company && <p>{order.shippingAddress.company}</p>}
              <p>{order.shippingAddress.address1}</p>
              {order.shippingAddress.address2 && <p>{order.shippingAddress.address2}</p>}
              <p>{order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.postalCode}</p>
              <p>{order.shippingAddress.country}</p>
              {order.shippingAddress.phone && <p>Phone: {order.shippingAddress.phone}</p>}
            </div>
          </Card>
        </>
      )}

      {/* Next Steps */}
      <Card className="p-6 bg-blue-50 border-blue-200">
        <h3 className="text-lg font-medium text-blue-900 mb-4">What's Next?</h3>
        <div className="space-y-3 text-blue-800">
          <DirectionalFlex className="items-center gap-2">
            <Icons.Mail className="h-4 w-4" />
            <span>{t('checkout.confirmation.emailSent')}</span>
          </DirectionalFlex>
          <DirectionalFlex className="items-center gap-2">
            <Icons.Settings className="h-4 w-4" />
            <span>Your jeweler will begin crafting your custom piece</span>
          </DirectionalFlex>
          <DirectionalFlex className="items-center gap-2">
            <Icons.Truck className="h-4 w-4" />
            <span>You'll receive tracking information once your order ships</span>
          </DirectionalFlex>
        </div>
      </Card>

      {/* Action Buttons */}
      <Card className="p-6">
        <DirectionalFlex className="justify-center gap-4">
          <Button
            variant="outline"
            onClick={() => window.location.href = '/dashboard/orders'}
          >
            <Icons.Eye className="h-4 w-4 mr-2" />
            {t('checkout.confirmation.trackOrder')}
          </Button>
          
          <Button onClick={() => window.location.href = '/products'}>
            <Icons.ShoppingBag className="h-4 w-4 mr-2" />
            {t('checkout.confirmation.continueShopping')}
          </Button>
        </DirectionalFlex>
      </Card>
    </DirectionalContainer>
  );
}