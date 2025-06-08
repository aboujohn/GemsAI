import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { cookies } from 'next/headers';

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
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

    const storyId = params.id;
    const body = await request.json();
    const { shareType = 'public', shareWith = [], message = '' } = body;

    // Validate story exists and user has permission
    const { data: story, error: storyError } = await supabase
      .from('stories')
      .select('id, user_id, is_public')
      .eq('id', storyId)
      .single();

    if (storyError || !story) {
      return NextResponse.json({ error: 'Story not found' }, { status: 404 });
    }

    if (story.user_id !== user.id) {
      return NextResponse.json({ error: 'Unauthorized to share this story' }, { status: 403 });
    }

    // Generate share URL
    const shareUrl = `${process.env.NEXT_PUBLIC_APP_URL}/stories/${storyId}`;

    // Create share record
    const { data: shareRecord, error: shareError } = await supabase
      .from('story_shares')
      .insert({
        story_id: storyId,
        shared_by: user.id,
        share_type: shareType,
        share_url: shareUrl,
        message: message,
        expires_at:
          shareType === 'temporary' ? new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) : null, // 7 days for temporary shares
      })
      .select()
      .single();

    if (shareError) {
      console.error('Error creating share record:', shareError);
      return NextResponse.json({ error: 'Failed to create share' }, { status: 500 });
    }

    // If sharing with specific users, create share recipients
    if (shareWith.length > 0) {
      const recipients = shareWith.map((email: string) => ({
        share_id: shareRecord.id,
        recipient_email: email,
        status: 'pending',
      }));

      const { error: recipientError } = await supabase
        .from('story_share_recipients')
        .insert(recipients);

      if (recipientError) {
        console.error('Error creating share recipients:', recipientError);
        // Don't fail the request, just log the error
      }
    }

    // Update story share count
    const { error: updateError } = await supabase
      .from('stories')
      .update({ share_count: (story.share_count || 0) + 1 })
      .eq('id', storyId);

    if (updateError) {
      console.error('Error updating share count:', updateError);
    }

    return NextResponse.json({
      shareUrl,
      shareId: shareRecord.id,
      message: 'Story shared successfully',
    });
  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const cookieStore = cookies();
    const supabase = createClient(cookieStore);

    const storyId = params.id;

    // Get share records for this story
    const { data: shares, error: shareError } = await supabase
      .from('story_shares')
      .select(
        `
        id,
        share_type,
        share_url,
        message,
        created_at,
        expires_at,
        view_count,
        story_share_recipients (
          recipient_email,
          status,
          viewed_at
        )
      `
      )
      .eq('story_id', storyId)
      .order('created_at', { ascending: false });

    if (shareError) {
      console.error('Error fetching shares:', shareError);
      return NextResponse.json({ error: 'Failed to fetch shares' }, { status: 500 });
    }

    return NextResponse.json({ shares });
  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
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

    const storyId = params.id;
    const { searchParams } = new URL(request.url);
    const shareId = searchParams.get('shareId');

    if (!shareId) {
      return NextResponse.json({ error: 'Share ID is required' }, { status: 400 });
    }

    // Verify user owns the story
    const { data: story, error: storyError } = await supabase
      .from('stories')
      .select('user_id')
      .eq('id', storyId)
      .single();

    if (storyError || !story || story.user_id !== user.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    // Delete share record
    const { error: deleteError } = await supabase
      .from('story_shares')
      .delete()
      .eq('id', shareId)
      .eq('story_id', storyId);

    if (deleteError) {
      console.error('Error deleting share:', deleteError);
      return NextResponse.json({ error: 'Failed to delete share' }, { status: 500 });
    }

    return NextResponse.json({ message: 'Share deleted successfully' });
  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
