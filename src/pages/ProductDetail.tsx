
import { useParams, Link } from "react-router-dom";
import { useProduct } from "@/hooks/useProduct";
import { Button } from "@/components/ui/button";
import { AlertTriangle, ChevronRight } from "lucide-react";
import { useEffect } from "react";
import ProductImageGallery from "@/components/products/ProductImageGallery";
import ProductInfo from "@/components/products/ProductInfo";
import ProductBenefits from "@/components/products/ProductBenefits";
import RelatedProducts from "@/components/products/RelatedProducts";
import ProductDescription from "@/components/products/ProductDescription";

const ProductDetail = () => {
  const { slug } = useParams<{ slug: string }>();
  const { data: product, isLoading, error } = useProduct(slug || "");

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [slug]);

  if (isLoading) {
    return (
      <div className="container py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="h-[400px] rounded-lg bg-muted animate-pulse" />
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
      <div className="container py-12">
        <div className="bg-muted p-6 rounded-lg text-center">
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

  return (
    <div className="container py-8">
      <div className="flex items-center text-sm text-muted-foreground mb-6">
        <Link to="/" className="hover:text-foreground">Trang chủ</Link>
        <ChevronRight className="h-4 w-4 mx-1" />
        <Link to="/products" className="hover:text-foreground">Sản phẩm</Link>
        <ChevronRight className="h-4 w-4 mx-1" />
        <Link to={`/products?category=${product.category?.slug}`} className="hover:text-foreground">
          {product.category?.name}
        </Link>
        <ChevronRight className="h-4 w-4 mx-1" />
        <span className="text-foreground font-medium truncate">{product.name}</span>
      </div>

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
        />
      </div>

      <ProductDescription 
        description={product.long_description || product.description}
        specifications={product.specifications}
        usage={product.usage_instructions}
      />

      <ProductBenefits />

      {product.category_id && (
        <RelatedProducts 
          categoryId={product.category_id} 
          currentProductId={product.id}
        />
      )}
    </div>
  );
};

export default ProductDetail;
