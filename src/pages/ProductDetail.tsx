
import { useParams, Link } from "react-router-dom";
import { useProduct, useRelatedProducts } from "@/hooks/useProduct";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ShoppingCart, Package, Shield, Clock, AlertTriangle, ChevronRight } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import ProductCard from "@/components/ProductCard";
import { useEffect } from "react";
import { useCart } from "@/hooks/useCart";

const ProductDetail = () => {
  const { slug } = useParams<{ slug: string }>();
  const { data: product, isLoading, error } = useProduct(slug || "");
  const { data: relatedProducts } = useRelatedProducts(
    product?.category_id || "", 
    product?.id || ""
  );
  const { toast } = useToast();
  const { addItem } = useCart();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [slug]);

  const handleAddToCart = () => {
    if (product) {
      addItem({
        id: product.id,
        name: product.name,
        price: product.sale_price || product.price,
        image: product.image_url || '',
      });
    }
  };

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

  const isOutOfStock = product.stock_quantity === 0;
  const isLowStock = product.stock_quantity <= 5 && product.stock_quantity > 0;

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
        <div className="relative overflow-hidden rounded-lg border bg-background">
          <img 
            src={product.image_url || 'https://placehold.co/600x400?text=No+Image'} 
            alt={product.name}
            className="w-full h-auto object-cover aspect-[4/3]"
          />
          {product.sale_price && (
            <Badge className="absolute top-4 left-4 bg-destructive hover:bg-destructive">
              Giảm giá
            </Badge>
          )}
          {product.category && (
            <Badge className="absolute top-4 right-4 bg-secondary hover:bg-secondary">
              {product.category.name}
            </Badge>
          )}
        </div>

        <div className="flex flex-col">
          <h1 className="text-3xl font-bold mb-2">{product.name}</h1>
          
          <div className="flex items-baseline mb-4">
            <span className="text-2xl font-bold text-primary mr-2">
              {(product.sale_price || product.price).toLocaleString('vi-VN')}đ
            </span>
            {product.sale_price && (
              <span className="text-lg text-muted-foreground line-through">
                {product.price.toLocaleString('vi-VN')}đ
              </span>
            )}
          </div>

          <div className="mb-6">
            {isOutOfStock ? (
              <Badge variant="destructive" className="text-sm py-1">
                Hết hàng
              </Badge>
            ) : isLowStock ? (
              <Badge variant="outline" className="text-sm py-1 border-amber-500 text-amber-500">
                Chỉ còn {product.stock_quantity} sản phẩm
              </Badge>
            ) : (
              <Badge variant="outline" className="text-sm py-1 border-primary text-primary">
                Còn hàng ({product.stock_quantity} sản phẩm)
              </Badge>
            )}
          </div>

          <p className="text-muted-foreground mb-6">
            {product.description}
          </p>

          {featuresList.length > 0 && (
            <div className="mb-6">
              <h3 className="font-medium mb-2">Tính năng chính:</h3>
              <ul className="space-y-2">
                {featuresList.map((feature, index) => (
                  <li key={index} className="flex items-center">
                    <div className="h-1.5 w-1.5 rounded-full bg-primary mr-2"></div>
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          <div className="mt-auto space-y-4">
            <Button 
              className="w-full gap-2"
              size="lg"
              onClick={handleAddToCart}
              disabled={isOutOfStock}
            >
              <ShoppingCart className="h-5 w-5" />
              {isOutOfStock ? "Hết hàng" : "Thêm vào giỏ hàng"}
            </Button>

            {!isOutOfStock && (
              <Button 
                className="w-full"
                variant="secondary"
                size="lg"
              >
                Mua ngay
              </Button>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
        <div className="flex items-center p-4 border rounded-lg">
          <Package className="h-8 w-8 text-primary mr-3" />
          <div>
            <h3 className="font-medium">Giao hàng tức thì</h3>
            <p className="text-sm text-muted-foreground">Nhận hàng qua email</p>
          </div>
        </div>
        <div className="flex items-center p-4 border rounded-lg">
          <Shield className="h-8 w-8 text-primary mr-3" />
          <div>
            <h3 className="font-medium">Bảo đảm 100%</h3>
            <p className="text-sm text-muted-foreground">Hoàn tiền nếu có vấn đề</p>
          </div>
        </div>
        <div className="flex items-center p-4 border rounded-lg">
          <Clock className="h-8 w-8 text-primary mr-3" />
          <div>
            <h3 className="font-medium">Hỗ trợ 24/7</h3>
            <p className="text-sm text-muted-foreground">Luôn sẵn sàng hỗ trợ bạn</p>
          </div>
        </div>
      </div>

      {relatedProducts && relatedProducts.length > 0 && (
        <div className="mt-12">
          <h2 className="text-2xl font-bold mb-6">Sản phẩm liên quan</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {relatedProducts.map((relatedProduct) => (
              <ProductCard
                key={relatedProduct.id}
                id={relatedProduct.id}
                name={relatedProduct.name}
                image={relatedProduct.image_url || ''}
                price={relatedProduct.price}
                category={relatedProduct.category?.name || ''}
                stock={relatedProduct.stock_quantity}
                featured={relatedProduct.status === 'active' && relatedProduct.stock_quantity > 0}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductDetail;
