
import { Link } from "react-router-dom";
import { ShoppingCart } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { useCart } from "@/hooks/useCart";
import { formatCurrency } from "@/utils/formatters";

interface ProductCardProps {
  id: string;
  name: string;
  image: string;
  price: number;
  salePrice?: number; 
  category: string;
  subcategory?: string;
  stock: number;
  featured?: boolean;
  kioskToken?: string;
}

const ProductCard = ({
  id,
  name,
  image,
  price,
  salePrice,
  category,
  subcategory,
  stock,
  featured,
  kioskToken,
}: ProductCardProps) => {
  const { addItem } = useCart();

  const handleAddToCart = () => {
    const item = {
      id,
      name,
      price: salePrice || price,
      image,
    };

    addItem(item);

    // If this is an API product, store the kioskToken in localStorage
    if (kioskToken) {
      localStorage.setItem(`product_${id}`, JSON.stringify({
        kioskToken,
        name,
        price: salePrice || price,
      }));
    }
  };

  return (
    <Card className={`overflow-hidden transition-all hover:shadow-md ${featured ? 'border-primary/20 bg-primary/5' : ''}`}>
      <Link to={`/product/${id}`} className="block">
        <div className="relative">
          <img
            src={image}
            alt={name}
            className="w-full h-48 object-cover"
          />
          <div className="absolute top-2 left-2 flex gap-2 flex-wrap max-w-[calc(100%-1rem)]">
            <Badge className="bg-secondary hover:bg-secondary/80">{category}</Badge>
            {subcategory && (
              <Badge variant="outline" className="bg-background/80 backdrop-blur-sm">
                {subcategory}
              </Badge>
            )}
            {featured && <Badge variant="default">Featured</Badge>}
            {kioskToken && <Badge variant="outline" className="bg-blue-100 text-blue-800">API</Badge>}
          </div>
          {stock <= 5 && stock > 0 && (
            <Badge variant="outline" className="absolute top-2 right-2 bg-background/80 backdrop-blur-sm">
              Chỉ còn {stock} sản phẩm
            </Badge>
          )}
          {stock === 0 && (
            <div className="absolute inset-0 bg-background/60 backdrop-blur-[2px] flex items-center justify-center">
              <Badge variant="destructive" className="text-lg py-1 px-3">Hết hàng</Badge>
            </div>
          )}
        </div>
      </Link>
      <CardContent className="p-4">
        <Link to={`/product/${id}`}>
          <h3 className="font-medium text-lg line-clamp-2 hover:text-primary transition-colors mb-2">{name}</h3>
        </Link>
        <div className="flex justify-between items-center">
          <div>
            <span className="text-lg font-bold text-primary">{formatCurrency(salePrice || price)}</span>
            {salePrice && (
              <span className="text-sm text-muted-foreground line-through ml-2">
                {formatCurrency(price)}
              </span>
            )}
          </div>
          <span className="text-sm text-muted-foreground">
            {stock > 10 ? 'Còn hàng' : stock > 0 ? `Còn ${stock} sản phẩm` : 'Hết hàng'}
          </span>
        </div>
      </CardContent>
      <CardFooter className="p-4 pt-0">
        <Button 
          className="w-full gap-2" 
          disabled={stock === 0}
          onClick={handleAddToCart}
        >
          <ShoppingCart className="h-4 w-4" />
          Thêm vào giỏ hàng
        </Button>
      </CardFooter>
    </Card>
  );
};

export default ProductCard;
