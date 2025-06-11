import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { cookies } from 'next/headers';
import type { CreateGiftRequest, GiftFilterOptions } from '@/lib/types/gifts';

export async function GET(request: NextRequest) {
  try {
    const cookieStore = cookies();
    const supabase = createClient(cookieStore);

    // Get current user
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '10');
    const offset = parseInt(searchParams.get('offset') || '0');
    const status = searchParams.get('status');
    const giftType = searchParams.get('gift_type');
    const privacyLevel = searchParams.get('privacy_level');
    const sent = searchParams.get('sent') === 'true';
    const received = searchParams.get('received') === 'true';

    let query = supabase
      .from('gifts')
      .select(`
        id,
        title,
        message,
        gift_type,
        privacy_level,
        status,
        view_count,
        reaction_count,
        created_at,
        updated_at,
        scheduled_delivery,
        expires_at,
        viewed_at,
        sender_id,
        sender_name,
        recipient_id,
        recipient_name,
        recipient_email,
        share_token,
        share_url,
        animation_id,
        product_id,
        sketch_id,
        is_favorite,
        voice_message_url,
        gift_animations (
          id,
          name,
          thumbnail_url,
          category,
          style
        ),
        products (
          id,
          images,
          price,
          currency
        ),
        sketches (
          id,
          image_url
        )
      `)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    // Filter by sent or received gifts
    if (sent && !received) {
      query = query.eq('sender_id', user.id);
    } else if (received && !sent) {
      query = query.or(`recipient_id.eq.${user.id},recipient_email.eq.${user.email}`);
    } else {
      // Default: show both sent and received
      query = query.or(
        `sender_id.eq.${user.id},recipient_id.eq.${user.id},recipient_email.eq.${user.email}`
      );
    }

    // Apply filters
    if (status) {
      query = query.eq('status', status);
    }
    if (giftType) {
      query = query.eq('gift_type', giftType);
    }
    if (privacyLevel) {
      query = query.eq('privacy_level', privacyLevel);
    }

    const { data: gifts, error } = await query;

    if (error) {
      console.error('Error fetching gifts:', error);
      return NextResponse.json({ error: 'Failed to fetch gifts' }, { status: 500 });
    }

    return NextResponse.json({ 
      gifts, 
      total: gifts?.length || 0,
      page: Math.floor(offset / limit) + 1,
      limit,
      hasMore: gifts && gifts.length === limit 
    });
  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const cookieStore = cookies();
    const supabase = createClient(cookieStore);

    // Get current user
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body: CreateGiftRequest = await request.json();
    const {
      title,
      message,
      gift_type,
      privacy_level,
      animation_id,
      recipient_email,
      recipient_name,
      product_id,
      sketch_id,
      scheduled_delivery,
      expires_at,
      voice_message_file
    } = body;

    // Validate required fields
    if (!title) {
      return NextResponse.json({ error: 'Title is required' }, { status: 400 });
    }
    if (!gift_type) {
      return NextResponse.json({ error: 'Gift type is required' }, { status: 400 });
    }
    if (!privacy_level) {
      return NextResponse.json({ error: 'Privacy level is required' }, { status: 400 });
    }
    if (!animation_id) {
      return NextResponse.json({ error: 'Animation selection is required' }, { status: 400 });
    }

    // Handle voice message upload if provided
    let voiceMessageUrl: string | undefined;
    if (voice_message_file) {
      // TODO: Implement voice message upload to storage
      // For now, we'll skip this and add it in the TTS integration step
      console.log('Voice message file received, but upload not implemented yet');
    }

    // Look up recipient by email if provided
    let recipientId: string | undefined;
    if (recipient_email) {
      const { data: recipientUser } = await supabase
        .from('users')
        .select('id')
        .eq('email', recipient_email)
        .single();
      
      if (recipientUser) {
        recipientId = recipientUser.id;
      }
    }

    // Get sender information
    const { data: senderUser } = await supabase
      .from('users')
      .select('name, email')
      .eq('id', user.id)
      .single();

    // Create gift
    const { data: gift, error: giftError } = await supabase
      .from('gifts')
      .insert({
        sender_id: user.id,
        sender_name: senderUser?.name || 'Anonymous',
        sender_email: senderUser?.email,
        recipient_id: recipientId,
        recipient_email,
        recipient_name,
        title,
        message,
        gift_type,
        privacy_level,
        animation_id,
        product_id,
        sketch_id,
        voice_message_url: voiceMessageUrl,
        scheduled_delivery: scheduled_delivery ? new Date(scheduled_delivery).toISOString() : null,
        expires_at: expires_at ? new Date(expires_at).toISOString() : null,
        status: scheduled_delivery ? 'scheduled' : 'sent'
      })
      .select(`
        id,
        title,
        message,
        gift_type,
        privacy_level,
        status,
        share_token,
        share_url,
        created_at,
        sender_name,
        recipient_name,
        recipient_email
      `)
      .single();

    if (giftError) {
      console.error('Error creating gift:', giftError);
      return NextResponse.json({ error: 'Failed to create gift' }, { status: 500 });
    }

    // TODO: Send notification email to recipient if email provided
    // TODO: Create notification record for recipient if they're a user

    return NextResponse.json({ 
      gift,
      share_url: gift.share_url,
      success: true,
      message: 'Gift created successfully' 
    }, { status: 201 });
  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const cookieStore = cookies();
    const supabase = createClient(cookieStore);

    // Get current user
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { id, ...updateData } = body;

    if (!id) {
      return NextResponse.json({ error: 'Gift ID is required' }, { status: 400 });
    }

    // Remove fields that shouldn't be updated directly
    const {
      sender_id,
      share_token,
      share_url,
      view_count,
      reaction_count,
      created_at,
      ...safeUpdateData
    } = updateData;

    // Update gift (only if user owns it)
    const { data: gift, error: updateError } = await supabase
      .from('gifts')
      .update(safeUpdateData)
      .eq('id', id)
      .eq('sender_id', user.id)
      .select()
      .single();

    if (updateError) {
      console.error('Error updating gift:', updateError);
      return NextResponse.json({ error: 'Failed to update gift' }, { status: 500 });
    }

    if (!gift) {
      return NextResponse.json({ error: 'Gift not found or unauthorized' }, { status: 404 });
    }

    return NextResponse.json({ gift, message: 'Gift updated successfully' });
  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const cookieStore = cookies();
    const supabase = createClient(cookieStore);

    // Get current user
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Gift ID is required' }, { status: 400 });
    }

    // Delete gift (only if user owns it)
    const { error: deleteError } = await supabase
      .from('gifts')
      .delete()
      .eq('id', id)
      .eq('sender_id', user.id);

    if (deleteError) {
      console.error('Error deleting gift:', deleteError);
      return NextResponse.json({ error: 'Failed to delete gift' }, { status: 500 });
    }

    return NextResponse.json({ message: 'Gift deleted successfully' });
  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}