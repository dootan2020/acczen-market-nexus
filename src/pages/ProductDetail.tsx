
import React, { useState, Suspense } from 'react';
import { useParams } from 'react-router-dom';
import { Container } from "@/components/ui/container";
import { useProduct, useRelatedProducts } from "@/hooks/useProduct";
import { SEO } from "@/components/seo/SEO";
import ProductHeader from "@/components/products/ProductHeader";
import ProductImageGallery from "@/components/products/ProductImageGallery";
import ProductInfo from "@/components/products/ProductInfo";
import ProductDescription from "@/components/products/ProductDescription";
import ProductInventoryStatus from "@/components/products/ProductInventoryStatus";
import ProductBenefits from "@/components/products/ProductBenefits";
import ErrorBoundary from "@/components/error/ErrorBoundary";
import { Card, CardContent } from "@/components/ui/card";
import TrustBadges from "@/components/trust/TrustBadges";

// Lazy load non-critical components
const ProductReviews = React.lazy(() => import("@/components/products/ProductReviews"));
const RelatedProducts = React.lazy(() => import("@/components/products/RelatedProducts"));

const ProductDetail = () => {
  const { slug } = useParams<{ slug: string }>();
  const { data: product, isLoading, error } = useProduct(slug || '');
  const [quantity, setQuantity] = useState(1);
  
  const { data: relatedProducts } = useRelatedProducts(
    product?.category_id || '',
    product?.id || ''
  );
  
  if (isLoading) {
    return (
      <Container className="py-16">
        <div className="animate-pulse space-y-8">
          <div className="h-10 bg-gray-200 rounded w-2/3"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="aspect-square bg-gray-200 rounded"></div>
            <div className="space-y-4">
              <div className="h-8 bg-gray-200 rounded w-3/4"></div>
              <div className="h-4 bg-gray-200 rounded w-1/2"></div>
              <div className="h-12 bg-gray-200 rounded w-1/3"></div>
              <div className="h-32 bg-gray-200 rounded"></div>
            </div>
          </div>
        </div>
      </Container>
    );
  }
  
  if (error || !product) {
    return (
      <Container className="py-16">
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16">
            <h1 className="text-2xl font-bold mb-4">Không tìm thấy sản phẩm</h1>
            <p className="text-muted-foreground">
              Sản phẩm bạn đang tìm kiếm không tồn tại hoặc đã bị xóa.
            </p>
          </CardContent>
        </Card>
      </Container>
    );
  }

  // Product schema data for SEO
  const productSchema = {
    '@context': 'https://schema.org/',
    '@type': 'Product',
    name: product.name,
    description: product.description || '',
    image: product.image_url || '',
    sku: product.id,
    brand: {
      '@type': 'Brand',
      name: 'AccZen',
    },
    offers: {
      '@type': 'Offer',
      url: window.location.href,
      price: product.sale_price || product.price,
      priceCurrency: 'VND',
      availability: product.stock_quantity > 0 
        ? 'https://schema.org/InStock' 
        : 'https://schema.org/OutOfStock',
    },
  };
  
  return (
    <>
      <SEO 
        title={product.name}
        description={product.description ? product.description.substring(0, 160) : ''}
        image={product.image_url || ''}
        type="product"
        schemaMarkup={productSchema}
      />
      
      <div>
        <Container className="py-8 md:py-12">
          <ProductHeader
            name={product.name}
            categoryName={product.category?.name || ''}
            rating={4.5} // Example rating
            reviewCount={10} // Example review count
          />
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12 mb-12">
            <ProductImageGallery 
              imageUrl={product.image_url || '/placeholder.svg'} 
              name={product.name}
              salePrice={product.sale_price}
              categoryName={product.category?.name}
            />
            
            <div className="space-y-6">
              <ProductInfo 
                id={product.id}
                name={product.name}
                description={product.description || ''}
                price={product.price}
                salePrice={product.sale_price}
                stockQuantity={product.stock_quantity}
                image={product.image_url || '/placeholder.svg'}
                rating={4.5} // Example rating
                reviewCount={10} // Example review count
                soldCount={50} // Example sold count
                kiosk_token={product.kiosk_token}
              />
              
              <ProductInventoryStatus
                stockQuantity={product.stock_quantity}
                lastChecked={new Date().toISOString()} // Example timestamp
              />
              
              <ProductBenefits />
              
              <div className="pt-4">
                <TrustBadges variant="compact" />
              </div>
            </div>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
            <div className="lg:col-span-2">
              <ProductDescription description={product.description || ''} />
            </div>
          </div>
          
          <ErrorBoundary>
            <Suspense fallback={<div className="h-40 bg-gray-100 rounded-lg animate-pulse"></div>}>
              <div className="mb-12">
                <ProductReviews productId={product.id} />
              </div>
            </Suspense>
          </ErrorBoundary>
          
          {relatedProducts && relatedProducts.length > 0 && (
            <ErrorBoundary>
              <Suspense fallback={<div className="h-60 bg-gray-100 rounded-lg animate-pulse"></div>}>
                <div className="mb-12">
                  <RelatedProducts products={relatedProducts} />
                </div>
              </Suspense>
            </ErrorBoundary>
          )}
        </Container>
      </div>
    </>
  );
};

export default ProductDetail;
