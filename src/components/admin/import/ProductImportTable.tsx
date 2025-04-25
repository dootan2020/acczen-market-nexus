
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { TaphoammoProduct } from '@/pages/admin/AdminProductImport';

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
  
  const selectedCount = products.filter(product => product.selected).length;
  
  const handleSelectAll = (checked: boolean) => {
    setSelectAll(checked);
    onSelectAll(checked);
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
              <TableHead>Sales</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {products.map((product) => {
              const finalPrice = product.price * (1 + (product.markup_percentage || 0) / 100);
              
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
                  <TableCell>{product.stock_quantity}</TableCell>
                  <TableCell>
                    {product.rating ? `${product.rating} ★` : 'N/A'}
                  </TableCell>
                  <TableCell>{product.sales_count || 'N/A'}</TableCell>
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
    </div>
  );
};
