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
    const { data: adminData, error: adminError } = await supabase
      .from('users')
      .select('role, email')
      .eq('id', session.user.id)
      .single();

    if (adminError || adminData?.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const url = new URL(request.url);
    const format = url.searchParams.get('format') || 'csv';
    const role = url.searchParams.get('role');
    const status = url.searchParams.get('status');

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
        is_active,
        user_metadata
      `)
      .order('created_at', { ascending: false });

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

    const { data: users, error: usersError } = await query;

    if (usersError) {
      console.error('Error fetching users for export:', usersError);
      return NextResponse.json({ error: 'Failed to fetch users' }, { status: 500 });
    }

    // Get additional statistics
    const userIds = users?.map(user => user.id) || [];
    
    const [ordersResult, storiesResult] = await Promise.allSettled([
      supabase
        .from('orders')
        .select('user_id, total_amount, status')
        .in('user_id', userIds),
      
      supabase
        .from('stories')
        .select('user_id')
        .in('user_id', userIds)
    ]);

    const orders = ordersResult.status === 'fulfilled' ? ordersResult.value.data || [] : [];
    const stories = storiesResult.status === 'fulfilled' ? storiesResult.value.data || [] : [];

    // Calculate stats per user
    const userStats = userIds.reduce((acc: Record<string, any>, userId) => {
      const userOrders = orders.filter(order => order.user_id === userId);
      const userStories = stories.filter(story => story.user_id === userId);
      
      acc[userId] = {
        orders_count: userOrders.length,
        total_spent: userOrders.reduce((sum, order) => sum + (order.total_amount || 0), 0),
        completed_orders: userOrders.filter(order => order.status === 'completed').length,
        stories_count: userStories.length
      };
      
      return acc;
    }, {});

    // Log admin export action
    await supabase
      .from('admin_audit_logs')
      .insert({
        admin_user_id: session.user.id,
        action: 'users_exported',
        entity_type: 'users',
        changes: { 
          format: format,
          filters: { role, status },
          user_count: users?.length || 0,
          admin_email: adminData.email 
        },
        ip_address: request.headers.get('x-forwarded-for') || 
                   request.headers.get('x-real-ip') || 
                   'unknown',
        user_agent: request.headers.get('user-agent') || 'unknown'
      });

    if (format === 'csv') {
      // Generate CSV content
      const csvContent = generateUsersCSV(users || [], userStats);
      const fileName = `gemsai-users-export-${new Date().toISOString().split('T')[0]}.csv`;

      return new NextResponse(csvContent, {
        headers: {
          'Content-Type': 'text/csv',
          'Content-Disposition': `attachment; filename="${fileName}"`,
        },
      });
    } else if (format === 'json') {
      // Return JSON format
      const enhancedUsers = users?.map(user => ({
        ...user,
        stats: userStats[user.id] || {
          orders_count: 0,
          total_spent: 0,
          completed_orders: 0,
          stories_count: 0
        }
      })) || [];

      const exportData = {
        metadata: {
          exported_at: new Date().toISOString(),
          exported_by: adminData.email,
          filters: { role, status },
          total_users: enhancedUsers.length
        },
        users: enhancedUsers
      };

      const fileName = `gemsai-users-export-${new Date().toISOString().split('T')[0]}.json`;

      return new NextResponse(JSON.stringify(exportData, null, 2), {
        headers: {
          'Content-Type': 'application/json',
          'Content-Disposition': `attachment; filename="${fileName}"`,
        },
      });
    } else {
      return NextResponse.json({ error: 'Unsupported format' }, { status: 400 });
    }

  } catch (error) {
    console.error('Users export error:', error);
    return NextResponse.json(
      { error: 'Export failed' },
      { status: 500 }
    );
  }
}

function generateUsersCSV(users: any[], userStats: Record<string, any>): string {
  let csv = '';

  // Header with metadata
  csv += `GemsAI Users Export\n`;
  csv += `Exported At: ${new Date().toISOString()}\n`;
  csv += `Total Users: ${users.length}\n`;
  csv += `\n`;

  // CSV headers
  csv += `ID,Email,Name,Role,Status,Email Verified,Phone,Created At,Last Sign In,Orders,Total Spent,Completed Orders,Stories\n`;

  // User data
  users.forEach(user => {
    const stats = userStats[user.id] || {};
    const status = user.is_active ? 'Active' : 'Inactive';
    const emailVerified = user.email_verified ? 'Yes' : 'No';
    const phone = user.phone || '';
    const lastSignIn = user.last_sign_in_at || 'Never';
    
    // Escape CSV values
    const name = `"${(user.name || '').replace(/"/g, '""')}"`;
    const email = `"${user.email.replace(/"/g, '""')}"`;
    
    csv += `${user.id},${email},${name},${user.role},${status},${emailVerified},${phone},${user.created_at},${lastSignIn},${stats.orders_count || 0},${stats.total_spent || 0},${stats.completed_orders || 0},${stats.stories_count || 0}\n`;
  });

  return csv;
}