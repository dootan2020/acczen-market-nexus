
import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Container } from "@/components/ui/container";
import { useProduct, useRelatedProducts } from "@/hooks/useProduct";
import ProductImageGallery from "@/components/products/ProductImageGallery";
import ProductInfo from "@/components/products/ProductInfo";
import ProductDescription from "@/components/products/ProductDescription";
import ProductInventoryStatus from "@/components/products/ProductInventoryStatus";
import ProductBenefits from "@/components/products/ProductBenefits";
import { Card, CardContent } from "@/components/ui/card";
import RelatedProducts from "@/components/products/RelatedProducts";
import TrustBadges from "@/components/trust/TrustBadges";
import StockSoldBadges from "@/components/products/inventory/StockSoldBadges";
import ProductBadge from "@/components/products/ProductBadge";
import { stripHtmlTags } from '@/utils/htmlUtils';
import { 
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbSeparator,
  BreadcrumbPage
} from "@/components/ui/breadcrumb";
import { Home, ShieldCheck, Lock } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import ProductHeader from "@/components/products/ProductHeader";
import ProductPricing from "@/components/products/ProductPricing";

const ProductDetail = () => {
  const { slug } = useParams<{ slug: string }>();
  const { data: product, isLoading, error } = useProduct(slug || '');
  const [quantity, setQuantity] = useState(1);
  
  const { data: relatedProducts } = useRelatedProducts(
    product?.category_id || '',
    product?.id || ''
  );
  
  // Mock rating data (in a real app this would come from API)
  const rating = 4.5;
  const reviewCount = 23;
  
  if (isLoading) {
    return (
      <Container>
        <div className="py-16 flex items-center justify-center">
          <div className="animate-pulse flex flex-col w-full max-w-5xl">
            <div className="h-4 bg-gray-200 rounded w-1/3 mb-6"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="bg-gray-200 rounded-lg aspect-square"></div>
              <div className="space-y-4">
                <div className="h-8 bg-gray-200 rounded w-3/4"></div>
                <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                <div className="h-12 bg-gray-200 rounded w-1/3"></div>
                <div className="h-40 bg-gray-200 rounded"></div>
                <div className="h-12 bg-gray-200 rounded-lg"></div>
              </div>
            </div>
          </div>
        </div>
      </Container>
    );
  }
  
  if (error || !product) {
    return (
      <Container>
        <div className="py-16 text-center">
          <div className="mb-6 text-destructive">
            <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mx-auto mb-4"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>
            <h2 className="text-2xl font-bold">Could not load product details</h2>
          </div>
          <p className="text-muted-foreground mb-8">We're sorry, but we couldn't retrieve the product information at this time.</p>
          <Link to="/products" className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2">
            Return to Products
          </Link>
        </div>
      </Container>
    );
  }

  // Determine if product is featured, on sale, or new
  const isFeatured = true; // Example, set based on your criteria
  const isOnSale = product.sale_price && product.sale_price < product.price;
  const isNew = false; // Example, could be based on creation date
  const isBestSeller = false; // Example, could be based on sales metrics
  
  // Extract product images or use the main image
  const productImages = product.image_url ? [product.image_url] : [];
  
  // Example sold count (replace with actual data if available)
  const soldCount = 50;
  
  // Calculate discount percentage if on sale
  const discountPercentage = isOnSale 
    ? Math.round(((product.price - (product.sale_price || 0)) / product.price) * 100) 
    : 0;

  // Extract specifications and usage instructions from metadata or set defaults
  const specifications = product.metadata && typeof product.metadata === 'object' 
    ? (product.metadata as any).specifications || null 
    : null;
  
  const usageInstructions = product.metadata && typeof product.metadata === 'object'
    ? (product.metadata as any).usage_instructions || null
    : null;
  
  return (
    <div className="bg-background pb-16">
      {/* Breadcrumbs */}
      <div className="bg-muted/50 py-4 border-b">
        <Container>
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink asChild>
                  <Link to="/">
                    <Home className="h-3.5 w-3.5 mr-1" />
                    <span>Trang chủ</span>
                  </Link>
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              {product.category && (
                <>
                  <BreadcrumbItem>
                    <BreadcrumbLink asChild>
                      <Link to={`/category/${product.category.slug}`}>
                        {product.category.name}
                      </Link>
                    </BreadcrumbLink>
                  </BreadcrumbItem>
                  <BreadcrumbSeparator />
                </>
              )}
              <BreadcrumbItem>
                <BreadcrumbPage>{product.name}</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </Container>
      </div>
            
      <Container className="py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12">
          {/* Left Column: Product Image */}
          <div className="relative">
            <ProductImageGallery 
              imageUrl={product.image_url}
              name={product.name}
              images={productImages}
              categoryName={product.category?.name}
              salePrice={product.sale_price}
            />
            
            {/* Badges */}
            <div className="absolute top-4 left-4 flex flex-col gap-2">
              {isFeatured && (
                <ProductBadge type="featured" label="Featured" />
              )}
              {isOnSale && (
                <ProductBadge type="sale" label={`-${discountPercentage}%`} />
              )}
              {isNew && (
                <ProductBadge type="new" label="New" />
              )}
              {isBestSeller && (
                <ProductBadge type="bestseller" label="Best Seller" />
              )}
            </div>
          </div>
            
          {/* Right Column: Product Info */}
          <div className="flex flex-col">
            <div className="mb-6">
              <ProductHeader 
                name={product.name}
                slug={slug}
                categoryName={product.category?.name}
                categorySlug={product.category?.slug}
                rating={rating}
                reviewCount={reviewCount}
              />
            </div>
            
            <ProductPricing 
              price={product.price}
              salePrice={product.sale_price}
              stockQuantity={product.stock_quantity}
              soldCount={soldCount}
            />
            
            {/* Product Actions */}
            <Card className="bg-card/50 border shadow-sm mb-6">
              <CardContent className="p-6">
                <ProductInventoryStatus 
                  stockQuantity={product.stock_quantity}
                  lastChecked={product.updated_at}
                  kioskToken={product.kiosk_token}
                />
                
                <ProductInfo
                  id={product.id}
                  name={product.name}
                  description={stripHtmlTags(product.description)}
                  price={product.price}
                  salePrice={product.sale_price}
                  stockQuantity={product.stock_quantity}
                  image={product.image_url || ''}
                  rating={rating}
                  reviewCount={reviewCount}
                  soldCount={soldCount}
                  kiosk_token={product.kiosk_token}
                />
              </CardContent>
            </Card>
            
            {/* Trust Badges */}
            <div className="flex items-center justify-between mb-6 p-4 bg-muted/30 rounded-lg">
              <div className="flex items-center gap-2">
                <ShieldCheck className="h-5 w-5 text-primary" />
                <span className="text-sm font-medium">Secure Payments</span>
              </div>
              <div className="flex items-center gap-2">
                <Lock className="h-5 w-5 text-primary" />
                <span className="text-sm font-medium">Privacy Protected</span>
              </div>
            </div>
          </div>
        </div>
            
        {/* Product Description Tabs */}
        <div className="mt-10">
          <ProductDescription 
            description={product.description}
            specifications={specifications}
            usage={usageInstructions}
          />
        </div>
            
        {/* Product Benefits */}
        <div className="mt-12">
          <h2 className="text-2xl font-bold mb-6">Ưu đãi khi mua tại Digital Deals Hub</h2>
          <ProductBenefits />
        </div>
            
        {/* Related Products */}
        {relatedProducts && relatedProducts.length > 0 && (
          <div className="mt-16">
            <h2 className="text-2xl font-bold mb-6">Sản phẩm tương tự</h2>
            <RelatedProducts products={relatedProducts} />
          </div>
        )}
      </Container>
    </div>
  );
};

export default ProductDetail;
