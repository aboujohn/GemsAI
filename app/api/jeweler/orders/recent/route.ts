import { NextRequest, NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';

interface RecentOrder {
  id: string;
  orderNumber: string;
  customerName: string;
  productName: string;
  amount: number;
  status: string;
  createdAt: string;
}

export async function GET(request: NextRequest) {
  try {
    const supabase = createRouteHandlerClient({ cookies });
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '10');

    // Get the authenticated user
    const {
      data: { session },
      error: authError,
    } = await supabase.auth.getSession();

    if (authError || !session) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Verify user is a jeweler
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('role')
      .eq('id', session.user.id)
      .single();

    if (userError || userData?.role !== 'jeweler') {
      return NextResponse.json(
        { error: 'Access denied. Jeweler role required.' },
        { status: 403 }
      );
    }

    // Get jeweler ID
    const { data: jewelerData, error: jewelerError } = await supabase
      .from('jewelers')
      .select('id')
      .eq('user_id', session.user.id)
      .single();

    if (jewelerError || !jewelerData) {
      return NextResponse.json(
        { error: 'Jeweler profile not found' },
        { status: 404 }
      );
    }

    const jewelerId = jewelerData.id;

    // Fetch recent orders with customer and product information
    const { data: ordersData, error: ordersError } = await supabase
      .from('orders')
      .select(`
        id,
        order_number,
        status,
        total_amount,
        created_at,
        users!inner(name, email),
        products(name, sku)
      `)
      .eq('jeweler_id', jewelerId)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (ordersError) {
      console.error('Error fetching orders:', ordersError);
      return NextResponse.json(
        { error: 'Failed to fetch orders' },
        { status: 500 }
      );
    }

    // Transform the data
    const recentOrders: RecentOrder[] = (ordersData || []).map(order => ({
      id: order.id,
      orderNumber: order.order_number,
      customerName: order.users?.name || order.users?.email || 'Unknown Customer',
      productName: order.products?.name || `SKU: ${order.products?.sku || 'N/A'}`,
      amount: order.total_amount,
      status: order.status,
      createdAt: order.created_at,
    }));

    return NextResponse.json(recentOrders);

  } catch (error) {
    console.error('Error fetching recent orders:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}