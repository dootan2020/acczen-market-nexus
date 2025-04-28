import React, { useState } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import ProductImportForm from '@/components/admin/products/ProductImportForm';
import ImportPreview from '@/components/admin/products/ImportPreview';
import ImportConfirmation from '@/components/admin/products/ImportConfirmation';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useTaphoammoAPI } from '@/hooks/useTaphoammoAPI';
import { useCategories } from '@/hooks/useCategories';
import { toast } from 'sonner';

// Product type from the TaphoaMMO API
export interface TaphoammoProduct {
  kiosk_token: string;
  name: string;
  stock_quantity: number;
  price: number;
}

// Extended product type with additional fields for our database
export interface ExtendedProduct extends TaphoammoProduct {
  category_id?: string;
  subcategory_id?: string;
  description?: string;
  selling_price?: number;
  status: 'active' | 'inactive';
  image_url?: string;
  sku: string;
  slug: string;
}

// Generate a random SKU
const generateSKU = () => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let result = 'PROD-';
  for (let i = 0; i < 8; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
};

// Generate a slug from product name
const generateSlug = (name: string) => {
  return name
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-')
    .trim();
};

const ProductsImport = () => {
  const [step, setStep] = useState<'connect' | 'preview' | 'confirm'>('connect');
  const [product, setProduct] = useState<ExtendedProduct | null>(null);
  const { getStock, testConnection, loading, error } = useTaphoammoAPI();
  const { categories, loading: categoriesLoading } = useCategories();

  const handleFetchProduct = async (kioskToken: string, proxyType: 'direct' | 'corsproxy.io' | 'admin') => {
    try {
      const productData = await getStock(kioskToken, { proxyType });
      
      // Create extended product with additional fields
      const extendedProduct: ExtendedProduct = {
        ...productData,
        selling_price: productData.price,
        status: 'active',
        sku: generateSKU(),
        slug: generateSlug(productData.name)
      };
      
      setProduct(extendedProduct);
      setStep('preview');
      toast.success("Đã lấy thông tin sản phẩm thành công!");
    } catch (err) {
      toast.error(`Lỗi: ${err instanceof Error ? err.message : 'Không thể kết nối tới API'}`);
    }
  };

  const handleUpdateProduct = (updatedProduct: ExtendedProduct) => {
    setProduct(updatedProduct);
    setStep('confirm');
  };

  const handleResetForm = () => {
    setProduct(null);
    setStep('connect');
  };

  // Map active tab to the current step
  const activeTab = {
    'connect': 'step1',
    'preview': 'step2',
    'confirm': 'step3'
  }[step];

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-6">Import Sản Phẩm từ TaphoaMMO</h1>
      
      <Tabs value={activeTab} className="w-full mb-8" onValueChange={(value) => {
        // Only allow changing tabs to previous steps
        if ((value === 'step1' && ['connect', 'preview', 'confirm'].includes(step)) || 
           (value === 'step2' && ['preview', 'confirm'].includes(step)) || 
           (value === 'step3' && step === 'confirm')) {
          setStep(value === 'step1' ? 'connect' : value === 'step2' ? 'preview' : 'confirm');
        }
      }}>
        <TabsList className="grid w-full grid-cols-3 mb-8">
          <TabsTrigger value="step1" disabled={!['connect', 'preview', 'confirm'].includes(step)}>
            1. Kết nối API
          </TabsTrigger>
          <TabsTrigger value="step2" disabled={!['preview', 'confirm'].includes(step)}>
            2. Xem trước và chỉnh sửa
          </TabsTrigger>
          <TabsTrigger value="step3" disabled={step !== 'confirm'}>
            3. Xác nhận và import
          </TabsTrigger>
        </TabsList>

        <TabsContent value="step1">
          <Card>
            <CardContent className="pt-6">
              <ProductImportForm 
                onFetchProduct={handleFetchProduct}
                isLoading={loading}
                error={error}
                onTestConnection={testConnection}
              />
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="step2">
          {product && (
            <Card>
              <CardContent className="pt-6">
                <ImportPreview 
                  product={product} 
                  onPrevious={() => setStep('connect')}
                  onNext={handleUpdateProduct}
                  categories={categories || []}
                  categoriesLoading={categoriesLoading}
                />
              </CardContent>
            </Card>
          )}
        </TabsContent>
        
        <TabsContent value="step3">
          {product && (
            <Card>
              <CardContent className="pt-6">
                <ImportConfirmation 
                  product={product} 
                  onPrevious={() => setStep('preview')}
                  onComplete={handleResetForm}
                />
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ProductsImport;
