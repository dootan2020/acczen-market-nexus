
import React, { memo } from "react";
import ProductCard from "@/components/ProductCard";
import MobileProductCard from "@/components/mobile/MobileProductCard";
import { useIsMobile } from "@/hooks/use-mobile";

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

// Use React.memo to prevent unnecessary re-renders
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
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="rounded-lg bg-muted animate-pulse h-64 md:h-72"></div>
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
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-4">
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
