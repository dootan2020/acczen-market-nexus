
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Loader2 } from 'lucide-react';
import { ExtendedProduct } from '@/pages/admin/ProductsImport';
import ImportPreviewHeader from './ImportPreviewHeader';
import { Form } from '@/components/ui/form';
import { useForm } from 'react-hook-form';
import { ImportProductFormValues, importProductFormSchema } from './types';
import { zodResolver } from '@hookform/resolvers/zod';
import ProductBasicInfo from './ProductBasicInfo';
import ProductCategoryFields from './ProductCategoryFields';
import ProductDescription from './ProductDescription';
import ProductImageUpload from './ProductImageUpload';
import ProductMetaFields from './ProductMetaFields';

interface ImportPreviewProps {
  product: ExtendedProduct;
  categories: any[];
  categoriesLoading: boolean;
  onPrevious: () => void;
  onNext: (updatedProduct: ExtendedProduct) => void;
}

const ImportPreview: React.FC<ImportPreviewProps> = ({
  product,
  categories,
  categoriesLoading,
  onPrevious,
  onNext,
}) => {
  const [isLoading, setIsLoading] = useState(false);

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
    setIsLoading(true);
    
    // Simulate processing delay
    await new Promise((resolve) => setTimeout(resolve, 1000));
    
    const updatedProduct: ExtendedProduct = {
      ...product,
      ...data
    };
    
    onNext(updatedProduct);
    setIsLoading(false);
  };

  if (categoriesLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <ImportPreviewHeader product={product} />
      
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid gap-6 md:grid-cols-3">
            <div className="md:col-span-2 space-y-6">
              <ProductBasicInfo form={form} />
              <ProductDescription form={form} />
              <ProductMetaFields form={form} />
            </div>
            
            <div className="space-y-6">
              <ProductCategoryFields
                form={form}
                categories={categories}
                categoriesLoading={categoriesLoading}
              />
              <ProductImageUpload form={form} />
            </div>
          </div>
          
          <div className="flex justify-between pt-6">
            <Button 
              type="button"
              variant="outline" 
              onClick={onPrevious}
              disabled={isLoading}
            >
              Quay lại
            </Button>
            
            <Button 
              type="submit"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Đang xử lý...
                </>
              ) : (
                'Tiếp tục'
              )}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
};

export default ImportPreview;
