
import React from "react";
import { useParams } from "react-router-dom";
import { Container } from "@/components/ui/container";
import { useProduct, useRelatedProducts } from "@/hooks/useProduct";
import { Separator } from "@/components/ui/separator";
import ProductHeader from "@/components/products/ProductHeader";
import ProductDescription from "@/components/products/ProductDescription";
import ProductPurchase from "@/components/products/ProductPurchase";
import ProductReviews from "@/components/products/ProductReviews";
import ProductInstructions from "@/components/products/ProductInstructions";
import ProductBenefits from "@/components/products/ProductBenefits";
import ProductImageGallery from "@/components/products/ProductImageGallery";
import RelatedProducts from "@/components/products/RelatedProducts";

const extractFeatures = (features: any) => {
  if (!features) return null;
  
  try {
    if (typeof features === 'object') return features;
    return JSON.parse(features);
  } catch (e) {
    console.error('Failed to parse features:', e);
    return null;
  }
};

const ProductDetail = () => {
  const { slug } = useParams<{ slug: string }>();
  const { data: product, isLoading, error } = useProduct(slug || '');
  const { data: relatedProducts = [] } = useRelatedProducts(
    product?.category_id || '', 
    product?.id || ''
  );

  if (isLoading) {
    return (
      <Container className="py-12">
        <div className="animate-pulse space-y-8">
          <div className="h-8 bg-gray-200 rounded w-1/3"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="h-[400px] bg-gray-200 rounded"></div>
            <div className="space-y-4">
              <div className="h-8 bg-gray-200 rounded w-2/3"></div>
              <div className="h-4 bg-gray-200 rounded w-1/4"></div>
              <div className="h-4 bg-gray-200 rounded"></div>
              <div className="h-4 bg-gray-200 rounded"></div>
              <div className="h-10 bg-gray-200 rounded w-1/3 mt-6"></div>
            </div>
          </div>
        </div>
      </Container>
    );
  }

  if (error || !product) {
    return (
      <Container className="py-12">
        <div className="text-center py-12">
          <h2 className="text-xl font-semibold text-gray-800 mb-2">Product Not Found</h2>
          <p className="text-gray-600">
            The product you are looking for doesn't exist or has been removed.
          </p>
        </div>
      </Container>
    );
  }

  const features = extractFeatures(product.features);
  const instructions = [
    { 
      number: 1, 
      title: "Create an Account", 
      description: "Sign up for a free account to get started." 
    },
    { 
      number: 2, 
      title: "Purchase the Product", 
      description: "Complete your purchase using our secure payment system." 
    },
    { 
      number: 3, 
      title: "Receive Digital Delivery", 
      description: "Your digital product will be delivered to your email or account immediately." 
    },
    { 
      number: 4, 
      title: "Access Anytime", 
      description: "Access your purchase from your account dashboard whenever you need it." 
    }
  ];

  const sanitizedImageUrl = product.image_url || '/placeholder.svg';

  return (
    <Container className="py-8 md:py-12">
      <ProductHeader name={product.name} category={product.category} />
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 md:gap-12">
        <div className="lg:col-span-2">
          <ProductImageGallery 
            imageUrl={sanitizedImageUrl}
            name={product.name}
          />
          
          <div className="mt-8">
            <ProductDescription 
              description={product.description}
              specifications={features?.specifications}
              usage={features?.usage_instructions}
            />
          </div>

          <ProductBenefits />
          
          <ProductInstructions steps={instructions} />
          
          <div className="mt-10">
            <Separator className="my-8" />
            <ProductReviews productId={product.id} />
          </div>
        </div>
        
        <div>
          <div className="sticky top-24">
            <ProductPurchase
              id={product.id}
              name={product.name}
              price={Number(product.price)}
              salePrice={product.sale_price ? Number(product.sale_price) : undefined}
              stockQuantity={product.stock_quantity}
              imageUrl={sanitizedImageUrl}
              status={product.status}
            />
          </div>
        </div>
      </div>
      
      {relatedProducts.length > 0 && (
        <div className="mt-16">
          <h2 className="text-2xl font-bold mb-6 font-poppins">Related Products</h2>
          <RelatedProducts products={relatedProducts} />
        </div>
      )}
    </Container>
  );
};

export default ProductDetail;
