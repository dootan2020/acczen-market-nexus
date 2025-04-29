
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface ProductCardProps {
  name: string;
  price: string;
  stock: string;
}

const ProductCard: React.FC<ProductCardProps> = ({
  name,
  price,
  stock
}) => {
  // Determine stock level for badge color
  const stockLevel = parseInt(stock);
  let stockBadgeVariant: "default" | "secondary" | "destructive" = "default";
  
  if (stockLevel <= 0) {
    stockBadgeVariant = "destructive";
  } else if (stockLevel < 5) {
    stockBadgeVariant = "secondary";
  }
  
  return (
    <Card className="w-full bg-white">
      <CardContent className="p-6">
        <div className="space-y-4">
          <div className="flex justify-between items-start">
            <h3 className="text-lg font-medium line-clamp-2">{name}</h3>
            <Badge variant={stockBadgeVariant}>
              {stockLevel > 0 ? `Còn hàng: ${stock}` : 'Hết hàng'}
            </Badge>
          </div>
          
          <div className="pt-2 border-t">
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Giá sản phẩm:</span>
              <span className="text-lg font-medium text-primary">
                {new Intl.NumberFormat('vi-VN').format(parseInt(price))} VND
              </span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ProductCard;
