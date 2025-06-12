import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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

    const { action } = await request.json();
    const userId = params.id;

    // Get the target user
    const { data: targetUser, error: targetUserError } = await supabase
      .from('users')
      .select('id, email, name, role, is_active, email_verified')
      .eq('id', userId)
      .single();

    if (targetUserError || !targetUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Prevent admin from deactivating themselves
    if (action === 'deactivate' && userId === session.user.id) {
      return NextResponse.json({ error: 'Cannot deactivate yourself' }, { status: 400 });
    }

    let updateData: any = {};
    let auditAction = '';
    let auditChanges: any = {};

    switch (action) {
      case 'activate':
        updateData = { is_active: true };
        auditAction = 'user_activated';
        auditChanges = { is_active: { from: targetUser.is_active, to: true } };
        break;

      case 'deactivate':
        updateData = { is_active: false };
        auditAction = 'user_deactivated';
        auditChanges = { is_active: { from: targetUser.is_active, to: false } };
        break;

      case 'verify_email':
        updateData = { email_verified: true };
        auditAction = 'email_verified';
        auditChanges = { email_verified: { from: targetUser.email_verified, to: true } };
        break;

      case 'unverify_email':
        updateData = { email_verified: false };
        auditAction = 'email_unverified';
        auditChanges = { email_verified: { from: targetUser.email_verified, to: false } };
        break;

      case 'promote_to_jeweler':
        if (targetUser.role === 'admin') {
          return NextResponse.json({ error: 'Cannot change admin role' }, { status: 400 });
        }
        updateData = { role: 'jeweler' };
        auditAction = 'user_promoted_jeweler';
        auditChanges = { role: { from: targetUser.role, to: 'jeweler' } };
        break;

      case 'demote_to_user':
        if (targetUser.role === 'admin') {
          return NextResponse.json({ error: 'Cannot change admin role' }, { status: 400 });
        }
        updateData = { role: 'user' };
        auditAction = 'user_demoted_user';
        auditChanges = { role: { from: targetUser.role, to: 'user' } };
        break;

      case 'reset_password':
        // This would typically trigger a password reset email
        // For now, we'll just log the action
        auditAction = 'password_reset_requested';
        auditChanges = { password_reset: true };
        break;

      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }

    // Update user if there are changes
    if (Object.keys(updateData).length > 0) {
      const { error: updateError } = await supabase
        .from('users')
        .update(updateData)
        .eq('id', userId);

      if (updateError) {
        console.error('Error updating user:', updateError);
        return NextResponse.json({ error: 'Failed to update user' }, { status: 500 });
      }
    }

    // Log admin action
    await supabase
      .from('admin_audit_logs')
      .insert({
        admin_user_id: session.user.id,
        action: auditAction,
        entity_type: 'user',
        entity_id: userId,
        changes: {
          ...auditChanges,
          target_user: {
            id: targetUser.id,
            email: targetUser.email,
            name: targetUser.name
          },
          admin_email: adminData.email
        },
        ip_address: request.headers.get('x-forwarded-for') || 
                   request.headers.get('x-real-ip') || 
                   'unknown',
        user_agent: request.headers.get('user-agent') || 'unknown'
      });

    return NextResponse.json({ 
      success: true,
      message: `User ${action.replace('_', ' ')} successfully`
    });

  } catch (error) {
    console.error('User action error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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
      .select('role')
      .eq('id', session.user.id)
      .single();

    if (adminError || adminData?.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const userId = params.id;

    // Get user details
    const { data: user, error: userError } = await supabase
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
      .eq('id', userId)
      .single();

    if (userError) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Get user activity data
    const [ordersResult, storiesResult, sketchesResult] = await Promise.allSettled([
      supabase
        .from('orders')
        .select('id, created_at, status, total_amount')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(10),
      
      supabase
        .from('stories')
        .select('id, created_at, title, language')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(10),
      
      supabase
        .from('sketches')
        .select('id, created_at, status')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(10)
    ]);

    const orders = ordersResult.status === 'fulfilled' ? ordersResult.value.data || [] : [];
    const stories = storiesResult.status === 'fulfilled' ? storiesResult.value.data || [] : [];
    const sketches = sketchesResult.status === 'fulfilled' ? sketchesResult.value.data || [] : [];

    // Calculate activity statistics
    const totalRevenue = orders.reduce((sum, order) => sum + (order.total_amount || 0), 0);
    const completedOrders = orders.filter(order => order.status === 'completed').length;
    const successfulSketches = sketches.filter(sketch => sketch.status === 'completed').length;

    const userDetails = {
      ...user,
      activity: {
        total_orders: orders.length,
        completed_orders: completedOrders,
        total_revenue: totalRevenue,
        total_stories: stories.length,
        total_sketches: sketches.length,
        successful_sketches: successfulSketches,
        recent_orders: orders,
        recent_stories: stories,
        recent_sketches: sketches
      }
    };

    // Log admin access
    await supabase
      .from('admin_audit_logs')
      .insert({
        admin_user_id: session.user.id,
        action: 'user_details_viewed',
        entity_type: 'user',
        entity_id: userId,
        changes: { viewed_user: user.email },
        ip_address: request.headers.get('x-forwarded-for') || 
                   request.headers.get('x-real-ip') || 
                   'unknown',
        user_agent: request.headers.get('user-agent') || 'unknown'
      });

    return NextResponse.json(userDetails);

  } catch (error) {
    console.error('User details error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}