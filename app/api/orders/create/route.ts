import { NextRequest, NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { orderService } from '@/lib/services/order-service';

export async function POST(request: NextRequest) {
  try {
    const supabase = createRouteHandlerClient({ cookies });
    
    // Get authenticated user
    const {
      data: { session },
      error: authError,
    } = await supabase.auth.getSession();

    if (authError || !session) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const {
      items,
      shippingAddress,
      billingAddress,
      shippingMethod,
      paymentMethod,
      customerNotes,
      subtotal,
      shipping,
      tax,
      total,
      currency,
    } = body;

    // Validate required fields
    if (!items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Items are required' },
        { status: 400 }
      );
    }

    if (!shippingAddress || !billingAddress || !shippingMethod) {
      return NextResponse.json(
        { success: false, error: 'Shipping and billing information required' },
        { status: 400 }
      );
    }

    if (!paymentMethod || !['stripe', 'payplus'].includes(paymentMethod)) {
      return NextResponse.json(
        { success: false, error: 'Valid payment method required' },
        { status: 400 }
      );
    }

    if (!total || !currency) {
      return NextResponse.json(
        { success: false, error: 'Total amount and currency required' },
        { status: 400 }
      );
    }

    // Create order
    const result = await orderService.createOrder({
      userId: session.user.id,
      items,
      shippingAddress,
      billingAddress,
      shippingMethod,
      paymentMethod,
      customerNotes,
      subtotal,
      shipping,
      tax,
      total,
      currency,
    });

    if (!result.success) {
      return NextResponse.json(
        { success: false, error: result.error },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      orderId: result.orderId,
      orderNumber: result.orderNumber,
    });

  } catch (error) {
    console.error('Order creation error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}