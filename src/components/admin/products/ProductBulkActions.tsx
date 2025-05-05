
import React from 'react';
import { Button } from '@/components/ui/button';
import { Trash2, CheckCircle, Ban, RefreshCcw, X } from 'lucide-react';

interface ProductBulkActionsProps {
  selectedCount: number;
  filteredProducts: any[];  // This prop is now properly typed
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
  if (selectedCount === 0) return null;
  
  const allSelected = selectedCount === filteredProducts.length;
  
  return (
    <div className="bg-muted/50 border rounded-md p-3 mb-4 flex flex-wrap items-center gap-2">
      <div className="mr-auto">
        <span className="text-sm font-medium">
          {selectedCount} {selectedCount === 1 ? 'product' : 'products'} selected
          {allSelected && filteredProducts.length > 0 && ' (all items)'}
        </span>
      </div>
      
      <Button 
        variant="outline" 
        size="sm" 
        onClick={onBulkActivate}
        disabled={disabled}
        className="h-8"
      >
        <CheckCircle className="h-4 w-4 mr-1" />
        Activate
      </Button>
      
      <Button 
        variant="outline" 
        size="sm" 
        onClick={onBulkDeactivate}
        disabled={disabled}
        className="h-8"
      >
        <Ban className="h-4 w-4 mr-1" />
        Deactivate
      </Button>
      
      {onSyncProducts && (
        <Button 
          variant="outline" 
          size="sm" 
          onClick={onSyncProducts}
          disabled={disabled}
          className="h-8"
        >
          <RefreshCcw className="h-4 w-4 mr-1" />
          Sync Selected
        </Button>
      )}
      
      <Button 
        variant="outline" 
        size="sm" 
        onClick={onBulkDelete}
        disabled={disabled}
        className="h-8 text-red-500 hover:text-red-700 hover:border-red-300"
      >
        <Trash2 className="h-4 w-4 mr-1" />
        Delete
      </Button>
      
      <Button 
        variant="ghost" 
        size="sm" 
        onClick={onClearSelection}
        className="h-8"
      >
        <X className="h-4 w-4 mr-1" />
        Clear Selection
      </Button>
    </div>
  );
}
