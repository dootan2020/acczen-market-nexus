
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
