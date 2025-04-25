import React, { useState } from 'react';
import { toast } from 'sonner';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useTaphoammoAPI } from '@/hooks/useTaphoammoAPI';
import { ProductImportForm } from '@/components/admin/import/ProductImportForm';
import { ProductImportFilters } from '@/components/admin/import/ProductImportFilters';
import { ProductImportTable } from '@/components/admin/import/ProductImportTable';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AlertCircle, ArrowRight, Check, Info } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';

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
  category: string;
  minRating: number;
  minStock: number;
  maxPrice: number;
};

const AdminProductImport = () => {
  const [userToken, setUserToken] = useState<string>('');
  const [kioskToken, setKioskToken] = useState<string>('');
  const [products, setProducts] = useState<TaphoammoProduct[]>([]);
  const [markupPercentage, setMarkupPercentage] = useState<number>(10);
  const [activeTab, setActiveTab] = useState<string>('fetch');
  const [filters, setFilters] = useState<ImportFilters>({
    category: 'all',
    minRating: 0,
    minStock: 0,
    maxPrice: 100000,
  });
  
  const { getStock, loading, error } = useTaphoammoAPI();
  
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

  const handleFetchProducts = async () => {
    if (!kioskToken || !userToken) {
      toast.error("Please provide both Kiosk Token and User Token");
      return;
    }
    
    try {
      toast.info("Connecting to TaphoaMMO API...");
      
      const stockInfo = await getStock(kioskToken, userToken);
      
      if (!stockInfo) {
        toast.error("Failed to fetch product information");
        return;
      }
      
      toast.success("API connection successful", {
        description: `Connected to ${stockInfo.name || "product"}`
      });
      
      const { data, error } = await supabase.functions.invoke('sync-taphoammo-products', {
        body: JSON.stringify({ kioskToken, userToken, filters })
      });
      
      if (error) {
        toast.error("Failed to fetch products", {
          description: error.message
        });
        return;
      }
      
      if (data && Array.isArray(data.products)) {
        const productsWithMeta = data.products.map((product: TaphoammoProduct) => ({
          ...product,
          selected: false,
          markup_percentage: markupPercentage,
          final_price: calculateFinalPrice(product.price, markupPercentage)
        }));
        
        setProducts(productsWithMeta);
        setActiveTab('preview');
        toast.success(`Found ${productsWithMeta.length} products`);
      } else {
        toast.warning("No products found");
        setProducts([]);
      }
    } catch (error) {
      console.error("Error fetching products:", error);
      toast.error("Failed to fetch products", {
        description: error instanceof Error ? error.message : "Unknown error"
      });
    }
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
        body: JSON.stringify({ products: selectedProducts })
      });
      
      if (error) {
        toast.error("Import failed", {
          description: error.message
        });
        return;
      }
      
      toast.success(`Successfully imported ${data.imported} products`);
      
      setProducts(prevProducts => 
        prevProducts.filter(product => !product.selected)
      );
      
      if (selectedProducts.length === products.length) {
        setActiveTab('fetch');
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
          <TabsTrigger value="fetch">1. Fetch Products</TabsTrigger>
          <TabsTrigger 
            value="preview" 
            disabled={products.length === 0}
          >
            2. Preview & Import
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="fetch">
          <Card>
            <CardHeader>
              <CardTitle>API Credentials</CardTitle>
              <CardDescription>Enter your TaphoaMMO API credentials</CardDescription>
            </CardHeader>
            <CardContent>
              <ProductImportForm 
                userToken={userToken}
                kioskToken={kioskToken}
                onUserTokenChange={setUserToken}
                onKioskTokenChange={setKioskToken}
                onSubmit={handleFetchProducts}
                loading={loading}
                error={error}
              />
            </CardContent>
          </Card>
          
          <Card className="mt-6">
            <CardHeader>
              <CardTitle>Filters & Options</CardTitle>
              <CardDescription>Filter products and set markup</CardDescription>
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
            <AlertTitle>Connection Information</AlertTitle>
            <AlertDescription>
              Your API credentials will be securely handled by our server-side Edge Function.
              No sensitive information will be exposed to the client.
            </AlertDescription>
          </Alert>
        </TabsContent>
        
        <TabsContent value="preview">
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
                <CardTitle>Product Preview</CardTitle>
                <CardDescription>
                  Select products to import into your store
                </CardDescription>
              </div>
              <Button 
                onClick={() => setActiveTab('fetch')} 
                variant="outline" 
                size="sm"
              >
                Back to Filters
              </Button>
            </CardHeader>
            <CardContent>
              <ProductImportTable 
                products={products}
                onSelectProduct={handleSelectProduct}
                onSelectAll={handleSelectAllProducts}
                onImportSelected={handleImportSelectedProducts}
                onProductMarkupChange={handleProductMarkupChange}
              />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AdminProductImport;
