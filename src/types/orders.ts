
import { Database } from '@/integrations/supabase/types';

// Define order status type based on the database enum
export type OrderStatus = Database['public']['Enums']['order_status'];

// Define a type for the order with profiles
export interface OrderWithProfile {
  id: string;
  user_id: string;
  status: OrderStatus;
  total_amount: number;
  created_at: string;
  updated_at: string;
  profiles?: {
    id: string;
    email: string;
    username: string;
  } | null;
}

export interface OrderItem {
  id: string;
  order_id: string;
  product_id: string;
  quantity: number;
  price: number;
  total: number;
  created_at: string;
  data: any;
  product?: {
    id: string;
    name: string;
    slug: string;
    image_url?: string;
  };
}

export interface OrderDetailsData {
  id: string;
  status: OrderStatus;
  total_amount: number;
  created_at: string;
  updated_at: string;
  user_id: string;
  items: OrderItem[];
  customer?: {
    email: string;
    username?: string;
    full_name?: string;
  };
}

// Define the OrderData interface for API responses
export interface OrderData {
  order_id: string;
  product_keys?: string[];
  success?: string;   // Added to match API response structure
  message?: string;   // Added to match API response structure
  description?: string; // Added to match API response structure
  status?: string;
}

// Add the OrderItemData interface for order item data
export interface OrderItemData {
  product_keys?: string[];
  kiosk_token?: string;
  taphoammo_order_id?: string;
  [key: string]: any;  // Allow for additional dynamic properties
}

// OrderEmailPayload interface for order confirmation emails
export interface OrderEmailPayload {
  order_id: string;
  date: string;
  total: number;
  payment_method?: string;
  transaction_id?: string;
  items: OrderEmailItem[];
  digital_items?: DigitalEmailItem[];
  customer_name?: string;
}

// OrderEmailItem interface for items in order confirmation emails
export interface OrderEmailItem {
  name: string;
  quantity: number;
  price: number;
  total: number;
}

// DigitalEmailItem interface for digital products in emails
export interface DigitalEmailItem {
  name: string;
  keys?: string[];
}

// Define the OrderRow interface for database order data
export interface OrderRow {
  id: string;
  total_amount: number;
  status: string;
  created_at: string;
  order_items: OrderItemRow[];
}

// Define the OrderItemRow interface for order item data from the database
export interface OrderItemRow {
  id: string;
  quantity: number;
  price: number;
  total: number;
  data: any;
  product?: {
    id: string;
    name: string;
  };
}

// Type guard for order data
export function isOrderRow(data: any): data is OrderRow {
  return data && 
         typeof data === 'object' && 
         'id' in data && 
         'total_amount' in data && 
         'status' in data && 
         'created_at' in data && 
         Array.isArray(data.order_items);
}
