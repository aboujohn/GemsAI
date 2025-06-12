'use client';

import React, { useState } from 'react';
import { useCart } from '@/contexts/CartContext';
import { useTranslation } from '@/lib/hooks/useTranslation';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { DirectionalContainer } from '@/components/ui/DirectionalContainer';
import { DirectionalFlex } from '@/components/ui/DirectionalFlex';
import { Icons } from '@/components/ui/Icons';
import { Badge } from '@/components/ui/badge';
import { Alert } from '@/components/ui/alert';
import { CheckoutState } from '@/lib/types/cart';

interface CheckoutPaymentProps {
  onContinue: (paymentMethod: 'stripe' | 'payplus', paymentData?: any) => Promise<void>;
  onBack: () => void;
  checkoutState: CheckoutState;
}

interface PaymentMethod {
  id: 'stripe' | 'payplus';
  name: string;
  description: string;
  icon: React.ComponentType<any>;
  currencies: string[];
  fees: string;
  processingTime: string;
}

const PAYMENT_METHODS: PaymentMethod[] = [
  {
    id: 'payplus',
    name: 'PayPlus - Israeli Payment Methods',
    description: 'Credit cards, debit cards, and local Israeli payment methods',
    icon: Icons.CreditCard,
    currencies: ['ILS'],
    fees: '2.9% + ₪1.50',
    processingTime: 'Instant',
  },
  {
    id: 'stripe',
    name: 'Stripe - International Payments',
    description: 'Credit cards, Apple Pay, Google Pay, and more',
    icon: Icons.CreditCard,
    currencies: ['USD', 'EUR', 'GBP'],
    fees: '2.9% + $0.30',
    processingTime: 'Instant',
  },
];

