export interface CartItem {
  id: string;
  productId: string;
  product: {
    id: string;
    name: string;
    price: number;
    currency: string;
    images: string[];
    sku: string;
    jewelerId: string;
    jewelerName: string;
    category: string;
    customizable: boolean;
    leadTimeDays: number;
  };
  quantity: number;
  customization?: {
    size?: string;
    engraving?: string;
    metal?: string;
    gemstone?: string;
    notes?: string;
  };
  storyId?: string; // Link to user's story that inspired this purchase
  addedAt: string;
}

export interface CartSummary {
  items: CartItem[];
  subtotal: number;
  shipping: number;
  tax: number;
  total: number;
  currency: string;
  itemCount: number;
  estimatedDelivery: string;
}

export interface ShippingAddress {
  firstName: string;
  lastName: string;
  company?: string;
  address1: string;
  address2?: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  phone?: string;
}

export interface BillingAddress extends ShippingAddress {
  sameAsShipping: boolean;
}

export interface ShippingMethod {
  id: string;
  name: string;
  description: string;
  cost: number;
  estimatedDays: number;
  carrier: string;
}

export interface CheckoutState {
  step: 'cart' | 'shipping' | 'payment' | 'confirmation';
  cart: CartSummary;
  shippingAddress?: ShippingAddress;
  billingAddress?: BillingAddress;
  shippingMethod?: ShippingMethod;
  paymentMethod?: 'stripe' | 'payplus';
  customerNotes?: string;
  orderId?: string;
}

export interface CartContextType {
  cart: CartItem[];
  cartSummary: CartSummary;
  loading: boolean;
  addItem: (productId: string, quantity?: number, customization?: CartItem['customization'], storyId?: string) => Promise<void>;
  updateItem: (itemId: string, quantity: number) => void;
  removeItem: (itemId: string) => void;
  clearCart: () => void;
  calculateSummary: () => CartSummary;
}