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

    // Check if story exists
    const { data: story, error: storyError } = await supabase
      .from('stories')
      .select('id, like_count')
      .eq('id', storyId)
      .single();

    if (storyError || !story) {
      return NextResponse.json({ error: 'Story not found' }, { status: 404 });
    }

    // Check if user already liked this story
    const { data: existingLike, error: likeCheckError } = await supabase
      .from('story_likes')
      .select('id')
      .eq('story_id', storyId)
      .eq('user_id', user.id)
      .single();

    if (likeCheckError && likeCheckError.code !== 'PGRST116') {
      console.error('Error checking existing like:', likeCheckError);
      return NextResponse.json({ error: 'Failed to check like status' }, { status: 500 });
    }

    if (existingLike) {
      return NextResponse.json({ error: 'Story already liked' }, { status: 400 });
    }

    // Create like record
    const { error: likeError } = await supabase.from('story_likes').insert({
      story_id: storyId,
      user_id: user.id,
    });

    if (likeError) {
      console.error('Error creating like:', likeError);
      return NextResponse.json({ error: 'Failed to like story' }, { status: 500 });
    }

    // Update story like count
    const { error: updateError } = await supabase
      .from('stories')
      .update({ like_count: (story.like_count || 0) + 1 })
      .eq('id', storyId);

    if (updateError) {
      console.error('Error updating like count:', updateError);
    }

    return NextResponse.json({ message: 'Story liked successfully' });
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

    // Check if story exists
    const { data: story, error: storyError } = await supabase
      .from('stories')
      .select('id, like_count')
      .eq('id', storyId)
      .single();

    if (storyError || !story) {
      return NextResponse.json({ error: 'Story not found' }, { status: 404 });
    }

    // Delete like record
    const { error: deleteError } = await supabase
      .from('story_likes')
      .delete()
      .eq('story_id', storyId)
      .eq('user_id', user.id);

    if (deleteError) {
      console.error('Error deleting like:', deleteError);
      return NextResponse.json({ error: 'Failed to unlike story' }, { status: 500 });
    }

    // Update story like count
    const newLikeCount = Math.max((story.like_count || 0) - 1, 0);
    const { error: updateError } = await supabase
      .from('stories')
      .update({ like_count: newLikeCount })
      .eq('id', storyId);

    if (updateError) {
      console.error('Error updating like count:', updateError);
    }

    return NextResponse.json({ message: 'Story unliked successfully' });
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

    // Get likes for this story
    const { data: likes, error: likesError } = await supabase
      .from('story_likes')
      .select(
        `
        id,
        created_at,
        user_id,
        profiles (
          id,
          full_name,
          avatar_url
        )
      `
      )
      .eq('story_id', storyId)
      .order('created_at', { ascending: false });

    if (likesError) {
      console.error('Error fetching likes:', likesError);
      return NextResponse.json({ error: 'Failed to fetch likes' }, { status: 500 });
    }

    return NextResponse.json({ likes, count: likes?.length || 0 });
  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
