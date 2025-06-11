import { NextRequest, NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';

interface InventoryAlert {
  id: string;
  productName: string;
  currentStock: number;
  minStock: number;
  type: 'low_stock' | 'out_of_stock';
}

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

    const jewelerId = jewelerData.id;

    // Fetch products with low or no inventory
    // We'll use a threshold of 5 items as "low stock" and 0 as "out of stock"
    const { data: productsData, error: productsError } = await supabase
      .from('products')
      .select(`
        id,
        name,
        sku,
        inventory_count
      `)
      .eq('jeweler_id', jewelerId)
      .lte('inventory_count', 10) // Products with 10 or fewer items
      .eq('is_available', true) // Only check available products
      .order('inventory_count', { ascending: true });

    if (productsError) {
      console.error('Error fetching inventory alerts:', productsError);
      return NextResponse.json(
        { error: 'Failed to fetch inventory alerts' },
        { status: 500 }
      );
    }

    // Transform the data into alerts
    const inventoryAlerts: InventoryAlert[] = (productsData || [])
      .filter(product => (product.inventory_count || 0) <= 5) // Only show items with 5 or fewer
      .map(product => {
        const currentStock = product.inventory_count || 0;
        const minStock = 5; // Configurable threshold
        
        return {
          id: product.id,
          productName: product.name || `SKU: ${product.sku}` || 'Unnamed Product',
          currentStock,
          minStock,
          type: currentStock === 0 ? 'out_of_stock' : 'low_stock',
        };
      });

    return NextResponse.json(inventoryAlerts);

  } catch (error) {
    console.error('Error fetching inventory alerts:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}