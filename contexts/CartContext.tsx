'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { CartItem, CartSummary, CartContextType } from '@/lib/types/cart';
import { useAuth } from '@/lib/hooks/useAuth';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();
  const supabase = createClientComponentClient();

  // Load cart from localStorage on mount
  useEffect(() => {
    const savedCart = localStorage.getItem('gemsai_cart');
    if (savedCart) {
      try {
        const parsedCart = JSON.parse(savedCart);
        setCart(parsedCart);
      } catch (error) {
        console.error('Error parsing saved cart:', error);
        localStorage.removeItem('gemsai_cart');
      }
    }
  }, []);

  // Save cart to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('gemsai_cart', JSON.stringify(cart));
  }, [cart]);

  const addItem = async (
    productId: string, 
    quantity: number = 1, 
    customization?: CartItem['customization'],
    storyId?: string
  ) => {
    setLoading(true);
    try {
      // Fetch product details from database
      const { data: product, error } = await supabase
        .from('products')
        .select(`
          id,
          name,
          price,
          currency,
          images,
          sku,
          category,
          customizable,
          lead_time_days,
          jewelers (
            id,
            business_name,
            users (
              name
            )
          )
        `)
        .eq('id', productId)
        .eq('is_available', true)
        .single();

      if (error || !product) {
        throw new Error('Product not found or unavailable');
      }

      const newItem: CartItem = {
        id: `${productId}_${Date.now()}`,
        productId,
        product: {
          id: product.id,
          name: product.name,
          price: product.price,
          currency: product.currency,
          images: product.images,
          sku: product.sku,
          jewelerId: product.jewelers.id,
          jewelerName: product.jewelers.business_name || product.jewelers.users?.name || 'Unknown Jeweler',
          category: product.category,
          customizable: product.customizable,
          leadTimeDays: product.lead_time_days,
        },
        quantity,
        customization,
        storyId,
        addedAt: new Date().toISOString(),
      };

      setCart(prevCart => {
        // Check if item already exists (same product + customization)
        const existingItemIndex = prevCart.findIndex(item => 
          item.productId === productId && 
          JSON.stringify(item.customization) === JSON.stringify(customization)
        );

        if (existingItemIndex >= 0) {
          // Update quantity of existing item
          const updatedCart = [...prevCart];
          updatedCart[existingItemIndex].quantity += quantity;
          return updatedCart;
        } else {
          // Add new item
          return [...prevCart, newItem];
        }
      });
    } catch (error) {
      console.error('Error adding item to cart:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const updateItem = (itemId: string, quantity: number) => {
    if (quantity <= 0) {
      removeItem(itemId);
      return;
    }

    setCart(prevCart =>
      prevCart.map(item =>
        item.id === itemId ? { ...item, quantity } : item
      )
    );
  };

  const removeItem = (itemId: string) => {
    setCart(prevCart => prevCart.filter(item => item.id !== itemId));
  };

  const clearCart = () => {
    setCart([]);
    localStorage.removeItem('gemsai_cart');
  };

  const calculateSummary = (): CartSummary => {
    const subtotal = cart.reduce((sum, item) => 
      sum + (item.product.price * item.quantity), 0
    );
    
    // Basic shipping calculation - can be enhanced with real shipping API
    const shipping = subtotal > 500 ? 0 : 50; // Free shipping over 500 ILS
    
    // Basic tax calculation - should use real tax service
    const tax = subtotal * 0.17; // 17% VAT in Israel
    
    const total = subtotal + shipping + tax;
    
    // Estimate delivery based on longest lead time
    const maxLeadTime = Math.max(...cart.map(item => item.product.leadTimeDays), 7);
    const estimatedDelivery = new Date(Date.now() + maxLeadTime * 24 * 60 * 60 * 1000)
      .toLocaleDateString('he-IL');

    return {
      items: cart,
      subtotal,
      shipping,
      tax,
      total,
      currency: cart[0]?.product.currency || 'ILS',
      itemCount: cart.reduce((sum, item) => sum + item.quantity, 0),
      estimatedDelivery,
    };
  };

  const cartSummary = calculateSummary();

  const value: CartContextType = {
    cart,
    cartSummary,
    loading,
    addItem,
    updateItem,
    removeItem,
    clearCart,
    calculateSummary,
  };

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}