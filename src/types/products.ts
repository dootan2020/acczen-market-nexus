
// Add this if it doesn't exist yet or update the existing interface
export interface TaphoammoProduct {
  kiosk_token: string; 
  name?: string;
  stock_quantity: number;
  price: number;
  cached?: boolean;
  cacheId?: string;
  emergency?: boolean;
}

export type ProductStatus = 'active' | 'inactive' | 'out_of_stock' | 'draft' | 'archived';

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  sale_price?: number | string | null;
  stock_quantity: number;
  image_url?: string;
  slug: string;
  category_id?: string;
  subcategory_id?: string;
  status: ProductStatus;
  sku?: string;
  kiosk_token?: string;
  category?: {
    id: string;
    name: string;
    slug: string;
  };
  subcategory?: {
    id: string;
    name: string;
    slug: string;
  };
  metadata?: Record<string, any>;
  specifications?: string | null;
  usage_instructions?: string | null;
  technical_details?: string | null;
  warranty_info?: string | null;
  sold_count?: number;
  is_visible?: boolean;
}

export interface ProductFormData {
  id?: string;
  name: string;
  description: string;
  price: string;
  sale_price: string;
  stock_quantity: string;
  image_url: string;
  slug: string;
  category_id: string;
  subcategory_id: string;
  status: ProductStatus;
  sku: string;
  kiosk_token?: string;
  is_visible?: boolean;
}
