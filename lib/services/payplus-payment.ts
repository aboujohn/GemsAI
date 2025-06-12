import { config } from '@/lib/config';

export interface PayPlusPaymentRequest {
  amount: number;
  currency: string;
  orderId: string;
  customerName: string;
  customerEmail: string;
  customerPhone?: string;
  description: string;
  returnUrl: string;
  cancelUrl: string;
  webhookUrl: string;
}

export interface PayPlusPaymentResponse {
  success: boolean;
  paymentId?: string;
  redirectUrl?: string;
  error?: string;
  transactionId?: string;
}

export interface PayPlusWebhookPayload {
  transaction_id: string;
  payment_id: string;
  status: 'completed' | 'failed' | 'pending' | 'cancelled';
  amount: number;
  currency: string;
  order_id: string;
  timestamp: string;
  signature: string;
}

class PayPlusPaymentService {
  private apiUrl: string;
  private secretKey: string;
  private publicKey: string;

  constructor() {
    this.apiUrl = process.env.PAYPLUS_API_URL || 'https://api.payplus.co.il';
    this.secretKey = process.env.PAYPLUS_SECRET_KEY || '';
    this.publicKey = process.env.PAYPLUS_PUBLIC_KEY || '';
  }

  /**
   * Create a payment session with PayPlus
   */
  async createPayment(request: PayPlusPaymentRequest): Promise<PayPlusPaymentResponse> {
    try {
      if (!this.secretKey || !this.publicKey) {
        console.warn('PayPlus credentials not configured, using mock response');
        return this.mockPaymentResponse(request);
      }

      const payload = {
        amount: Math.round(request.amount * 100), // Convert to agorot
        currency_code: request.currency,
        order_id: request.orderId,
        customer: {
          name: request.customerName,
          email: request.customerEmail,
          phone: request.customerPhone,
        },
        description: request.description,
        callback_url: request.returnUrl,
        cancel_url: request.cancelUrl,
        webhook_url: request.webhookUrl,
        language: 'he', // Hebrew interface
        payment_page_uid: process.env.PAYPLUS_PAGE_UID,
      };

      const response = await fetch(`${this.apiUrl}/api/v1.0/PaymentPages/generateLink`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.secretKey}`,
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'PayPlus API error');
      }

      return {
        success: true,
        paymentId: data.payment_id,
        redirectUrl: data.payment_page_link,
        transactionId: data.transaction_id,
      };

    } catch (error) {
      console.error('PayPlus payment creation failed:', error);
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
      if (!this.secretKey) {
        console.warn('PayPlus secret key not configured, skipping signature verification');
        return true; // Allow in development/demo mode
      }

      // PayPlus uses HMAC-SHA256 for webhook signatures
      const crypto = require('crypto');
      const expectedSignature = crypto
        .createHmac('sha256', this.secretKey)
        .update(payload)
        .digest('hex');

      return signature === expectedSignature;
    } catch (error) {
      console.error('Webhook signature verification failed:', error);
      return false;
    }
  }

  /**
   * Process webhook payload
   */
  processWebhook(payload: PayPlusWebhookPayload): {
    orderId: string;
    status: 'success' | 'failed' | 'pending';
    transactionId: string;
    amount: number;
  } {
    return {
      orderId: payload.order_id,
      status: payload.status === 'completed' ? 'success' : 
              payload.status === 'failed' ? 'failed' : 'pending',
      transactionId: payload.transaction_id,
      amount: payload.amount / 100, // Convert from agorot
    };
  }

  /**
   * Get payment status
   */
  async getPaymentStatus(paymentId: string): Promise<{
    status: 'completed' | 'failed' | 'pending' | 'cancelled';
    transactionId?: string;
    amount?: number;
  }> {
    try {
      if (!this.secretKey) {
        // Mock response for development
        return {
          status: 'completed',
          transactionId: `mock_txn_${Date.now()}`,
          amount: 100,
        };
      }

      const response = await fetch(`${this.apiUrl}/api/v1.0/Transactions/${paymentId}`, {
        headers: {
          'Authorization': `Bearer ${this.secretKey}`,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to get payment status');
      }

      return {
        status: data.status,
        transactionId: data.transaction_id,
        amount: data.amount / 100,
      };

    } catch (error) {
      console.error('Failed to get payment status:', error);
      throw error;
    }
  }

  /**
   * Mock payment response for development/demo
   */
  private mockPaymentResponse(request: PayPlusPaymentRequest): PayPlusPaymentResponse {
    const mockPaymentId = `mock_${Date.now()}`;
    const mockUrl = `${config.app.url}/checkout/payment/payplus/mock?payment_id=${mockPaymentId}&amount=${request.amount}`;

    return {
      success: true,
      paymentId: mockPaymentId,
      redirectUrl: mockUrl,
      transactionId: `mock_txn_${Date.now()}`,
    };
  }

  /**
   * Calculate PayPlus fees
   */
  calculateFees(amount: number): { fee: number; total: number } {
    // PayPlus typical fees in Israel
    const feeRate = 0.029; // 2.9%
    const fixedFee = 1.5; // 1.5 ILS fixed fee
    
    const fee = Math.round((amount * feeRate + fixedFee) * 100) / 100;
    const total = amount + fee;

    return { fee, total };
  }
}

export const payPlusService = new PayPlusPaymentService();