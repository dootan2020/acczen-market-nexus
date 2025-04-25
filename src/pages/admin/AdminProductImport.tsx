
import React, { useState } from 'react';
import { toast } from 'sonner';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useTaphoammoAPI } from '@/hooks/useTaphoammoAPI';
import { ProductImportForm } from '@/components/admin/import/ProductImportForm';
import { ProductImportFilters } from '@/components/admin/import/ProductImportFilters';
import { ProductImportTable } from '@/components/admin/import/ProductImportTable';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

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
  const [filters, setFilters] = useState<ImportFilters>({
    category: '',
    minRating: 0,
    minStock: 0,
    maxPrice: 100000,
  });
  
  const { getStock, loading, error } = useTaphoammoAPI();
  
  // Fetch categories for filter dropdown
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
      toast.info("Fetching products from TaphoaMMO...");
      
      // First, check if we can fetch product info with the provided tokens
      const stockInfo = await getStock(kioskToken, userToken);
      
      // If successful, call our Edge Function to fetch full product details
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
        // Add selected and markup fields to each product
        const productsWithMeta = data.products.map((product: TaphoammoProduct) => ({
          ...product,
          selected: false,
          markup_percentage: markupPercentage
        }));
        
        setProducts(productsWithMeta);
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
  
  const handleFilterChange = (newFilters: Partial<ImportFilters>) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
  };
  
  const handleMarkupChange = (value: number) => {
    setMarkupPercentage(value);
    
    // Apply the new markup to all selected products
    setProducts(prevProducts => 
      prevProducts.map(product => ({
        ...product,
        markup_percentage: value
      }))
    );
  };
  
  const handleSelectProduct = (productId: string, selected: boolean) => {
    setProducts(prevProducts => 
      prevProducts.map(product => 
        product.id === productId ? { ...product, selected } : product
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
      
      // Remove imported products from the list
      setProducts(prevProducts => 
        prevProducts.filter(product => !product.selected)
      );
      
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
        product.id === productId ? { ...product, markup_percentage: markup } : product
      )
    );
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Import Products from TaphoaMMO</h1>
        <p className="text-muted-foreground">
          Sync products from TaphoaMMO to your store
        </p>
      </div>
      
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
          />
        </CardContent>
      </Card>
      
      {products.length > 0 && (
        <>
          <Card>
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
          
          <Card>
            <CardHeader>
              <CardTitle>Products</CardTitle>
              <CardDescription>
                Select products to import into your store
              </CardDescription>
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
        </>
      )}
      
      {error && (
        <Card className="bg-destructive/10 border-destructive">
          <CardHeader>
            <CardTitle className="text-destructive">Error</CardTitle>
          </CardHeader>
          <CardContent>
            <p>{error}</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default AdminProductImport;
