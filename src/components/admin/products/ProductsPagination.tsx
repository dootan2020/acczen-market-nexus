
import React from 'react';
import { Button } from '@/components/ui/button';

interface ProductsPaginationProps {
  currentPage: number;
  totalPages: number;
  prevPage: () => void;
  nextPage: () => void;
  hasNextPage: boolean;
  hasPrevPage: boolean;
  goToPage: (page: number) => void; // Sửa lại để nhận tham số page
}

export const ProductsPagination = ({
  currentPage,
  totalPages,
  prevPage,
  nextPage,
  hasNextPage,
  hasPrevPage,
  goToPage
}: ProductsPaginationProps) => {
  if (totalPages <= 1) return null;
  
  return (
    <div className="flex justify-center mt-4">
      <div className="flex items-center gap-2">
        <Button 
          variant="outline" 
          size="sm" 
          onClick={prevPage}
          disabled={!hasPrevPage}
        >
          Previous
        </Button>
        <span className="text-sm">
          Page {currentPage} of {totalPages}
        </span>
        <Button 
          variant="outline" 
          size="sm" 
          onClick={nextPage}
          disabled={!hasNextPage}
        >
          Next
        </Button>
      </div>
    </div>
  );
};
