import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { ExtendedProduct } from '@/pages/admin/ProductsImport';
import { Tables } from '@/types/supabase';
import { useSubcategories } from '@/hooks/useSubcategories';
import { Label } from '@/components/ui/label';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

const formSchema = z.object({
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

type FormValues = z.infer<typeof formSchema>;

interface ImportPreviewProps {
  product: ExtendedProduct;
  categories: Tables<'categories'>[];
  categoriesLoading: boolean;
  onPrevious: () => void;
  onNext: (product: ExtendedProduct) => void;
}

export default function ImportPreview({
  product,
  categories,
  categoriesLoading,
  onPrevious,
  onNext
}: ImportPreviewProps) {
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: product.name,
      description: product.description || '',
      category_id: product.category_id || '',
      subcategory_id: product.subcategory_id || '',
      price: product.price,
      selling_price: product.selling_price || product.price,
      stock_quantity: product.stock_quantity,
      status: product.status || 'active',
      image_url: product.image_url || '',
      sku: product.sku,
      slug: product.slug,
      kiosk_token: product.kiosk_token
    }
  });

  const selectedCategoryId = form.watch('category_id');
  const { data: subcategories, isLoading: subcategoriesLoading } = useSubcategories(selectedCategoryId);

  const handleImageUpload = async (file: File) => {
    if (!file) return null;
    
    setUploading(true);
    try {
      const fileExt = file.name.split('.').pop();
      const filePath = `${Math.random().toString(36).slice(2)}.${fileExt}`;
      
      const { error: uploadError } = await supabase.storage
        .from('products')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('products')
        .getPublicUrl(filePath);

      form.setValue('image_url', publicUrl);
      toast({
        title: "Upload thành công",
        description: "Hình ảnh đã được tải lên thành công",
      });
      
      return publicUrl;
    } catch (error) {
      console.error('Error uploading image:', error);
      toast({
        variant: "destructive",
        title: "Lỗi upload",
        description: "Không thể tải lên hình ảnh. Vui lòng thử lại.",
      });
      return null;
    } finally {
      setUploading(false);
    }
  };
  
  const onSubmit = async (data: FormValues) => {
    const processedProduct = {
      ...product,
      ...data
    };
    onNext(processedProduct);
  };

  return (
    <div>
      <h2 className="text-xl font-semibold mb-4">Xem trước và chỉnh sửa thông tin sản phẩm</h2>
      <div className="bg-muted/50 p-4 rounded-md mb-6">
        <h3 className="font-medium mb-2">Thông tin từ TaphoaMMO API:</h3>
        <div className="grid grid-cols-3 gap-4">
          <div>
            <span className="text-sm text-muted-foreground">Tên sản phẩm:</span>
            <p className="font-medium">{product.name}</p>
          </div>
          <div>
            <span className="text-sm text-muted-foreground">Giá gốc:</span>
            <p className="font-medium">{product.price.toLocaleString('vi-VN')} VND</p>
          </div>
          <div>
            <span className="text-sm text-muted-foreground">Tồn kho:</span>
            <p className="font-medium">{product.stock_quantity} sản phẩm</p>
          </div>
          <div className="col-span-3">
            <span className="text-sm text-muted-foreground">Kiosk Token:</span>
            <p className="font-medium">{product.kiosk_token}</p>
          </div>
        </div>
      </div>
      
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tên sản phẩm</FormLabel>
                  <FormControl>
                    <Input {...field} />
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
                  <Select onValueChange={(value) => {
                    field.onChange(value);
                    form.setValue('subcategory_id', '');
                  }} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Chọn danh mục" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {categoriesLoading ? (
                        <div className="p-2">
                          <Skeleton className="h-5 w-full mb-2" />
                          <Skeleton className="h-5 w-full mb-2" />
                          <Skeleton className="h-5 w-full" />
                        </div>
                      ) : (
                        categories.map((category) => (
                          <SelectItem key={category.id} value={category.id}>
                            {category.name}
                          </SelectItem>
                        ))
                      )}
                    </SelectContent>
                  </Select>
                  <FormDescription>
                    Chọn danh mục cho sản phẩm
                  </FormDescription>
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
                  <Select 
                    onValueChange={field.onChange} 
                    value={field.value}
                    disabled={!selectedCategoryId || subcategoriesLoading}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Chọn danh mục con" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {subcategoriesLoading ? (
                        <div className="p-2">
                          <Skeleton className="h-5 w-full mb-2" />
                          <Skeleton className="h-5 w-full mb-2" />
                          <Skeleton className="h-5 w-full" />
                        </div>
                      ) : (
                        subcategories?.map((subcategory) => (
                          <SelectItem key={subcategory.id} value={subcategory.id}>
                            {subcategory.name}
                          </SelectItem>
                        ))
                      )}
                    </SelectContent>
                  </Select>
                  <FormDescription>
                    Chọn danh mục con cho sản phẩm
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="price"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Giá gốc (VND)</FormLabel>
                  <FormControl>
                    <Input type="number" {...field} />
                  </FormControl>
                  <FormDescription>
                    Giá gốc từ nhà cung cấp
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="selling_price"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Giá bán (VND)</FormLabel>
                  <FormControl>
                    <Input type="number" {...field} />
                  </FormControl>
                  <FormDescription>
                    Giá bán trên hệ thống của bạn
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="stock_quantity"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Số lượng tồn kho</FormLabel>
                  <FormControl>
                    <Input type="number" {...field} />
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
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Chọn trạng thái" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="active">Đang bán</SelectItem>
                      <SelectItem value="inactive">Chưa bán</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="sku"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>SKU</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormDescription>
                    Mã SKU được tạo tự động
                  </FormDescription>
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
                    <Input {...field} />
                  </FormControl>
                  <FormDescription>
                    Đường dẫn URL của sản phẩm
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="image_url"
              render={({ field }) => (
                <FormItem className="col-span-2">
                  <FormLabel>Hình ảnh sản phẩm</FormLabel>
                  <div className="space-y-4">
                    <FormControl>
                      <Input {...field} type="url" placeholder="Nhập URL hình ảnh" />
                    </FormControl>
                    <div className="flex flex-col space-y-2">
                      <Label>Hoặc tải lên hình ảnh</Label>
                      <Input
                        type="file"
                        accept="image/*"
                        onChange={async (e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            setImageFile(file);
                            const url = await handleImageUpload(file);
                            if (url) {
                              field.onChange(url);
                            }
                          }
                        }}
                        disabled={uploading}
                      />
                    </div>
                    {imageFile && field.value && (
                      <div className="mt-2">
                        <img 
                          src={field.value} 
                          alt="Preview" 
                          className="max-w-[200px] h-auto rounded-md"
                        />
                      </div>
                    )}
                  </div>
                  <FormDescription>
                    Nhập URL hoặc tải lên hình ảnh sản phẩm
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem className="col-span-2">
                  <FormLabel>Mô tả</FormLabel>
                  <FormControl>
                    <Textarea 
                      rows={5}
                      placeholder="Mô tả sản phẩm..."
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          
          <div className="flex justify-between">
            <Button type="button" variant="outline" onClick={onPrevious}>
              Quay lại
            </Button>
            <Button type="submit" disabled={uploading}>
              {uploading ? 'Đang tải lên...' : 'Tiếp tục'}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}
