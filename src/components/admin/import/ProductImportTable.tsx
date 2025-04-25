
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { TaphoammoProduct } from '@/pages/admin/AdminProductImport';
import { Badge } from '@/components/ui/badge';
import { Star, Boxes, DollarSign, Eye } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Separator } from '@/components/ui/separator';

interface ProductImportTableProps {
  products: TaphoammoProduct[];
  onSelectProduct: (productId: string, selected: boolean) => void;
  onSelectAll: (selected: boolean) => void;
  onImportSelected: () => void;
  onProductMarkupChange: (productId: string, markup: number) => void;
}

export const ProductImportTable: React.FC<ProductImportTableProps> = ({
  products,
  onSelectProduct,
  onSelectAll,
  onImportSelected,
  onProductMarkupChange
}) => {
  const [selectAll, setSelectAll] = useState(false);
  const [previewProduct, setPreviewProduct] = useState<TaphoammoProduct | null>(null);
  
  const selectedCount = products.filter(product => product.selected).length;
  
  const handleSelectAll = (checked: boolean) => {
    setSelectAll(checked);
    onSelectAll(checked);
  };
  
  const getStockBadge = (quantity: number) => {
    if (quantity > 50) return <Badge className="bg-green-500">High Stock ({quantity})</Badge>;
    if (quantity > 10) return <Badge className="bg-yellow-500">Medium Stock ({quantity})</Badge>;
    return <Badge variant="destructive">Low Stock ({quantity})</Badge>;
  };
  
  const formatRating = (rating?: number) => {
    if (!rating) return 'N/A';
    return `${rating.toFixed(1)} ★`;
  };
  
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Checkbox
            id="select-all"
            checked={selectAll}
            onCheckedChange={handleSelectAll}
          />
          <label htmlFor="select-all" className="text-sm">
            Select All ({selectedCount}/{products.length})
          </label>
        </div>
        
        <Button
          onClick={onImportSelected}
          disabled={selectedCount === 0}
        >
          Import Selected ({selectedCount})
        </Button>
      </div>
      
      <div className="border rounded-md">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-12"></TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Price</TableHead>
              <TableHead>Markup (%)</TableHead>
              <TableHead>Final Price</TableHead>
              <TableHead>Stock</TableHead>
              <TableHead>Rating</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {products.map((product) => {
              const finalPrice = product.final_price || product.price * (1 + (product.markup_percentage || 0) / 100);
              
              return (
                <TableRow key={product.id}>
                  <TableCell>
                    <Checkbox
                      checked={product.selected}
                      onCheckedChange={(checked) => 
                        onSelectProduct(product.id, checked === true)
                      }
                    />
                  </TableCell>
                  <TableCell className="font-medium">{product.name}</TableCell>
                  <TableCell>${product.price.toFixed(2)}</TableCell>
                  <TableCell>
                    <Input
                      type="number"
                      min={0}
                      max={100}
                      className="w-20"
                      value={product.markup_percentage || 0}
                      onChange={(e) => 
                        onProductMarkupChange(product.id, Number(e.target.value))
                      }
                    />
                  </TableCell>
                  <TableCell className="font-medium">
                    ${finalPrice.toFixed(2)}
                  </TableCell>
                  <TableCell>{getStockBadge(product.stock_quantity)}</TableCell>
                  <TableCell>{formatRating(product.rating)}</TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setPreviewProduct(product)}
                    >
                      <Eye className="h-4 w-4 mr-1" /> Preview
                    </Button>
                  </TableCell>
                </TableRow>
              );
            })}
            
            {products.length === 0 && (
              <TableRow>
                <TableCell colSpan={8} className="text-center py-4">
                  No products found
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      
      <Dialog open={!!previewProduct} onOpenChange={(open) => !open && setPreviewProduct(null)}>
        {previewProduct && (
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>{previewProduct.name}</DialogTitle>
              <DialogDescription>Product details preview</DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Original Price</p>
                  <p className="text-lg font-semibold flex items-center">
                    <DollarSign className="h-4 w-4 mr-1" /> 
                    {previewProduct.price.toFixed(2)}
                  </p>
                </div>
                
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Final Price</p>
                  <p className="text-lg font-semibold flex items-center text-green-600">
                    <DollarSign className="h-4 w-4 mr-1" /> 
                    {(previewProduct.final_price || previewProduct.price * (1 + (previewProduct.markup_percentage || 0) / 100)).toFixed(2)}
                  </p>
                </div>
              </div>
              
              <Separator />
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Stock</p>
                  <p className="text-base flex items-center">
                    <Boxes className="h-4 w-4 mr-1" /> 
                    {previewProduct.stock_quantity} units
                  </p>
                </div>
                
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Rating</p>
                  <p className="text-base flex items-center">
                    <Star className="h-4 w-4 mr-1 text-yellow-500" /> 
                    {formatRating(previewProduct.rating)}
                  </p>
                </div>
              </div>
              
              <Separator />
              
              <div>
                <p className="text-sm font-medium text-muted-foreground">Description</p>
                <p className="text-sm mt-1">
                  {previewProduct.description || "No description available"}
                </p>
              </div>
              
              <div>
                <p className="text-sm font-medium text-muted-foreground">Token</p>
                <p className="text-xs font-mono bg-secondary p-2 rounded mt-1 overflow-x-auto">
                  {previewProduct.kiosk_token}
                </p>
              </div>
              
              <Separator />
              
              <div className="flex justify-between">
                <Button 
                  variant="outline"
                  onClick={() => setPreviewProduct(null)}
                >
                  Close
                </Button>
                
                <Button
                  onClick={() => {
                    onSelectProduct(previewProduct.id, true);
                    setPreviewProduct(null);
                  }}
                >
                  Select for Import
                </Button>
              </div>
            </div>
          </DialogContent>
        )}
      </Dialog>
    </div>
  );
};
