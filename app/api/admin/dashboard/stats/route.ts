import { NextRequest, NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';

export async function GET(request: NextRequest) {
  try {
    const supabase = createRouteHandlerClient({ cookies });

    // Verify admin access
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

    // Check admin role
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('role')
      .eq('id', session.user.id)
      .single();

    if (userError || userData?.role !== 'admin') {
      return NextResponse.json(
        { error: 'Access denied' },
        { status: 403 }
      );
    }

    // Get current date for filtering
    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const previousMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);

    // Fetch user statistics
    const { data: totalUsers, error: usersError } = await supabase
      .from('users')
      .select('id, created_at')
      .order('created_at', { ascending: false });

    if (usersError) {
      console.error('Error fetching users:', usersError);
    }

    // Calculate user metrics
    const userStats = {
      total: totalUsers?.length || 0,
      active: totalUsers?.length || 0, // TODO: Calculate actual active users
      newToday: totalUsers?.filter(u => 
        new Date(u.created_at) >= todayStart
      ).length || 0,
      growth: 12.5, // TODO: Calculate actual growth rate
    };

    // Fetch order statistics
    const { data: orders, error: ordersError } = await supabase
      .from('orders')
      .select('id, status, total_amount, created_at, currency');

    if (ordersError) {
      console.error('Error fetching orders:', ordersError);
    }

    // Calculate order metrics
    const orderStats = {
      total: orders?.length || 0,
      pending: orders?.filter(o => o.status === 'pending').length || 0,
      completed: orders?.filter(o => o.status === 'completed' || o.status === 'delivered').length || 0,
      revenue: orders?.reduce((sum, o) => sum + (o.total_amount || 0), 0) || 0,
    };

    // Fetch sketch statistics
    const { data: sketches, error: sketchesError } = await supabase
      .from('sketches')
      .select('id, status, created_at');

    if (sketchesError) {
      console.error('Error fetching sketches:', sketchesError);
    }

    // Calculate sketch metrics
    const sketchStats = {
      total: sketches?.length || 0,
      generating: sketches?.filter(s => s.status === 'generating').length || 0,
      completed: sketches?.filter(s => s.status === 'completed').length || 0,
      failed: sketches?.filter(s => s.status === 'failed').length || 0,
    };

    // System health metrics (mock for now - in real implementation, get from monitoring service)
    const systemStats = {
      uptime: '99.9%',
      queueHealth: 'healthy' as const,
      errorRate: 0.2,
      responseTime: 145,
    };

    const stats = {
      users: userStats,
      orders: orderStats,
      sketches: sketchStats,
      system: systemStats,
      lastUpdated: new Date().toISOString(),
    };

    return NextResponse.json(stats);

  } catch (error) {
    console.error('Dashboard stats error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}