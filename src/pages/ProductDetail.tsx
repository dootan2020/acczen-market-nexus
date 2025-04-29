
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
import { Star } from "lucide-react";

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
      <Container className="py-8 md:py-12">
        <div className="animate-pulse space-y-8">
          <div className="h-10 bg-gray-200 rounded w-2/3"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="aspect-square bg-gray-200 rounded-lg"></div>
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
      <Container className="py-8 md:py-12">
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16">
            <h1 className="text-2xl font-bold mb-4 font-poppins">Product Not Found</h1>
            <p className="text-muted-foreground font-inter">
              Sorry, we couldn't find the product you're looking for.
            </p>
          </CardContent>
        </Card>
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
    <div className="bg-[#FFFFFF] py-8 md:py-12">
      <Container>
        {/* Breadcrumb */}
        <Breadcrumb className="mb-6">
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
            
            <BreadcrumbItem>
              <BreadcrumbLink asChild>
                <Link to={`/category/${product.category?.id || ''}`}>
                  {product.category?.name || 'Danh mục'}
                </Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            
            <BreadcrumbItem>
              <BreadcrumbPage>{product.name}</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
        
        {/* Main Product Section */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-8 mb-12">
          {/* Product Gallery - 40% on desktop */}
          <div className="md:col-span-2">
            <Card className="overflow-hidden rounded-lg shadow-md">
              <div className="relative">
                <div className="absolute top-4 left-4 flex gap-1.5 flex-wrap z-10">
                  {isFeatured && <ProductBadge type="featured" />}
                  {isNew && <ProductBadge type="new" />}
                  {isBestSeller && <ProductBadge type="bestSeller" />}
                  {isOnSale && <ProductBadge type="sale" />}
                </div>
                
                <ProductImageGallery 
                  imageUrl={product.image_url || '/placeholder.svg'} 
                  name={product.name}
                  salePrice={product.sale_price}
                  categoryName={product.category?.name}
                />
              </div>
              
              <div className="p-4 border-t border-gray-100">
                <StockSoldBadges 
                  stock={product.stock_quantity} 
                  soldCount={soldCount} 
                />
              </div>
            </Card>
          </div>
          
          {/* Product Information - 60% on desktop */}
          <div className="md:col-span-3">
            <Card className="overflow-hidden rounded-lg shadow-md p-6 h-full flex flex-col">
              {/* Product Title & Rating */}
              <div className="mb-4">
                <h1 className="text-2xl md:text-3xl font-bold text-[#333333] mb-3 font-poppins">
                  {product.name}
                </h1>
                
                <div className="flex items-center gap-2">
                  <div className="flex">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star
                        key={star}
                        className={`h-4 w-4 ${
                          star <= Math.floor(rating)
                            ? "fill-yellow-400 text-yellow-400"
                            : star <= rating
                              ? "fill-yellow-400/50 text-yellow-400/50"
                              : "text-gray-300"
                        }`}
                      />
                    ))}
                  </div>
                  <span className="text-sm text-gray-500">({reviewCount} đánh giá)</span>
                </div>
              </div>
              
              {/* Price Section */}
              <div className="mb-6">
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl font-bold text-[#2ECC71] font-poppins">
                    ${product.sale_price || product.price}
                  </span>
                  
                  {isOnSale && (
                    <span className="text-lg text-muted-foreground line-through">
                      ${product.price}
                    </span>
                  )}
                  
                  {isOnSale && (
                    <Badge variant="destructive" className="ml-2 text-xs font-medium">
                      {discountPercentage}% giảm giá
                    </Badge>
                  )}
                </div>
              </div>
              
              {/* Short Description */}
              <div className="mb-6 prose prose-sm max-w-none text-[#333333] font-inter">
                {stripHtmlTags(product.description || 'No description available.')}
              </div>
              
              {/* Product Actions */}
              <div className="mt-auto">
                <ProductInfo 
                  id={product.id}
                  name={product.name}
                  description={stripHtmlTags(product.description || '')}
                  price={product.price}
                  salePrice={product.sale_price}
                  stockQuantity={product.stock_quantity}
                  image={product.image_url || '/placeholder.svg'}
                  rating={rating}
                  reviewCount={reviewCount}
                  soldCount={soldCount}
                  kiosk_token={product.kiosk_token}
                />
                
                <ProductInventoryStatus
                  stockQuantity={product.stock_quantity}
                  lastChecked={new Date().toISOString()}
                />
              </div>
            </Card>
          </div>
        </div>
        
        {/* Benefits & Trust Indicators Section */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-12">
          <div className="md:col-span-2">
            <ProductBenefits />
          </div>
          
          <div className="bg-[#F9FAFB] p-4 rounded-lg shadow-sm flex flex-col gap-4">
            <div className="flex items-start gap-3 p-3 bg-white rounded-md shadow-sm">
              <ShieldCheck className="text-[#2ECC71] h-6 w-6 flex-shrink-0" />
              <div>
                <h3 className="font-semibold text-sm mb-1 font-poppins">Secure Payment</h3>
                <p className="text-sm text-gray-600 font-inter">All transactions are protected with secure encryption</p>
              </div>
            </div>
            
            <div className="flex items-start gap-3 p-3 bg-white rounded-md shadow-sm">
              <Lock className="text-[#3498DB] h-6 w-6 flex-shrink-0" />
              <div>
                <h3 className="font-semibold text-sm mb-1 font-poppins">Privacy Protected</h3>
                <p className="text-sm text-gray-600 font-inter">Your information is never shared with third parties</p>
              </div>
            </div>
            
            <TrustBadges variant="compact" />
          </div>
        </div>
        
        {/* Product Tabs - Description, Specs, Reviews */}
        <div className="mb-12">
          <Card className="overflow-hidden">
            <CardContent className="p-0">
              <ProductDescription 
                description={product.description || 'No description available.'} 
                specifications={specifications}
                usage={usageInstructions}
              />
            </CardContent>
          </Card>
        </div>
        
        {/* Related Products */}
        {relatedProducts && relatedProducts.length > 0 && (
          <div className="mb-12">
            <h2 className="text-2xl font-bold mb-6 text-[#333333] font-poppins">Sản Phẩm Liên Quan</h2>
            <RelatedProducts products={relatedProducts} />
          </div>
        )}
      </Container>
    </div>
  );
};

export default ProductDetail;
