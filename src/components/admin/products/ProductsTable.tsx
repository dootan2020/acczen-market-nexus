
import React from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Switch } from '@/components/ui/switch';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { MoreVertical, Eye, Edit, Trash2, Package, AlertCircle } from 'lucide-react';
import { formatCurrency } from '@/utils/formatters';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface Product {
  id: string;
  name: string;
  slug: string;
  category?: { name: string };
  subcategory?: { name: string };
  status: string;
  price: number;
  sale_price?: number;
  stock_quantity: number;
  image_url?: string;
  is_visible?: boolean;
}

interface ProductsTableProps {
  products: Product[];
  selectedProducts: string[];
  onToggleSelect: (productId: string) => void;
  onToggleSelectAll: () => void;
  onEditProduct: (product: Product) => void;
  onDeleteProduct: (product: Product) => void;
  onToggleVisibility?: (productId: string, isVisible: boolean) => void;
}

const ProductsTable: React.FC<ProductsTableProps> = ({
  products,
  selectedProducts,
  onToggleSelect,
  onToggleSelectAll,
  onEditProduct,
  onDeleteProduct,
  onToggleVisibility,
}) => {
  const isAllSelected = 
    products.length > 0 &&
    selectedProducts.length === products.length;
  
  const isIndeterminate = 
    selectedProducts.length > 0 && 
    selectedProducts.length < products.length;

  return (
    <TooltipProvider>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-12">
              <Checkbox 
                checked={isAllSelected}
                data-state={isIndeterminate ? "indeterminate" : undefined}
                onCheckedChange={onToggleSelectAll}
              />
            </TableHead>
            <TableHead>Product</TableHead>
            <TableHead>Category</TableHead>
            <TableHead>Subcategory</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="text-right">Price</TableHead>
            <TableHead className="text-right">Stock</TableHead>
            <TableHead className="text-center">Visible</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {products.length ? (
            products.map((product) => (
              <TableRow key={product.id} className={!product.is_visible ? 'bg-slate-50' : ''}>
                <TableCell>
                  <Checkbox 
                    checked={selectedProducts.includes(product.id)}
                    onCheckedChange={() => onToggleSelect(product.id)}
                  />
                </TableCell>
                <TableCell>
                  <div className="flex items-center space-x-3">
                    {product.image_url ? (
                      <img 
                        src={product.image_url} 
                        alt={product.name} 
                        className="h-10 w-10 rounded object-cover"
                      />
                    ) : (
                      <div className="h-10 w-10 rounded bg-muted flex items-center justify-center">
                        <Package className="h-5 w-5 text-muted-foreground" />
                      </div>
                    )}
                    <div>
                      <div className="font-medium">{product.name}</div>
                      <div className="text-xs text-muted-foreground">{product.slug}</div>
                    </div>
                  </div>
                </TableCell>
                <TableCell>{product.category?.name || 'Uncategorized'}</TableCell>
                <TableCell>{product.subcategory?.name || '-'}</TableCell>
                <TableCell>
                  <Badge variant={product.status === 'active' ? 'default' : 'secondary'}>
                    {product.status}
                  </Badge>
                </TableCell>
                <TableCell className="text-right">
                  {formatCurrency(product.price)}
                  {product.sale_price && (
                    <div className="text-xs text-muted-foreground line-through">
                      {formatCurrency(product.sale_price)}
                    </div>
                  )}
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex items-center justify-end">
                    {product.stock_quantity <= 0 && (
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <AlertCircle className="h-4 w-4 text-red-500 mr-1" />
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Out of stock</p>
                        </TooltipContent>
                      </Tooltip>
                    )}
                    {product.stock_quantity}
                  </div>
                </TableCell>
                <TableCell className="text-center">
                  {onToggleVisibility && (
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Switch 
                          checked={product.is_visible ?? true}
                          onCheckedChange={(checked) => onToggleVisibility(product.id, checked)}
                          className="data-[state=checked]:bg-green-500"
                        />
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>{product.is_visible ? 'Visible on website' : 'Hidden from website'}</p>
                      </TooltipContent>
                    </Tooltip>
                  )}
                </TableCell>
                <TableCell className="text-right">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                        <span className="sr-only">Open menu</span>
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => window.open(`/product/${product.slug}`, '_blank')}>
                        <Eye className="h-4 w-4 mr-2" />
                        View
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => onEditProduct(product)}>
                        <Edit className="h-4 w-4 mr-2" />
                        Edit
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        className="text-red-600"
                        onClick={() => onDeleteProduct(product)}
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={9} className="text-center py-6">
                No products found
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </TooltipProvider>
  );
};

export default ProductsTable;
