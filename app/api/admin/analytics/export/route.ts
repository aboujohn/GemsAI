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
      .select('role, email')
      .eq('id', session.user.id)
      .single();

    if (userError || userData?.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const url = new URL(request.url);
    const timeRange = url.searchParams.get('range') || '7d';
    const format = url.searchParams.get('format') || 'csv';

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

    // Log admin export action
    await supabase
      .from('admin_audit_logs')
      .insert({
        admin_user_id: session.user.id,
        action: 'analytics_exported',
        entity_type: 'analytics',
        changes: { 
          time_range: timeRange, 
          format: format,
          admin_email: userData.email 
        },
        ip_address: request.headers.get('x-forwarded-for') || 
                   request.headers.get('x-real-ip') || 
                   'unknown',
        user_agent: request.headers.get('user-agent') || 'unknown'
      });

    // Fetch comprehensive analytics data
    const [
      usersResult,
      ordersResult,
      storiesResult,
      sketchesResult
    ] = await Promise.allSettled([
      supabase
        .from('users')
        .select('id, email, created_at, role, last_sign_in_at')
        .gte('created_at', startDate.toISOString())
        .lte('created_at', endDate.toISOString())
        .order('created_at', { ascending: false }),
      
      supabase
        .from('orders')
        .select('id, user_id, created_at, status, total_amount, payment_status')
        .gte('created_at', startDate.toISOString())
        .lte('created_at', endDate.toISOString())
        .order('created_at', { ascending: false }),
      
      supabase
        .from('stories')
        .select('id, user_id, created_at, language, emotion_tags, word_count')
        .gte('created_at', startDate.toISOString())
        .lte('created_at', endDate.toISOString())
        .order('created_at', { ascending: false }),
      
      supabase
        .from('sketches')
        .select('id, story_id, created_at, status, generation_time, ai_model_used')
        .gte('created_at', startDate.toISOString())
        .lte('created_at', endDate.toISOString())
        .order('created_at', { ascending: false })
    ]);

    // Extract data from results
    const users = usersResult.status === 'fulfilled' ? usersResult.value.data || [] : [];
    const orders = ordersResult.status === 'fulfilled' ? ordersResult.value.data || [] : [];
    const stories = storiesResult.status === 'fulfilled' ? storiesResult.value.data || [] : [];
    const sketches = sketchesResult.status === 'fulfilled' ? sketchesResult.value.data || [] : [];

    if (format === 'csv') {
      // Generate CSV content
      const csvContent = generateCSV({
        users,
        orders,
        stories,
        sketches,
        timeRange,
        startDate,
        endDate
      });

      const fileName = `gemsai-analytics-${timeRange}-${new Date().toISOString().split('T')[0]}.csv`;

      return new NextResponse(csvContent, {
        headers: {
          'Content-Type': 'text/csv',
          'Content-Disposition': `attachment; filename="${fileName}"`,
        },
      });
    } else if (format === 'json') {
      // Return JSON format
      const jsonData = {
        metadata: {
          timeRange,
          startDate: startDate.toISOString(),
          endDate: endDate.toISOString(),
          exportedAt: new Date().toISOString(),
          exportedBy: userData.email
        },
        summary: {
          totalUsers: users.length,
          totalOrders: orders.length,
          totalStories: stories.length,
          totalSketches: sketches.length,
          totalRevenue: orders.reduce((sum, order) => sum + (order.total_amount || 0), 0)
        },
        data: {
          users,
          orders,
          stories,
          sketches
        }
      };

      const fileName = `gemsai-analytics-${timeRange}-${new Date().toISOString().split('T')[0]}.json`;

      return new NextResponse(JSON.stringify(jsonData, null, 2), {
        headers: {
          'Content-Type': 'application/json',
          'Content-Disposition': `attachment; filename="${fileName}"`,
        },
      });
    } else {
      return NextResponse.json({ error: 'Unsupported format' }, { status: 400 });
    }

  } catch (error) {
    console.error('Analytics export error:', error);
    return NextResponse.json(
      { error: 'Export failed' },
      { status: 500 }
    );
  }
}

function generateCSV(data: {
  users: any[];
  orders: any[];
  stories: any[];
  sketches: any[];
  timeRange: string;
  startDate: Date;
  endDate: Date;
}): string {
  const { users, orders, stories, sketches, timeRange, startDate, endDate } = data;

  let csv = '';

  // Header with metadata
  csv += `GemsAI Analytics Export\n`;
  csv += `Time Range: ${timeRange}\n`;
  csv += `Start Date: ${startDate.toISOString()}\n`;
  csv += `End Date: ${endDate.toISOString()}\n`;
  csv += `Exported At: ${new Date().toISOString()}\n`;
  csv += `\n`;

  // Summary section
  csv += `SUMMARY\n`;
  csv += `Total Users,${users.length}\n`;
  csv += `Total Orders,${orders.length}\n`;
  csv += `Total Stories,${stories.length}\n`;
  csv += `Total Sketches,${sketches.length}\n`;
  csv += `Total Revenue,${orders.reduce((sum, order) => sum + (order.total_amount || 0), 0)}\n`;
  csv += `\n`;

  // Users section
  csv += `USERS\n`;
  csv += `ID,Email,Created At,Role,Last Sign In\n`;
  users.forEach(user => {
    csv += `${user.id},${user.email || ''},${user.created_at},${user.role},${user.last_sign_in_at || ''}\n`;
  });
  csv += `\n`;

  // Orders section
  csv += `ORDERS\n`;
  csv += `ID,User ID,Created At,Status,Amount,Payment Status\n`;
  orders.forEach(order => {
    csv += `${order.id},${order.user_id},${order.created_at},${order.status},${order.total_amount || 0},${order.payment_status || ''}\n`;
  });
  csv += `\n`;

  // Stories section
  csv += `STORIES\n`;
  csv += `ID,User ID,Created At,Language,Emotion Tags,Word Count\n`;
  stories.forEach(story => {
    const emotionTags = Array.isArray(story.emotion_tags) ? story.emotion_tags.join(';') : '';
    csv += `${story.id},${story.user_id},${story.created_at},${story.language || ''},${emotionTags},${story.word_count || 0}\n`;
  });
  csv += `\n`;

  // Sketches section
  csv += `SKETCHES\n`;
  csv += `ID,Story ID,Created At,Status,Generation Time,AI Model\n`;
  sketches.forEach(sketch => {
    csv += `${sketch.id},${sketch.story_id},${sketch.created_at},${sketch.status},${sketch.generation_time || 0},${sketch.ai_model_used || ''}\n`;
  });

  return csv;
}