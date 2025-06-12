import { NextRequest, NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';

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
        { isAdmin: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Check user role in database
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('role, email, name')
      .eq('id', session.user.id)
      .single();

    if (userError) {
      console.error('Error fetching user data:', userError);
      return NextResponse.json(
        { isAdmin: false, error: 'User not found' },
        { status: 404 }
      );
    }

    const isAdmin = userData.role === 'admin';

    // Log admin access attempt
    if (isAdmin) {
      console.log(`Admin access granted to user: ${userData.email}`);
      
      // Log admin access in audit table (optional)
      await supabase.from('admin_audit_logs').insert({
        admin_user_id: session.user.id,
        action: 'admin_access_granted',
        entity_type: 'auth',
        ip_address: request.headers.get('x-forwarded-for') || 
                   request.headers.get('x-real-ip') || 
                   'unknown',
        user_agent: request.headers.get('user-agent') || 'unknown',
      }).catch(err => {
        // Don't fail if audit logging fails
        console.warn('Failed to log admin access:', err);
      });
    } else {
      console.warn(`Admin access denied to user: ${userData.email} (role: ${userData.role})`);
    }

    return NextResponse.json({
      isAdmin,
      user: isAdmin ? {
        id: session.user.id,
        email: userData.email,
        name: userData.name,
        role: userData.role,
      } : undefined,
    });

  } catch (error) {
    console.error('Admin auth check error:', error);
    return NextResponse.json(
      { isAdmin: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}