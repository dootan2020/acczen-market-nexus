
import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Container } from "@/components/ui/container";
import { useProduct, useRelatedProducts } from "@/hooks/useProduct";
import ProductImageGallery from "@/components/products/ProductImageGallery";
import ProductInfo from "@/components/products/ProductInfo";
import ProductDescription from "@/components/products/ProductDescription";
import ProductBadge from "@/components/products/ProductBadge";
import { Card } from "@/components/ui/card";
import RelatedProducts from "@/components/products/RelatedProducts";
import TrustBadges from "@/components/trust/TrustBadges";
import { stripHtmlTags } from '@/utils/htmlUtils';
import ProductPricing from '@/components/products/ProductPricing';
import ProductReviews from '@/components/products/ProductReviews';
import { 
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbSeparator,
  BreadcrumbPage
} from "@/components/ui/breadcrumb";
import { Home, ShieldCheck, Lock, Heart, ShoppingBag, Star } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import RichTextContent from "@/components/RichTextContent";
import { cn } from "@/lib/utils";

const ProductDetail = () => {
  console.log("ProductDetail component rendering");
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  
  // Ensure we have a valid slug
  useEffect(() => {
    if (!slug) {
      console.error("No product slug provided");
      navigate('/products');
    } else {
      console.log(`Product detail page for slug: ${slug}`);
    }
  }, [slug, navigate]);
  
  const { data: product, isLoading, error } = useProduct(slug || '');
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState('description');
  const [isFavorited, setIsFavorited] = useState(false);
  const [isTabsSticky, setIsTabsSticky] = useState(false);
  
  const { data: relatedProducts } = useRelatedProducts(
    product?.category_id || '',
    product?.id || ''
  );
  
  console.log("Product detail state:", { 
    slug,
    isLoading, 
    hasError: !!error,
    productFound: !!product,
    productName: product?.name,
    relatedCount: relatedProducts?.length || 0
  });
  
  // Monitor scroll position for sticky tabs
  useEffect(() => {
    const handleScroll = () => {
      const tabsElement = document.getElementById('product-tabs');
      if (tabsElement) {
        const tabsPosition = tabsElement.getBoundingClientRect().top;
        setIsTabsSticky(tabsPosition <= 0);
      }
    };
    
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);
  
  // Mock rating data (in a real app this would come from API)
  const rating = 4.5;
  const reviewCount = 23;
  
  if (isLoading) {
    return (
      <Container className="py-8">
        <div className="flex flex-col items-center justify-center min-h-[300px]">
          <div className="w-16 h-16 border-4 border-[#19C37D] border-t-transparent rounded-full animate-spin"></div>
          <p className="mt-4 text-lg font-medium text-gray-600">Loading product details...</p>
        </div>
      </Container>
    );
  }
  
  if (error || !product) {
    console.error("Product detail error:", error);
    return (
      <Container className="py-8">
        <div className="flex flex-col items-center justify-center min-h-[300px] bg-red-50 rounded-lg p-8">
          <div className="text-red-500 mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="w-16 h-16">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <h3 className="text-xl font-bold text-red-800 mb-2">
            {error ? `Error: ${String(error)}` : 'Product not found'}
          </h3>
          <p className="text-red-600 mb-4">Please try again later or choose another product</p>
          <Link to="/products" className="px-4 py-2 bg-[#19C37D] hover:bg-[#15a76b] text-white rounded-md transition-colors">
            View other products
          </Link>
        </div>
      </Container>
    );
  }

  // Fix product name for internationalization
  const productName = product.name.includes("ngầm trầu") 
    ? "Telegram Premium Account (1-7 days)" 
    : product.name;

  // Determine if product is featured, on sale, or new
  const isFeatured = true; // Example, set based on your criteria
  const isOnSale = product.sale_price && product.sale_price < product.price;
  const isNew = false; // Example, could be based on creation date
  const isBestSeller = product.stock_quantity > 0 && product.stock_quantity < 50; // Example condition
  
  // Extract product images or use the main image
  const productImages = product.image_url ? [product.image_url] : [];
  
  // Example sold count (replace with actual data if available)
  const soldCount = 50;
  
  // Calculate discount percentage if on sale
  const discountPercentage = isOnSale 
    ? Math.round(((product.price - (product.sale_price || 0)) / product.price) * 100) 
    : 0;

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
                <Link to="/" className="hover:text-[#2ECC71] flex items-center">
                  <Home className="h-3.5 w-3.5 mr-1" />
                  <span>Home</span>
                </Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbLink asChild>
                <Link to="/products" className="hover:text-[#2ECC71]">Products</Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            {product.category && (
              <>
                <BreadcrumbItem>
                  <BreadcrumbLink asChild>
                    <Link 
                      to={`/categories/${product.category?.id}`} 
                      className="hover:text-[#2ECC71]"
                    >
                      {product.category?.name}
                    </Link>
                  </BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator />
              </>
            )}
            <BreadcrumbItem>
              <BreadcrumbPage>{productName}</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>

        {/* Product Main Section */}
        <div className="bg-white rounded-xl shadow-md overflow-hidden mb-8">
          <div className="md:grid md:grid-cols-5 lg:grid-cols-5 gap-0">
            {/* Left column - Product Images (40%) */}
            <div className="md:col-span-2 p-6 md:border-r border-gray-200">
              <div className="sticky top-24">
                <div className="relative">
                  {isFeatured && (
                    <div className="absolute top-4 left-4 z-10">
                      <ProductBadge type="featured" />
                    </div>
                  )}
                  {isNew && (
                    <div className="absolute top-4 left-32 z-10">
                      <ProductBadge type="new" />
                    </div>
                  )}
                  {isBestSeller && (
                    <div className="absolute top-14 left-4 z-10">
                      <ProductBadge type="bestSeller" />
                    </div>
                  )}
                  {isOnSale && discountPercentage > 0 && (
                    <div className="absolute top-4 right-4 z-10">
                      <ProductBadge type="sale" percentage={discountPercentage} />
                    </div>
                  )}
                  <ProductImageGallery
                    imageUrl={product.image_url}
                    name={productName}
                    salePrice={product.sale_price}
                    images={productImages}
                  />
                </div>
              </div>
            </div>

            {/* Right column - Product Info (60%) */}
            <div className="md:col-span-3 p-8">
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 font-sans mb-2 leading-tight">
                  {productName}
                </h1>
                
                {/* Inventory summary - consolidated */}
                <div className="flex items-center space-x-2 text-sm mt-2 mb-4">
                  <span className={cn(
                    "inline-flex items-center px-2.5 py-0.5 rounded-full font-medium",
                    product.stock_quantity > 10 
                      ? "bg-green-100 text-green-800" 
                      : product.stock_quantity > 0
                      ? "bg-amber-100 text-amber-800"
                      : "bg-red-100 text-red-800"
                  )}>
                    {product.stock_quantity > 0 
                      ? `In Stock: ${product.stock_quantity} items` 
                      : "Out of Stock"}
                  </span>
                  <span className="text-gray-500">|</span>
                  <span className="text-gray-600">Sold: {soldCount}</span>
                </div>
                
                {/* Rating stars */}
                <div className="flex items-center mb-6">
                  <div className="flex mr-2">
                    {[...Array(5)].map((_, i) => (
                      <Star 
                        key={i} 
                        className={`h-5 w-5 ${i < Math.floor(rating) ? 'fill-amber-400 text-amber-400' : i < rating ? 'fill-amber-400/50 text-amber-400/50' : 'text-gray-300'}`} 
                      />
                    ))}
                  </div>
                  <span className="text-gray-600 text-sm">{rating} ({reviewCount} reviews)</span>
                </div>
                
                {/* Pricing */}
                <ProductPricing 
                  price={product.price}
                  salePrice={product.sale_price}
                  stockQuantity={product.stock_quantity}
                  soldCount={soldCount}
                />
                
                {/* Product Info component with Buy/Favorite buttons */}
                <ProductInfo 
                  id={product.id}
                  name={productName}
                  description={product.description || ''}
                  price={product.price}
                  salePrice={product.sale_price}
                  stockQuantity={product.stock_quantity}
                  image={product.image_url || ''}
                  rating={rating}
                  reviewCount={reviewCount}
                  soldCount={soldCount}
                  kiosk_token={product.kiosk_token}
                />
              </div>
            </div>
          </div>
        </div>
        
        {/* Description and Reviews Tabs */}
        <div id="product-tabs" className="relative">
          <div className={cn(
            "bg-white rounded-lg shadow-sm overflow-hidden transition-all", 
            isTabsSticky ? "sticky top-0 z-30 shadow-md" : ""
          )}>
            <Tabs defaultValue="description" value={activeTab} onValueChange={setActiveTab}>
              <div className={cn(
                "border-b border-gray-200 bg-white",
                isTabsSticky ? "sticky top-0 z-30" : ""
              )}>
                <TabsList className="h-auto bg-transparent w-full flex justify-start p-0">
                  <TabsTrigger 
                    value="description" 
                    className="py-4 px-6 rounded-none data-[state=active]:border-b-2 data-[state=active]:border-[#2ECC71] data-[state=active]:bg-transparent"
                  >
                    Product Description
                  </TabsTrigger>
                  <TabsTrigger 
                    value="specifications" 
                    className="py-4 px-6 rounded-none data-[state=active]:border-b-2 data-[state=active]:border-[#2ECC71] data-[state=active]:bg-transparent"
                  >
                    Specifications
                  </TabsTrigger>
                  <TabsTrigger 
                    value="reviews" 
                    className="py-4 px-6 rounded-none data-[state=active]:border-b-2 data-[state=active]:border-[#2ECC71] data-[state=active]:bg-transparent"
                  >
                    Reviews ({reviewCount})
                  </TabsTrigger>
                  <TabsTrigger 
                    value="faq" 
                    className="py-4 px-6 rounded-none data-[state=active]:border-b-2 data-[state=active]:border-[#2ECC71] data-[state=active]:bg-transparent"
                  >
                    FAQ
                  </TabsTrigger>
                </TabsList>
              </div>
              
              <TabsContent value="description" className="p-6 animate-fade-in">
                <div className="prose max-w-none">
                  {product.description ? (
                    <RichTextContent content={product.description} />
                  ) : (
                    <>
                      <h2 className="text-xl font-semibold mb-4">Telegram Premium Account (1-7 days)</h2>
                      <p className="mb-4">This premium Telegram account gives you access to all premium features for up to 7 days. Perfect for testing and experiencing the enhanced functionalities.</p>
                      <h3 className="text-lg font-semibold mb-3">Key Features:</h3>
                      <ul className="list-disc pl-5 mb-4 space-y-2">
                        <li>Increased upload limit (4GB per file)</li>
                        <li>Double the channels limit (1,000)</li>
                        <li>Access to premium stickers and reactions</li>
                        <li>Ad-free experience</li>
                        <li>Faster download speeds</li>
                        <li>Voice-to-text conversion</li>
                        <li>Premium badges and profile features</li>
                      </ul>
                      <p className="text-gray-700">
                        All accounts are manually verified and guaranteed to work for the specified duration. After purchase, account details will be delivered instantly to your email.
                      </p>
                    </>
                  )}
                </div>
              </TabsContent>
              
              <TabsContent value="specifications" className="p-6 animate-fade-in">
                {specifications ? (
                  <div className="prose max-w-none">
                    <RichTextContent content={specifications} />
                  </div>
                ) : (
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold">Account Specifications</h3>
                    <div className="bg-gray-50 rounded-lg overflow-hidden">
                      <table className="min-w-full divide-y divide-gray-200">
                        <tbody className="divide-y divide-gray-200">
                          <tr className="bg-white">
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">Account Type</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">Premium</td>
                          </tr>
                          <tr className="bg-gray-50">
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">Duration</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">1-7 days</td>
                          </tr>
                          <tr className="bg-white">
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">Region</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">International</td>
                          </tr>
                          <tr className="bg-gray-50">
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">Warranty</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">Full period of account validity</td>
                          </tr>
                          <tr className="bg-white">
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">Delivery Method</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">Email (Instant)</td>
                          </tr>
                          <tr className="bg-gray-50">
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">Support</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">24/7 via email and chat</td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </TabsContent>
              
              <TabsContent value="reviews" className="p-6 animate-fade-in">
                {product.id && <ProductReviews productId={product.id} />}
              </TabsContent>
              
              <TabsContent value="faq" className="p-6 animate-fade-in">
                <div className="space-y-6">
                  <div className="border-b pb-4">
                    <h3 className="text-lg font-medium mb-2">How long can this account be used?</h3>
                    <p className="text-gray-600">The account will remain active for 1-7 days after the first login. This can vary slightly depending on Telegram's policies and updates.</p>
                  </div>
                  <div className="border-b pb-4">
                    <h3 className="text-lg font-medium mb-2">How do I receive account information after purchase?</h3>
                    <p className="text-gray-600">After successful payment, account information will be automatically sent to your registered email. You can also view this information in your purchase history on your personal page.</p>
                  </div>
                  <div className="border-b pb-4">
                    <h3 className="text-lg font-medium mb-2">Can I change the password after receiving the account?</h3>
                    <p className="text-gray-600">Yes, you can change the password after receiving the account. We recommend changing the password immediately after receiving the login information to ensure security.</p>
                  </div>
                  <div className="border-b pb-4">
                    <h3 className="text-lg font-medium mb-2">What should I do if the account is locked or encounters issues?</h3>
                    <p className="text-gray-600">If the account encounters issues, please contact our support team via email at support@acczen.net or through live chat on the website. We will resolve it as soon as possible.</p>
                  </div>
                  <div className="border-b pb-4">
                    <h3 className="text-lg font-medium mb-2">Is there a refund policy?</h3>
                    <p className="text-gray-600">Yes, we offer a 100% refund if the account is locked or becomes unusable within the first 30 days of purchase, provided it wasn't due to user violation of terms.</p>
                  </div>
                  <div>
                    <h3 className="text-lg font-medium mb-2">Can I use this account for business purposes?</h3>
                    <p className="text-gray-600">Yes, these accounts can be used for both personal and business purposes, though we recommend checking Telegram's terms of service regarding business usage.</p>
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </div>

        {/* Sticky Actions Bar for Mobile */}
        <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white p-4 border-t border-gray-200 shadow-md z-40">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-lg font-bold text-[#2ECC71]">
                {product.sale_price ? `$${product.sale_price.toFixed(2)}` : `$${product.price.toFixed(2)}`}
              </div>
              {product.sale_price && (
                <div className="text-sm text-gray-500 line-through">${product.price.toFixed(2)}</div>
              )}
            </div>
            <button 
              onClick={() => setActiveTab('description')}
              className="bg-[#2ECC71] text-white px-5 py-2 rounded-md font-medium hover:bg-[#27AE60] transition-colors"
            >
              Buy Now
            </button>
          </div>
        </div>

        {/* Related Products */}
        {relatedProducts && relatedProducts.length > 0 && (
          <div className="mt-12">
            <h2 className="text-xl font-bold mb-6">Related Products</h2>
            <RelatedProducts products={relatedProducts} />
          </div>
        )}
      </Container>
    </div>
  );
};

export default ProductDetail;
