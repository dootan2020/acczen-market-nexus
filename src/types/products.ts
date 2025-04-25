
export type ProductStatus = 'active' | 'inactive' | 'out_of_stock';

export interface ProductFormData {
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
}
