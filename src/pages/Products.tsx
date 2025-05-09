
import React, { useState, useEffect } from 'react';
import { useProducts, useCategories } from '@/hooks/useProducts';
import ProductCard from '@/components/ProductCard';
import { Skeleton } from '@/components/ui/skeleton';
import { AlertCircle, ShoppingBag, Search } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
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
import { Container } from '@/components/ui/container';

const PRODUCTS_PER_PAGE = 12;

const Products = () => {
  // Fetch products and categories data using existing hooks
  const { data: allProducts, isLoading, error } = useProducts();
  const { data: categories } = useCategories();
  
  // State for filters, search, and pagination
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [sortOrder, setSortOrder] = useState('newest');
  const [currentPage, setCurrentPage] = useState(1);
  const [filteredProducts, setFilteredProducts] = useState<any[]>([]);
  
  // Filter and sort products whenever dependencies change
  useEffect(() => {
    if (!allProducts) {
      return;
    }
    
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
    if (selectedCategory && selectedCategory !== 'all') {
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
          // Safely extract sold_count from metadata or default to 0
          const aSold = typeof a.metadata === 'object' && a.metadata !== null ? 
            (typeof a.metadata === 'object' && 'sold_count' in a.metadata ? Number(a.metadata.sold_count) : 0) : 0;
          const bSold = typeof b.metadata === 'object' && b.metadata !== null ? 
            (typeof b.metadata === 'object' && 'sold_count' in b.metadata ? Number(b.metadata.sold_count) : 0) : 0;
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
      <Container className="py-8" id="products-section">
        <Breadcrumb className="mb-6">
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink asChild>
                <Link to="/">Home</Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>Products</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      
        <h1 className="text-3xl font-bold mb-6">Digital Products</h1>
        
        <Card className="mb-8">
          <CardContent className="p-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
            </div>
          </CardContent>
        </Card>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {Array.from({ length: 8 }).map((_, index) => (
            <div key={index} className="border border-gray-200 rounded-xl p-4">
              <Skeleton className="h-[180px] w-full rounded-xl" />
              <Skeleton className="h-6 w-3/4 mt-4" />
              <Skeleton className="h-4 w-full mt-2" />
              <Skeleton className="h-10 w-full mt-4" />
            </div>
          ))}
        </div>
      </Container>
    );
  }

  // Render error state
  if (error) {
    return (
      <Container className="py-8" id="products-section">
        <Breadcrumb className="mb-6">
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink asChild>
                <Link to="/">Home</Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>Products</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      
        <h1 className="text-3xl font-bold mb-6">Digital Products</h1>
        
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>
            Failed to load products. Please try again later. Error: {String(error)}
          </AlertDescription>
        </Alert>
      </Container>
    );
  }

  // Render empty state
  if (!allProducts || allProducts.length === 0) {
    return (
      <Container className="py-8" id="products-section">
        <Breadcrumb className="mb-6">
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink asChild>
                <Link to="/">Home</Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>Products</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      
        <h1 className="text-3xl font-bold mb-6">Digital Products</h1>
        
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <ShoppingBag className="h-16 w-16 text-muted-foreground mb-4" />
          <h2 className="text-xl font-medium">No products available</h2>
          <p className="text-muted-foreground mt-2">
            We currently don't have any products available. Please check back later.
          </p>
        </div>
      </Container>
    );
  }

  // Render product grid
  return (
    <Container className="py-8" id="products-section">
      <Breadcrumb className="mb-6">
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink asChild>
              <Link to="/">Home</Link>
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>Products</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>
      
      <h1 className="text-3xl font-bold mb-6">Digital Products</h1>
      
      <Card className="mb-8">
        <CardContent className="p-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search products..."
                className="pl-9"
                value={searchQuery}
                onChange={handleSearchChange}
              />
            </div>
            
            <Select value={selectedCategory} onValueChange={handleCategoryChange}>
              <SelectTrigger>
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {categories?.map((category: any) => (
                  <SelectItem key={category.id} value={category.id}>
                    {category.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            
            <Select value={sortOrder} onValueChange={handleSortChange}>
              <SelectTrigger>
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="newest">Newest</SelectItem>
                <SelectItem value="popular">Popular</SelectItem>
                <SelectItem value="price-asc">Price: Low to High</SelectItem>
                <SelectItem value="price-desc">Price: High to Low</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="mt-4 text-sm text-gray-500">
            Showing {currentProducts.length} of {filteredProducts.length} products
          </div>
        </CardContent>
      </Card>
      
      {filteredProducts.length > 0 ? (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {currentProducts.map((product) => {
              // Safely extract metadata properties
              const metadata = typeof product.metadata === 'object' && product.metadata !== null ? 
                product.metadata : {};
              
              // Safely extract sold_count
              let soldCount = 0;
              if (typeof metadata === 'object' && metadata !== null && 'sold_count' in metadata) {
                soldCount = typeof metadata.sold_count === 'number' ? 
                  metadata.sold_count : Number(metadata.sold_count) || 0;
              }
              
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
                  soldCount={soldCount}
                />
              );
            })}
          </div>
          
          {/* Pagination */}
          <Pagination className="mt-8">
            <PaginationContent>
              {/* Previous page button */}
              <PaginationItem>
                {currentPage === 1 ? (
                  <button className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-10 px-4 py-2 gap-1 pl-2.5" disabled>
                    <span className="sr-only">Go to previous page</span>
                    <span>Previous</span>
                  </button>
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
              
              {/* Next page button */}
              <PaginationItem>
                {currentPage === totalPages ? (
                  <button className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-10 px-4 py-2 gap-1 pr-2.5" disabled>
                    <span className="sr-only">Go to next page</span>
                    <span>Next</span>
                  </button>
                ) : (
                  <PaginationNext onClick={() => handlePageChange(Math.min(totalPages, currentPage + 1))} />
                )}
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        </>
      ) : (
        <div className="flex flex-col items-center justify-center py-16 text-center bg-white border border-gray-200 rounded-lg">
          <ShoppingBag className="h-12 w-12 text-gray-300 mb-4" />
          <h2 className="text-xl font-medium text-gray-900 mb-2">No products found</h2>
          <p className="text-gray-500 max-w-md">
            Try changing your filters or search term.
          </p>
        </div>
      )}
    </Container>
  );
};

export default Products;
