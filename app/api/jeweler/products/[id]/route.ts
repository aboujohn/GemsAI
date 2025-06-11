import { NextRequest, NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { z } from 'zod';

const UpdateProductSchema = z.object({
  name: z.string().min(1, 'Product name is required').optional(),
  sku: z.string().min(1, 'SKU is required').optional(),
  price: z.number().positive('Price must be positive').optional(),
  currency: z.string().optional(),
  category: z.string().min(1, 'Category is required').optional(),
  materials: z.array(z.string()).min(1, 'At least one material is required').optional(),
  dimensions: z.object({
    width: z.number().optional(),
    height: z.number().optional(),
    depth: z.number().optional(),
    weight: z.number().optional(),
  }).optional(),
  customizable: z.boolean().optional(),
  leadTimeDays: z.number().int().positive('Lead time must be positive').optional(),
  inventoryCount: z.number().int().min(0, 'Inventory count cannot be negative').optional(),
  emotionTags: z.array(z.string()).optional(),
  styleTags: z.array(z.string()).optional(),
  description: z.string().optional(),
  images: z.array(z.string()).min(1, 'At least one image is required').optional(),
  isAvailable: z.boolean().optional(),
});

async function getJewelerAndVerifyAccess(supabase: any, productId: string) {
  // Get the authenticated user
  const {
    data: { session },
    error: authError,
  } = await supabase.auth.getSession();

  if (authError || !session) {
    return { error: 'Unauthorized', status: 401 };
  }

  // Verify user is a jeweler
  const { data: userData, error: userError } = await supabase
    .from('users')
    .select('role')
    .eq('id', session.user.id)
    .single();

  if (userError || userData?.role !== 'jeweler') {
    return { error: 'Access denied. Jeweler role required.', status: 403 };
  }

  // Get jeweler ID
  const { data: jewelerData, error: jewelerError } = await supabase
    .from('jewelers')
    .select('id')
    .eq('user_id', session.user.id)
    .single();

  if (jewelerError || !jewelerData) {
    return { error: 'Jeweler profile not found', status: 404 };
  }

  // Verify product belongs to this jeweler
  const { data: productData, error: productError } = await supabase
    .from('products')
    .select('jeweler_id')
    .eq('id', productId)
    .single();

  if (productError) {
    return { error: 'Product not found', status: 404 };
  }

  if (productData.jeweler_id !== jewelerData.id) {
    return { error: 'Access denied. Product does not belong to you.', status: 403 };
  }

  return { jewelerId: jewelerData.id, success: true };
}

// GET - Fetch single product
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = createRouteHandlerClient({ cookies });
    const productId = params.id;

    const result = await getJewelerAndVerifyAccess(supabase, productId);
    if (!result.success) {
      return NextResponse.json(
        { error: result.error },
        { status: result.status }
      );
    }

    // Fetch the product
    const { data: product, error: productError } = await supabase
      .from('products')
      .select('*')
      .eq('id', productId)
      .single();

    if (productError) {
      console.error('Error fetching product:', productError);
      return NextResponse.json(
        { error: 'Failed to fetch product' },
        { status: 500 }
      );
    }

    return NextResponse.json(product);

  } catch (error) {
    console.error('Error in GET /api/jeweler/products/[id]:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// PUT - Update product
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = createRouteHandlerClient({ cookies });
    const productId = params.id;

    const result = await getJewelerAndVerifyAccess(supabase, productId);
    if (!result.success) {
      return NextResponse.json(
        { error: result.error },
        { status: result.status }
      );
    }

    // Parse and validate request body
    const body = await request.json();
    const validatedData = UpdateProductSchema.parse(body);

    // Check if SKU update conflicts with existing products
    if (validatedData.sku) {
      const { data: existingSku, error: skuError } = await supabase
        .from('products')
        .select('id')
        .eq('jeweler_id', result.jewelerId)
        .eq('sku', validatedData.sku)
        .neq('id', productId)
        .single();

      if (existingSku) {
        return NextResponse.json(
          { error: 'SKU already exists for your products' },
          { status: 400 }
        );
      }
    }

    // Build update object
    const updateData: any = {};
    if (validatedData.name !== undefined) updateData.name = validatedData.name;
    if (validatedData.sku !== undefined) updateData.sku = validatedData.sku;
    if (validatedData.price !== undefined) updateData.price = validatedData.price;
    if (validatedData.currency !== undefined) updateData.currency = validatedData.currency;
    if (validatedData.category !== undefined) updateData.category = validatedData.category;
    if (validatedData.materials !== undefined) updateData.materials = validatedData.materials;
    if (validatedData.dimensions !== undefined) updateData.dimensions = validatedData.dimensions;
    if (validatedData.customizable !== undefined) updateData.customizable = validatedData.customizable;
    if (validatedData.leadTimeDays !== undefined) updateData.lead_time_days = validatedData.leadTimeDays;
    if (validatedData.inventoryCount !== undefined) updateData.inventory_count = validatedData.inventoryCount;
    if (validatedData.emotionTags !== undefined) updateData.emotion_tags = validatedData.emotionTags;
    if (validatedData.styleTags !== undefined) updateData.style_tags = validatedData.styleTags;
    if (validatedData.description !== undefined) updateData.description = validatedData.description;
    if (validatedData.images !== undefined) updateData.images = validatedData.images;
    if (validatedData.isAvailable !== undefined) updateData.is_available = validatedData.isAvailable;

    // Update the product
    const { data: product, error: updateError } = await supabase
      .from('products')
      .update(updateData)
      .eq('id', productId)
      .select()
      .single();

    if (updateError) {
      console.error('Error updating product:', updateError);
      return NextResponse.json(
        { error: 'Failed to update product' },
        { status: 500 }
      );
    }

    return NextResponse.json(product);

  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation error', details: error.errors },
        { status: 400 }
      );
    }

    console.error('Error in PUT /api/jeweler/products/[id]:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// DELETE - Delete product
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = createRouteHandlerClient({ cookies });
    const productId = params.id;

    const result = await getJewelerAndVerifyAccess(supabase, productId);
    if (!result.success) {
      return NextResponse.json(
        { error: result.error },
        { status: result.status }
      );
    }

    // Check if product has active orders
    const { data: activeOrders, error: ordersError } = await supabase
      .from('orders')
      .select('id')
      .eq('product_id', productId)
      .in('status', ['pending', 'confirmed', 'in_progress'])
      .limit(1);

    if (ordersError) {
      console.error('Error checking active orders:', ordersError);
      return NextResponse.json(
        { error: 'Failed to check product dependencies' },
        { status: 500 }
      );
    }

    if (activeOrders && activeOrders.length > 0) {
      return NextResponse.json(
        { error: 'Cannot delete product with active orders' },
        { status: 400 }
      );
    }

    // Soft delete by setting is_available to false instead of hard delete
    // This preserves order history and references
    const { data: product, error: deleteError } = await supabase
      .from('products')
      .update({ is_available: false })
      .eq('id', productId)
      .select()
      .single();

    if (deleteError) {
      console.error('Error deleting product:', deleteError);
      return NextResponse.json(
        { error: 'Failed to delete product' },
        { status: 500 }
      );
    }

    return NextResponse.json({ 
      message: 'Product marked as unavailable successfully',
      product 
    });

  } catch (error) {
    console.error('Error in DELETE /api/jeweler/products/[id]:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}