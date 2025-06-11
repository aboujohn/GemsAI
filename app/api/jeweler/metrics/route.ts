import { NextRequest, NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';

interface DashboardMetrics {
  totalOrders: number;
  pendingOrders: number;
  completedOrders: number;
  totalRevenue: number;
  monthlyRevenue: number;
  activeProducts: number;
  totalProducts: number;
  averageRating: number;
  totalReviews: number;
  inventoryAlerts: number;
}

export async function GET(request: NextRequest) {
  try {
    const supabase = createRouteHandlerClient({ cookies });

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

    // Get current date for monthly calculations
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    // Fetch all metrics in parallel
    const [
      ordersResult,
      productsResult,
      reviewsResult,
      inventoryResult
    ] = await Promise.all([
      // Orders metrics
      supabase
        .from('orders')
        .select('status, total_amount, created_at')
        .eq('jeweler_id', jewelerId),

      // Products metrics
      supabase
        .from('products')
        .select('is_available, inventory_count')
        .eq('jeweler_id', jewelerId),

      // Reviews metrics
      supabase
        .from('reviews')
        .select('rating')
        .eq('jeweler_id', jewelerId),

      // Inventory alerts (products with low stock)
      supabase
        .from('products')
        .select('inventory_count')
        .eq('jeweler_id', jewelerId)
        .lt('inventory_count', 5) // Consider items with less than 5 as low stock
    ]);

    // Process orders data
    const orders = ordersResult.data || [];
    const totalOrders = orders.length;
    const pendingOrders = orders.filter(o => 
      ['pending', 'confirmed', 'in_progress'].includes(o.status)
    ).length;
    const completedOrders = orders.filter(o => 
      ['completed', 'delivered'].includes(o.status)
    ).length;

    const totalRevenue = orders
      .filter(o => ['completed', 'delivered'].includes(o.status))
      .reduce((sum, order) => sum + (order.total_amount || 0), 0);

    const monthlyRevenue = orders
      .filter(o => 
        ['completed', 'delivered'].includes(o.status) &&
        new Date(o.created_at) >= startOfMonth
      )
      .reduce((sum, order) => sum + (order.total_amount || 0), 0);

    // Process products data
    const products = productsResult.data || [];
    const totalProducts = products.length;
    const activeProducts = products.filter(p => p.is_available).length;

    // Process reviews data
    const reviews = reviewsResult.data || [];
    const totalReviews = reviews.length;
    const averageRating = totalReviews > 0 
      ? reviews.reduce((sum, review) => sum + review.rating, 0) / totalReviews
      : 0;

    // Process inventory alerts
    const inventoryAlerts = inventoryResult.data?.length || 0;

    const metrics: DashboardMetrics = {
      totalOrders,
      pendingOrders,
      completedOrders,
      totalRevenue,
      monthlyRevenue,
      activeProducts,
      totalProducts,
      averageRating,
      totalReviews,
      inventoryAlerts,
    };

    return NextResponse.json(metrics);

  } catch (error) {
    console.error('Error fetching jeweler metrics:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}