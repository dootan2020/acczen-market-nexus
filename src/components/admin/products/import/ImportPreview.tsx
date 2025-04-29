
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Loader2 } from 'lucide-react';
import { ExtendedProduct } from '@/pages/admin/ProductsImport';
import ProductBasicInfo from './ProductBasicInfo';
import ProductCategoryFields from './ProductCategoryFields';
import ProductDescription from './ProductDescription';
import ProductImageUpload from './ProductImageUpload';
import ProductMetaFields from './ProductMetaFields';
import ImportPreviewHeader from './ImportPreviewHeader';

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
  const [updatedProduct, setUpdatedProduct] = useState<ExtendedProduct>(product);

  const handleUpdate = (field: keyof ExtendedProduct, value: any) => {
    setUpdatedProduct((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleNext = async () => {
    setIsLoading(true);
    
    // Simulate processing delay
    await new Promise((resolve) => setTimeout(resolve, 1000));
    
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
      <ImportPreviewHeader product={updatedProduct} />
      
      <div className="grid gap-6 md:grid-cols-3">
        <div className="md:col-span-2 space-y-6">
          <ProductBasicInfo 
            product={updatedProduct}
            onUpdate={handleUpdate}
          />
          
          <ProductDescription 
            description={updatedProduct.description || ''}
            onUpdate={(value) => handleUpdate('description', value)}
          />
          
          <ProductMetaFields
            product={updatedProduct}
            onUpdate={handleUpdate}
          />
        </div>
        
        <div className="space-y-6">
          <ProductCategoryFields
            product={updatedProduct}
            categories={categories}
            onUpdate={handleUpdate}
          />
          
          <ProductImageUpload
            imageUrl={updatedProduct.image_url || ''}
            onUpdate={(value) => handleUpdate('image_url', value)}
          />
        </div>
      </div>
      
      <div className="flex justify-between pt-6">
        <Button 
          variant="outline" 
          onClick={onPrevious}
          disabled={isLoading}
        >
          Quay lại
        </Button>
        
        <Button 
          onClick={handleNext} 
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
    </div>
  );
};

export default ImportPreview;
