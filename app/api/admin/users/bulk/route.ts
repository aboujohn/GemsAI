import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function PATCH(request: NextRequest) {
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

    const { userIds, action } = await request.json();

    if (!Array.isArray(userIds) || userIds.length === 0) {
      return NextResponse.json({ error: 'Invalid user IDs' }, { status: 400 });
    }

    // Get target users
    const { data: targetUsers, error: targetUsersError } = await supabase
      .from('users')
      .select('id, email, name, role, is_active, email_verified')
      .in('id', userIds);

    if (targetUsersError || !targetUsers || targetUsers.length === 0) {
      return NextResponse.json({ error: 'Users not found' }, { status: 404 });
    }

    // Prevent admin from deactivating themselves
    if (action === 'deactivate' && userIds.includes(session.user.id)) {
      return NextResponse.json({ error: 'Cannot deactivate yourself' }, { status: 400 });
    }

    // Filter out admin users for certain actions
    const adminUsers = targetUsers.filter(user => user.role === 'admin');
    if (adminUsers.length > 0 && ['deactivate', 'promote_to_jeweler', 'demote_to_user'].includes(action)) {
      return NextResponse.json({ 
        error: `Cannot perform ${action} on admin users` 
      }, { status: 400 });
    }

    let updateData: any = {};
    let auditAction = '';

    switch (action) {
      case 'activate':
        updateData = { is_active: true };
        auditAction = 'bulk_users_activated';
        break;

      case 'deactivate':
        updateData = { is_active: false };
        auditAction = 'bulk_users_deactivated';
        break;

      case 'verify_email':
        updateData = { email_verified: true };
        auditAction = 'bulk_emails_verified';
        break;

      case 'unverify_email':
        updateData = { email_verified: false };
        auditAction = 'bulk_emails_unverified';
        break;

      case 'promote_to_jeweler':
        updateData = { role: 'jeweler' };
        auditAction = 'bulk_users_promoted_jeweler';
        break;

      case 'demote_to_user':
        updateData = { role: 'user' };
        auditAction = 'bulk_users_demoted_user';
        break;

      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }

    // Filter out users that shouldn't be affected by this action
    let validUserIds = userIds;
    
    if (['promote_to_jeweler', 'demote_to_user'].includes(action)) {
      validUserIds = targetUsers
        .filter(user => user.role !== 'admin')
        .map(user => user.id);
    }

    if (validUserIds.length === 0) {
      return NextResponse.json({ 
        error: 'No valid users to update' 
      }, { status: 400 });
    }

    // Perform bulk update
    const { error: updateError } = await supabase
      .from('users')
      .update(updateData)
      .in('id', validUserIds);

    if (updateError) {
      console.error('Error updating users:', updateError);
      return NextResponse.json({ error: 'Failed to update users' }, { status: 500 });
    }

    // Log admin action
    await supabase
      .from('admin_audit_logs')
      .insert({
        admin_user_id: session.user.id,
        action: auditAction,
        entity_type: 'users',
        changes: {
          action: action,
          user_count: validUserIds.length,
          affected_users: targetUsers
            .filter(user => validUserIds.includes(user.id))
            .map(user => ({
              id: user.id,
              email: user.email,
              name: user.name,
              role: user.role
            })),
          admin_email: adminData.email,
          update_data: updateData
        },
        ip_address: request.headers.get('x-forwarded-for') || 
                   request.headers.get('x-real-ip') || 
                   'unknown',
        user_agent: request.headers.get('user-agent') || 'unknown'
      });

    return NextResponse.json({ 
      success: true,
      message: `${validUserIds.length} users ${action.replace('_', ' ')} successfully`,
      affected_count: validUserIds.length
    });

  } catch (error) {
    console.error('Bulk user action error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}