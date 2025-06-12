import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { CartItem, ShippingAddress, BillingAddress, ShippingMethod } from '@/lib/types/cart';

export interface CreateOrderRequest {
  userId: string;
  items: CartItem[];
  shippingAddress: ShippingAddress;
  billingAddress: BillingAddress;
  shippingMethod: ShippingMethod;
  paymentMethod: 'stripe' | 'payplus';
  customerNotes?: string;
  subtotal: number;
  shipping: number;
  tax: number;
  total: number;
  currency: string;
}

export interface Order {
  id: string;
  orderNumber: string;
  userId: string;
  status: 'pending' | 'confirmed' | 'in_progress' | 'completed' | 'shipped' | 'delivered' | 'cancelled';
  paymentStatus: 'pending' | 'processing' | 'completed' | 'failed' | 'refunded';
  totalAmount: number;
  currency: string;
  shippingAddress: ShippingAddress;
  billingAddress: BillingAddress;
  items: OrderItem[];
  createdAt: string;
  updatedAt: string;
}

export interface OrderItem {
  id: string;
  productId: string;
  productName: string;
  productSku: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  customization?: any;
}

class OrderService {
  private supabase = createClientComponentClient();

  /**
   * Create a new order
   */
  async createOrder(request: CreateOrderRequest): Promise<{ success: boolean; orderId?: string; orderNumber?: string; error?: string }> {
    try {
      // Generate order number
      const orderNumber = this.generateOrderNumber();

      // Create order record
      const { data: orderData, error: orderError } = await this.supabase
        .from('orders')
        .insert({
          order_number: orderNumber,
          user_id: request.userId,
          status: 'pending',
          payment_status: 'pending',
          total_amount: request.total,
          currency: request.currency,
          shipping_address: request.shippingAddress,
          billing_address: request.billingAddress,
          notes: request.customerNotes,
        })
        .select()
        .single();

      if (orderError) {
        console.error('Failed to create order:', orderError);
        return { success: false, error: 'Failed to create order' };
      }

      // Create order items
      const orderItems = request.items.map(item => ({
        order_id: orderData.id,
        product_id: item.productId,
        quantity: item.quantity,
        unit_price: item.product.price,
        total_price: item.product.price * item.quantity,
        customization: item.customization,
      }));

      const { error: itemsError } = await this.supabase
        .from('order_items')
        .insert(orderItems);

      if (itemsError) {
        console.error('Failed to create order items:', itemsError);
        // Rollback order creation
        await this.supabase.from('orders').delete().eq('id', orderData.id);
        return { success: false, error: 'Failed to create order items' };
      }

      // Update inventory counts
      await this.updateInventory(request.items);

      // Send order confirmation email
      await this.sendOrderConfirmationEmail(orderData.id);

      return {
        success: true,
        orderId: orderData.id,
        orderNumber: orderNumber,
      };

    } catch (error) {
      console.error('Order creation failed:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * Update order status
   */
  async updateOrderStatus(orderId: string, status: Order['status']): Promise<{ success: boolean; error?: string }> {
    try {
      const { error } = await this.supabase
        .from('orders')
        .update({
          status,
          updated_at: new Date().toISOString(),
        })
        .eq('id', orderId);

      if (error) {
        console.error('Failed to update order status:', error);
        return { success: false, error: 'Failed to update order status' };
      }

      // Send status update notification
      await this.sendOrderStatusNotification(orderId, status);

      return { success: true };

    } catch (error) {
      console.error('Order status update failed:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * Update payment status
   */
  async updatePaymentStatus(orderNumber: string, paymentStatus: Order['paymentStatus'], paymentId?: string): Promise<{ success: boolean; error?: string }> {
    try {
      const updateData: any = {
        payment_status: paymentStatus,
        updated_at: new Date().toISOString(),
      };

      if (paymentId) {
        updateData.payment_id = paymentId;
      }

      const { error } = await this.supabase
        .from('orders')
        .update(updateData)
        .eq('order_number', orderNumber);

      if (error) {
        console.error('Failed to update payment status:', error);
        return { success: false, error: 'Failed to update payment status' };
      }

      // If payment completed, update order status to confirmed
      if (paymentStatus === 'completed') {
        await this.updateOrderStatusByNumber(orderNumber, 'confirmed');
      }

      return { success: true };

    } catch (error) {
      console.error('Payment status update failed:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * Get order by ID
   */
  async getOrder(orderId: string): Promise<Order | null> {
    try {
      const { data, error } = await this.supabase
        .from('orders')
        .select(`
          *,
          order_items (
            id,
            product_id,
            quantity,
            unit_price,
            total_price,
            customization,
            products (
              name,
              sku
            )
          )
        `)
        .eq('id', orderId)
        .single();

      if (error || !data) {
        return null;
      }

      return this.mapDatabaseOrderToOrder(data);

    } catch (error) {
      console.error('Failed to get order:', error);
      return null;
    }
  }

  /**
   * Get orders by user ID
   */
  async getUserOrders(userId: string, limit: number = 10): Promise<Order[]> {
    try {
      const { data, error } = await this.supabase
        .from('orders')
        .select(`
          *,
          order_items (
            id,
            product_id,
            quantity,
            unit_price,
            total_price,
            customization,
            products (
              name,
              sku
            )
          )
        `)
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) {
        console.error('Failed to get user orders:', error);
        return [];
      }

      return (data || []).map(order => this.mapDatabaseOrderToOrder(order));

    } catch (error) {
      console.error('Failed to get user orders:', error);
      return [];
    }
  }

  /**
   * Generate order number
   */
  private generateOrderNumber(): string {
    const now = new Date();
    const dateStr = now.toISOString().slice(0, 10).replace(/-/g, '');
    const timeStr = now.getTime().toString().slice(-4);
    return `GEM-${dateStr}-${timeStr}`;
  }

  /**
   * Update inventory counts
   */
  private async updateInventory(items: CartItem[]): Promise<void> {
    try {
      for (const item of items) {
        await this.supabase
          .from('products')
          .update({
            inventory_count: this.supabase.raw('inventory_count - ?', [item.quantity])
          })
          .eq('id', item.productId);
      }
    } catch (error) {
      console.error('Failed to update inventory:', error);
      // Don't throw error as this is not critical for order creation
    }
  }

  /**
   * Update order status by order number
   */
  private async updateOrderStatusByNumber(orderNumber: string, status: Order['status']): Promise<void> {
    try {
      await this.supabase
        .from('orders')
        .update({
          status,
          updated_at: new Date().toISOString(),
        })
        .eq('order_number', orderNumber);
    } catch (error) {
      console.error('Failed to update order status by number:', error);
    }
  }

  /**
   * Send order confirmation email
   */
  private async sendOrderConfirmationEmail(orderId: string): Promise<void> {
    try {
      // TODO: Implement email notification service
      // This would typically use a service like SendGrid, Mailgun, or AWS SES
      console.log(`Order confirmation email should be sent for order ${orderId}`);
    } catch (error) {
      console.error('Failed to send order confirmation email:', error);
    }
  }

  /**
   * Send order status notification
   */
  private async sendOrderStatusNotification(orderId: string, status: Order['status']): Promise<void> {
    try {
      // TODO: Implement status notification service
      console.log(`Order status notification should be sent for order ${orderId}: ${status}`);
    } catch (error) {
      console.error('Failed to send order status notification:', error);
    }
  }

  /**
   * Map database order to Order interface
   */
  private mapDatabaseOrderToOrder(data: any): Order {
    return {
      id: data.id,
      orderNumber: data.order_number,
      userId: data.user_id,
      status: data.status,
      paymentStatus: data.payment_status,
      totalAmount: data.total_amount,
      currency: data.currency,
      shippingAddress: data.shipping_address,
      billingAddress: data.billing_address,
      items: (data.order_items || []).map((item: any) => ({
        id: item.id,
        productId: item.product_id,
        productName: item.products?.name || 'Unknown Product',
        productSku: item.products?.sku || 'N/A',
        quantity: item.quantity,
        unitPrice: item.unit_price,
        totalPrice: item.total_price,
        customization: item.customization,
      })),
      createdAt: data.created_at,
      updatedAt: data.updated_at,
    };
  }
}

export const orderService = new OrderService();