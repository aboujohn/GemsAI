import { NextRequest, NextResponse } from 'next/server';
import { payPlusService } from '@/lib/services/payplus-payment';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    const {
      amount,
      currency,
      orderId,
      customerName,
      customerEmail,
      customerPhone,
      description,
      returnUrl,
      cancelUrl,
      webhookUrl,
    } = body;

    // Validate required fields
    if (!amount || !currency || !orderId || !customerName || !customerEmail) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Create payment with PayPlus
    const result = await payPlusService.createPayment({
      amount,
      currency,
      orderId,
      customerName,
      customerEmail,
      customerPhone,
      description,
      returnUrl,
      cancelUrl,
      webhookUrl,
    });

    if (!result.success) {
      return NextResponse.json(
        { success: false, error: result.error },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      paymentId: result.paymentId,
      redirectUrl: result.redirectUrl,
      transactionId: result.transactionId,
    });

  } catch (error) {
    console.error('PayPlus payment creation error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}