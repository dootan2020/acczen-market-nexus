
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
      <Container>
        <div className="py-12">
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
        </div>
      </Container>
    );
  }
  
  if (error || !product) {
    return (
      <Container>
        <div className="py-12">
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-16">
              <h1 className="text-2xl font-bold mb-4 font-poppins">Không tìm thấy sản phẩm</h1>
              <p className="text-muted-foreground font-inter">
                Xin lỗi, chúng tôi không thể tìm thấy sản phẩm bạn đang tìm kiếm.
              </p>
            </CardContent>
          </Card>
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
    <div className="bg-white min-h-screen">
      <Container>
        {/* Breadcrumb Navigation - Improved visibility */}
        <Breadcrumb className="py-4 mb-2">
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink asChild>
                <Link to="/" className="flex items-center hover:text-primary transition-colors">
                  <Home className="h-3.5 w-3.5 mr-1.5" />
                  <span>Trang chủ</span>
                </Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            
            <BreadcrumbItem>
              <BreadcrumbLink asChild>
                <Link to={`/category/${product.category?.id || ''}`} className="hover:text-primary transition-colors">
                  {product.category?.name || 'Danh mục'}
                </Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            
            <BreadcrumbItem>
              <BreadcrumbPage className="font-medium">{product.name}</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
        
        {/* Main Product Section - Enhanced Layout */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16">
          {/* Product Gallery - With improved visual appeal */}
          <div className="md:sticky md:top-24 self-start">
            <Card className="overflow-hidden rounded-xl shadow-md border-0">
              <div className="relative">
                <div className="absolute top-4 left-4 z-10 flex gap-2 flex-wrap">
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
              
              <div className="p-4 bg-gray-50">
                <StockSoldBadges 
                  stock={product.stock_quantity} 
                  soldCount={soldCount} 
                />
              </div>
            </Card>
          </div>
          
          {/* Product Information - Restructured for clarity */}
          <div className="flex flex-col gap-6">
            {/* Product Header */}
            <div>
              <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold text-gray-800 font-poppins mb-3 leading-tight">
                {product.name}
              </h1>
              
              <div className="flex items-center gap-2 mb-4">
                <div className="flex">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                      key={star}
                      className={`h-5 w-5 ${
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
              
              {/* Price Section - More prominent */}
              <div className="p-4 bg-gray-50 rounded-lg mb-6">
                <div className="flex items-baseline gap-3 flex-wrap">
                  <span className="text-3xl font-bold text-primary font-poppins">
                    ${product.sale_price || product.price}
                  </span>
                  
                  {isOnSale && (
                    <>
                      <span className="text-lg text-muted-foreground line-through">
                        ${product.price}
                      </span>
                      
                      <Badge variant="destructive" className="ml-1">
                        {discountPercentage}% giảm giá
                      </Badge>
                    </>
                  )}
                </div>
              </div>
              
              {/* Short Description */}
              <div className="prose prose-sm max-w-none text-gray-600 mb-6 font-inter">
                {stripHtmlTags(product.description || 'No description available.')}
              </div>
            </div>
            
            {/* Product Actions - Purchase & Inventory */}
            <Card className="overflow-hidden rounded-xl shadow-sm border-0">
              <CardContent className="p-5">
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
              </CardContent>
            </Card>
            
            {/* Trust Elements */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="flex items-start gap-3 p-4 bg-white rounded-lg shadow-sm border border-gray-100 transition-shadow hover:shadow">
                <ShieldCheck className="text-primary h-6 w-6 flex-shrink-0" />
                <div>
                  <h3 className="font-semibold text-sm mb-1 font-poppins">Thanh toán an toàn</h3>
                  <p className="text-xs text-gray-600 font-inter">Tất cả giao dịch đều được bảo vệ bằng mã hóa bảo mật</p>
                </div>
              </div>
              
              <div className="flex items-start gap-3 p-4 bg-white rounded-lg shadow-sm border border-gray-100 transition-shadow hover:shadow">
                <Lock className="text-accent h-6 w-6 flex-shrink-0" />
                <div>
                  <h3 className="font-semibold text-sm mb-1 font-poppins">Bảo vệ quyền riêng tư</h3>
                  <p className="text-xs text-gray-600 font-inter">Thông tin của bạn không được chia sẻ với bên thứ ba</p>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-16">
          {/* Benefits Section - Left */}
          <div className="lg:col-span-2">
            <h2 className="text-xl font-bold mb-4 text-gray-800 font-poppins">Ưu đãi khi mua tại chúng tôi</h2>
            <ProductBenefits />
          </div>
          
          {/* Trust Badges - Right */}
          <div>
            <h2 className="text-xl font-bold mb-4 text-gray-800 font-poppins">Chúng tôi cam kết</h2>
            <TrustBadges />
          </div>
        </div>
        
        {/* Product Tabs - Detailed Information */}
        <div className="mb-16">
          <h2 className="text-xl font-bold mb-4 text-gray-800 font-poppins">Thông tin chi tiết</h2>
          <Card className="overflow-hidden rounded-xl shadow-md border-0">
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
          <div className="mb-16">
            <h2 className="text-2xl font-bold mb-6 text-gray-800 font-poppins">Sản Phẩm Liên Quan</h2>
            <RelatedProducts products={relatedProducts} />
          </div>
        )}
      </Container>
    </div>
  );
};

export default ProductDetail;
