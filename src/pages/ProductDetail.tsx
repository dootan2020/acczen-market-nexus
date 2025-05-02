
import { useParams } from 'react-router-dom';
import { useProduct, useRelatedProducts } from '@/hooks/useProduct';
import { Container } from '@/components/ui/container';
import { Separator } from '@/components/ui/separator';
import ProductHeader from '@/components/products/ProductHeader';
import ProductPricing from '@/components/products/ProductPricing';
import ProductFeatures from '@/components/products/ProductFeatures';
import ProductActions from '@/components/products/ProductActions';
import ProductTabs from '@/components/products/ProductTabs';
import TrustBadges from '@/components/products/TrustBadges';
import { Skeleton } from '@/components/ui/skeleton';
import RelatedProducts from '@/components/products/RelatedProducts';
import { useCurrencyContext } from '@/contexts/CurrencyContext';

const ProductDetail = () => {
  const { slug } = useParams<{ slug: string }>();
  const { data: product, isLoading, error } = useProduct(slug || '');
  const { data: relatedProducts } = useRelatedProducts(
    product?.category_id || '',
    product?.id || ''
  );
  const currency = useCurrencyContext();

  if (isLoading) {
    return <ProductDetailSkeleton />;
  }

  if (error || !product) {
    return (
      <Container className="py-12">
        <div className="text-center py-16">
          <h2 className="text-2xl font-semibold text-gray-800 mb-2 font-poppins">Product Not Found</h2>
          <p className="text-gray-600 mb-6 font-inter">The product you're looking for doesn't exist or has been removed.</p>
          <a href="/products" className="inline-flex items-center justify-center bg-primary text-white px-6 py-3 rounded-md hover:bg-primary-dark transition-colors">
            Browse Products
          </a>
        </div>
      </Container>
    );
  }

  // Product features list in English
  const features = [
    'Premium quality guaranteed',
    'Immediate delivery after purchase',
    'Technical support included',
    'Secure transaction',
    'No subscription required'
  ];

  // Extract or define sections from product description
  // In a real application, these might be separate fields in the product database
  const technicalDetails = product.technical_details || null;
  const usageInstructions = product.usage_instructions || null;
  const warrantyInfo = product.warranty_info || null;

  return (
    <div className="bg-background min-h-screen">
      <Container className="py-8 md:py-12">
        <div className="grid lg:grid-cols-2 gap-12">
          {/* Left Column - Product Info */}
          <div className="flex flex-col gap-8">
            <ProductHeader 
              title={product.name} 
              subtitle=""  
              categoryName={product.category?.name || ''}
              stockQuantity={product.stock_quantity}
            />
            
            <ProductPricing 
              price={product.price} 
              salePrice={product.sale_price}
              stockQuantity={product.stock_quantity} 
              currency={currency}
            />

            <TrustBadges />
            
            <Separator className="my-2" />
            
            <ProductFeatures features={features} />
            
            <ProductActions 
              product={product}
            />
          </div>
          
          {/* Right Column - Detailed Information */}
          <div className="flex flex-col gap-6">
            <div className="bg-white rounded-lg shadow-sm border border-gray-100">
              <ProductTabs 
                description={product.description}
                technicalDetails={technicalDetails}
                usageInstructions={usageInstructions}
                warrantyInfo={warrantyInfo}
              />
            </div>
          </div>
        </div>
        
        {/* Related Products Section */}
        {relatedProducts && relatedProducts.length > 0 && (
          <div className="mt-16">
            <h2 className="text-2xl font-semibold mb-6 font-poppins">Related Products</h2>
            <RelatedProducts products={relatedProducts} />
          </div>
        )}
      </Container>
    </div>
  );
};

const ProductDetailSkeleton = () => {
  return (
    <Container className="py-8 md:py-12">
      <div className="grid lg:grid-cols-2 gap-12">
        <div className="flex flex-col gap-8">
          <div>
            <Skeleton className="h-10 w-3/4 mb-2" />
            <Skeleton className="h-5 w-1/2" />
          </div>
          
          <div>
            <Skeleton className="h-8 w-1/3 mb-2" />
            <Skeleton className="h-6 w-1/4" />
          </div>
          
          <Separator className="my-2" />
          
          <div className="space-y-3">
            <Skeleton className="h-5 w-full" />
            <Skeleton className="h-5 w-full" />
            <Skeleton className="h-5 w-full" />
            <Skeleton className="h-5 w-3/4" />
          </div>
          
          <div className="space-y-3">
            <Skeleton className="h-10 w-1/3" />
            <div className="flex gap-4">
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-12 w-16" />
            </div>
          </div>
        </div>
        
        <div>
          <Skeleton className="h-[500px] w-full rounded-lg" />
        </div>
      </div>
    </Container>
  );
};

export default ProductDetail;
