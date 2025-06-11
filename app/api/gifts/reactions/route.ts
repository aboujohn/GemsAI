import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { cookies } from 'next/headers';
import type { ReactionType } from '@/lib/types/gifts';

export async function GET(request: NextRequest) {
  try {
    const cookieStore = cookies();
    const supabase = createClient(cookieStore);

    const { searchParams } = new URL(request.url);
    const giftId = searchParams.get('gift_id');
    const shareToken = searchParams.get('share_token');

    if (!giftId && !shareToken) {
      return NextResponse.json({ error: 'Gift ID or share token is required' }, { status: 400 });
    }

    let query = supabase
      .from('gift_reactions')
      .select(`
        id,
        reaction_type,
        message,
        emoji,
        created_at,
        user_name,
        user_email
      `)
      .order('created_at', { ascending: false });

    if (giftId) {
      query = query.eq('gift_id', giftId);
    } else if (shareToken) {
      // First get the gift ID from share token
      const { data: gift } = await supabase
        .from('gifts')
        .select('id')
        .eq('share_token', shareToken)
        .single();

      if (!gift) {
        return NextResponse.json({ error: 'Gift not found' }, { status: 404 });
      }

      query = query.eq('gift_id', gift.id);
    }

    const { data: reactions, error } = await query;

    if (error) {
      console.error('Error fetching reactions:', error);
      return NextResponse.json({ error: 'Failed to fetch reactions' }, { status: 500 });
    }

    // Group reactions by type for summary
    const reactionSummary = reactions?.reduce((acc, reaction) => {
      const type = reaction.reaction_type;
      if (!acc[type]) {
        acc[type] = 0;
      }
      acc[type]++;
      return acc;
    }, {} as Record<ReactionType, number>);

    return NextResponse.json({ 
      reactions,
      summary: reactionSummary,
      total: reactions?.length || 0
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

    const body = await request.json();
    const { 
      gift_id, 
      share_token, 
      reaction_type, 
      message, 
      emoji,
      user_name,
      user_email 
    } = body;

    // Validate required fields
    if (!reaction_type) {
      return NextResponse.json({ error: 'Reaction type is required' }, { status: 400 });
    }

    if (!gift_id && !share_token) {
      return NextResponse.json({ error: 'Gift ID or share token is required' }, { status: 400 });
    }

    // Get current user (optional for reactions)
    const {
      data: { user },
    } = await supabase.auth.getUser();

    let targetGiftId = gift_id;

    // If share token provided, get the gift ID
    if (share_token && !gift_id) {
      const { data: gift, error: giftError } = await supabase
        .from('gifts')
        .select('id, sender_id')
        .eq('share_token', share_token)
        .single();

      if (giftError || !gift) {
        return NextResponse.json({ error: 'Gift not found' }, { status: 404 });
      }

      targetGiftId = gift.id;

      // Don't allow users to react to their own gifts
      if (user && gift.sender_id === user.id) {
        return NextResponse.json({ error: 'Cannot react to your own gift' }, { status: 400 });
      }
    }

    // Prepare reaction data
    const reactionData = {
      gift_id: targetGiftId,
      reaction_type,
      message: message || null,
      emoji: emoji || null,
      user_id: user?.id || null,
      user_name: user?.user_metadata?.name || user_name || null,
      user_email: user?.email || user_email || null,
      ip_address: request.headers.get('x-forwarded-for') || 
                 request.headers.get('x-real-ip') || 
                 'unknown'
    };

    // Check if user already reacted (if authenticated)
    if (user) {
      const { data: existingReaction } = await supabase
        .from('gift_reactions')
        .select('id, reaction_type')
        .eq('gift_id', targetGiftId)
        .eq('user_id', user.id)
        .single();

      if (existingReaction) {
        // Update existing reaction
        const { data: updatedReaction, error: updateError } = await supabase
          .from('gift_reactions')
          .update({
            reaction_type,
            message: message || null,
            emoji: emoji || null
          })
          .eq('id', existingReaction.id)
          .select()
          .single();

        if (updateError) {
          console.error('Error updating reaction:', updateError);
          return NextResponse.json({ error: 'Failed to update reaction' }, { status: 500 });
        }

        return NextResponse.json({ 
          reaction: updatedReaction,
          message: 'Reaction updated successfully'
        });
      }
    } else if (user_email) {
      // Check for existing reaction by email (for non-authenticated users)
      const { data: existingReaction } = await supabase
        .from('gift_reactions')
        .select('id')
        .eq('gift_id', targetGiftId)
        .eq('user_email', user_email)
        .single();

      if (existingReaction) {
        return NextResponse.json({ 
          error: 'You have already reacted to this gift' 
        }, { status: 400 });
      }
    }

    // Create new reaction
    const { data: reaction, error: reactionError } = await supabase
      .from('gift_reactions')
      .insert(reactionData)
      .select()
      .single();

    if (reactionError) {
      console.error('Error creating reaction:', reactionError);
      return NextResponse.json({ error: 'Failed to create reaction' }, { status: 500 });
    }

    // TODO: Create notification for gift sender
    // TODO: Send email notification if enabled

    return NextResponse.json({ 
      reaction,
      message: 'Reaction added successfully'
    }, { status: 201 });
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
    const reactionId = searchParams.get('id');
    const giftId = searchParams.get('gift_id');

    if (!reactionId && !giftId) {
      return NextResponse.json({ error: 'Reaction ID or Gift ID is required' }, { status: 400 });
    }

    let query = supabase.from('gift_reactions').delete();

    if (reactionId) {
      // Delete specific reaction (only if user owns it)
      query = query.eq('id', reactionId).eq('user_id', user.id);
    } else if (giftId) {
      // Delete user's reaction to a specific gift
      query = query.eq('gift_id', giftId).eq('user_id', user.id);
    }

    const { error: deleteError } = await query;

    if (deleteError) {
      console.error('Error deleting reaction:', deleteError);
      return NextResponse.json({ error: 'Failed to delete reaction' }, { status: 500 });
    }

    return NextResponse.json({ message: 'Reaction deleted successfully' });
  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}