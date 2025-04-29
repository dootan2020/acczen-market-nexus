
import React, { memo } from "react";
import ProductCard from "@/components/ProductCard";
import MobileProductCard from "@/components/mobile/MobileProductCard";
import { useIsMobile } from "@/hooks/use-mobile";
import { Skeleton } from '@/components/ui/skeleton';

interface Product {
  id: string;
  name: string;
  image: string;
  price: number;
  salePrice?: number;
  category: string;
  subcategory?: string;
  stock: number;
  featured?: boolean;
  kioskToken?: string;
}

interface ProductsListProps {
  products: Product[];
  loading?: boolean;
  emptyMessage?: string;
}

// Sử dụng React.memo để ngăn re-render không cần thiết
const MemoizedProductCard = memo(ProductCard);
const MemoizedMobileProductCard = memo(MobileProductCard);

export const ProductsList: React.FC<ProductsListProps> = ({
  products,
  loading = false,
  emptyMessage = "Không có sản phẩm nào",
}) => {
  const isMobile = useIsMobile();

  if (loading) {
    return (
      <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <Skeleton key={i} className="rounded-lg h-64 md:h-72" />
        ))}
      </div>
    );
  }

  if (products.length === 0) {
    return (
      <div className="flex justify-center items-center py-16 text-muted-foreground">
        {emptyMessage}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-4">
      {products.map((product) => (
        isMobile ? (
          <MemoizedMobileProductCard key={product.id} {...product} />
        ) : (
          <MemoizedProductCard key={product.id} {...product} />
        )
      ))}
    </div>
  );
};

export default memo(ProductsList);
