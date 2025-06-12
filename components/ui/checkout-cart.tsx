'use client';

import React from 'react';
import { useCart } from '@/contexts/CartContext';
import { useTranslation } from '@/lib/hooks/useTranslation';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { DirectionalContainer } from '@/components/ui/DirectionalContainer';
import { DirectionalFlex } from '@/components/ui/DirectionalFlex';
import { Icons } from '@/components/ui/Icons';
import { Badge } from '@/components/ui/badge';

interface CheckoutCartProps {
  onContinue: () => void;
}

export function CheckoutCart({ onContinue }: CheckoutCartProps) {
  const { cart, cartSummary, updateItem, removeItem } = useCart();
  const { t, formatCurrency } = useTranslation();

  if (cart.length === 0) {
    return (
      <Card className="p-12 text-center">
        <Icons.ShoppingBag className="h-16 w-16 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">
          {t('checkout.cart.empty.title')}
        </h3>
        <p className="text-gray-600 mb-6">
          {t('checkout.cart.empty.description')}
        </p>
        <Button onClick={() => window.location.href = '/products'}>
          {t('checkout.cart.empty.browseProducts')}
        </Button>
      </Card>
    );
  }

  return (
    <DirectionalContainer className="space-y-6">
      {/* Cart Header */}
      <Card className="p-6">
        <DirectionalFlex className="justify-between items-center">
          <h2 className="text-2xl font-bold text-gray-900">
            {t('checkout.cart.title')}
          </h2>
          <Badge variant="secondary">
            {t('checkout.cart.itemCount', { count: cartSummary.itemCount })}
          </Badge>
        </DirectionalFlex>
      </Card>

      {/* Cart Items */}
      <Card className="divide-y">
        {cart.map((item) => (
          <div key={item.id} className="p-6">
            <DirectionalFlex className="gap-4">
              {/* Product Image */}
              <div className="flex-shrink-0">
                <img
                  src={item.product.images[0] || '/placeholder-product.jpg'}
                  alt={item.product.name}
                  className="w-20 h-20 object-cover rounded-lg"
                />
              </div>

              {/* Product Details */}
              <div className="flex-1 min-w-0">
                <h3 className="text-lg font-medium text-gray-900 truncate">
                  {item.product.name}
                </h3>
                <p className="text-sm text-gray-500">
                  {t('checkout.cart.by')} {item.product.jewelerName}
                </p>
                <p className="text-sm text-gray-500">
                  {t('checkout.cart.sku')}: {item.product.sku}
                </p>
                
                {/* Customization */}
                {item.customization && (
                  <div className="mt-2 space-y-1">
                    {Object.entries(item.customization).map(([key, value]) => (
                      value && (
                        <p key={key} className="text-xs text-gray-600">
                          {t(`checkout.cart.customization.${key}`)}: {value}
                        </p>
                      )
                    ))}
                  </div>
                )}

                {/* Lead Time */}
                <div className="mt-2">
                  <Badge variant="outline" className="text-xs">
                    {t('checkout.cart.leadTime', { days: item.product.leadTimeDays })}
                  </Badge>
                </div>
              </div>

              {/* Quantity and Price */}
              <div className="flex-shrink-0 text-right">
                <div className="text-lg font-medium text-gray-900">
                  {formatCurrency(item.product.price * item.quantity, item.product.currency)}
                </div>
                
                {/* Quantity Controls */}
                <DirectionalFlex className="items-center gap-2 mt-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => updateItem(item.id, item.quantity - 1)}
                    disabled={item.quantity <= 1}
                  >
                    <Icons.Minus className="h-3 w-3" />
                  </Button>
                  
                  <Input
                    type="number"
                    min="1"
                    max="10"
                    value={item.quantity}
                    onChange={(e) => updateItem(item.id, parseInt(e.target.value) || 1)}
                    className="w-16 text-center text-sm"
                  />
                  
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => updateItem(item.id, item.quantity + 1)}
                    disabled={item.quantity >= 10}
                  >
                    <Icons.Plus className="h-3 w-3" />
                  </Button>
                </DirectionalFlex>

                {/* Remove Item */}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => removeItem(item.id)}
                  className="mt-2 text-red-600 hover:text-red-700"
                >
                  <Icons.Trash2 className="h-4 w-4 mr-1" />
                  {t('checkout.cart.remove')}
                </Button>
              </div>
            </DirectionalFlex>
          </div>
        ))}
      </Card>

      {/* Order Summary */}
      <Card className="p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">
          {t('checkout.cart.summary.title')}
        </h3>
        
        <div className="space-y-3">
          <DirectionalFlex className="justify-between">
            <span className="text-gray-600">
              {t('checkout.cart.summary.subtotal')}
            </span>
            <span className="text-gray-900">
              {formatCurrency(cartSummary.subtotal, cartSummary.currency)}
            </span>
          </DirectionalFlex>
          
          <DirectionalFlex className="justify-between">
            <span className="text-gray-600">
              {t('checkout.cart.summary.shipping')}
            </span>
            <span className="text-gray-900">
              {cartSummary.shipping === 0 
                ? t('checkout.cart.summary.freeShipping')
                : formatCurrency(cartSummary.shipping, cartSummary.currency)
              }
            </span>
          </DirectionalFlex>
          
          <DirectionalFlex className="justify-between">
            <span className="text-gray-600">
              {t('checkout.cart.summary.tax')}
            </span>
            <span className="text-gray-900">
              {formatCurrency(cartSummary.tax, cartSummary.currency)}
            </span>
          </DirectionalFlex>
          
          <hr className="border-gray-200" />
          
          <DirectionalFlex className="justify-between">
            <span className="text-lg font-medium text-gray-900">
              {t('checkout.cart.summary.total')}
            </span>
            <span className="text-lg font-bold text-gray-900">
              {formatCurrency(cartSummary.total, cartSummary.currency)}
            </span>
          </DirectionalFlex>
        </div>

        {/* Estimated Delivery */}
        <div className="mt-4 p-3 bg-blue-50 rounded-lg">
          <DirectionalFlex className="items-center gap-2">
            <Icons.Truck className="h-4 w-4 text-blue-600" />
            <span className="text-sm text-blue-800">
              {t('checkout.cart.estimatedDelivery', { date: cartSummary.estimatedDelivery })}
            </span>
          </DirectionalFlex>
        </div>

        {/* Continue Button */}
        <Button
          onClick={onContinue}
          className="w-full mt-6"
          size="lg"
        >
          {t('checkout.cart.continue')}
          <Icons.ArrowRight className="h-4 w-4 ml-2" />
        </Button>
      </Card>
    </DirectionalContainer>
  );
}