-- Order Items Table Migration
-- Creates the order_items table to store individual items within orders

-- Create order_items table
CREATE TABLE IF NOT EXISTS order_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
    product_id UUID NOT NULL REFERENCES products(id),
    quantity INTEGER NOT NULL CHECK (quantity > 0),
    unit_price DECIMAL(10,2) NOT NULL,
    total_price DECIMAL(10,2) NOT NULL,
    customization JSONB, -- Store any product customizations
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_order_items_order_id ON order_items(order_id);
CREATE INDEX IF NOT EXISTS idx_order_items_product_id ON order_items(product_id);

-- Add updated_at trigger
CREATE TRIGGER set_updated_at_order_items
    BEFORE UPDATE ON order_items
    FOR EACH ROW EXECUTE FUNCTION handle_updated_at();

-- Add RLS policy
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;

-- Users can only see their own order items
CREATE POLICY "Users can view their own order items" ON order_items
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM orders 
            WHERE orders.id = order_items.order_id 
            AND orders.user_id = auth.uid()
        )
    );

-- Jewelers can see order items for their products
CREATE POLICY "Jewelers can view order items for their products" ON order_items
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM products 
            JOIN jewelers ON products.jeweler_id = jewelers.id
            WHERE products.id = order_items.product_id 
            AND jewelers.user_id = auth.uid()
        )
    );

-- Only authenticated users can insert order items (through orders)
CREATE POLICY "Authenticated users can create order items" ON order_items
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- Add table comment
COMMENT ON TABLE order_items IS 'Individual items within orders with quantities and customizations';