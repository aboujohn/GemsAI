import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { cookies } from 'next/headers';
import type { AnimationCategory, AnimationStyle, AnimationFilterOptions } from '@/lib/types/gifts';

export async function GET(request: NextRequest) {
  try {
    const cookieStore = cookies();
    const supabase = createClient(cookieStore);

    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category') as AnimationCategory | null;
    const style = searchParams.get('style') as AnimationStyle | null;
    const featured = searchParams.get('featured') === 'true';
    const premium = searchParams.get('premium') === 'true';
    const search = searchParams.get('search');
    const limit = parseInt(searchParams.get('limit') || '20');
    const offset = parseInt(searchParams.get('offset') || '0');

    let query = supabase
      .from('gift_animations')
      .select(`
        id,
        name,
        description,
        file_path,
        thumbnail_url,
        preview_url,
        category,
        style,
        tags,
        duration_ms,
        file_size_bytes,
        is_premium,
        is_featured,
        usage_count,
        rating,
        created_at
      `)
      .order('is_featured', { ascending: false })
      .order('usage_count', { ascending: false })
      .order('rating', { ascending: false })
      .range(offset, offset + limit - 1);

    // Apply filters
    if (category) {
      query = query.eq('category', category);
    }
    if (style) {
      query = query.eq('style', style);
    }
    if (featured) {
      query = query.eq('is_featured', true);
    }
    if (premium !== null) {
      query = query.eq('is_premium', premium);
    }
    if (search) {
      query = query.or(`name.ilike.%${search}%,description.ilike.%${search}%,tags.cs.{${search}}`);
    }

    const { data: animations, error } = await query;

    if (error) {
      console.error('Error fetching animations:', error);
      return NextResponse.json({ error: 'Failed to fetch animations' }, { status: 500 });
    }

    // Get categories and featured animations for response metadata
    const { data: categoriesData } = await supabase
      .from('gift_animations')
      .select('category')
      .order('category');

    const { data: featuredAnimations } = await supabase
      .from('gift_animations')
      .select(`
        id,
        name,
        thumbnail_url,
        category,
        style
      `)
      .eq('is_featured', true)
      .order('usage_count', { ascending: false })
      .limit(6);

    const categories = Array.from(new Set(categoriesData?.map(item => item.category) || []));

    return NextResponse.json({
      animations,
      total: animations?.length || 0,
      categories,
      featured: featuredAnimations || [],
      page: Math.floor(offset / limit) + 1,
      limit,
      hasMore: animations && animations.length === limit
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

    // Get current user and check admin privileges
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if user is admin
    const { data: userData } = await supabase
      .from('users')
      .select('role')
      .eq('id', user.id)
      .single();

    if (!userData || userData.role !== 'admin') {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
    }

    const body = await request.json();
    const {
      name,
      description,
      file_path,
      thumbnail_url,
      preview_url,
      category,
      style,
      tags,
      duration_ms,
      file_size_bytes,
      is_premium,
      is_featured
    } = body;

    // Validate required fields
    if (!name || !file_path || !thumbnail_url || !category || !style) {
      return NextResponse.json({ 
        error: 'Name, file_path, thumbnail_url, category, and style are required' 
      }, { status: 400 });
    }

    // Create animation
    const { data: animation, error: animationError } = await supabase
      .from('gift_animations')
      .insert({
        name,
        description,
        file_path,
        thumbnail_url,
        preview_url,
        category,
        style,
        tags: tags || [],
        duration_ms: duration_ms || 3000,
        file_size_bytes,
        is_premium: is_premium || false,
        is_featured: is_featured || false,
        usage_count: 0,
        rating: 0.0
      })
      .select()
      .single();

    if (animationError) {
      console.error('Error creating animation:', animationError);
      return NextResponse.json({ error: 'Failed to create animation' }, { status: 500 });
    }

    return NextResponse.json({ 
      animation,
      message: 'Animation created successfully' 
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

    // Get current user and check admin privileges
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if user is admin
    const { data: userData } = await supabase
      .from('users')
      .select('role')
      .eq('id', user.id)
      .single();

    if (!userData || userData.role !== 'admin') {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
    }

    const body = await request.json();
    const { id, ...updateData } = body;

    if (!id) {
      return NextResponse.json({ error: 'Animation ID is required' }, { status: 400 });
    }

    // Remove fields that shouldn't be updated directly
    const { usage_count, created_at, updated_at, ...safeUpdateData } = updateData;

    // Update animation
    const { data: animation, error: updateError } = await supabase
      .from('gift_animations')
      .update(safeUpdateData)
      .eq('id', id)
      .select()
      .single();

    if (updateError) {
      console.error('Error updating animation:', updateError);
      return NextResponse.json({ error: 'Failed to update animation' }, { status: 500 });
    }

    if (!animation) {
      return NextResponse.json({ error: 'Animation not found' }, { status: 404 });
    }

    return NextResponse.json({ animation, message: 'Animation updated successfully' });
  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const cookieStore = cookies();
    const supabase = createClient(cookieStore);

    // Get current user and check admin privileges
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if user is admin
    const { data: userData } = await supabase
      .from('users')
      .select('role')
      .eq('id', user.id)
      .single();

    if (!userData || userData.role !== 'admin') {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Animation ID is required' }, { status: 400 });
    }

    // Check if animation is being used by any gifts
    const { data: giftUsage } = await supabase
      .from('gifts')
      .select('id')
      .eq('animation_id', id)
      .limit(1);

    if (giftUsage && giftUsage.length > 0) {
      return NextResponse.json({ 
        error: 'Cannot delete animation that is being used by gifts' 
      }, { status: 400 });
    }

    // Delete animation
    const { error: deleteError } = await supabase
      .from('gift_animations')
      .delete()
      .eq('id', id);

    if (deleteError) {
      console.error('Error deleting animation:', deleteError);
      return NextResponse.json({ error: 'Failed to delete animation' }, { status: 500 });
    }

    return NextResponse.json({ message: 'Animation deleted successfully' });
  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}