export function CheckoutPayment({ onContinue, onBack, checkoutState }: CheckoutPaymentProps) {
  const { cartSummary } = useCart();
  const { t, formatCurrency } = useTranslation();
  const [selectedMethod, setSelectedMethod] = useState<'stripe' | 'payplus'>('payplus');
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Determine best payment method based on currency and location
  const recommendedMethod = cartSummary.currency === 'ILS' ? 'payplus' : 'stripe';
  
  const handlePaymentSubmit = async () => {
    setProcessing(true);
    setError(null);

    try {
      if (selectedMethod === 'payplus') {
        await handlePayPlusPayment();
      } else {
        await handleStripePayment();
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Payment failed');
      setProcessing(false);
    }
  };

  const handlePayPlusPayment = async () => {
    try {
      // Create PayPlus payment request
      const response = await fetch('/api/payment/payplus/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          amount: cartSummary.total,
          currency: cartSummary.currency,
          orderId: `temp_${Date.now()}`, // Temporary order ID
          customerName: `${checkoutState.shippingAddress?.firstName} ${checkoutState.shippingAddress?.lastName}`,
          customerEmail: 'customer@example.com', // Should come from auth context
          customerPhone: checkoutState.shippingAddress?.phone,
          description: `GemsAI Order - ${cartSummary.itemCount} items`,
          returnUrl: `${window.location.origin}/checkout/payment/payplus/return`,
          cancelUrl: `${window.location.origin}/checkout/payment/payplus/cancel`,
          webhookUrl: `${window.location.origin}/api/payment/payplus/webhook`,
        }),
      });

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.error || 'Failed to create PayPlus payment');
      }

      // Redirect to PayPlus payment page
      if (data.redirectUrl) {
        window.location.href = data.redirectUrl;
      } else {
        // For mock/demo mode, simulate success
        await onContinue('payplus', { paymentId: data.paymentId });
      }
    } catch (error) {
      console.error('PayPlus payment failed:', error);
      throw error;
    }
  };

  const handleStripePayment = async () => {
    try {
      // Create Stripe payment intent
      const response = await fetch('/api/payment/stripe/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          amount: cartSummary.total,
          currency: cartSummary.currency,
          orderId: `temp_${Date.now()}`,
          customerName: `${checkoutState.shippingAddress?.firstName} ${checkoutState.shippingAddress?.lastName}`,
          customerEmail: 'customer@example.com',
          description: `GemsAI Order - ${cartSummary.itemCount} items`,
          returnUrl: `${window.location.origin}/checkout/payment/stripe/return`,
          cancelUrl: `${window.location.origin}/checkout/payment/stripe/cancel`,
        }),
      });

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.error || 'Failed to create Stripe payment');
      }

      // For now, simulate success - in real implementation, would use Stripe Elements
      await onContinue('stripe', { 
        clientSecret: data.clientSecret,
        paymentIntentId: data.paymentIntentId 
      });
    } catch (error) {
      console.error('Stripe payment failed:', error);
      throw error;
    }
  };

  const getMethodAvailability = (method: PaymentMethod) => {
    return method.currencies.includes(cartSummary.currency);
  };

  return (
    <DirectionalContainer className="space-y-6">
      {/* Payment Method Selection */}
      <Card className="p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-6">
          {t('checkout.payment.methods.title')}
        </h2>

        {error && (
          <Alert variant="destructive" className="mb-6">
            <Icons.AlertCircle className="h-4 w-4" />
            <div>
              <h4 className="font-medium">Payment Error</h4>
              <p>{error}</p>
            </div>
          </Alert>
        )}

        <div className="space-y-4">
          {PAYMENT_METHODS.map((method) => {
            const isAvailable = getMethodAvailability(method);
            const isRecommended = method.id === recommendedMethod;
            
            return (
              <div
                key={method.id}
                className={`
                  relative p-4 border rounded-lg cursor-pointer transition-colors
                  ${!isAvailable ? 'opacity-50 cursor-not-allowed' : ''}
                  ${selectedMethod === method.id && isAvailable
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:border-gray-300'
                  }
                `}
                onClick={() => isAvailable && setSelectedMethod(method.id)}
              >
                {isRecommended && isAvailable && (
                  <Badge
                    variant="secondary"
                    className="absolute top-2 right-2 bg-green-100 text-green-800"
                  >
                    Recommended
                  </Badge>
                )}
                
                <DirectionalFlex className="items-start gap-4">
                  <div className="flex items-center gap-3">
                    <div
                      className={`
                        w-4 h-4 rounded-full border-2 flex items-center justify-center
                        ${selectedMethod === method.id && isAvailable
                          ? 'border-blue-500'
                          : 'border-gray-300'
                        }
                      `}
                    >
                      {selectedMethod === method.id && isAvailable && (
                        <div className="w-2 h-2 rounded-full bg-blue-500" />
                      )}
                    </div>
                    
                    <method.icon className="h-6 w-6 text-gray-600" />
                  </div>
                  
                  <div className="flex-1">
                    <h3 className="font-medium text-gray-900">{method.name}</h3>
                    <p className="text-sm text-gray-600 mt-1">{method.description}</p>
                    
                    <div className="mt-2 space-y-1">
                      <div className="text-xs text-gray-500">
                        <strong>Currencies:</strong> {method.currencies.join(', ')}
                      </div>
                      <div className="text-xs text-gray-500">
                        <strong>Fees:</strong> {method.fees}
                      </div>
                      <div className="text-xs text-gray-500">
                        <strong>Processing:</strong> {method.processingTime}
                      </div>
                    </div>
                    
                    {!isAvailable && (
                      <div className="mt-2">
                        <Badge variant="outline" className="text-xs">
                          Not available for {cartSummary.currency}
                        </Badge>
                      </div>
                    )}
                  </div>
                </DirectionalFlex>
              </div>
            );
          })}
        </div>
      </Card>

      {/* Security Notice */}
      <Card className="p-4 bg-green-50 border-green-200">
        <DirectionalFlex className="items-center gap-3">
          <Icons.Shield className="h-5 w-5 text-green-600" />
          <div className="text-sm text-green-800">
            <strong>Secure Payment:</strong> {t('checkout.payment.secure')}
          </div>
        </DirectionalFlex>
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
              {formatCurrency(cartSummary.shipping, cartSummary.currency)}
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
      </Card>

      {/* Action Buttons */}
      <Card className="p-6">
        <DirectionalFlex className="justify-between items-center">
          <Button variant="outline" onClick={onBack} disabled={processing}>
            <Icons.ArrowLeft className="h-4 w-4 mr-2" />
            {t('common.actions.back')}
          </Button>
          
          <Button 
            onClick={handlePaymentSubmit} 
            disabled={processing || !PAYMENT_METHODS.find(m => m.id === selectedMethod && getMethodAvailability(m))}
            size="lg"
          >
            {processing ? (
              <>
                <Icons.Loader2 className="h-4 w-4 mr-2 animate-spin" />
                {t('checkout.payment.processing')}
              </>
            ) : (
              <>
                <Icons.CreditCard className="h-4 w-4 mr-2" />
                Pay {formatCurrency(cartSummary.total, cartSummary.currency)}
              </>
            )}
          </Button>
        </DirectionalFlex>
      </Card>
    </DirectionalContainer>
  );
}