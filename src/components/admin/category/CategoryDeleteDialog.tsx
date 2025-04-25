
import React from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

interface CategoryDeleteDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  categoryName: string | undefined;
  onDelete: () => void;
  isPending: boolean;
}

const CategoryDeleteDialog: React.FC<CategoryDeleteDialogProps> = ({
  isOpen,
  onOpenChange,
  categoryName,
  onDelete,
  isPending
}) => {
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Delete Category</DialogTitle>
          <DialogDescription>
            Are you sure you want to delete "{categoryName}"? This action cannot be undone and may affect products in this category.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outline">Cancel</Button>
          </DialogClose>
          <Button 
            variant="destructive"
            onClick={onDelete}
            disabled={isPending}
          >
            {isPending ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-2 border-b-transparent mr-2"></div>
                Deleting...
              </>
            ) : 'Delete Category'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default CategoryDeleteDialog;
