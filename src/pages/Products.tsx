
import React from 'react';
import { useProducts } from '@/hooks/useProducts';
import ProductCard from '@/components/ProductCard';
import { Skeleton } from '@/components/ui/skeleton';
import { AlertCircle, ShoppingBag } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

const Products = () => {
  const { data: products, isLoading, error } = useProducts();

  // Render loading skeleton
  if (isLoading) {
    return (
      <div className="container mx-auto p-8">
        <h1 className="text-3xl font-bold mb-6">Sản phẩm</h1>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
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
      <div className="container mx-auto p-8">
        <h1 className="text-3xl font-bold mb-6">Sản phẩm</h1>
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
  if (!products || products.length === 0) {
    return (
      <div className="container mx-auto p-8">
        <h1 className="text-3xl font-bold mb-6">Sản phẩm</h1>
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
    <div className="container mx-auto p-8">
      <h1 className="text-3xl font-bold mb-6">Sản phẩm</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {products.map((product) => (
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
            featured={product.metadata?.featured}
            rating={product.metadata?.rating}
            reviewCount={product.metadata?.review_count}
            isNew={product.metadata?.is_new}
            isBestSeller={product.metadata?.is_best_seller}
            description={product.description?.substring(0, 100)}
            soldCount={product.metadata?.sold_count}
          />
        ))}
      </div>
    </div>
  );
};

export default Products;
