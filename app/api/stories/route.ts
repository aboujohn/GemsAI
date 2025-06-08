import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { cookies } from 'next/headers';

export async function GET(request: NextRequest) {
  try {
    const cookieStore = cookies();
    const supabase = createClient(cookieStore);

    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const isPublic = searchParams.get('public') === 'true';
    const limit = parseInt(searchParams.get('limit') || '10');
    const offset = parseInt(searchParams.get('offset') || '0');

    let query = supabase
      .from('stories')
      .select(
        `
        id,
        title,
        content,
        emotion_tags,
        style_tags,
        budget_range,
        timeline,
        cultural_significance,
        special_notes,
        audio_url,
        created_at,
        updated_at,
        user_id,
        is_public,
        share_count,
        like_count,
        comment_count,
        story_translations (
          language,
          title,
          content,
          cultural_significance,
          special_notes
        )
      `
      )
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    // Filter by user if specified
    if (userId) {
      query = query.eq('user_id', userId);
    }

    // Filter by public stories if specified
    if (isPublic) {
      query = query.eq('is_public', true);
    }

    const { data: stories, error } = await query;

    if (error) {
      console.error('Error fetching stories:', error);
      return NextResponse.json({ error: 'Failed to fetch stories' }, { status: 500 });
    }

    return NextResponse.json({ stories, count: stories?.length || 0 });
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

    const body = await request.json();
    const {
      title,
      content,
      emotionTags,
      styleTags,
      budgetRange,
      timeline,
      culturalSignificance,
      specialNotes,
      audioUrl,
      language = 'he',
      isPublic = false,
    } = body;

    // Validate required fields
    if (!title || !content) {
      return NextResponse.json({ error: 'Title and content are required' }, { status: 400 });
    }

    // Create story
    const { data: story, error: storyError } = await supabase
      .from('stories')
      .insert({
        user_id: user.id,
        emotion_tags: emotionTags || [],
        style_tags: styleTags || [],
        budget_range: budgetRange,
        timeline: timeline,
        cultural_significance: culturalSignificance,
        special_notes: specialNotes,
        audio_url: audioUrl,
        is_public: isPublic,
      })
      .select()
      .single();

    if (storyError) {
      console.error('Error creating story:', storyError);
      return NextResponse.json({ error: 'Failed to create story' }, { status: 500 });
    }

    // Create translation
    const { error: translationError } = await supabase.from('story_translations').insert({
      story_id: story.id,
      language: language,
      title: title,
      content: content,
      cultural_significance: culturalSignificance,
      special_notes: specialNotes,
      is_published: true,
    });

    if (translationError) {
      console.error('Error creating translation:', translationError);
      // Don't fail the request, just log the error
    }

    return NextResponse.json({ story, message: 'Story created successfully' }, { status: 201 });
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
      return NextResponse.json({ error: 'Story ID is required' }, { status: 400 });
    }

    // Update story (only if user owns it)
    const { data: story, error: updateError } = await supabase
      .from('stories')
      .update(updateData)
      .eq('id', id)
      .eq('user_id', user.id)
      .select()
      .single();

    if (updateError) {
      console.error('Error updating story:', updateError);
      return NextResponse.json({ error: 'Failed to update story' }, { status: 500 });
    }

    if (!story) {
      return NextResponse.json({ error: 'Story not found or unauthorized' }, { status: 404 });
    }

    return NextResponse.json({ story, message: 'Story updated successfully' });
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
      return NextResponse.json({ error: 'Story ID is required' }, { status: 400 });
    }

    // Delete story (only if user owns it)
    const { error: deleteError } = await supabase
      .from('stories')
      .delete()
      .eq('id', id)
      .eq('user_id', user.id);

    if (deleteError) {
      console.error('Error deleting story:', deleteError);
      return NextResponse.json({ error: 'Failed to delete story' }, { status: 500 });
    }

    return NextResponse.json({ message: 'Story deleted successfully' });
  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
