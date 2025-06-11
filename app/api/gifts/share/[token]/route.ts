import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { cookies } from 'next/headers';
import type { GiftViewResponse } from '@/lib/types/gifts';

interface RouteParams {
  params: {
    token: string;
  };
}

export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const cookieStore = cookies();
    const supabase = createClient(cookieStore);
    const { token } = params;

    if (!token) {
      return NextResponse.json({ error: 'Share token is required' }, { status: 400 });
    }

    // Get gift by share token
    const { data: gift, error: giftError } = await supabase
      .from('gifts')
      .select(`
        id,
        title,
        message,
        description,
        gift_type,
        privacy_level,
        status,
        view_count,
        reaction_count,
        created_at,
        scheduled_delivery,
        expires_at,
        viewed_at,
        sender_id,
        sender_name,
        sender_email,
        recipient_id,
        recipient_name,
        recipient_email,
        share_token,
        share_url,
        animation_id,
        product_id,
        sketch_id,
        voice_message_url,
        gift_animations (
          id,
          name,
          description,
          file_path,
          thumbnail_url,
          preview_url,
          category,
          style,
          duration_ms,
          tags
        ),
        products (
          id,
          sku,
          price,
          currency,
          images,
          category,
          materials,
          customizable,
          lead_time_days,
          jewelers (
            id,
            business_name,
            rating,
            location_city,
            location_country
          )
        ),
        sketches (
          id,
          image_url,
          prompt,
          ai_model,
          user_rating,
          user_feedback
        )
      `)
      .eq('share_token', token)
      .single();

    if (giftError || !gift) {
      console.error('Error fetching gift:', giftError);
      return NextResponse.json({ error: 'Gift not found' }, { status: 404 });
    }

    // Check if gift is expired
    if (gift.expires_at && new Date(gift.expires_at) < new Date()) {
      return NextResponse.json({ error: 'Gift has expired' }, { status: 410 });
    }

    // Check if gift is blocked
    if (gift.status === 'blocked') {
      return NextResponse.json({ error: 'Gift is not available' }, { status: 403 });
    }

    // Check privacy level access
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (gift.privacy_level === 'private') {
      if (!user || (user.id !== gift.sender_id && user.id !== gift.recipient_id && user.email !== gift.recipient_email)) {
        return NextResponse.json({ error: 'Access denied' }, { status: 403 });
      }
    }

    // Mark as viewed if first time viewing and increment view count
    const shouldMarkViewed = !gift.viewed_at;
    if (shouldMarkViewed) {
      await supabase
        .from('gifts')
        .update({ 
          viewed_at: new Date().toISOString(),
          status: 'viewed'
        })
        .eq('id', gift.id);
    }

    // Get sender information
    const { data: senderInfo } = await supabase
      .from('users')
      .select('name, avatar_url')
      .eq('id', gift.sender_id)
      .single();

    // Check if current user can react (not the sender)
    const canReact = !user || user.id !== gift.sender_id;

    // Get current user's reaction if logged in
    let userReaction = null;
    if (user && canReact) {
      const { data: reaction } = await supabase
        .from('gift_reactions')
        .select('reaction_type')
        .eq('gift_id', gift.id)
        .eq('user_id', user.id)
        .single();
      
      userReaction = reaction?.reaction_type || null;
    }

    const response: GiftViewResponse = {
      gift: {
        ...gift,
        view_count: shouldMarkViewed ? gift.view_count + 1 : gift.view_count,
        viewed_at: shouldMarkViewed ? new Date().toISOString() : gift.viewed_at
      },
      animation: gift.gift_animations,
      product: gift.products,
      sketch: gift.sketches,
      sender_info: {
        name: senderInfo?.name || gift.sender_name || 'Anonymous',
        avatar: senderInfo?.avatar_url
      },
      can_react: canReact,
      user_reaction: userReaction
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// Mark gift as favorite for the current user
export async function POST(request: NextRequest, { params }: RouteParams) {
  try {
    const cookieStore = cookies();
    const supabase = createClient(cookieStore);
    const { token } = params;

    // Get current user
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get gift by share token
    const { data: gift, error: giftError } = await supabase
      .from('gifts')
      .select('id, sender_id')
      .eq('share_token', token)
      .single();

    if (giftError || !gift) {
      return NextResponse.json({ error: 'Gift not found' }, { status: 404 });
    }

    // Don't allow users to favorite their own gifts
    if (gift.sender_id === user.id) {
      return NextResponse.json({ error: 'Cannot favorite your own gift' }, { status: 400 });
    }

    const body = await request.json();
    const { action, notes } = body; // action: 'add' or 'remove'

    if (action === 'add') {
      // Add to favorites
      const { error: favoriteError } = await supabase
        .from('user_favorites')
        .insert({
          user_id: user.id,
          gift_id: gift.id,
          notes: notes || null
        });

      if (favoriteError) {
        // If already exists, just update the notes
        if (favoriteError.code === '23505') {
          const { error: updateError } = await supabase
            .from('user_favorites')
            .update({ notes: notes || null })
            .eq('user_id', user.id)
            .eq('gift_id', gift.id);

          if (updateError) {
            console.error('Error updating favorite:', updateError);
            return NextResponse.json({ error: 'Failed to update favorite' }, { status: 500 });
          }
        } else {
          console.error('Error adding favorite:', favoriteError);
          return NextResponse.json({ error: 'Failed to add to favorites' }, { status: 500 });
        }
      }

      return NextResponse.json({ message: 'Added to favorites' });
    } else if (action === 'remove') {
      // Remove from favorites
      const { error: removeError } = await supabase
        .from('user_favorites')
        .delete()
        .eq('user_id', user.id)
        .eq('gift_id', gift.id);

      if (removeError) {
        console.error('Error removing favorite:', removeError);
        return NextResponse.json({ error: 'Failed to remove from favorites' }, { status: 500 });
      }

      return NextResponse.json({ message: 'Removed from favorites' });
    } else {
      return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }
  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}