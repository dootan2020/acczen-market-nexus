
import React, { useState } from 'react';
import { useProducts } from '@/hooks/useProducts';
import ProductsList from '@/components/products/ProductsList';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search } from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';
import MobileHeader from '@/components/mobile/MobileHeader';

const Products = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const { products, isLoading, error } = useProducts();
  const isMobile = useIsMobile();

  const filteredProducts = products?.filter(product => 
    product.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    // Search is already handled through the filter above
  };

  // Function for the mobile search button
  const openMobileSearch = () => {
    const searchField = document.getElementById('product-search');
    if (searchField) {
      searchField.focus();
    }
  };

  return (
    <>
      {isMobile && <MobileHeader title="Products" onSearchClick={openMobileSearch} />}
      <div className="container mx-auto p-4 md:p-8">
        <div className="mb-6">
          <h1 className={`${isMobile ? "text-2xl" : "text-3xl"} font-bold mb-4`}>Sản phẩm</h1>
          
          <form onSubmit={handleSearch} className="flex gap-2 mb-6">
            <div className="relative flex-1">
              <Input
                id="product-search"
                type="text"
                placeholder="Tìm kiếm sản phẩm..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
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
            <p>Error loading products. Please try again later.</p>
          </div>
        ) : (
          <ProductsList 
            products={filteredProducts || []} 
            loading={isLoading}
            emptyMessage={searchTerm ? "Không có sản phẩm phù hợp" : "Chưa có sản phẩm nào"}
          />
        )}
      </div>
    </>
  );
};

export default Products;
