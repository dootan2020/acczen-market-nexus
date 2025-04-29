
import React, { useState, useEffect } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Loader2, AlertTriangle, RefreshCw, Info } from 'lucide-react';
import { toast } from 'sonner';
import ImportConfirmation from '@/components/admin/products/ImportConfirmation';
import ImportPreview from '@/components/admin/products/import/ImportPreview';
import ProductImportForm from '@/components/admin/products/ProductImportForm';
import ProductCard from '@/components/admin/products/import/ProductCard';
import { 
  fetchTaphoammoProduct, 
  getRecentTokens, 
  saveRecentToken,
  clearRecentTokens
} from '@/utils/taphoammoApi';

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

// Define the interface for recently used tokens
interface RecentToken {
  token: string;
  timestamp: number;
  name: string;
}

const MAX_RECENT_TOKENS = 5;
const RECENT_TOKENS_KEY = 'recent_import_tokens';

const ProductsImport = () => {
  const [importStep, setImportStep] = useState<'verify' | 'preview' | 'confirm'>('verify');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [productData, setProductData] = useState<{
    name: string;
    price: string;
    stock: string;
  } | null>(null);
  const [currentProduct, setCurrentProduct] = useState<ExtendedProduct | null>(null);
  const [recentTokens, setRecentTokens] = useState<RecentToken[]>([]);
  const queryClient = useQueryClient();
  
  // Load recent tokens from localStorage on component mount
  useEffect(() => {
    const tokens = getRecentTokens();
    setRecentTokens(tokens);
  }, []);

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
    },
    retry: 2,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  // Fetch product data from API
  const handleFetchProduct = async (kioskToken: string, corsProxyUrl: string) => {
    if (!kioskToken.trim()) {
      setError('Vui lòng nhập mã token sản phẩm');
      return;
    }

    setIsLoading(true);
    setError(null);
    setProductData(null);

    try {
      // Call the API through the selected CORS proxy
      const result = await fetchTaphoammoProduct(kioskToken, corsProxyUrl);
      
      if (result.error) {
        setError(result.error);
        return;
      }
      
      if (!result.data) {
        setError('Không thể lấy thông tin sản phẩm');
        return;
      }
      
      // Set the product data
      setProductData(result.data);
      
      // Add to recent tokens
      const updatedTokens = saveRecentToken(kioskToken, result.data.name);
      setRecentTokens(updatedTokens);
      
      // Create a product object for the form
      const productObj: ExtendedProduct = {
        name: result.data.name,
        description: `Sản phẩm nhập từ API TaphoaMMO: ${result.data.name}`,
        price: parseInt(result.data.price) || 0,
        selling_price: parseInt(result.data.price) || 0,
        stock_quantity: parseInt(result.data.stock) || 0,
        slug: result.data.name.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]+/g, ''),
        sku: `TPM-${kioskToken.substring(0, 8)}`,
        kiosk_token: kioskToken,
        status: 'active'
      };
      
      setCurrentProduct(productObj);
      
      // Move to preview step
      setImportStep('preview');
      
      toast.success('Đã tải thông tin sản phẩm thành công');
      
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Lỗi không xác định khi tải sản phẩm';
      setError(errorMessage);
      console.error('Error fetching product:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClearCache = () => {
    toast.success('Cache đã được xóa');
  };

  const handleClearRecentTokens = () => {
    clearRecentTokens();
    setRecentTokens([]);
    toast.success('Đã xóa danh sách token gần đây');
  };

  return (
    <div className="container py-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Import sản phẩm</h1>
        <div className="space-x-2">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handleClearCache}
            className="flex items-center gap-1"
          >
            <RefreshCw size={16} />
            Xóa cache API
          </Button>
        </div>
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
              <div className="grid gap-6 md:grid-cols-[1fr_380px]">
                <div>
                  <ProductImportForm
                    onFetchProduct={handleFetchProduct}
                    isLoading={isLoading}
                    error={error}
                    recentTokens={recentTokens}
                    onClearRecent={handleClearRecentTokens}
                  />
                </div>

                <div className="space-y-4">
                  {isLoading && (
                    <div className="flex justify-center items-center p-12 border rounded">
                      <Loader2 className="h-8 w-8 animate-spin text-primary" />
                      <span className="ml-2">Đang tải thông tin sản phẩm...</span>
                    </div>
                  )}

                  {productData && !isLoading && (
                    <div className="space-y-3">
                      <h3 className="text-lg font-medium">Kết quả từ API:</h3>
                      <ProductCard 
                        name={productData.name}
                        price={productData.price}
                        stock={productData.stock}
                      />
                      <Alert className="mt-2">
                        <Info className="h-4 w-4" />
                        <AlertDescription>
                          Nhấn "Xác minh & tải sản phẩm" để tiếp tục và chỉnh sửa thông tin chi tiết.
                        </AlertDescription>
                      </Alert>
                    </div>
                  )}

                  {error && !isLoading && (
                    <Alert variant="destructive" className="mt-4">
                      <AlertTriangle className="h-4 w-4" />
                      <AlertDescription>
                        <div className="font-medium mb-1">Lỗi khi tải sản phẩm:</div>
                        <div>{error}</div>
                        <div className="text-sm mt-2">
                          Kiểm tra lại token hoặc thử chọn CORS proxy khác.
                        </div>
                      </AlertDescription>
                    </Alert>
                  )}
                </div>
              </div>
            </TabsContent>

            <TabsContent value="preview" className="mt-0">
              {error && (
                <Alert variant="destructive" className="mb-6">
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription className="flex justify-between items-center">
                    <span>{error}</span>
                  </AlertDescription>
                </Alert>
              )}
              {isLoading && (
                <div className="flex justify-center items-center p-12">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                  <span className="ml-2">Đang tải thông tin sản phẩm...</span>
                </div>
              )}
              {currentProduct && !isLoading && (
                <ImportPreview
                  product={currentProduct}
                  categories={categories || []}
                  categoriesLoading={categoriesLoading}
                  onPrevious={() => setImportStep('verify')}
                  onNext={(product) => {
                    setCurrentProduct(product);
                    setImportStep('confirm');
                  }}
                />
              )}
            </TabsContent>

            <TabsContent value="confirm" className="mt-0">
              {currentProduct && (
                <ImportConfirmation
                  product={currentProduct}
                  onPrevious={() => setImportStep('preview')}
                  onComplete={() => {
                    setImportStep('verify');
                    setCurrentProduct(null);
                    setError(null);
                    setProductData(null);
                    queryClient.invalidateQueries({ queryKey: ['products'] });
                  }}
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
