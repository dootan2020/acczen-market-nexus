
import { useState } from 'react';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuLabel, 
  DropdownMenuTrigger,
  DropdownMenuSeparator
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { 
  Trash2, 
  CheckSquare, 
  XSquare, 
  Download, 
  Filter, 
  RefreshCcw, 
  MoreHorizontal 
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { exportProductsToCSV, exportProductsToExcel } from '@/utils/product-utils';
import { Product } from '@/hooks/admin/types/productManagement.types';

interface ProductBulkActionsProps {
  selectedCount: number;
  filteredProducts: Product[];
  onBulkDelete: () => void;
  onBulkActivate: () => void;
  onBulkDeactivate: () => void;
  onSyncProducts?: () => void;
  onClearSelection: () => void;
  disabled?: boolean;
}

export function ProductBulkActions({ 
  selectedCount, 
  filteredProducts,
  onBulkDelete, 
  onBulkActivate, 
  onBulkDeactivate,
  onSyncProducts,
  onClearSelection,
  disabled = false
}: ProductBulkActionsProps) {
  const [isExporting, setIsExporting] = useState(false);
  
  // Handle export to CSV
  const handleExportCSV = () => {
    setIsExporting(true);
    try {
      exportProductsToCSV(filteredProducts);
    } catch (error) {
      console.error('Error exporting to CSV:', error);
    } finally {
      setIsExporting(false);
    }
  };
  
  // Handle export to Excel
  const handleExportExcel = () => {
    setIsExporting(true);
    try {
      exportProductsToExcel(filteredProducts);
    } catch (error) {
      console.error('Error exporting to Excel:', error);
    } finally {
      setIsExporting(false);
    }
  };
  
  return (
    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-2 mb-4">
      {selectedCount > 0 ? (
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="h-7 px-3">
            {selectedCount} {selectedCount === 1 ? 'product' : 'products'} selected
          </Badge>
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={onClearSelection} 
            className="h-7 px-2"
          >
            Clear
          </Button>
        </div>
      ) : (
        <div className="text-sm text-muted-foreground">
          Select products to perform bulk actions
        </div>
      )}
      
      <div className="flex flex-wrap gap-2">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button 
              variant="outline" 
              size="sm" 
              disabled={selectedCount === 0 || disabled}
            >
              Bulk Actions
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            <DropdownMenuLabel>Selected Products</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem 
              onClick={onBulkActivate}
              disabled={selectedCount === 0 || disabled}
            >
              <CheckSquare className="mr-2 h-4 w-4" />
              Set as Active
            </DropdownMenuItem>
            <DropdownMenuItem 
              onClick={onBulkDeactivate}
              disabled={selectedCount === 0 || disabled}
            >
              <XSquare className="mr-2 h-4 w-4" />
              Set as Inactive
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem 
              onClick={onBulkDelete} 
              className="text-red-600"
              disabled={selectedCount === 0 || disabled}
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Delete Selected
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
        
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button 
              variant="outline" 
              size="sm"
              disabled={filteredProducts.length === 0 || isExporting}
            >
              <Download className="mr-2 h-4 w-4" />
              Export
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Export Options</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleExportCSV}>
              Export to CSV
            </DropdownMenuItem>
            <DropdownMenuItem onClick={handleExportExcel}>
              Export to Excel
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
        
        {onSyncProducts && (
          <Button 
            variant="outline" 
            size="sm" 
            onClick={onSyncProducts}
          >
            <RefreshCcw className="mr-2 h-4 w-4" />
            Sync Products
          </Button>
        )}
      </div>
    </div>
  );
}
