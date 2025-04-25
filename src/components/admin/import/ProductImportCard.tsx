
import React from 'react';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Package } from 'lucide-react';
import { TaphoammoProduct } from '@/pages/admin/AdminProductImport';

interface ProductImportCardProps {
  product: TaphoammoProduct;
  onImport: (product: TaphoammoProduct) => void;
  loading?: boolean;
}

export const ProductImportCard: React.FC<ProductImportCardProps> = ({
  product,
  onImport,
  loading = false
}) => {
  const getStockBadge = (quantity: number) => {
    if (quantity > 50) return <Badge className="bg-green-500">High Stock ({quantity})</Badge>;
    if (quantity > 10) return <Badge className="bg-yellow-500">Medium Stock ({quantity})</Badge>;
    return <Badge variant="destructive">Low Stock ({quantity})</Badge>;
  };

  return (
    <Card className="h-full flex flex-col">
      <CardContent className="pt-6 flex-grow">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h3 className="font-semibold text-lg mb-2">{product.name}</h3>
            <div className="space-y-2">
              <p className="text-2xl font-bold text-primary">
                ${product.price.toFixed(2)}
              </p>
              <div className="flex items-center gap-2">
                <Package className="h-4 w-4 text-muted-foreground" />
                {getStockBadge(product.stock_quantity)}
              </div>
            </div>
          </div>
        </div>
      </CardContent>
      <CardFooter>
        <Button 
          className="w-full" 
          onClick={() => onImport(product)}
          disabled={loading || product.stock_quantity === 0}
        >
          Import Now
        </Button>
      </CardFooter>
    </Card>
  );
};
