
import React, { useState, useEffect } from 'react';
import { useProducts } from '@/hooks/useProducts';
import ProductCard from '@/components/ProductCard';
import { Skeleton } from '@/components/ui/skeleton';
import { useCategories } from '@/hooks/useProducts';
import { AlertCircle, ShoppingBag, Search, SlidersHorizontal } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbSeparator,
  BreadcrumbPage
} from '@/components/ui/breadcrumb';
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination';
import { Card, CardContent } from '@/components/ui/card';
import { Link } from 'react-router-dom';

const PRODUCTS_PER_PAGE = 12;

const Products = () => {
  const { data: allProducts, isLoading, error } = useProducts();
  const { data: categories } = useCategories();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [sortOrder, setSortOrder] = useState('newest');
  const [currentPage, setCurrentPage] = useState(1);
  const [filteredProducts, setFilteredProducts] = useState<any[]>([]);
  
  // Filter and sort products whenever dependencies change
  useEffect(() => {
    if (!allProducts) return;
    
    let result = [...allProducts];
    
    // Apply search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(product => 
        product.name.toLowerCase().includes(query) || 
        (product.description && product.description.toLowerCase().includes(query))
      );
    }
    
    // Apply category filter
    if (selectedCategory) {
      result = result.filter(product => 
        product.category?.id === selectedCategory || 
        product.category?.slug === selectedCategory
      );
    }
    
    // Apply sorting
    switch(sortOrder) {
      case 'newest':
        result.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
        break;
      case 'popular':
        result.sort((a, b) => {
          // Fixed type issue: safely extract sold_count from metadata
          const aSold = typeof a.metadata === 'object' && a.metadata !== null ? 
            (a.metadata.sold_count || 0) : 0;
          const bSold = typeof b.metadata === 'object' && b.metadata !== null ? 
            (b.metadata.sold_count || 0) : 0;
          return bSold - aSold;
        });
        break;
      case 'price-asc':
        result.sort((a, b) => {
          const aPrice = a.sale_price || a.price;
          const bPrice = b.sale_price || b.price;
          return aPrice - bPrice;
        });
        break;
      case 'price-desc':
        result.sort((a, b) => {
          const aPrice = a.sale_price || a.price;
          const bPrice = b.sale_price || b.price;
          return bPrice - aPrice;
        });
        break;
      default:
        break;
    }
    
    setFilteredProducts(result);
    
    // Reset to first page when filters change
    if (currentPage !== 1) {
      setCurrentPage(1);
    }
  }, [allProducts, searchQuery, selectedCategory, sortOrder]);
  
  // Calculate pagination
  const totalPages = Math.ceil((filteredProducts?.length || 0) / PRODUCTS_PER_PAGE);
  const currentProducts = filteredProducts.slice(
    (currentPage - 1) * PRODUCTS_PER_PAGE,
    currentPage * PRODUCTS_PER_PAGE
  );
  
  // Pagination range generation 
  const getPaginationRange = () => {
    const range = [];
    const showPages = 5;
    let startPage = Math.max(1, currentPage - Math.floor(showPages / 2));
    let endPage = Math.min(totalPages, startPage + showPages - 1);
    
    if (endPage - startPage + 1 < showPages) {
      startPage = Math.max(1, endPage - showPages + 1);
    }
    
    for (let i = startPage; i <= endPage; i++) {
      range.push(i);
    }
    
    return range;
  };
  
  // Handle search
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };
  
  // Handle category change
  const handleCategoryChange = (value: string) => {
    setSelectedCategory(value);
  };
  
  // Handle sort change
  const handleSortChange = (value: string) => {
    setSortOrder(value);
  };
  
  // Handle page change
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    // Scroll to top of the products section
    window.scrollTo({
      top: document.getElementById('products-section')?.offsetTop || 0,
      behavior: 'smooth'
    });
  };

  // Render loading skeleton
  if (isLoading) {
    return (
      <div className="container mx-auto p-6 lg:p-8">
        {/* Breadcrumb */}
        <Breadcrumb className="mb-6">
          <BreadcrumbList>
            <BreadcrumbItem>
              {/* Fixed BreadcrumbLink by using asChild prop and putting Link inside */}
              <BreadcrumbLink asChild>
                <Link to="/">Trang chủ</Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>Sản phẩm</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      
        <h1 className="text-3xl font-bold mb-6">Danh sách sản phẩm</h1>
        
        {/* Filter skeleton */}
        <Card className="mb-8">
          <CardContent className="p-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Skeleton className="h-10 w-full bg-gray-200" />
              <Skeleton className="h-10 w-full bg-gray-200" />
              <Skeleton className="h-10 w-full bg-gray-200" />
            </div>
          </CardContent>
        </Card>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {Array.from({ length: 8 }).map((_, index) => (
            <div key={index} className="border border-gray-200 rounded-xl p-4">
              <Skeleton className="h-[180px] w-full rounded-xl bg-gray-200" />
              <Skeleton className="h-6 w-3/4 mt-4 bg-gray-200" />
              <Skeleton className="h-4 w-full mt-2 bg-gray-200" />
              <Skeleton className="h-10 w-full mt-4 bg-gray-200" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  // Render error state
  if (error) {
    return (
      <div className="container mx-auto p-6 lg:p-8">
        <Breadcrumb className="mb-6">
          <BreadcrumbList>
            <BreadcrumbItem>
              {/* Fixed BreadcrumbLink by using asChild prop and putting Link inside */}
              <BreadcrumbLink asChild>
                <Link to="/">Trang chủ</Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>Sản phẩm</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      
        <h1 className="text-3xl font-bold mb-6">Danh sách sản phẩm</h1>
        
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Lỗi</AlertTitle>
          <AlertDescription>
            Không thể tải danh sách sản phẩm. Vui lòng thử lại sau.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  // Render empty state
  if (!allProducts || allProducts.length === 0) {
    return (
      <div className="container mx-auto p-6 lg:p-8">
        <Breadcrumb className="mb-6">
          <BreadcrumbList>
            <BreadcrumbItem>
              {/* Fixed BreadcrumbLink by using asChild prop and putting Link inside */}
              <BreadcrumbLink asChild>
                <Link to="/">Trang chủ</Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>Sản phẩm</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      
        <h1 className="text-3xl font-bold mb-6">Danh sách sản phẩm</h1>
        
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <ShoppingBag className="h-16 w-16 text-muted-foreground mb-4" />
          <h2 className="text-xl font-medium">Không có sản phẩm nào</h2>
          <p className="text-muted-foreground mt-2">
            Hiện tại chúng tôi không có sản phẩm nào. Vui lòng quay lại sau.
          </p>
        </div>
      </div>
    );
  }

  // Render product grid
  return (
    <div className="container mx-auto p-6 lg:p-8" id="products-section">
      {/* Breadcrumb */}
      <Breadcrumb className="mb-6">
        <BreadcrumbList>
          <BreadcrumbItem>
            {/* Fixed BreadcrumbLink by using asChild prop and putting Link inside */}
            <BreadcrumbLink asChild>
              <Link to="/">Trang chủ</Link>
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>Sản phẩm</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>
      
      <h1 className="text-3xl font-bold mb-6">Danh sách sản phẩm</h1>
      
      {/* Filters */}
      <Card className="mb-8">
        <CardContent className="p-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Search filter */}
            <div className="relative">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Tìm kiếm sản phẩm..."
                className="pl-8"
                value={searchQuery}
                onChange={handleSearchChange}
              />
            </div>
            
            {/* Category filter */}
            <Select value={selectedCategory} onValueChange={handleCategoryChange}>
              <SelectTrigger>
                <SelectValue placeholder="Chọn danh mục" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">Tất cả danh mục</SelectItem>
                {categories?.map((category: any) => (
                  <SelectItem key={category.id} value={category.id}>
                    {category.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            
            {/* Sort order */}
            <Select value={sortOrder} onValueChange={handleSortChange}>
              <SelectTrigger>
                <SelectValue placeholder="Sắp xếp theo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="newest">Mới nhất</SelectItem>
                <SelectItem value="popular">Phổ biến</SelectItem>
                <SelectItem value="price-asc">Giá thấp đến cao</SelectItem>
                <SelectItem value="price-desc">Giá cao đến thấp</SelectItem>
              </SelectContent>
            </Select>
            
            {/* Filter button (for mobile) */}
            <Button variant="outline" className="lg:hidden flex items-center justify-center">
              <SlidersHorizontal className="mr-2 h-4 w-4" />
              Lọc thêm
            </Button>
          </div>
          
          {/* Results count */}
          <div className="mt-4 text-sm text-muted-foreground">
            Hiển thị {currentProducts.length} trong {filteredProducts.length} sản phẩm
          </div>
        </CardContent>
      </Card>
      
      {/* Products grid */}
      {filteredProducts.length > 0 ? (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {currentProducts.map((product) => {
              // Safely extract metadata properties with type checking
              const metadata = typeof product.metadata === 'object' && product.metadata !== null ? 
                product.metadata : {};
              
              return (
                <ProductCard
                  key={product.id}
                  id={product.id}
                  name={product.name}
                  image={product.image_url}
                  price={product.price}
                  salePrice={product.sale_price}
                  category={product.category?.name || 'Uncategorized'}
                  subcategory={product.subcategory?.name}
                  stock={product.stock_quantity}
                  kioskToken={product.kiosk_token}
                  featured={!!metadata.featured}
                  rating={typeof metadata.rating === 'number' ? metadata.rating : 0}
                  reviewCount={typeof metadata.review_count === 'number' ? metadata.review_count : 0}
                  isNew={!!metadata.is_new}
                  isBestSeller={!!metadata.is_best_seller}
                  description={product.description?.substring(0, 100)}
                  soldCount={typeof metadata.sold_count === 'number' ? metadata.sold_count : 0}
                />
              );
            })}
          </div>
          
          {/* Pagination */}
          {totalPages > 1 && (
            <Pagination className="mt-8">
              <PaginationContent>
                <PaginationItem>
                  {/* Use a Button with onClick instead of passing disabled to PaginationPrevious */}
                  {currentPage === 1 ? (
                    <Button variant="outline" size="icon" disabled className="cursor-not-allowed">
                      <span className="sr-only">Go to previous page</span>
                      <span className="text-sm">Previous</span>
                    </Button>
                  ) : (
                    <PaginationPrevious onClick={() => handlePageChange(Math.max(1, currentPage - 1))} />
                  )}
                </PaginationItem>
                
                {/* First page */}
                {getPaginationRange()[0] > 1 && (
                  <>
                    <PaginationItem>
                      <PaginationLink onClick={() => handlePageChange(1)}>
                        1
                      </PaginationLink>
                    </PaginationItem>
                    {getPaginationRange()[0] > 2 && (
                      <PaginationItem>
                        <PaginationEllipsis />
                      </PaginationItem>
                    )}
                  </>
                )}
                
                {/* Page numbers */}
                {getPaginationRange().map(page => (
                  <PaginationItem key={page}>
                    <PaginationLink 
                      isActive={page === currentPage}
                      onClick={() => handlePageChange(page)}
                    >
                      {page}
                    </PaginationLink>
                  </PaginationItem>
                ))}
                
                {/* Last page */}
                {getPaginationRange()[getPaginationRange().length - 1] < totalPages && (
                  <>
                    {getPaginationRange()[getPaginationRange().length - 1] < totalPages - 1 && (
                      <PaginationItem>
                        <PaginationEllipsis />
                      </PaginationItem>
                    )}
                    <PaginationItem>
                      <PaginationLink onClick={() => handlePageChange(totalPages)}>
                        {totalPages}
                      </PaginationLink>
                    </PaginationItem>
                  </>
                )}
                
                <PaginationItem>
                  {/* Use a Button with onClick instead of passing disabled to PaginationNext */}
                  {currentPage === totalPages ? (
                    <Button variant="outline" size="icon" disabled className="cursor-not-allowed">
                      <span className="sr-only">Go to next page</span>
                      <span className="text-sm">Next</span>
                    </Button>
                  ) : (
                    <PaginationNext onClick={() => handlePageChange(Math.min(totalPages, currentPage + 1))} />
                  )}
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          )}
        </>
      ) : (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <ShoppingBag className="h-16 w-16 text-muted-foreground mb-4" />
          <h2 className="text-xl font-medium">Không tìm thấy sản phẩm phù hợp</h2>
          <p className="text-muted-foreground mt-2">
            Thử thay đổi bộ lọc hoặc tìm kiếm với từ khóa khác.
          </p>
        </div>
      )}
    </div>
  );
};

export default Products;
