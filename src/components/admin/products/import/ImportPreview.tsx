
import React from 'react';
import { Button } from '@/components/ui/button';
import { Form } from "@/components/ui/form";
import { ExtendedProduct } from '@/pages/admin/ProductsImport';
import { Tables } from '@/types/supabase';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { importProductFormSchema, ImportProductFormValues } from './types';
import ImportPreviewHeader from './ImportPreviewHeader';
import ProductBasicInfo from './ProductBasicInfo';
import ProductCategoryFields from './ProductCategoryFields';
import ProductMetaFields from './ProductMetaFields';
import ProductImageUpload from './ProductImageUpload';
import ProductDescription from './ProductDescription';

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
            <Button type="submit">
              Tiếp tục
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}
