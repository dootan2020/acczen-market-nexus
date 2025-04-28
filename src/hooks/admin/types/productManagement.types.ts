
import { ProductFormData, ProductStatus } from '@/types/products';

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  sale_price?: number;
  stock_quantity: number;
  image_url?: string;
  slug: string;
  category_id: string;
  subcategory_id?: string;
  status: ProductStatus;
  sku: string;
  category?: any;
  subcategory?: any;
}
