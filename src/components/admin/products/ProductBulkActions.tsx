
import { Button } from '@/components/ui/button';
import {
  TrashIcon,
  CheckCircle,
  XCircle,
  EyeOff,
  Eye,
  Eraser
} from 'lucide-react';

interface ProductBulkActionsProps {
  selectedCount: number;
  onBulkDelete: () => void;
  onBulkActivate: () => void;
  onBulkDeactivate: () => void;
  onBulkShow?: () => void;
  onBulkHide?: () => void;
  onClearSelection: () => void;
}

export function ProductBulkActions({ 
  selectedCount, 
  onBulkDelete, 
  onBulkActivate, 
  onBulkDeactivate,
  onBulkShow,
  onBulkHide,
  onClearSelection 
}: ProductBulkActionsProps) {
  if (selectedCount === 0) {
    return null;
  }

  return (
    <div className="bg-muted/50 border rounded-lg p-2 mb-4">
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-sm font-medium ml-2">
          {selectedCount} item{selectedCount !== 1 && 's'} selected
        </span>
        
        <div className="flex flex-wrap gap-2 ml-auto">
          <Button
            size="sm"
            variant="outline"
            onClick={onBulkActivate}
          >
            <CheckCircle className="h-4 w-4 mr-1" />
            Activate
          </Button>
          
          <Button
            size="sm"
            variant="outline"
            onClick={onBulkDeactivate}
          >
            <XCircle className="h-4 w-4 mr-1" />
            Deactivate
          </Button>
          
          {onBulkShow && (
            <Button
              size="sm"
              variant="outline"
              onClick={onBulkShow}
            >
              <Eye className="h-4 w-4 mr-1" />
              Show
            </Button>
          )}
          
          {onBulkHide && (
            <Button
              size="sm"
              variant="outline"
              onClick={onBulkHide}
            >
              <EyeOff className="h-4 w-4 mr-1" />
              Hide
            </Button>
          )}
          
          <Button
            size="sm"
            variant="outline"
            className="text-destructive hover:text-destructive hover:bg-destructive/10"
            onClick={onBulkDelete}
          >
            <TrashIcon className="h-4 w-4 mr-1" />
            Delete
          </Button>
          
          <Button
            size="sm"
            variant="ghost"
            onClick={onClearSelection}
          >
            <Eraser className="h-4 w-4 mr-1" />
            Clear selection
          </Button>
        </div>
      </div>
    </div>
  );
}
