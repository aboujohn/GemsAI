import { NextRequest, NextResponse } from 'next/server';
import { stripeService } from '@/lib/services/stripe-payment';
import { orderService } from '@/lib/services/order-service';

export async function POST(request: NextRequest) {
  try {
    const body = await request.text();
    const signature = request.headers.get('stripe-signature') || '';

    // Verify webhook signature
    if (!stripeService.verifyWebhookSignature(body, signature)) {
      console.error('Invalid Stripe webhook signature');
      return NextResponse.json(
        { error: 'Invalid signature' },
        { status: 401 }
      );
    }

    const payload = JSON.parse(body);
    const processedWebhook = stripeService.processWebhook(payload);

    // Skip if not a payment intent event
    if (!processedWebhook) {
      return NextResponse.json({ success: true });
    }

    // Update payment status using order service
    const result = await orderService.updatePaymentStatus(
      processedWebhook.orderId,
      processedWebhook.status === 'success' ? 'completed' : 'failed',
      processedWebhook.paymentIntentId
    );

    if (!result.success) {
      console.error('Failed to update payment status:', result.error);
      return NextResponse.json(
        { error: 'Failed to update order' },
        { status: 500 }
      );
    }

    // TODO: Send email notification to customer
    // TODO: Update inventory
    // TODO: Create order processing queue job

    console.log('Stripe webhook processed successfully:', {
      orderId: processedWebhook.orderId,
      status: processedWebhook.status,
      amount: processedWebhook.amount,
    });

    return NextResponse.json({ success: true });

  } catch (error) {
    console.error('Stripe webhook processing error:', error);
    return NextResponse.json(
      { error: 'Webhook processing failed' },
      { status: 500 }
    );
  }
}