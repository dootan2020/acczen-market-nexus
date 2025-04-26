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

interface ProductFeatures {
  features: string[];
}

const ProductDetail = () => {
  const { slug } = useParams<{ slug: string }>();
  const { data: product, isLoading, error } = useProduct(slug || "");
  const { data: relatedProducts, isLoading: isLoadingRelated } = useRelatedProducts(
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
          <div>
            <div className="h-8 w-3/4 bg-muted animate-pulse mb-4" />
            <div className="h-6 w-1/4 bg-muted animate-pulse mb-8" />
            <div className="h-4 w-full bg-muted animate-pulse mb-2" />
            <div className="h-4 w-5/6 bg-muted animate-pulse mb-2" />
            <div className="h-4 w-4/6 bg-muted animate-pulse mb-8" />
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
          <h2 className="text-2xl font-bold mb-2">Product Not Found</h2>
          <p className="text-muted-foreground mb-4">
            The product you are looking for does not exist or has been removed.
          </p>
          <Button asChild>
            <Link to="/products">Back to Products</Link>
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
        <Link to="/" className="hover:text-foreground">Home</Link>
        <ChevronRight className="h-4 w-4 mx-1" />
        <Link to="/products" className="hover:text-foreground">Products</Link>
        <ChevronRight className="h-4 w-4 mx-1" />
        <Link to={`/products?category=${product.category?.slug}`} className="hover:text-foreground">
          {product.category?.name}
        </Link>
        <ChevronRight className="h-4 w-4 mx-1" />
        <span className="text-foreground font-medium truncate">{product.name}</span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
        <div className="relative overflow-hidden rounded-lg border">
          <img 
            src={product.image_url || 'https://placehold.co/600x400?text=No+Image'} 
            alt={product.name}
            className="w-full h-auto object-cover aspect-[4/3]"
          />
          {product.sale_price && (
            <Badge className="absolute top-4 left-4 bg-destructive hover:bg-destructive">
              Sale
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
              ${product.sale_price?.toFixed(2) || product.price.toFixed(2)}
            </span>
            {product.sale_price && (
              <span className="text-lg text-muted-foreground line-through">
                ${product.price.toFixed(2)}
              </span>
            )}
          </div>

          <div className="mb-6">
            {isOutOfStock ? (
              <Badge variant="destructive" className="text-sm py-1">
                Out of Stock
              </Badge>
            ) : isLowStock ? (
              <Badge variant="outline" className="text-sm py-1 border-amber-500 text-amber-500">
                Only {product.stock_quantity} left
              </Badge>
            ) : (
              <Badge variant="outline" className="text-sm py-1 border-primary text-primary">
                In Stock ({product.stock_quantity} available)
              </Badge>
            )}
          </div>

          <p className="text-muted-foreground mb-6">
            {product.description}
          </p>

          {featuresList.length > 0 && (
            <div className="mb-6">
              <h3 className="font-medium mb-2">Key Features:</h3>
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

          <div className="mt-auto">
            <Button 
              className="w-full mb-4 gap-2"
              size="lg"
              onClick={handleAddToCart}
              disabled={isOutOfStock}
            >
              <ShoppingCart className="h-5 w-5" />
              {isOutOfStock ? "Out of Stock" : "Add to Cart"}
            </Button>

            {!isOutOfStock && (
              <Button 
                className="w-full"
                variant="secondary"
                size="lg"
              >
                Buy Now
              </Button>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
        <div className="flex items-center p-4 border rounded-lg">
          <Package className="h-8 w-8 text-primary mr-3" />
          <div>
            <h3 className="font-medium">Instant Delivery</h3>
            <p className="text-sm text-muted-foreground">Delivered to your email</p>
          </div>
        </div>
        <div className="flex items-center p-4 border rounded-lg">
          <Shield className="h-8 w-8 text-primary mr-3" />
          <div>
            <h3 className="font-medium">100% Guaranteed</h3>
            <p className="text-sm text-muted-foreground">Or your money back</p>
          </div>
        </div>
        <div className="flex items-center p-4 border rounded-lg">
          <Clock className="h-8 w-8 text-primary mr-3" />
          <div>
            <h3 className="font-medium">24/7 Support</h3>
            <p className="text-sm text-muted-foreground">We're always here to help</p>
          </div>
        </div>
      </div>

      {relatedProducts && relatedProducts.length > 0 && (
        <div className="mt-12">
          <h2 className="text-2xl font-bold mb-6">Related Products</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {relatedProducts.map((product) => (
              <ProductCard
                key={product.id}
                id={product.id}
                name={product.name}
                image={product.image_url || ''}
                price={product.price}
                category={product.category?.name || ''}
                stock={product.stock_quantity}
                featured={product.status === 'active' && product.stock_quantity > 0}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductDetail;
