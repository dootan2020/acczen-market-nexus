
import React from 'react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { ChevronDown } from 'lucide-react';

interface ProductBulkActionsProps {
  selectedCount: number;
  onBulkDelete: () => void;
  onBulkActivate: () => void;
  onBulkDeactivate: () => void;
  onClearSelection: () => void;
}

export const ProductBulkActions = ({
  selectedCount,
  onBulkDelete,
  onBulkActivate,
  onBulkDeactivate,
  onClearSelection,
}: ProductBulkActionsProps) => {
  if (selectedCount === 0) return null;

  return (
    <div className="bg-muted p-2 rounded-md mb-4 flex items-center justify-between">
      <span className="text-sm ml-2">
        {selectedCount} {selectedCount === 1 ? 'product' : 'products'} selected
      </span>
      <div className="flex gap-2">
        <Button 
          size="sm" 
          variant="outline"
          onClick={onClearSelection}
        >
          Clear Selection
        </Button>
        
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button size="sm" variant="outline">
              Bulk Actions <ChevronDown className="h-4 w-4 ml-1" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={onBulkActivate}>
              Set Active
            </DropdownMenuItem>
            <DropdownMenuItem onClick={onBulkDeactivate}>
              Set Inactive
            </DropdownMenuItem>
            <DropdownMenuItem 
              className="text-red-600" 
              onClick={onBulkDelete}
            >
              Delete Selected
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
};
