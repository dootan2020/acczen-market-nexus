
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
import ProductPricing from '@/components/products/ProductPricing';
import { 
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbSeparator,
  BreadcrumbPage
} from "@/components/ui/breadcrumb";
import { Home, ShieldCheck, Lock, Heart, ShoppingBag, Star } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import RichTextContent from "@/components/RichTextContent";
import { cn } from "@/lib/utils";

const ProductDetail = () => {
  const { slug } = useParams<{ slug: string }>();
  const { data: product, isLoading, error } = useProduct(slug || '');
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState('description');
  const [isFavorited, setIsFavorited] = useState(false);
  
  const { data: relatedProducts } = useRelatedProducts(
    product?.category_id || '',
    product?.id || ''
  );
  
  // Mock rating data (in a real app this would come from API)
  const rating = 4.5;
  const reviewCount = 23;
  
  if (isLoading) {
    return (
      <Container className="py-8">
        <div className="flex flex-col items-center justify-center min-h-[300px]">
          <div className="w-16 h-16 border-4 border-[#19C37D] border-t-transparent rounded-full animate-spin"></div>
          <p className="mt-4 text-lg font-medium text-gray-600">Đang tải thông tin sản phẩm...</p>
        </div>
      </Container>
    );
  }
  
  if (error || !product) {
    return (
      <Container className="py-8">
        <div className="flex flex-col items-center justify-center min-h-[300px] bg-red-50 rounded-lg p-8">
          <div className="text-red-500 mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="w-16 h-16">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <h3 className="text-xl font-bold text-red-800 mb-2">Không thể tải thông tin sản phẩm</h3>
          <p className="text-red-600 mb-4">Vui lòng thử lại sau hoặc chọn sản phẩm khác</p>
          <Link to="/products" className="px-4 py-2 bg-[#19C37D] hover:bg-[#15a76b] text-white rounded-md transition-colors">
            Xem sản phẩm khác
          </Link>
        </div>
      </Container>
    );
  }

  // Determine if product is featured, on sale, or new
  const isFeatured = true; // Example, set based on your criteria
  const isOnSale = product.sale_price && product.sale_price < product.price;
  const isNew = false; // Example, could be based on creation date
  
  // Extract product images or use the main image
  const productImages = product.image_url ? [product.image_url] : [];
  
  // Example sold count (replace with actual data if available)
  const soldCount = 50;
  
  // Calculate discount percentage if on sale
  const discountPercentage = isOnSale 
    ? Math.round(((product.price - (product.sale_price || 0)) / product.price) * 100) 
    : 0;

  const handleFavoriteToggle = () => {
    setIsFavorited(!isFavorited);
  };

  // Extract specifications and usage instructions from metadata
  const specifications = product.metadata && typeof product.metadata === 'object' 
    ? (product.metadata as any).specifications || null 
    : null;
  
  const usageInstructions = product.metadata && typeof product.metadata === 'object'
    ? (product.metadata as any).usage_instructions || null
    : null;
  
  return (
    <div className="bg-gray-50">
      <Container className="py-8">
        {/* Breadcrumb Navigation */}
        <Breadcrumb className="mb-6 text-sm text-gray-600">
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink asChild>
                <Link to="/" className="hover:text-[#19C37D] flex items-center">
                  <Home className="h-3.5 w-3.5 mr-1" />
                  <span>Trang chủ</span>
                </Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbLink asChild>
                <Link to="/products" className="hover:text-[#19C37D]">Sản phẩm</Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            {product.category && (
              <>
                <BreadcrumbItem>
                  <BreadcrumbLink asChild>
                    <Link 
                      to={`/categories/${product.category?.id}`} 
                      className="hover:text-[#19C37D]"
                    >
                      {product.category?.name}
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

        {/* Product Main Section */}
        <div className="bg-white rounded-xl shadow-sm overflow-hidden mb-10">
          <div className="md:flex">
            {/* Left column - Product Images */}
            <div className="md:w-2/5 p-6">
              <div className="relative">
                {isFeatured && (
                  <div className="absolute top-4 left-4 z-10">
                    <ProductBadge type="featured" />
                  </div>
                )}
                {isOnSale && (
                  <div className="absolute top-4 right-4 z-10">
                    <ProductBadge type="sale" label={`-${discountPercentage}%`} />
                  </div>
                )}
                {isNew && (
                  <div className="absolute top-14 left-4 z-10">
                    <ProductBadge type="new" />
                  </div>
                )}
                <ProductImageGallery
                  imageUrl={product.image_url}
                  name={product.name}
                  salePrice={product.sale_price}
                  images={productImages}
                />
              </div>
            </div>

            {/* Right column - Product Info */}
            <div className="md:w-3/5 p-6 md:border-l border-gray-200">
              <div className="flex justify-between items-start">
                <h1 className="text-2xl font-bold text-gray-800 font-sans mb-2">{product.name}</h1>
                <ProductInventoryStatus stockQuantity={product.stock_quantity} variant="badge" />
              </div>
              
              {/* Rating stars */}
              <div className="flex items-center mb-4">
                <div className="flex mr-2">
                  {[...Array(5)].map((_, i) => (
                    <Star 
                      key={i} 
                      className={`h-4 w-4 ${i < Math.floor(rating) ? 'fill-amber-400 text-amber-400' : i < rating ? 'fill-amber-400/50 text-amber-400/50' : 'text-gray-300'}`} 
                    />
                  ))}
                </div>
                <span className="text-gray-600 text-sm">{rating} ({reviewCount} đánh giá)</span>
              </div>
              
              {/* Inventory info */}
              <StockSoldBadges 
                stock={product.stock_quantity}
                soldCount={soldCount}
              />
              
              {/* Pricing */}
              <ProductPricing 
                price={product.price}
                salePrice={product.sale_price}
                stockQuantity={product.stock_quantity}
                soldCount={soldCount}
              />
              
              {/* Buy/Favorite buttons */}
              <div className="flex flex-col sm:flex-row gap-4 mb-6">
                <Button 
                  onClick={() => {}}
                  size="lg"
                  className="flex-1 bg-[#19C37D] hover:bg-[#15a76b] text-white font-medium transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98] h-12 text-base"
                  disabled={product.stock_quantity <= 0}
                >
                  <ShoppingBag className="mr-2 h-5 w-5 transition-transform hover:rotate-12" />
                  {product.stock_quantity <= 0 ? 'Hết hàng' : 'Mua ngay'}
                </Button>
                
                <Button 
                  onClick={handleFavoriteToggle}
                  variant="outline"
                  size="lg"
                  className={cn(
                    "flex-1 transition-all duration-300 border-2 h-12",
                    isFavorited 
                      ? "border-[#E74C3C] text-[#E74C3C] bg-[#E74C3C]/5 hover:bg-[#E74C3C]/10" 
                      : "border-accent text-accent hover:bg-accent/5"
                  )}
                >
                  <Heart 
                    className={cn(
                      "mr-2 h-5 w-5 transition-all duration-300", 
                      isFavorited ? "fill-[#E74C3C]" : ""
                    )} 
                  />
                  {isFavorited ? 'Đã yêu thích' : 'Yêu thích'}
                </Button>
              </div>
              
              {/* Security info */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="flex items-start mb-3">
                  <ShieldCheck className="text-gray-700 h-5 w-5 mt-1 mr-3" />
                  <div>
                    <h4 className="font-medium text-gray-800 text-sm">Bảo hành an toàn</h4>
                    <p className="text-gray-600 text-xs">Hoàn tiền 100% nếu tài khoản bị khóa trong 30 ngày</p>
                  </div>
                </div>
                <div className="flex items-start">
                  <Lock className="text-gray-700 h-5 w-5 mt-1 mr-3" />
                  <div>
                    <h4 className="font-medium text-gray-800 text-sm">Giao hàng tức thì</h4>
                    <p className="text-gray-600 text-xs">Thông tin tài khoản được gửi tự động qua email</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Description and Reviews Tabs */}
        <div className="bg-white rounded-lg shadow-sm mb-10 overflow-hidden">
          <Tabs defaultValue="description" value={activeTab} onValueChange={setActiveTab}>
            <div className="border-b border-gray-200 bg-gray-50">
              <TabsList className="h-auto bg-transparent w-full flex justify-start p-0">
                <TabsTrigger 
                  value="description" 
                  className="py-4 px-6 rounded-none data-[state=active]:border-b-2 data-[state=active]:border-[#19C37D] data-[state=active]:bg-transparent"
                >
                  Mô tả sản phẩm
                </TabsTrigger>
                <TabsTrigger 
                  value="specifications" 
                  className="py-4 px-6 rounded-none data-[state=active]:border-b-2 data-[state=active]:border-[#19C37D] data-[state=active]:bg-transparent"
                >
                  Thông số kỹ thuật
                </TabsTrigger>
                <TabsTrigger 
                  value="reviews" 
                  className="py-4 px-6 rounded-none data-[state=active]:border-b-2 data-[state=active]:border-[#19C37D] data-[state=active]:bg-transparent"
                >
                  Đánh giá ({reviewCount})
                </TabsTrigger>
                <TabsTrigger 
                  value="faq" 
                  className="py-4 px-6 rounded-none data-[state=active]:border-b-2 data-[state=active]:border-[#19C37D] data-[state=active]:bg-transparent"
                >
                  FAQ
                </TabsTrigger>
              </TabsList>
            </div>
            
            <TabsContent value="description" className="p-6">
              <div className="prose max-w-none">
                {product.description ? (
                  <RichTextContent content={product.description} />
                ) : (
                  <p className="text-gray-500 italic">Không có thông tin mô tả cho sản phẩm này.</p>
                )}
              </div>
            </TabsContent>
            
            <TabsContent value="specifications" className="p-6">
              {specifications ? (
                <div className="prose max-w-none">
                  <RichTextContent content={specifications} />
                </div>
              ) : (
                <div className="text-center py-8">
                  <p className="text-gray-500 italic">Không có thông số kỹ thuật cho sản phẩm này.</p>
                </div>
              )}
            </TabsContent>
            
            <TabsContent value="reviews" className="p-6">
              <div className="mb-8">
                <div className="flex flex-col md:flex-row items-start md:items-center mb-4">
                  <div className="md:mr-4 mb-4 md:mb-0">
                    <div className="text-5xl font-bold text-gray-800">{rating}</div>
                    <div className="flex mt-1">
                      {[...Array(5)].map((_, i) => (
                        <Star 
                          key={i} 
                          className={`h-4 w-4 ${i < Math.floor(rating) ? 'fill-amber-400 text-amber-400' : i < rating ? 'fill-amber-400/50 text-amber-400/50' : 'text-gray-300'}`} 
                        />
                      ))}
                    </div>
                    <div className="text-sm text-gray-500 mt-1">{reviewCount} đánh giá</div>
                  </div>
                  
                  <div className="flex-1 md:ml-4 w-full">
                    {[5, 4, 3, 2, 1].map((stars) => (
                      <div className="flex items-center mb-2" key={stars}>
                        <div className="text-sm font-medium w-14">{stars} sao</div>
                        <div className="flex-1 h-2.5 bg-gray-200 rounded-full">
                          <div 
                            className="h-2.5 bg-amber-400 rounded-full" 
                            style={{ width: `${stars === 5 ? 85 : stars === 4 ? 10 : stars === 3 ? 3 : stars === 2 ? 1 : 1}%` }}
                          ></div>
                        </div>
                        <div className="text-sm font-medium w-14 text-right">
                          {stars === 5 ? '85%' : stars === 4 ? '10%' : stars === 3 ? '3%' : stars === 2 ? '1%' : '1%'}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              
              {/* Review Comments (example) */}
              <div className="space-y-6">
                {/* These would be real reviews from your database */}
                {[
                  { 
                    id: 1, 
                    name: 'Trần Hoàng', 
                    initials: 'TH', 
                    date: '14/05/2023', 
                    rating: 5, 
                    comment: 'Tài khoản hoạt động rất tốt, có đầy đủ tính năng như mô tả. Tôi đã thay đổi mật khẩu và thông tin cá nhân thành công. Hỗ trợ khách hàng phản hồi nhanh khi tôi có thắc mắc. Rất hài lòng với sản phẩm này!' 
                  },
                  { 
                    id: 2, 
                    name: 'Nguyễn Thảo', 
                    initials: 'NT', 
                    date: '02/05/2023', 
                    rating: 5, 
                    comment: 'Nhận tài khoản ngay sau khi thanh toán. Hướng dẫn chi tiết và dễ hiểu. Tôi đã sử dụng được Gmail và các dịch vụ Google khác mà không gặp vấn đề gì. Đặc biệt hài lòng với chế độ bảo hành 30 ngày.' 
                  },
                  { 
                    id: 3, 
                    name: 'Lê Minh', 
                    initials: 'LM', 
                    date: '27/04/2023', 
                    rating: 4, 
                    comment: 'Tài khoản hoạt động tốt, chỉ có một vài vấn đề nhỏ khi thay đổi thông tin khôi phục. Đã liên hệ với bộ phận hỗ trợ và họ đã giúp tôi giải quyết nhanh chóng. Giá cả hợp lý cho một tài khoản đã xác minh đầy đủ.' 
                  }
                ].map((review) => (
                  <div key={review.id} className="border-b border-gray-200 pb-6">
                    <div className="flex justify-between mb-2">
                      <div className="flex items-center">
                        <div className="w-10 h-10 rounded-full bg-gray-300 flex items-center justify-center">
                          <span className="text-gray-600 font-medium">{review.initials}</span>
                        </div>
                        <div className="ml-3">
                          <h4 className="font-medium text-gray-800">{review.name}</h4>
                          <div className="text-xs text-gray-500">{review.date}</div>
                        </div>
                      </div>
                      <div className="flex">
                        {[...Array(5)].map((_, i) => (
                          <Star 
                            key={i} 
                            className={`h-4 w-4 ${i < review.rating ? 'fill-amber-400 text-amber-400' : 'text-gray-300'}`} 
                          />
                        ))}
                      </div>
                    </div>
                    <div className="text-gray-600 text-sm">
                      <p>{review.comment}</p>
                    </div>
                  </div>
                ))}
              </div>
            </TabsContent>
            
            <TabsContent value="faq" className="p-6">
              <div className="space-y-4">
                <div className="border-b pb-4">
                  <h3 className="text-lg font-medium mb-2">Tài khoản email này có thể sử dụng được bao lâu?</h3>
                  <p className="text-gray-600">Tài khoản email của chúng tôi được đảm bảo hoạt động ít nhất 6 tháng. Nếu có vấn đề trong thời gian đó, chúng tôi sẽ cung cấp tài khoản thay thế miễn phí.</p>
                </div>
                <div className="border-b pb-4">
                  <h3 className="text-lg font-medium mb-2">Làm cách nào để nhận thông tin tài khoản sau khi mua?</h3>
                  <p className="text-gray-600">Sau khi thanh toán thành công, thông tin tài khoản sẽ được gửi tự động đến email đăng ký của bạn. Ngoài ra, bạn cũng có thể xem thông tin này trong lịch sử mua hàng trên trang cá nhân.</p>
                </div>
                <div className="border-b pb-4">
                  <h3 className="text-lg font-medium mb-2">Tôi có thể thay đổi mật khẩu sau khi nhận tài khoản không?</h3>
                  <p className="text-gray-600">Có, bạn có thể thay đổi mật khẩu sau khi nhận tài khoản. Chúng tôi khuyến nghị bạn nên thay đổi mật khẩu ngay sau khi nhận được thông tin đăng nhập để đảm bảo tính bảo mật.</p>
                </div>
                <div className="border-b pb-4">
                  <h3 className="text-lg font-medium mb-2">Tôi cần làm gì nếu tài khoản bị khóa hoặc gặp sự cố?</h3>
                  <p className="text-gray-600">Nếu tài khoản gặp sự cố, vui lòng liên hệ với đội ngũ hỗ trợ của chúng tôi qua email support@acczen.net hoặc chat trực tuyến trên trang web. Chúng tôi sẽ hỗ trợ giải quyết trong thời gian sớm nhất.</p>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </div>

        {/* Related Products */}
        {relatedProducts && relatedProducts.length > 0 && (
          <div className="mb-10">
            <h2 className="text-xl font-bold text-gray-800 mb-6">Sản phẩm tương tự</h2>
            <RelatedProducts products={relatedProducts} />
          </div>
        )}
      </Container>
    </div>
  );
};

export default ProductDetail;
