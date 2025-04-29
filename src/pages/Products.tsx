
import React, { useState, useCallback, useMemo } from 'react';
import { useProducts } from '@/hooks/useProducts';
import ProductsList from '@/components/products/ProductsList';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search } from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';
import MobileHeader from '@/components/mobile/MobileHeader';
import { useDebounce } from '@/hooks/useDebounce';
import { Container } from '@/components/ui/container';
import Layout from '@/components/Layout';

const Products = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const debouncedSearchTerm = useDebounce(searchTerm, 300); // Debounce search by 300ms
  const { data, isLoading, error } = useProducts();
  const isMobile = useIsMobile();

  // Use callback for search handler to prevent recreation on each render
  const handleSearchChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  }, []);

  // Memoize the filtered products to avoid recomputation on every render
  const filteredProducts = useMemo(() => {
    if (!data) return [];
    return data.filter(product => 
      product.name.toLowerCase().includes(debouncedSearchTerm.toLowerCase())
    );
  }, [data, debouncedSearchTerm]);

  // Map the database product format to the format expected by ProductsList
  // Memoize this transformation to avoid unnecessary processing
  const mappedProducts = useMemo(() => {
    return filteredProducts.map(product => ({
      id: product.id,
      name: product.name,
      image: product.image_url || '', 
      price: product.price,
      salePrice: product.sale_price || undefined,
      category: product.category?.name || '',
      subcategory: product.subcategory?.name,
      stock: product.stock_quantity,
      // Changed from product.featured to check for active status and stock
      featured: product.status === 'active' && product.stock_quantity > 0
    })) || [];
  }, [filteredProducts]);

  const handleSearch = useCallback((e: React.FormEvent) => {
    e.preventDefault();
  }, []);

  // Function for the mobile search button
  const openMobileSearch = useCallback(() => {
    const searchField = document.getElementById('product-search');
    if (searchField) {
      searchField.focus();
    }
  }, []);

  return (
    <Layout>
      {isMobile && <MobileHeader title="Sản phẩm" onSearchClick={openMobileSearch} />}
      <Container className="py-4 md:py-8">
        <div className="mb-6">
          <h1 className={`${isMobile ? "text-2xl" : "text-3xl"} font-bold mb-4`}>Sản phẩm</h1>
          
          <form onSubmit={handleSearch} className="flex gap-2 mb-6">
            <div className="relative flex-1">
              <Input
                id="product-search"
                type="text"
                placeholder="Tìm kiếm sản phẩm..."
                value={searchTerm}
                onChange={handleSearchChange}
                className="pl-9 py-6 md:py-5 text-base"
              />
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            </div>
            <Button type="submit" className="hidden md:flex min-h-[44px]">
              Tìm kiếm
            </Button>
          </form>
        </div>
        
        {error ? (
          <div className="text-center py-8 text-destructive">
            <p>Lỗi tải sản phẩm. Vui lòng thử lại sau.</p>
          </div>
        ) : (
          <ProductsList 
            products={mappedProducts} 
            loading={isLoading}
            emptyMessage={searchTerm ? "Không có sản phẩm phù hợp" : "Chưa có sản phẩm nào"}
          />
        )}
      </Container>
    </Layout>
  );
};

export default React.memo(Products);
