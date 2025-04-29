
import React from 'react';
import { DialogFooter, DialogClose } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { ProductFormData, ProductStatus } from '@/types/products';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';
import { Loader2 } from 'lucide-react';
import SubcategorySelector from '@/components/SubcategorySelector';

// Define the product form schema
const productFormSchema = z.object({
  name: z
    .string()
    .min(3, { message: 'Tên sản phẩm phải có ít nhất 3 ký tự' })
    .max(100, { message: 'Tên sản phẩm không được vượt quá 100 ký tự' }),
  slug: z
    .string()
    .min(3, { message: 'Slug phải có ít nhất 3 ký tự' })
    .max(100, { message: 'Slug không được vượt quá 100 ký tự' })
    .regex(/^[a-z0-9-]+$/, { message: 'Slug chỉ được chứa chữ thường, số và dấu gạch ngang' }),
  description: z
    .string()
    .min(10, { message: 'Mô tả phải có ít nhất 10 ký tự' }),
  price: z
    .string()
    .refine(val => !isNaN(parseFloat(val)) && parseFloat(val) >= 0, { 
      message: 'Giá phải là số không âm' 
    }),
  sale_price: z
    .string()
    .refine(val => val === '' || (!isNaN(parseFloat(val)) && parseFloat(val) >= 0), {
      message: 'Giá khuyến mãi phải là số không âm'
    })
    .optional(),
  stock_quantity: z
    .string()
    .refine(val => !isNaN(parseInt(val)) && parseInt(val) >= 0, {
      message: 'Số lượng phải là số nguyên không âm'
    }),
  status: z.string(),
  category_id: z.string().min(1, { message: 'Vui lòng chọn danh mục' }),
  subcategory_id: z.string().optional(),
  image_url: z.string().url({ message: 'URL hình ảnh không hợp lệ' }).optional().or(z.literal('')),
  sku: z.string().optional(),
  kiosk_token: z.string().optional(),
});

type ProductFormValues = z.infer<typeof productFormSchema>;

interface ProductFormProps {
  initialData: ProductFormData;
  handleSubmit: (formData: ProductFormData) => void;
  categories?: any[];
  isEditing: boolean;
  isPending: boolean;
}

