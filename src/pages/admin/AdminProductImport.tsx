import React, { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useTaphoammoAPI } from '@/hooks/useTaphoammoAPI';
import { ProductImportForm } from '@/components/admin/import/ProductImportForm';
import { ProductImportFilters } from '@/components/admin/import/ProductImportFilters';
import { ProductImportTable } from '@/components/admin/import/ProductImportTable';
import { ProductImportCard } from '@/components/admin/import/ProductImportCard';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AlertCircle, ArrowRight, Check, Info, RefreshCw } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { taphoammoProxy } from '@/api/taphoammoProxy';
import { ProxyType, getStoredTokens, getStoredProxy } from '@/utils/corsProxy';

export type TaphoammoProduct = {
  id: string;
  kiosk_token: string;
  name: string;
  description?: string;
  stock_quantity: number;
  price: number;
  rating?: number;
  sales_count?: number;
  selected?: boolean;
  markup_percentage?: number;
  category?: string;
  final_price?: number;
};

export type ImportFilters = {
  category: string;  // Ensure default 'all'
  minRating: number;
  minStock: number;
  maxPrice: number;
};

const AdminProductImport = () => {
  const storedTokens = getStoredTokens();
  const [userToken, setUserToken] = useState<string>(storedTokens.userToken || '');
  const [kioskToken, setKioskToken] = useState<string>(storedTokens.kioskToken || '');
  const [products, setProducts] = useState<TaphoammoProduct[]>([]);
  const [markupPercentage, setMarkupPercentage] = useState<number>(10);
  const [activeTab, setActiveTab] = useState<string>('connection');
  const [filters, setFilters] = useState<ImportFilters>({
    category: 'all',  // Explicit default
    minRating: 0,
    minStock: 0,
    maxPrice: 100000,
  });
  const [apiError, setApiError] = useState<string | null>(null);
  
  const { getStock, testConnection, getProducts, loading, error } = useTaphoammoAPI();
  
  const { data: categories } = useQuery({
    queryKey: ["categories"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("categories")
        .select("*");

      if (error) throw error;
      return data;
    },
  });

  const filteredProducts = products.filter(product => {
    const productPrice = product.price || 0;
    const productStock = product.stock_quantity || 0;
    const productRating = product.rating || 0;
    const productCategory = product.category || "";

    return (
      (filters.category === 'all' || productCategory === filters.category) &&
      productPrice <= filters.maxPrice &&
      productStock >= filters.minStock &&
      productRating >= filters.minRating
    );
  });

  const handleTestWithSampleTokens = async () => {
    const sampleTokens = {
      kioskToken: 'IEB8KZ8SAJQ5616W2M21',
      userToken: '0LP8RN0I7TNX6ROUD3DUS1I3LUJTQUJ4IFK9'
    };
    
    setKioskToken(sampleTokens.kioskToken);
    setUserToken(sampleTokens.userToken);
    
    toast.info('Testing with sample tokens...');
    
    try {
      const result = await handleTestConnection('allorigins');
      if (result.success) {
        handleFetchProducts('allorigins');
      }
    } catch (error) {
      console.error('Test failed:', error);
      toast.error('Test failed with sample tokens');
    }
  };

  const handleFetchProducts = async (proxyType: ProxyType) => {
    if (!kioskToken || !userToken) {
      toast.error("Please provide both Kiosk Token and User Token");
      return;
    }
    
    setApiError(null);
    let currentProxy = proxyType;
    
    const tryWithProxy = async (proxy: ProxyType): Promise<boolean> => {
      try {
        await getStock(kioskToken, userToken, proxy);
        const response = await getProducts(kioskToken, userToken, proxy);
        
        if (response.products && Array.isArray(response.products)) {
          const productsWithMeta = response.products.map((product: TaphoammoProduct) => ({
            ...product,
            selected: false,
            markup_percentage: markupPercentage,
            final_price: calculateFinalPrice(Number(product.price), markupPercentage)
          }));
          
          setProducts(productsWithMeta);
          setActiveTab('products');
          toast.success(`Found ${productsWithMeta.length} products`);
          return true;
        }
        return false;
      } catch (error) {
        console.error(`Failed with proxy ${proxy}:`, error);
        return false;
      }
    };
    
    if (await tryWithProxy(currentProxy)) {
      return;
    }
    
    if (currentProxy !== 'allorigins') {
      toast.info('Switching to allorigins proxy...');
      if (await tryWithProxy('allorigins')) {
        return;
      }
    }
    
    setApiError('Failed to fetch products with available proxies');
    toast.error('Could not fetch products');
    setProducts([]);
  };

  const calculateFinalPrice = (price: number, markup: number): number => {
    return price * (1 + (markup / 100));
  };
  
  const handleFilterChange = (newFilters: Partial<ImportFilters>) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
  };
  
  const handleMarkupChange = (value: number) => {
    setMarkupPercentage(value);
    
    setProducts(prevProducts => 
      prevProducts.map(product => ({
        ...product,
        markup_percentage: value,
        final_price: calculateFinalPrice(product.price, value)
      }))
    );
  };
  
  const handleSelectProduct = (productId: string, selected: boolean) => {
    setProducts(prevProducts => 
      prevProducts.map(product => 
        product.id === productId ? { 
          ...product, 
          selected 
        } : product
      )
    );
  };
  
  const handleSelectAllProducts = (selected: boolean) => {
    setProducts(prevProducts => 
      prevProducts.map(product => ({ ...product, selected }))
    );
  };
  
  const handleImportSelectedProducts = async () => {
    const selectedProducts = products.filter(product => product.selected);
    
    if (selectedProducts.length === 0) {
      toast.warning("No products selected for import");
      return;
    }
    
    try {
      toast.info(`Importing ${selectedProducts.length} products...`);
      
      const { data, error } = await supabase.functions.invoke('import-taphoammo-products', {
        body: JSON.stringify({ products: selectedProducts }),
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      if (error) {
        console.error("Import error:", error);
        toast.error("Import failed", {
          description: error.message
        });
        return;
      }
      
      if (data.error) {
        console.error("API import error:", data.error, data.details);
        toast.error("Import failed", {
          description: data.details || data.error
        });
        return;
      }
      
      toast.success(`Successfully imported ${data.imported} products`);
      
      setProducts(prevProducts => 
        prevProducts.filter(product => !product.selected)
      );
      
      if (selectedProducts.length === products.length) {
        setActiveTab('connection');
      }
      
    } catch (error) {
      console.error("Error importing products:", error);
      toast.error("Import failed", {
        description: error instanceof Error ? error.message : "Unknown error"
      });
    }
  };
  
  const handleProductMarkupChange = (productId: string, markup: number) => {
    setProducts(prevProducts => 
      prevProducts.map(product => 
        product.id === productId ? { 
          ...product, 
          markup_percentage: markup,
          final_price: calculateFinalPrice(product.price, markup)
        } : product
      )
    );
  };
  
  const handleRefreshProducts = async (proxyType: ProxyType) => {
    if (!userToken || !kioskToken) {
      toast.error("Missing API credentials");
      return;
    }
    
    toast.info("Refreshing products data...");
    await handleFetchProducts(proxyType);
  };
  
  const selectedCount = products.filter(p => p.selected).length;
  const selectedTotalValue = products
    .filter(p => p.selected)
    .reduce((sum, p) => sum + (p.final_price || 0), 0);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Import Products from TaphoaMMO</h1>
        <p className="text-muted-foreground">
          Sync products from TaphoaMMO to your store
        </p>
      </div>
      
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid grid-cols-2 mb-4">
          <TabsTrigger value="connection">1. API Connection</TabsTrigger>
          <TabsTrigger value="products" disabled={products.length === 0}>
            2. Import Products
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="connection">
          <Card>
            <CardHeader>
              <CardTitle>API Connection</CardTitle>
              <CardDescription>
                Test your connection to the TaphoaMMO API
                <Button
                  variant="link"
                  className="text-primary hover:underline ml-2"
                  onClick={handleTestWithSampleTokens}
                >
                  Test with sample tokens
                </Button>
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ProductImportForm 
                userToken={userToken}
                kioskToken={kioskToken}
                onUserTokenChange={setUserToken}
                onKioskTokenChange={setKioskToken}
                onSubmit={handleFetchProducts}
                onTestConnection={handleTestConnection}
                loading={loading}
                error={apiError || error}
              />
            </CardContent>
          </Card>
          
          <Card className="mt-6">
            <CardHeader>
              <CardTitle>Import Options</CardTitle>
              <CardDescription>Set default markup and filters for imported products</CardDescription>
            </CardHeader>
            <CardContent>
              <ProductImportFilters 
                filters={filters}
                onFilterChange={handleFilterChange}
                markupPercentage={markupPercentage}
                onMarkupChange={handleMarkupChange}
                categories={categories || []}
              />
            </CardContent>
          </Card>
          
          <Alert className="mt-6">
            <Info className="h-4 w-4" />
            <AlertTitle>CORS Proxy Information</AlertTitle>
            <AlertDescription>
              If you encounter connection issues, try switching to a different CORS proxy.
              Different proxies have varying reliability and may work better depending on your location.
            </AlertDescription>
          </Alert>
        </TabsContent>
        
        <TabsContent value="products">
          {selectedCount > 0 && (
            <Alert className="mb-6" variant="default">
              <div className="flex items-center justify-between w-full">
                <div className="flex items-center">
                  <Info className="h-4 w-4 mr-2" />
                  <span>
                    <strong>{selectedCount}</strong> products selected 
                    (Total value: <strong>${selectedTotalValue.toFixed(2)}</strong>)
                  </span>
                </div>
                <Button 
                  onClick={handleImportSelectedProducts}
                  size="sm"
                  className="ml-4"
                >
                  Import Selected <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            </Alert>
          )}
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Product List</CardTitle>
                <CardDescription>
                  Select products to import into your store ({filteredProducts.length} products found)
                </CardDescription>
              </div>
              <div className="flex gap-2">
                <Button 
                  onClick={() => handleRefreshProducts(getStoredProxy())}
                  variant="outline" 
                  size="sm"
                  disabled={loading}
                >
                  <RefreshCw className={`mr-2 h-4 w-4 ${loading ? "animate-spin" : ""}`} />
                  Refresh
                </Button>
                <Button 
                  onClick={() => setActiveTab('connection')} 
                  variant="outline" 
                  size="sm"
                >
                  Back to Connection
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredProducts.map((product) => (
                  <ProductImportCard
                    key={product.id}
                    product={product}
                    onImport={() => handleSelectProduct(product.id, true)}
                    loading={loading}
                  />
                ))}
                
                {filteredProducts.length === 0 && (
                  <div className="col-span-full text-center py-4 text-muted-foreground">
                    {products.length > 0 
                      ? "No products match your current filters" 
                      : "No products found"}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AdminProductImport;
