import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import { Container } from "@/components/ui/container";
import { useProduct, useRelatedProducts } from "@/hooks/useProduct";
import ProductHeader from "@/components/products/ProductHeader";
import ProductImageGallery from "@/components/products/ProductImageGallery";
import ProductInfo from "@/components/products/ProductInfo";
import ProductDescription from "@/components/products/ProductDescription";
import ProductInventoryStatus from "@/components/products/ProductInventoryStatus";
import ProductBenefits from "@/components/products/ProductBenefits";
import ProductReviews from "@/components/products/ProductReviews";
import { Card, CardContent } from "@/components/ui/card";
import RelatedProducts from "@/components/products/RelatedProducts";
import TrustBadges from "@/components/trust/TrustBadges";
import StockSoldBadges from "@/components/products/inventory/StockSoldBadges";
import ProductBadge from "@/components/products/ProductBadge";
import { stripHtmlTags } from '@/utils/htmlUtils';

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
            <h1 className="text-2xl font-bold mb-4">Product Not Found</h1>
            <p className="text-muted-foreground">
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
  
  return (
    <div className="bg-background">
      <Container className="py-8 md:py-12">
        {/* Product Header with Breadcrumb */}
        <div className="mb-6">
          <ProductHeader
            name={product.name}
            categoryName={product.category?.name || ''}
            rating={4.5} // Example rating
            reviewCount={10} // Example review count
          />
        </div>
        
        {/* Main Product Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12 mb-12">
          {/* Product Gallery */}
          <div className="bg-white rounded-xl overflow-hidden shadow-md">
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
          </div>
          
          {/* Product Information */}
          <div className="bg-white rounded-xl p-6 shadow-md space-y-6">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-[#333333] mb-3 font-sans">
                {product.name}
              </h1>
              
              {/* Price Section */}
              <div className="flex items-baseline gap-2 mb-4">
                <span className="text-3xl font-bold text-[#2ECC71]">
                  ${product.sale_price || product.price}
                </span>
                
                {isOnSale && (
                  <span className="text-lg text-muted-foreground line-through">
                    ${product.price}
                  </span>
                )}
                
                {isOnSale && (
                  <span className="bg-rose-500 text-white text-xs px-2 py-1 rounded-full">
                    {Math.round(((product.price - (product.sale_price || 0)) / product.price) * 100)}% Off
                  </span>
                )}
              </div>
            </div>
            
            <div className="prose prose-sm max-w-none text-[#333333]/70">
              {/* Use stripHtmlTags for the short description in the detail page */}
              <p>{stripHtmlTags(product.description || 'No description available.')}</p>
            </div>
            
            <ProductInfo 
              id={product.id}
              name={product.name}
              description={stripHtmlTags(product.description || '')}
              price={product.price}
              salePrice={product.sale_price}
              stockQuantity={product.stock_quantity}
              image={product.image_url || '/placeholder.svg'}
              rating={4.5} // Example rating
              reviewCount={10} // Example review count
              soldCount={soldCount}
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
        
        {/* Product Description - uses RichTextContent for rich html rendering */}
        <div className="grid grid-cols-1 gap-8 mb-12">
          <Card className="overflow-hidden">
            <CardContent className="p-6">
              <h2 className="text-2xl font-bold mb-4 text-[#333333]">Product Description</h2>
              <div className="prose prose-lg max-w-none">
                <ProductDescription description={product.description || 'No description available.'} />
              </div>
            </CardContent>
          </Card>
        </div>
        
        {/* Reviews Section */}
        <div className="mb-12">
          <Card className="overflow-hidden">
            <CardContent className="p-6">
              <h2 className="text-2xl font-bold mb-4 text-[#333333]">Customer Reviews</h2>
              <ProductReviews productId={product.id} />
            </CardContent>
          </Card>
        </div>
        
        {/* Related Products */}
        {relatedProducts && relatedProducts.length > 0 && (
          <div className="mb-12">
            <h2 className="text-2xl font-bold mb-6 text-[#333333]">Related Products</h2>
            <RelatedProducts products={relatedProducts} />
          </div>
        )}
      </Container>
    </div>
  );
};

export default ProductDetail;