const ProductForm: React.FC<ProductFormProps> = ({
  initialData,
  handleSubmit,
  categories,
  isEditing,
  isPending,
}) => {
  // Initialize form with existing data
  const form = useForm<ProductFormValues>({
    resolver: zodResolver(productFormSchema),
    defaultValues: {
      name: initialData.name || '',
      slug: initialData.slug || '',
      description: initialData.description || '',
      price: initialData.price?.toString() || '0',
      sale_price: initialData.sale_price?.toString() || '',
      stock_quantity: initialData.stock_quantity?.toString() || '0',
      status: initialData.status || 'draft',
      category_id: initialData.category_id || '',
      subcategory_id: initialData.subcategory_id || '',
      image_url: initialData.image_url || '',
      sku: initialData.sku || '',
      kiosk_token: initialData.kiosk_token || '',
    },
    mode: 'onChange',
  });

  const onSubmit = (values: ProductFormValues) => {
    // Convert string values to their appropriate types
    const formattedValues: ProductFormData = {
      ...values,
      name: values.name,
      description: values.description,
      slug: values.slug,
      category_id: values.category_id,
      subcategory_id: values.subcategory_id || '',
      status: values.status as ProductStatus,
      price: values.price,
      sale_price: values.sale_price || '',
      stock_quantity: values.stock_quantity,
      image_url: values.image_url || '',
      sku: values.sku || '',
    };
    
    handleSubmit(formattedValues);
  };

  // Watch category_id to reset subcategory when it changes
  const watchCategoryId = form.watch('category_id');
  
  // Reset subcategory when category changes
  React.useEffect(() => {
    form.setValue('subcategory_id', '');
  }, [watchCategoryId, form]);

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <div className="grid gap-4 py-4 max-h-[70vh] overflow-y-auto px-1">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Tên sản phẩm</FormLabel>
                <FormControl>
                  <Input {...field} placeholder="Nhập tên sản phẩm" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="slug"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Slug</FormLabel>
                <FormControl>
                  <Input 
                    {...field} 
                    placeholder="product-slug"
                    onChange={(e) => {
                      // Automatically convert to lowercase and replace spaces with hyphens
                      const value = e.target.value
                        .toLowerCase()
                        .replace(/\s+/g, '-')
                        .replace(/[^a-z0-9-]/g, '');
                      field.onChange(value);
                    }}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="description"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Mô tả sản phẩm</FormLabel>
                <FormControl>
                  <textarea 
                    className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 min-h-[120px] resize-y"
                    {...field} 
                    placeholder="Nhập mô tả sản phẩm chi tiết"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <div className="grid grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="price"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Giá</FormLabel>
                  <FormControl>
                    <Input 
                      type="text"
                      inputMode="decimal"
                      {...field} 
                      onChange={(e) => {
                        // Allow only numbers and decimal points
                        const value = e.target.value.replace(/[^\d.]/g, '');
                        field.onChange(value);
                      }}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="sale_price"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Giá khuyến mãi</FormLabel>
                  <FormControl>
                    <Input 
                      type="text"
                      inputMode="decimal" 
                      {...field} 
                      onChange={(e) => {
                        // Allow only numbers and decimal points
                        const value = e.target.value.replace(/[^\d.]/g, '');
                        field.onChange(value);
                      }}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          
          <FormField
            control={form.control}
            name="stock_quantity"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Số lượng trong kho</FormLabel>
                <FormControl>
                  <Input 
                    type="text"
                    inputMode="numeric"
                    {...field} 
                    onChange={(e) => {
                      // Allow only numbers
                      const value = e.target.value.replace(/\D/g, '');
                      field.onChange(value);
                    }}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="status"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Trạng thái</FormLabel>
                <FormControl>
                  <Select
                    value={field.value}
                    onValueChange={field.onChange}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Chọn trạng thái" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="draft">Draft</SelectItem>
                      <SelectItem value="archived">Archived</SelectItem>
                    </SelectContent>
                  </Select>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="category_id"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Danh mục</FormLabel>
                <FormControl>
                  <Select
                    value={field.value}
                    onValueChange={field.onChange}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Chọn danh mục" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories?.map(category => (
                        <SelectItem key={category.id} value={category.id}>
                          {category.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="subcategory_id"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Danh mục con</FormLabel>
                <FormControl>
                  <SubcategorySelector 
                    categoryId={form.getValues('category_id')}
                    value={field.value} 
                    onValueChange={field.onChange}
                  />
                </FormControl>
                {!form.getValues('category_id') && (
                  <p className="text-sm text-muted-foreground">Select a category first</p>
                )}
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="image_url"
            render={({ field }) => (
              <FormItem>
                <FormLabel>URL hình ảnh</FormLabel>
                <FormControl>
                  <Input {...field} placeholder="https://example.com/image.jpg" />
                </FormControl>
                <FormMessage />
                {field.value && (
                  <div className="mt-2 relative w-20 h-20">
                    <img 
                      src={field.value} 
                      alt="Product preview" 
                      className="rounded object-cover w-full h-full"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = 'https://placehold.co/400x400?text=Invalid+Image';
                      }}
                    />
                  </div>
                )}
              </FormItem>
            )}
          />
        </div>

        <DialogFooter>
          <DialogClose asChild>
            <Button type="button" variant="outline">Hủy</Button>
          </DialogClose>
          <Button 
            type="submit"
            disabled={isPending || !form.formState.isValid}
          >
            {isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Đang lưu...
              </>
            ) : (
              isEditing ? 'Cập nhật sản phẩm' : 'Thêm sản phẩm'
            )}
          </Button>
        </DialogFooter>
      </form>
    </Form>
  );
};

export default ProductForm;
