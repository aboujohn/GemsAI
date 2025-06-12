import { NextRequest, NextResponse } from 'next/server';
import { payPlusService } from '@/lib/services/payplus-payment';
import { orderService } from '@/lib/services/order-service';

export async function POST(request: NextRequest) {
  try {
    const body = await request.text();
    const signature = request.headers.get('x-payplus-signature') || '';

    // Verify webhook signature
    if (!payPlusService.verifyWebhookSignature(body, signature)) {
      console.error('Invalid PayPlus webhook signature');
      return NextResponse.json(
        { error: 'Invalid signature' },
        { status: 401 }
      );
    }

    const payload = JSON.parse(body);
    const processedWebhook = payPlusService.processWebhook(payload);

    // Update payment status using order service
    const result = await orderService.updatePaymentStatus(
      processedWebhook.orderId,
      processedWebhook.status === 'success' ? 'completed' : 'failed',
      processedWebhook.transactionId
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

    console.log('PayPlus webhook processed successfully:', {
      orderId: processedWebhook.orderId,
      status: processedWebhook.status,
      amount: processedWebhook.amount,
    });

    return NextResponse.json({ success: true });

  } catch (error) {
    console.error('PayPlus webhook processing error:', error);
    return NextResponse.json(
      { error: 'Webhook processing failed' },
      { status: 500 }
    );
  }
}