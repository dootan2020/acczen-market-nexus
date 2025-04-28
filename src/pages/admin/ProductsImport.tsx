
import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Loader2, AlertTriangle } from 'lucide-react';
import ImportConfirmation from '@/components/admin/products/ImportConfirmation';
import ImportPreview from '@/components/admin/products/ImportPreview';

// Define and export the ExtendedProduct interface
export interface ExtendedProduct {
  id?: string;
  name: string;
  description?: string;
  price: number;
  selling_price?: number;
  stock_quantity: number;
  image_url?: string;
  slug: string;
  category_id?: string;
  subcategory_id?: string;
  status?: 'active' | 'inactive';
  sku: string;
  kiosk_token: string;
  api_order_id?: string;
}

const ProductsImport = () => {
  const [importStep, setImportStep] = useState<'verify' | 'preview' | 'confirm'>('verify');
  const [productToken, setProductToken] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentProduct, setCurrentProduct] = useState<ExtendedProduct | null>(null);

  // Fetch categories for the product form
  const { data: categories, isLoading: categoriesLoading } = useQuery({
    queryKey: ['categories'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .order('name');
      
      if (error) throw error;
      return data || [];
    }
  });

  const handleVerifyToken = async () => {
    if (!productToken.trim()) {
      setError('Vui lòng nhập mã token sản phẩm');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      // Fetch product data from API using the token
      // This is a mock implementation - in a real app, you'd call your actual API
      const { data, error } = await supabase.functions.invoke('taphoammo-api', {
        body: { 
          action: 'get_product',
          kiosk_token: productToken 
        }
      });

      if (error) throw new Error(error.message);
      
      if (!data || !data.product) {
        throw new Error('Không tìm thấy sản phẩm với mã token này');
      }
      
      // Create the ExtendedProduct object
      const product: ExtendedProduct = {
        name: data.product.name || 'Sản phẩm không tên',
        description: data.product.description || '',
        price: data.product.price || 0,
        stock_quantity: data.product.stock_quantity || 0,
        slug: data.product.slug || productToken.toLowerCase().replace(/\s+/g, '-'),
        sku: data.product.sku || `P-${Math.random().toString(36).substring(2, 10).toUpperCase()}`,
        kiosk_token: productToken,
        status: 'active'
      };
      
      setCurrentProduct(product);
      setImportStep('preview');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Có lỗi xảy ra khi kiểm tra sản phẩm');
      console.error('Token verification error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handlePrevious = () => {
    if (importStep === 'preview') {
      setImportStep('verify');
    } else if (importStep === 'confirm') {
      setImportStep('preview');
    }
  };

  const handleNext = (updatedProduct: ExtendedProduct) => {
    setCurrentProduct(updatedProduct);
    setImportStep('confirm');
  };

  const handleComplete = () => {
    setImportStep('verify');
    setProductToken('');
    setCurrentProduct(null);
  };

  return (
    <div className="container py-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Import sản phẩm</h1>
      </div>

      <Card>
        <CardContent className="p-6">
          <Tabs value={importStep} className="w-full">
            <TabsList className="grid grid-cols-3 mb-6">
              <TabsTrigger 
                value="verify" 
                disabled={importStep !== 'verify'}
                className={importStep === 'verify' ? 'bg-primary text-primary-foreground' : ''}
              >
                Xác minh token
              </TabsTrigger>
              <TabsTrigger 
                value="preview" 
                disabled={importStep !== 'preview'}
                className={importStep === 'preview' ? 'bg-primary text-primary-foreground' : ''}
              >
                Xem trước sản phẩm
              </TabsTrigger>
              <TabsTrigger 
                value="confirm" 
                disabled={importStep !== 'confirm'}
                className={importStep === 'confirm' ? 'bg-primary text-primary-foreground' : ''}
              >
                Hoàn tất import
              </TabsTrigger>
            </TabsList>

            <TabsContent value="verify" className="mt-0">
              <div className="space-y-4">
                <div>
                  <h2 className="text-xl font-semibold mb-4">Nhập mã token sản phẩm</h2>
                  <p className="text-muted-foreground mb-4">
                    Nhập mã token sản phẩm từ TaphoaMMO để bắt đầu import sản phẩm vào hệ thống.
                  </p>

                  <div className="flex gap-2 max-w-md">
                    <Input
                      placeholder="Nhập token sản phẩm..."
                      value={productToken}
                      onChange={(e) => setProductToken(e.target.value)}
                      disabled={isLoading}
                      className="flex-1"
                    />
                    <Button onClick={handleVerifyToken} disabled={isLoading}>
                      {isLoading ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Đang xác minh...
                        </>
                      ) : 'Xác minh'}
                    </Button>
                  </div>

                  {error && (
                    <Alert variant="destructive" className="mt-4">
                      <AlertTriangle className="h-4 w-4" />
                      <AlertDescription>{error}</AlertDescription>
                    </Alert>
                  )}
                </div>
              </div>
            </TabsContent>

            <TabsContent value="preview" className="mt-0">
              {currentProduct && (
                <ImportPreview
                  product={currentProduct}
                  categories={categories || []}
                  categoriesLoading={categoriesLoading}
                  onPrevious={handlePrevious}
                  onNext={handleNext}
                />
              )}
            </TabsContent>

            <TabsContent value="confirm" className="mt-0">
              {currentProduct && (
                <ImportConfirmation
                  product={currentProduct}
                  onPrevious={handlePrevious}
                  onComplete={handleComplete}
                />
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default ProductsImport;
