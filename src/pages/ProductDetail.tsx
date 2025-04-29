
import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import { Container } from "@/components/ui/container";
import { useProduct, useRelatedProducts } from "@/hooks/useProduct";
import ProductHeader from "@/components/products/ProductHeader";
import ProductImageGallery from "@/components/products/ProductImageGallery";
import ProductInfo from "@/components/products/ProductInfo";
import ProductDescription from "@/components/products/ProductDescription";
import ProductPricing from "@/components/products/ProductPricing";
import ProductActions from "@/components/products/ProductActions";
import ProductInventoryStatus from "@/components/products/ProductInventoryStatus";
import ProductBenefits from "@/components/products/ProductBenefits";
import ProductReviews from "@/components/products/ProductReviews";
import { Card, CardContent } from "@/components/ui/card";
import RelatedProducts from "@/components/products/RelatedProducts";
import TrustBadges from "@/components/trust/TrustBadges";

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
  
  return (
    <div>
      <Container className="py-8 md:py-12">
        <ProductHeader
          name={product.name}
          slug={product.slug}
          categoryName={product.category?.name}
          categorySlug={product.category?.slug}
        />
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12 mb-12">
          <ProductImageGallery images={product.images || [product.image_url || '/placeholder.svg']} />
          
          <div className="space-y-6">
            <ProductInfo 
              name={product.name}
              description={product.description}
            />
            
            <ProductPricing 
              price={product.price} 
              salePrice={product.sale_price}
            />
            
            <ProductInventoryStatus
              stockQuantity={product.stock_quantity}
              kioskToken={product.kiosk_token}
            />
            
            <ProductActions 
              product={product}
              quantity={quantity}
              onQuantityChange={setQuantity}
            />
            
            <ProductBenefits />
            
            <div className="pt-4">
              <TrustBadges variant="compact" />
            </div>
          </div>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
          <div className="lg:col-span-2">
            <ProductDescription description={product.description} />
          </div>
        </div>
        
        <div className="mb-12">
          <ProductReviews productId={product.id} />
        </div>
        
        {relatedProducts && relatedProducts.length > 0 && (
          <div className="mb-12">
            <RelatedProducts products={relatedProducts} />
          </div>
        )}
      </Container>
    </div>
  );
};

export default ProductDetail;
