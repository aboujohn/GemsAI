import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET(request: NextRequest) {
  try {
    const supabase = createClient();
    
    // Check authentication
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();
    
    if (sessionError || !session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Verify admin access
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('role')
      .eq('id', session.user.id)
      .single();

    if (userError || userData?.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const url = new URL(request.url);
    const timeRange = url.searchParams.get('range') || '7d';

    // Calculate date range
    const endDate = new Date();
    const startDate = new Date();
    
    switch (timeRange) {
      case '24h':
        startDate.setHours(startDate.getHours() - 24);
        break;
      case '7d':
        startDate.setDate(startDate.getDate() - 7);
        break;
      case '30d':
        startDate.setDate(startDate.getDate() - 30);
        break;
      case '90d':
        startDate.setDate(startDate.getDate() - 90);
        break;
      case '1y':
        startDate.setFullYear(startDate.getFullYear() - 1);
        break;
      default:
        startDate.setDate(startDate.getDate() - 7);
    }

    // Log admin access
    await supabase
      .from('admin_audit_logs')
      .insert({
        admin_user_id: session.user.id,
        action: 'analytics_viewed',
        entity_type: 'analytics',
        changes: { time_range: timeRange },
        ip_address: request.headers.get('x-forwarded-for') || 
                   request.headers.get('x-real-ip') || 
                   'unknown',
        user_agent: request.headers.get('user-agent') || 'unknown'
      });

    // Fetch analytics data in parallel
    const [
      userStats,
      orderStats,
      storyStats,
      sketchStats,
      engagementStats
    ] = await Promise.allSettled([
      // User metrics
      supabase
        .from('users')
        .select('id, created_at, role, last_sign_in_at')
        .gte('created_at', startDate.toISOString())
        .lte('created_at', endDate.toISOString()),
      
      // Order metrics
      supabase
        .from('orders')
        .select('id, created_at, status, total_amount')
        .gte('created_at', startDate.toISOString())
        .lte('created_at', endDate.toISOString()),
      
      // Story metrics
      supabase
        .from('stories')
        .select('id, created_at, language')
        .gte('created_at', startDate.toISOString())
        .lte('created_at', endDate.toISOString()),
      
      // Sketch metrics
      supabase
        .from('sketches')
        .select('id, created_at, status, generation_time')
        .gte('created_at', startDate.toISOString())
        .lte('created_at', endDate.toISOString()),
      
      // Engagement metrics (simplified, would typically come from analytics service)
      Promise.resolve({ data: null })
    ]);

    // Process user metrics
    const users = userStats.status === 'fulfilled' ? userStats.value.data || [] : [];
    const totalUsers = users.length;
    const activeUsers = users.filter(user => 
      user.last_sign_in_at && 
      new Date(user.last_sign_in_at) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
    ).length;
    const newUsers = users.filter(user => 
      new Date(user.created_at) > new Date(Date.now() - 24 * 60 * 60 * 1000)
    ).length;

    // Generate user growth data (mock data points)
    const userGrowth = Array.from({ length: 15 }, (_, i) => {
      const baseGrowth = Math.max(0, totalUsers - Math.floor(Math.random() * totalUsers * 0.3));
      return baseGrowth + Math.floor(Math.random() * (totalUsers * 0.1));
    });

    // User distribution by role
    const usersByRole = users.reduce((acc: Record<string, number>, user) => {
      acc[user.role] = (acc[user.role] || 0) + 1;
      return acc;
    }, {});

    // Mock country distribution (would typically come from user profiles)
    const usersByCountry = [
      { country: 'Israel', users: Math.floor(totalUsers * 0.6) },
      { country: 'United States', users: Math.floor(totalUsers * 0.2) },
      { country: 'United Kingdom', users: Math.floor(totalUsers * 0.1) },
      { country: 'Germany', users: Math.floor(totalUsers * 0.05) },
      { country: 'France', users: Math.floor(totalUsers * 0.05) },
    ];

    // Process order metrics
    const orders = orderStats.status === 'fulfilled' ? orderStats.value.data || [] : [];
    const totalOrders = orders.length;
    const totalRevenue = orders.reduce((sum, order) => sum + (order.total_amount || 0), 0);
    const averageOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;

    // Generate order growth data
    const orderGrowth = Array.from({ length: 15 }, (_, i) => {
      return Math.max(0, Math.floor(totalOrders * (0.5 + Math.random() * 0.5) / 15));
    });

    const revenueGrowth = Array.from({ length: 15 }, (_, i) => {
      return Math.max(0, Math.floor(totalRevenue * (0.5 + Math.random() * 0.5) / 15));
    });

    // Order status distribution
    const ordersByStatus = orders.reduce((acc: Record<string, number>, order) => {
      acc[order.status] = (acc[order.status] || 0) + 1;
      return acc;
    }, {});

    // Process content metrics
    const stories = storyStats.status === 'fulfilled' ? storyStats.value.data || [] : [];
    const sketches = sketchStats.status === 'fulfilled' ? sketchStats.value.data || [] : [];
    
    const totalStories = stories.length;
    const totalSketches = sketches.length;
    const successfulSketches = sketches.filter(sketch => sketch.status === 'completed').length;
    const sketchSuccessRate = totalSketches > 0 ? (successfulSketches / totalSketches) * 100 : 0;
    
    const avgGenerationTime = sketches.length > 0 
      ? sketches.reduce((sum, sketch) => sum + (sketch.generation_time || 45), 0) / sketches.length
      : 45;

    // Generate content growth data
    const storiesGrowth = Array.from({ length: 15 }, (_, i) => {
      return Math.max(0, Math.floor(totalStories * (0.6 + Math.random() * 0.4) / 15));
    });

    const sketchesGrowth = Array.from({ length: 15 }, (_, i) => {
      return Math.max(0, Math.floor(totalSketches * (0.6 + Math.random() * 0.4) / 15));
    });

    // Mock engagement metrics (would typically come from analytics service like PostHog)
    const engagementMetrics = {
      avgSessionDuration: 342, // seconds
      bounceRate: 24.3, // percentage
      pageViews: Math.floor(totalUsers * 12.5), // estimated page views
      conversionRate: totalOrders > 0 && totalUsers > 0 ? (totalOrders / totalUsers) * 100 : 3.7,
      topPages: [
        { page: '/story/new', views: Math.floor(totalUsers * 2.8) },
        { page: '/dashboard', views: Math.floor(totalUsers * 2.3) },
        { page: '/products', views: Math.floor(totalUsers * 1.9) },
        { page: '/gift/create', views: Math.floor(totalUsers * 1.5) },
        { page: '/auth/login', views: Math.floor(totalUsers * 1.25) },
      ],
    };

    const analyticsData = {
      timeRange,
      userMetrics: {
        totalUsers,
        activeUsers,
        newUsers,
        userGrowth,
        usersByCountry,
        usersByRole: Object.entries(usersByRole).map(([role, count]) => ({ role, count })),
      },
      orderMetrics: {
        totalOrders,
        totalRevenue,
        averageOrderValue,
        orderGrowth,
        revenueGrowth,
        ordersByStatus: Object.entries(ordersByStatus).map(([status, count]) => ({ status, count })),
      },
      contentMetrics: {
        totalStories,
        totalSketches,
        sketchSuccessRate: Math.round(sketchSuccessRate * 10) / 10,
        avgGenerationTime: Math.round(avgGenerationTime),
        storiesGrowth,
        sketchesGrowth,
      },
      engagementMetrics,
    };

    return NextResponse.json(analyticsData);

  } catch (error) {
    console.error('Analytics API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}