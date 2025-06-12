import { NextRequest, NextResponse } from 'next/server';
import { stripeService } from '@/lib/services/stripe-payment';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    const {
      amount,
      currency,
      orderId,
      customerName,
      customerEmail,
      description,
      returnUrl,
      cancelUrl,
    } = body;

    // Validate required fields
    if (!amount || !currency || !orderId || !customerName || !customerEmail) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Create payment intent with Stripe
    const result = await stripeService.createPaymentIntent({
      amount,
      currency,
      orderId,
      customerName,
      customerEmail,
      description,
      returnUrl,
      cancelUrl,
    });

    if (!result.success) {
      return NextResponse.json(
        { success: false, error: result.error },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      clientSecret: result.clientSecret,
      paymentIntentId: result.paymentIntentId,
      publishableKey: stripeService.getPublishableKey(),
    });

  } catch (error) {
    console.error('Stripe payment creation error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}