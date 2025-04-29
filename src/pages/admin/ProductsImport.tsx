
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
import { ProxyType, getStoredProxy } from '@/utils/corsProxy';

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

  // Mock test connection function
  const testConnection = async (kioskToken: string, proxyType: ProxyType) => {
    try {
      setIsLoading(true);
      // Mock implementation - no actual API call
      console.log('Test connection request with token:', kioskToken, 'proxy:', proxyType);
      
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      return {
        success: false,
        message: 'API integration has been removed from this application'
      };
    } catch (err) {
      console.error('Connection test error:', err);
      return {
        success: false,
        message: err instanceof Error ? err.message : 'API integration has been removed'
      };
    } finally {
      setIsLoading(false);
    }
  };

  // Mock fetch product function
  const handleFetchProduct = async (kioskToken: string, proxyType: ProxyType, useMockData: boolean = false) => {
    if (!kioskToken.trim()) {
      setError('Vui lòng nhập mã token sản phẩm');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      toast.info('API integration removed', {
        description: 'This functionality is currently unavailable',
        duration: 5000
      });
      
      setError('API integration has been removed from this application');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'API integration has been removed');
      console.error('Error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClearCache = () => {
    toast.success('Cache cleared (mock implementation)');
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

      <Alert className="mb-6">
        <Info className="h-4 w-4" />
        <AlertDescription>
          API integration has been temporarily removed. This page is currently for UI demonstration only.
        </AlertDescription>
      </Alert>

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
                    setDataSource(null);
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
