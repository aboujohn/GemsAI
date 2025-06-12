'use client';

import React, { useState } from 'react';
import { useAuth } from '@/lib/hooks/useAuth';
import { useTranslation } from '@/lib/hooks/useTranslation';
import { useCart } from '@/contexts/CartContext';
import { DirectionalContainer } from '@/components/ui/DirectionalContainer';
import { Navigation } from '@/components/ui/navigation';
import { CheckoutProgress } from '@/components/ui/checkout-progress';
import { CheckoutCart } from '@/components/ui/checkout-cart';
import { CheckoutShipping } from '@/components/ui/checkout-shipping';
import { CheckoutPayment } from '@/components/ui/checkout-payment';
import { CheckoutConfirmation } from '@/components/ui/checkout-confirmation';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { CheckoutState, ShippingAddress, BillingAddress, ShippingMethod } from '@/lib/types/cart';
import { AuthGuard } from '@/components/providers/AuthGuard';

// Placeholder components - will be implemented in next subtasks

function CheckoutPageContent() {
  const { cart, cartSummary } = useCart();
  const { t } = useTranslation();
  
  const [checkoutState, setCheckoutState] = useState<CheckoutState>({
    step: 'cart',
    cart: cartSummary,
  });

  const handleCartContinue = () => {
    setCheckoutState(prev => ({
      ...prev,
      step: 'shipping',
      cart: cartSummary,
    }));
  };

  const handleShippingContinue = (
    shippingAddress: ShippingAddress,
    billingAddress: BillingAddress,
    shippingMethod: ShippingMethod
  ) => {
    setCheckoutState(prev => ({
      ...prev,
      step: 'payment',
      shippingAddress,
      billingAddress,
      shippingMethod,
    }));
  };

  const handlePaymentContinue = async (paymentMethod: 'stripe' | 'payplus', paymentData?: any) => {
    try {
      // Create order in database
      const response = await fetch('/api/orders/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          items: cart,
          shippingAddress: checkoutState.shippingAddress,
          billingAddress: checkoutState.billingAddress,
          shippingMethod: checkoutState.shippingMethod,
          paymentMethod,
          customerNotes: checkoutState.customerNotes,
          subtotal: cartSummary.subtotal,
          shipping: cartSummary.shipping,
          tax: cartSummary.tax,
          total: cartSummary.total,
          currency: cartSummary.currency,
        }),
      });

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.error || 'Failed to create order');
      }
      
      setCheckoutState(prev => ({
        ...prev,
        step: 'confirmation',
        paymentMethod,
        orderId: data.orderId,
      }));
    } catch (error) {
      console.error('Order creation failed:', error);
      throw error;
    }
  };

  const handleBackToCart = () => {
    setCheckoutState(prev => ({ ...prev, step: 'cart' }));
  };

  const handleBackToShipping = () => {
    setCheckoutState(prev => ({ ...prev, step: 'shipping' }));
  };

  // Redirect to products if cart is empty and not on confirmation step
  if (cart.length === 0 && checkoutState.step !== 'confirmation') {
    return (
      <DirectionalContainer className="min-h-screen bg-gray-50">
        <Navigation />
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Card className="p-12 text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">
              {t('checkout.emptyCart.title')}
            </h1>
            <p className="text-gray-600 mb-6">
              {t('checkout.emptyCart.description')}
            </p>
            <Button onClick={() => window.location.href = '/products'}>
              {t('checkout.emptyCart.browseProducts')}
            </Button>
          </Card>
        </div>
      </DirectionalContainer>
    );
  }

  return (
    <DirectionalContainer className="min-h-screen bg-gray-50">
      <Navigation />
      
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            {t('checkout.title')}
          </h1>
          <p className="text-gray-600 mt-2">
            {t('checkout.subtitle')}
          </p>
        </div>

        {/* Progress Indicator */}
        <CheckoutProgress currentStep={checkoutState.step} />

        {/* Step Content */}
        <div className="mt-8">
          {checkoutState.step === 'cart' && (
            <CheckoutCart onContinue={handleCartContinue} />
          )}
          
          {checkoutState.step === 'shipping' && (
            <CheckoutShipping 
              onContinue={handleShippingContinue}
              onBack={handleBackToCart}
            />
          )}
          
          {checkoutState.step === 'payment' && (
            <CheckoutPayment 
              onContinue={handlePaymentContinue}
              onBack={handleBackToShipping}
              checkoutState={checkoutState}
            />
          )}
          
          {checkoutState.step === 'confirmation' && (
            <CheckoutConfirmation checkoutState={checkoutState} />
          )}
        </div>
      </div>
    </DirectionalContainer>
  );
}

export default function CheckoutPage() {
  return (
    <AuthGuard>
      <CheckoutPageContent />
    </AuthGuard>
  );
}