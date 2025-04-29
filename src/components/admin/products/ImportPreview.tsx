
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
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { ExtendedProduct } from '@/pages/admin/ProductsImport';
import { Loader2 } from 'lucide-react';
import ImportPreviewHeader from './import/ImportPreviewHeader';
import { ImportProductFormValues, importProductFormSchema } from './import/types';

// Let's import our components
import ProductBasicInfo from './import/ProductBasicInfo';
import ProductDescription from './import/ProductDescription';
import ProductMetaFields from './import/ProductMetaFields';
import ProductCategoryFields from './import/ProductCategoryFields';
import ProductImageUpload from './import/ProductImageUpload';

interface ImportPreviewProps {
  product: ExtendedProduct;
  categories: any[];
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
  const [uploading, setUploading] = useState(false);

  const form = useForm<ImportProductFormValues>({
    resolver: zodResolver(importProductFormSchema),
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
  
  const onSubmit = async (data: ImportProductFormValues) => {
    const processedProduct = {
      ...product,
      ...data
    };
    onNext(processedProduct);
  };

  return (
    <div>
      <h2 className="text-xl font-semibold mb-4">Xem trước và chỉnh sửa thông tin sản phẩm</h2>
      <ImportPreviewHeader product={product} />
      
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <ProductBasicInfo form={form} />
            <ProductCategoryFields 
              form={form} 
              categories={categories} 
              categoriesLoading={categoriesLoading}
            />
            <ProductMetaFields form={form} />
            <ProductImageUpload form={form} />
            <ProductDescription form={form} />
          </div>
          
          <div className="flex justify-between">
            <Button type="button" variant="outline" onClick={onPrevious}>
              Quay lại
            </Button>
            <Button type="submit" disabled={uploading}>
              {uploading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Đang xử lý...
                </>
              ) : 'Tiếp tục'}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}
