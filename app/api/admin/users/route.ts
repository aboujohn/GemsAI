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

    // Log admin access
    await supabase
      .from('admin_audit_logs')
      .insert({
        admin_user_id: session.user.id,
        action: 'users_viewed',
        entity_type: 'users',
        ip_address: request.headers.get('x-forwarded-for') || 
                   request.headers.get('x-real-ip') || 
                   'unknown',
        user_agent: request.headers.get('user-agent') || 'unknown'
      });

    // Get query parameters
    const url = new URL(request.url);
    const role = url.searchParams.get('role');
    const status = url.searchParams.get('status');
    const search = url.searchParams.get('search');
    const limit = parseInt(url.searchParams.get('limit') || '50');
    const offset = parseInt(url.searchParams.get('offset') || '0');

    // Build query
    let query = supabase
      .from('users')
      .select(`
        id,
        email,
        name,
        role,
        created_at,
        last_sign_in_at,
        email_verified,
        phone,
        avatar_url,
        is_active,
        user_metadata
      `)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    // Apply filters
    if (role) {
      query = query.eq('role', role);
    }

    if (status === 'active') {
      query = query.eq('is_active', true);
    } else if (status === 'inactive') {
      query = query.eq('is_active', false);
    } else if (status === 'verified') {
      query = query.eq('email_verified', true);
    } else if (status === 'unverified') {
      query = query.eq('email_verified', false);
    }

    if (search) {
      query = query.or(`email.ilike.%${search}%,name.ilike.%${search}%`);
    }

    const { data: users, error: usersError } = await query;

    if (usersError) {
      console.error('Error fetching users:', usersError);
      return NextResponse.json({ error: 'Failed to fetch users' }, { status: 500 });
    }

    // Get user statistics for each user
    const userIds = users?.map(user => user.id) || [];
    
    const [ordersResult, storiesResult] = await Promise.allSettled([
      supabase
        .from('orders')
        .select('user_id')
        .in('user_id', userIds),
      
      supabase
        .from('stories')
        .select('user_id')
        .in('user_id', userIds)
    ]);

    const orders = ordersResult.status === 'fulfilled' ? ordersResult.value.data || [] : [];
    const stories = storiesResult.status === 'fulfilled' ? storiesResult.value.data || [] : [];

    // Calculate stats per user
    const orderCounts = orders.reduce((acc: Record<string, number>, order) => {
      acc[order.user_id] = (acc[order.user_id] || 0) + 1;
      return acc;
    }, {});

    const storyCounts = stories.reduce((acc: Record<string, number>, story) => {
      acc[story.user_id] = (acc[story.user_id] || 0) + 1;
      return acc;
    }, {});

    // Enhance users with metadata
    const enhancedUsers = users?.map(user => ({
      ...user,
      metadata: {
        orders_count: orderCounts[user.id] || 0,
        stories_count: storyCounts[user.id] || 0,
        last_activity: user.last_sign_in_at || user.created_at
      }
    })) || [];

    // Get total count for pagination
    const { count, error: countError } = await supabase
      .from('users')
      .select('*', { count: 'exact', head: true });

    return NextResponse.json({
      users: enhancedUsers,
      total: count || 0,
      hasMore: (offset + limit) < (count || 0)
    });

  } catch (error) {
    console.error('Users API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}