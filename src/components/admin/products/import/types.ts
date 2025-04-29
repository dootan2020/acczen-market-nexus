
import { z } from 'zod';

export const importProductFormSchema = z.object({
  name: z.string().min(1, { message: 'Tên sản phẩm không được để trống' }),
  description: z.string().optional(),
  category_id: z.string().optional(),
  subcategory_id: z.string().optional(),
  price: z.coerce.number().nonnegative({ message: 'Giá gốc phải là số dương' }),
  selling_price: z.coerce.number().nonnegative({ message: 'Giá bán phải là số dương' }),
  stock_quantity: z.coerce.number().int().nonnegative({ message: 'Số lượng phải là số nguyên dương' }),
  status: z.enum(['active', 'inactive']),
  image_url: z.string().url({ message: 'URL hình ảnh không hợp lệ' }).optional().or(z.literal('')),
  sku: z.string().min(1, { message: 'SKU không được để trống' }),
  slug: z.string().min(1, { message: 'Slug không được để trống' }),
  kiosk_token: z.string(),
});

export type ImportProductFormValues = z.infer<typeof importProductFormSchema>;
