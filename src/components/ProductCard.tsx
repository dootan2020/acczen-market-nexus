
import { Link } from "react-router-dom";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ShoppingCart } from "lucide-react";

interface ProductCardProps {
  id: string;
  name: string;
  image: string;
  price: number;
  category: string;
  stock: number;
  featured?: boolean;
}

const ProductCard = ({
  id,
  name,
  image,
  price,
  category,
  stock,
  featured,
}: ProductCardProps) => {
  return (
    <Card className={`overflow-hidden transition-all hover:shadow-md ${featured ? 'border-primary/20 bg-primary/5' : ''}`}>
      <Link to={`/product/${id}`} className="block">
        <div className="relative">
          <img
            src={image}
            alt={name}
            className="w-full h-48 object-cover"
          />
          <div className="absolute top-2 left-2 flex gap-2">
            <Badge className="bg-secondary hover:bg-secondary/80">{category}</Badge>
            {featured && <Badge variant="default">Featured</Badge>}
          </div>
          {stock <= 5 && stock > 0 && (
            <Badge variant="outline" className="absolute top-2 right-2 bg-background/80 backdrop-blur-sm">
              Only {stock} left
            </Badge>
          )}
          {stock === 0 && (
            <div className="absolute inset-0 bg-background/60 backdrop-blur-[2px] flex items-center justify-center">
              <Badge variant="destructive" className="text-lg py-1 px-3">Out of Stock</Badge>
            </div>
          )}
        </div>
      </Link>
      <CardContent className="p-4">
        <Link to={`/product/${id}`}>
          <h3 className="font-medium text-lg line-clamp-2 hover:text-primary transition-colors mb-2">{name}</h3>
        </Link>
        <div className="flex justify-between items-center">
          <span className="text-lg font-bold text-primary">${price.toFixed(2)}</span>
          <span className="text-sm text-muted-foreground">
            {stock > 10 ? 'In Stock' : stock > 0 ? `${stock} available` : 'Out of stock'}
          </span>
        </div>
      </CardContent>
      <CardFooter className="p-4 pt-0">
        <Button 
          className="w-full gap-2" 
          disabled={stock === 0}
        >
          <ShoppingCart className="h-4 w-4" />
          Add to Cart
        </Button>
      </CardFooter>
    </Card>
  );
};

export default ProductCard;
