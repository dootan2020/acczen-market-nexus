
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

export type ProductStatus = 'active' | 'inactive' | 'out_of_stock';

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
}
