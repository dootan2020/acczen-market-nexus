
import React, { useState, useEffect } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Loader2, AlertTriangle, RefreshCw } from 'lucide-react';
import { toast } from 'sonner';
import ImportConfirmation from '@/components/admin/products/ImportConfirmation';
import ImportPreview from '@/components/admin/products/import/ImportPreview';
import ProductImportForm from '@/components/admin/products/ProductImportForm';
import { ProxyType, getStoredProxy, setStoredProxy } from '@/utils/corsProxy';
import { taphoammoApiService } from '@/services/TaphoammoApiService';

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
  const [currentProduct, setCurrentProduct] = useState<ExtendedProduct | null>(null);
  const [recentTokens, setRecentTokens] = useState<RecentToken[]>([]);
  const [dataSource, setDataSource] = useState<'mock' | 'api' | null>(null);
  const queryClient = useQueryClient();
  
  // Load recent tokens from localStorage on component mount
  useEffect(() => {
    const storedTokens = localStorage.getItem(RECENT_TOKENS_KEY);
    if (storedTokens) {
      try {
        const tokens = JSON.parse(storedTokens);
        setRecentTokens(tokens);
      } catch (e) {
        console.error('Failed to parse stored tokens:', e);
      }
    }
  }, []);
  
  // Save a token to recent tokens
  const saveToRecentTokens = (token: string, name: string) => {
    const updatedTokens = [
      { token, timestamp: Date.now(), name },
      ...recentTokens.filter(item => item.token !== token)
    ].slice(0, MAX_RECENT_TOKENS);
    
    setRecentTokens(updatedTokens);
    localStorage.setItem(RECENT_TOKENS_KEY, JSON.stringify(updatedTokens));
  };

  // Fetch categories for the product form with debounce and retry
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

  const testConnection = async (kioskToken: string, proxyType: ProxyType) => {
    try {
      setIsLoading(true);
      
      // Store the selected proxy type
      setStoredProxy(proxyType);
      
      const result = await taphoammoApiService.testConnection(kioskToken, proxyType);
      
      if (result.success) {
        // Extract product name from message if available
        const nameMatch = result.message.match(/Found: (.*?) \(Stock:/);
        const productName = nameMatch ? nameMatch[1] : 'Sản phẩm';
        
        // Save successful token to recent list
        saveToRecentTokens(kioskToken, productName);
      }
      
      return result;
    } catch (err) {
      console.error('Connection test error:', err);
      return {
        success: false,
        message: err instanceof Error ? err.message : 'Không thể kiểm tra kết nối'
      };
    } finally {
      setIsLoading(false);
    }
  };

  const handleFetchProduct = async (kioskToken: string, proxyType: ProxyType, useMockData: boolean = false) => {
    if (!kioskToken.trim()) {
      setError('Vui lòng nhập mã token sản phẩm');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      // Store the selected proxy type for future use
      setStoredProxy(proxyType);
      
      // Try to get the product data directly from the API service
      const product = await taphoammoApiService.getStock(kioskToken, {
        forceRefresh: true, // Always get fresh data
        proxyType: proxyType,
        useMockData: useMockData // Add flag to use mock data if requested
      });
      
      if (!product) {
        throw new Error('Không tìm thấy sản phẩm với mã token này');
      }
      
      // Create the ExtendedProduct object
      const extendedProduct: ExtendedProduct = {
        name: product.name || 'Sản phẩm không tên',
        description: product.description || '',
        price: product.price || 0,
        selling_price: product.price || 0,
        stock_quantity: product.stock_quantity || 0,
        slug: product.slug || kioskToken.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, ''),
        sku: product.sku || `P-${Math.random().toString(36).substring(2, 10).toUpperCase()}`,
        kiosk_token: kioskToken,
        status: 'active'
      };
      
      // Save to recent tokens
      saveToRecentTokens(kioskToken, extendedProduct.name);
      
      setCurrentProduct(extendedProduct);
      setImportStep('preview');
      
      // Track data source for UI display
      setDataSource(useMockData ? 'mock' : 'api');
      
      // Invalidate cache for real-time data
      queryClient.invalidateQueries({ queryKey: ['products'] });
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Có lỗi xảy ra khi kiểm tra sản phẩm');
      console.error('Token verification error:', err);
      
      // Show toast with detailed error
      toast.error('Lỗi lấy thông tin sản phẩm', {
        description: err instanceof Error ? err.message : 'Lỗi không xác định',
        duration: 5000,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleRetry = async () => {
    if (currentProduct?.kiosk_token) {
      // Clear the error and try again
      setError(null);
      await handleFetchProduct(currentProduct.kiosk_token, getStoredProxy(), dataSource === 'mock');
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
    setCurrentProduct(null);
    setError(null);
    setDataSource(null);
    
    // Invalidate the products query to refresh the data
    queryClient.invalidateQueries({ queryKey: ['products'] });
  };

  const handleClearCache = () => {
    taphoammoApiService.clearCache();
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
              <ProductImportForm
                onFetchProduct={handleFetchProduct}
                onTestConnection={testConnection}
                isLoading={isLoading}
                error={error}
                recentTokens={recentTokens}
                onClearRecent={() => {
                  setRecentTokens([]);
                  localStorage.removeItem(RECENT_TOKENS_KEY);
                  toast.success('Đã xóa danh sách token gần đây');
                }}
              />
            </TabsContent>

            <TabsContent value="preview" className="mt-0">
              {dataSource === 'mock' && (
                <Alert className="mb-4 bg-yellow-100 border-yellow-300">
                  <AlertDescription className="flex justify-between items-center">
                    <span className="font-medium text-yellow-800">
                      Đang sử dụng dữ liệu mẫu (Debug Mode) - Dữ liệu này không phải từ API thực
                    </span>
                  </AlertDescription>
                </Alert>
              )}
              
              {error && (
                <Alert variant="destructive" className="mb-6">
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription className="flex justify-between items-center">
                    <span>{error}</span>
                    <Button size="sm" onClick={handleRetry} variant="outline">
                      Thử lại
                    </Button>
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
                  onPrevious={handlePrevious}
                  onNext={handleNext}
                />
              )}
            </TabsContent>

            <TabsContent value="confirm" className="mt-0">
              {dataSource === 'mock' && (
                <Alert className="mb-4 bg-yellow-100 border-yellow-300">
                  <AlertDescription className="flex justify-between items-center">
                    <span className="font-medium text-yellow-800">
                      Đang sử dụng dữ liệu mẫu (Debug Mode) - Sản phẩm này không lấy từ API thực
                    </span>
                  </AlertDescription>
                </Alert>
              )}
              
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
