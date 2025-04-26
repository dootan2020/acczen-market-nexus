
import { useParams, Link } from "react-router-dom";
import { useProduct } from "@/hooks/useProduct";
import { Button } from "@/components/ui/button";
import { AlertTriangle } from "lucide-react";
import { useEffect } from "react";
import ProductImageGallery from "@/components/products/ProductImageGallery";
import ProductInfo from "@/components/products/ProductInfo";
import ProductBenefits from "@/components/products/ProductBenefits";
import RelatedProducts from "@/components/products/RelatedProducts";
import ProductDescription from "@/components/products/ProductDescription";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbSeparator
} from "@/components/ui/breadcrumb";

const ProductDetail = () => {
  const { slug } = useParams<{ slug: string }>();
  const { data: product, isLoading, error } = useProduct(slug || "");

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [slug]);

  if (isLoading) {
    return (
      <div className="container py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="h-[400px] rounded-lg bg-muted animate-pulse shadow-sm" />
          <div className="space-y-4">
            <div className="h-8 w-3/4 bg-muted animate-pulse" />
            <div className="h-6 w-1/4 bg-muted animate-pulse" />
            <div className="h-4 w-full bg-muted animate-pulse" />
            <div className="h-4 w-5/6 bg-muted animate-pulse" />
            <div className="h-10 w-full bg-muted animate-pulse" />
          </div>
        </div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="container py-8">
        <div className="bg-muted p-6 rounded-lg text-center shadow-sm">
          <AlertTriangle className="w-12 h-12 text-destructive mx-auto mb-4" />
          <h2 className="text-2xl font-bold mb-2">Không tìm thấy sản phẩm</h2>
          <p className="text-muted-foreground mb-4">
            Sản phẩm bạn đang tìm kiếm không tồn tại hoặc đã bị xóa.
          </p>
          <Button asChild>
            <Link to="/products">Quay lại trang sản phẩm</Link>
          </Button>
        </div>
      </div>
    );
  }

  // Process product features
  let featuresList: string[] = [];
  if (product.features) {
    try {
      const featuresData = typeof product.features === 'string' 
        ? JSON.parse(product.features) 
        : product.features;
        
      if (featuresData && featuresData.features && Array.isArray(featuresData.features)) {
        featuresList = featuresData.features;
      }
    } catch (e) {
      console.error("Error parsing product features:", e);
    }
  }

  // Process product metadata
  let specifications: string | null = null;
  let usageInstructions: string | null = null;

  if (product.metadata) {
    try {
      // Handle metadata being a string or already parsed object
      const metadata = typeof product.metadata === 'string'
        ? JSON.parse(product.metadata)
        : product.metadata;

      if (metadata) {
        specifications = metadata.specifications || null;
        usageInstructions = metadata.usage_instructions || null;
      }
    } catch (e) {
      console.error("Error processing product metadata:", e);
    }
  }

  return (
    <div className="container py-6 px-4 sm:px-6 lg:px-8">
      {/* Improved Breadcrumb */}
      <Breadcrumb className="mb-6">
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink href="/">Trang chủ</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbLink href="/products">Sản phẩm</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          {product.category && (
            <>
              <BreadcrumbItem>
                <BreadcrumbLink href={`/products?category=${product.category.slug}`}>
                  {product.category.name}
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
            </>
          )}
          <BreadcrumbItem>
            <span className="text-foreground font-medium line-clamp-1">{product.name}</span>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
        <ProductImageGallery 
          imageUrl={product.image_url}
          name={product.name}
          salePrice={product.sale_price}
          categoryName={product.category?.name}
        />

        <ProductInfo
          id={product.id}
          name={product.name}
          description={product.description}
          price={product.price}
          salePrice={product.sale_price}
          stockQuantity={product.stock_quantity}
          image={product.image_url || ''}
          features={featuresList}
          soldCount={Math.floor(Math.random() * 100) + 50} // Mock data - would come from API in real app
          rating={4.5} // Mock data - would come from API in real app
          reviewCount={23} // Mock data - would come from API in real app
          kiosk_token={product.kiosk_token}
        />
      </div>

      {/* Product Description Tabs */}
      <ProductDescription 
        description={product.description}
        specifications={specifications}
        usage={usageInstructions}
      />

      {/* Product Benefits */}
      <ProductBenefits />

      {/* Related Products */}
      {product.category_id && (
        <RelatedProducts 
          categoryId={product.category_id} 
          currentProductId={product.id}
        />
      )}

      {/* Continue Shopping Button */}
      <div className="flex justify-center mt-10 mb-6">
        <Button asChild variant="outline" size="lg" className="gap-2">
          <Link to="/products">
            Tiếp tục mua sắm
          </Link>
        </Button>
      </div>
    </div>
  );
};

export default ProductDetail;
