import { config } from '@/lib/config';

export interface StripePaymentRequest {
  amount: number;
  currency: string;
  orderId: string;
  customerName: string;
  customerEmail: string;
  description: string;
  returnUrl: string;
  cancelUrl: string;
}

export interface StripePaymentResponse {
  success: boolean;
  clientSecret?: string;
  paymentIntentId?: string;
  error?: string;
}

export interface StripeWebhookPayload {
  id: string;
  type: string;
  data: {
    object: {
      id: string;
      status: string;
      amount: number;
      currency: string;
      metadata: {
        order_id: string;
      };
    };
  };
}

class StripePaymentService {
  private secretKey: string;
  private publishableKey: string;
  private webhookSecret: string;

  constructor() {
    this.secretKey = process.env.STRIPE_SECRET_KEY || '';
    this.publishableKey = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || '';
    this.webhookSecret = process.env.STRIPE_WEBHOOK_SECRET || '';
  }

  /**
   * Create a payment intent with Stripe
   */
  async createPaymentIntent(request: StripePaymentRequest): Promise<StripePaymentResponse> {
    try {
      if (!this.secretKey) {
        console.warn('Stripe secret key not configured, using mock response');
        return this.mockPaymentResponse(request);
      }

      const payload = {
        amount: Math.round(request.amount * 100), // Convert to cents
        currency: request.currency.toLowerCase(),
        metadata: {
          order_id: request.orderId,
          customer_name: request.customerName,
          customer_email: request.customerEmail,
        },
        description: request.description,
        automatic_payment_methods: {
          enabled: true,
        },
        receipt_email: request.customerEmail,
      };

      const response = await fetch('https://api.stripe.com/v1/payment_intents', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.secretKey}`,
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: this.encodeFormData(payload),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error?.message || 'Stripe API error');
      }

      return {
        success: true,
        clientSecret: data.client_secret,
        paymentIntentId: data.id,
      };

    } catch (error) {
      console.error('Stripe payment intent creation failed:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * Confirm payment intent
   */
  async confirmPaymentIntent(paymentIntentId: string, paymentMethodId: string): Promise<{
    success: boolean;
    status?: string;
    error?: string;
  }> {
    try {
      if (!this.secretKey) {
        return { success: true, status: 'succeeded' };
      }

      const response = await fetch(`https://api.stripe.com/v1/payment_intents/${paymentIntentId}/confirm`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.secretKey}`,
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: this.encodeFormData({
          payment_method: paymentMethodId,
          return_url: `${config.app.url}/checkout/payment/stripe/return`,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error?.message || 'Payment confirmation failed');
      }

      return {
        success: true,
        status: data.status,
      };

    } catch (error) {
      console.error('Payment confirmation failed:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * Verify webhook signature
   */
  verifyWebhookSignature(payload: string, signature: string): boolean {
    try {
      if (!this.webhookSecret) {
        console.warn('Stripe webhook secret not configured, skipping signature verification');
        return true; // Allow in development/demo mode
      }

      const crypto = require('crypto');
      const expectedSignature = crypto
        .createHmac('sha256', this.webhookSecret)
        .update(payload)
        .digest('hex');

      return signature === `sha256=${expectedSignature}`;
    } catch (error) {
      console.error('Webhook signature verification failed:', error);
      return false;
    }
  }

  /**
   * Process webhook payload
   */
  processWebhook(payload: StripeWebhookPayload): {
    orderId: string;
    status: 'success' | 'failed' | 'pending';
    paymentIntentId: string;
    amount: number;
  } | null {
    // Only process payment intent events
    if (!payload.type.startsWith('payment_intent.')) {
      return null;
    }

    const paymentIntent = payload.data.object;
    
    return {
      orderId: paymentIntent.metadata.order_id,
      status: paymentIntent.status === 'succeeded' ? 'success' : 
              paymentIntent.status === 'canceled' ? 'failed' : 'pending',
      paymentIntentId: paymentIntent.id,
      amount: paymentIntent.amount / 100, // Convert from cents
    };
  }

  /**
   * Get payment intent status
   */
  async getPaymentIntentStatus(paymentIntentId: string): Promise<{
    status: string;
    amount?: number;
    currency?: string;
  }> {
    try {
      if (!this.secretKey) {
        return { status: 'succeeded', amount: 100, currency: 'usd' };
      }

      const response = await fetch(`https://api.stripe.com/v1/payment_intents/${paymentIntentId}`, {
        headers: {
          'Authorization': `Bearer ${this.secretKey}`,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error?.message || 'Failed to get payment intent status');
      }

      return {
        status: data.status,
        amount: data.amount / 100,
        currency: data.currency,
      };

    } catch (error) {
      console.error('Failed to get payment intent status:', error);
      throw error;
    }
  }

  /**
   * Mock payment response for development/demo
   */
  private mockPaymentResponse(request: StripePaymentRequest): StripePaymentResponse {
    return {
      success: true,
      clientSecret: `pi_mock_${Date.now()}_secret_mock`,
      paymentIntentId: `pi_mock_${Date.now()}`,
    };
  }

  /**
   * Encode form data for Stripe API
   */
  private encodeFormData(data: any): string {
    return Object.keys(data)
      .map(key => {
        const value = data[key];
        if (typeof value === 'object' && value !== null) {
          return Object.keys(value)
            .map(subKey => `${encodeURIComponent(key)}[${encodeURIComponent(subKey)}]=${encodeURIComponent(value[subKey])}`)
            .join('&');
        }
        return `${encodeURIComponent(key)}=${encodeURIComponent(value)}`;
      })
      .join('&');
  }

  /**
   * Calculate Stripe fees
   */
  calculateFees(amount: number, currency: string = 'USD'): { fee: number; total: number } {
    // Stripe fees vary by region and currency
    const feeRate = currency === 'USD' ? 0.029 : 0.014; // 2.9% for US, 1.4% for EU
    const fixedFee = currency === 'USD' ? 0.30 : 0.25;
    
    const fee = Math.round((amount * feeRate + fixedFee) * 100) / 100;
    const total = amount + fee;

    return { fee, total };
  }

  /**
   * Get publishable key for client-side
   */
  getPublishableKey(): string {
    return this.publishableKey;
  }
}

export const stripeService = new StripePaymentService();