import { NextRequest, NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { z } from 'zod';

const ProductSchema = z.object({
  name: z.string().min(1, 'Product name is required'),
  sku: z.string().min(1, 'SKU is required'),
  price: z.number().positive('Price must be positive'),
  currency: z.string().default('ILS'),
  category: z.string().min(1, 'Category is required'),
  materials: z.array(z.string()).min(1, 'At least one material is required'),
  dimensions: z.object({
    width: z.number().optional(),
    height: z.number().optional(),
    depth: z.number().optional(),
    weight: z.number().optional(),
  }).optional(),
  customizable: z.boolean().default(false),
  leadTimeDays: z.number().int().positive('Lead time must be positive'),
  inventoryCount: z.number().int().min(0, 'Inventory count cannot be negative'),
  emotionTags: z.array(z.string()).default([]),
  styleTags: z.array(z.string()).default([]),
  description: z.string().optional(),
  images: z.array(z.string()).min(1, 'At least one image is required'),
});

// GET - Fetch jeweler's products
export async function GET(request: NextRequest) {
  try {
    const supabase = createRouteHandlerClient({ cookies });
    const { searchParams } = new URL(request.url);
    
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const category = searchParams.get('category');
    const status = searchParams.get('status'); // available, unavailable, all
    const search = searchParams.get('search');
    
    const offset = (page - 1) * limit;

    // Get the authenticated user
    const {
      data: { session },
      error: authError,
    } = await supabase.auth.getSession();

    if (authError || !session) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Verify user is a jeweler
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('role')
      .eq('id', session.user.id)
      .single();

    if (userError || userData?.role !== 'jeweler') {
      return NextResponse.json(
        { error: 'Access denied. Jeweler role required.' },
        { status: 403 }
      );
    }

    // Get jeweler ID
    const { data: jewelerData, error: jewelerError } = await supabase
      .from('jewelers')
      .select('id')
      .eq('user_id', session.user.id)
      .single();

    if (jewelerError || !jewelerData) {
      return NextResponse.json(
        { error: 'Jeweler profile not found' },
        { status: 404 }
      );
    }

    // Build query
    let query = supabase
      .from('products')
      .select('*')
      .eq('jeweler_id', jewelerData.id);

    // Apply filters
    if (category && category !== 'all') {
      query = query.eq('category', category);
    }

    if (status === 'available') {
      query = query.eq('is_available', true);
    } else if (status === 'unavailable') {
      query = query.eq('is_available', false);
    }

    if (search) {
      query = query.or(`name.ilike.%${search}%,sku.ilike.%${search}%`);
    }

    // Apply pagination and ordering
    query = query
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    const { data: products, error: productsError } = await query;

    if (productsError) {
      console.error('Error fetching products:', productsError);
      return NextResponse.json(
        { error: 'Failed to fetch products' },
        { status: 500 }
      );
    }

    // Get total count for pagination
    let countQuery = supabase
      .from('products')
      .select('*', { count: 'exact', head: true })
      .eq('jeweler_id', jewelerData.id);

    if (category && category !== 'all') {
      countQuery = countQuery.eq('category', category);
    }

    if (status === 'available') {
      countQuery = countQuery.eq('is_available', true);
    } else if (status === 'unavailable') {
      countQuery = countQuery.eq('is_available', false);
    }

    if (search) {
      countQuery = countQuery.or(`name.ilike.%${search}%,sku.ilike.%${search}%`);
    }

    const { count, error: countError } = await countQuery;

    if (countError) {
      console.error('Error getting product count:', countError);
    }

    return NextResponse.json({
      products: products || [],
      pagination: {
        page,
        limit,
        total: count || 0,
        totalPages: Math.ceil((count || 0) / limit),
      },
    });

  } catch (error) {
    console.error('Error in GET /api/jeweler/products:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST - Create new product
export async function POST(request: NextRequest) {
  try {
    const supabase = createRouteHandlerClient({ cookies });

    // Get the authenticated user
    const {
      data: { session },
      error: authError,
    } = await supabase.auth.getSession();

    if (authError || !session) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Verify user is a jeweler
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('role')
      .eq('id', session.user.id)
      .single();

    if (userError || userData?.role !== 'jeweler') {
      return NextResponse.json(
        { error: 'Access denied. Jeweler role required.' },
        { status: 403 }
      );
    }

    // Get jeweler ID
    const { data: jewelerData, error: jewelerError } = await supabase
      .from('jewelers')
      .select('id')
      .eq('user_id', session.user.id)
      .single();

    if (jewelerError || !jewelerData) {
      return NextResponse.json(
        { error: 'Jeweler profile not found' },
        { status: 404 }
      );
    }

    // Parse and validate request body
    const body = await request.json();
    const validatedData = ProductSchema.parse(body);

    // Check if SKU already exists for this jeweler
    const { data: existingSku, error: skuError } = await supabase
      .from('products')
      .select('id')
      .eq('jeweler_id', jewelerData.id)
      .eq('sku', validatedData.sku)
      .single();

    if (existingSku) {
      return NextResponse.json(
        { error: 'SKU already exists for your products' },
        { status: 400 }
      );
    }

    // Create the product
    const { data: product, error: createError } = await supabase
      .from('products')
      .insert([
        {
          jeweler_id: jewelerData.id,
          name: validatedData.name,
          sku: validatedData.sku,
          price: validatedData.price,
          currency: validatedData.currency,
          images: validatedData.images,
          category: validatedData.category,
          materials: validatedData.materials,
          dimensions: validatedData.dimensions,
          customizable: validatedData.customizable,
          lead_time_days: validatedData.leadTimeDays,
          is_available: true,
          inventory_count: validatedData.inventoryCount,
          emotion_tags: validatedData.emotionTags,
          style_tags: validatedData.styleTags,
          description: validatedData.description,
        },
      ])
      .select()
      .single();

    if (createError) {
      console.error('Error creating product:', createError);
      return NextResponse.json(
        { error: 'Failed to create product' },
        { status: 500 }
      );
    }

    return NextResponse.json(product, { status: 201 });

  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation error', details: error.errors },
        { status: 400 }
      );
    }

    console.error('Error in POST /api/jeweler/products:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}