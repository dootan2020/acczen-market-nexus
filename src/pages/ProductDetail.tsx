
import React, { useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useProduct, useRelatedProducts } from '@/hooks/useProduct';
import { Container } from "@/components/ui/container";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowLeft } from "lucide-react";
import { Link } from 'react-router-dom';

// Import product components
import ProductHeader from '@/components/products/ProductHeader';
import ProductImageGallery from '@/components/products/ProductImageGallery';
import ProductInfo from '@/components/products/ProductInfo';
import ProductSpecifications from '@/components/products/ProductSpecifications';
import ProductPurchase from '@/components/products/ProductPurchase';
import ProductReviews from '@/components/products/ProductReviews';
import RelatedProducts from '@/components/products/RelatedProducts';

const ProductDetail: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const { data: product, isLoading, error } = useProduct(slug || '');
  const { data: relatedProducts = [] } = useRelatedProducts(
    product?.category_id || '', 
    product?.id || ''
  );

  useEffect(() => {
    // Scroll to top when product changes
    window.scrollTo(0, 0);
  }, [slug]);

  if (error) {
    return (
      <Container className="py-12">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600 mb-2">Product Not Found</h1>
          <p className="text-gray-600 mb-6">The product you're looking for doesn't exist or has been removed.</p>
          <Button asChild>
            <Link to="/products">Return to Products</Link>
          </Button>
        </div>
      </Container>
    );
  }

  return (
    <div className="bg-background min-h-screen">
      {/* Back to products navigation */}
      <Container className="py-4">
        <Link to="/products" className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground transition-colors">
          <ArrowLeft className="mr-1 h-4 w-4" />
          Back to Products
        </Link>
      </Container>

      <Container className="pb-16">
        {isLoading ? (
          <ProductDetailSkeleton />
        ) : (
          <>
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mb-12">
              {/* Left column - Product images */}
              <div className="lg:col-span-6 xl:col-span-5">
                <ProductImageGallery 
                  imageUrl={product?.image_url} 
                  name={product?.name}
                  salePrice={product?.sale_price}
                  categoryName={product?.category?.name}
                  images={product?.images || [product?.image_url].filter(Boolean) as string[]}
                />
              </div>

              {/* Right column - Product info */}
              <div className="lg:col-span-6 xl:col-span-7">
                <div className="sticky top-24">
                  <ProductHeader 
                    name={product?.name || ''} 
                    categoryName={product?.category?.name || ''}
                  />
                  
                  <ProductPurchase 
                    product={product}
                    stock={product?.stock_quantity || 0}
                  />
                  
                  <div className="mt-8">
                    <ProductSpecifications product={product} />
                  </div>
                </div>
              </div>
            </div>

            {/* Product info section */}
            <div className="mt-16">
              <h2 className="text-2xl font-bold mb-6">Product Information</h2>
              <ProductInfo description={product?.description || ''} />
            </div>

            {/* Separator */}
            <Separator className="my-12" />

            {/* Reviews section */}
            <div className="mt-16">
              {product?.id && <ProductReviews productId={product.id} />}
            </div>

            {/* Related products */}
            {relatedProducts.length > 0 && (
              <div className="mt-20">
                <h2 className="text-2xl font-bold mb-8">Related Products</h2>
                <RelatedProducts products={relatedProducts} />
              </div>
            )}
          </>
        )}
      </Container>
    </div>
  );
};

const ProductDetailSkeleton = () => (
  <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
    {/* Left column skeleton */}
    <div className="lg:col-span-6 xl:col-span-5">
      <div className="aspect-square bg-slate-100 rounded-lg"></div>
      <div className="flex gap-2 mt-4">
        {[1, 2, 3, 4].map((i) => (
          <Skeleton key={i} className="h-16 w-16 rounded-md" />
        ))}
      </div>
    </div>

    {/* Right column skeleton */}
    <div className="lg:col-span-6 xl:col-span-7 space-y-6">
      <Skeleton className="h-10 w-3/4" />
      <Skeleton className="h-6 w-1/3" />
      <div className="space-y-4 mt-6">
        <Skeleton className="h-7 w-1/4" />
        <Skeleton className="h-12 w-1/3" />
      </div>
      <div className="space-y-4 mt-6">
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-10 w-full" />
      </div>
      <div className="space-y-2 mt-6">
        {[1, 2, 3].map((i) => (
          <Skeleton key={i} className="h-4 w-full" />
        ))}
      </div>
    </div>
  </div>
);

export default ProductDetail;
