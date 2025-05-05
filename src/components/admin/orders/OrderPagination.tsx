
import React from 'react';
import { Button } from '@/components/ui/button';

interface OrderPaginationProps {
  currentPage: number;
  totalPages: number;
  prevPage: () => void;
  nextPage: () => void;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

export const OrderPagination: React.FC<OrderPaginationProps> = ({
  currentPage,
  totalPages,
  prevPage,
  nextPage,
  hasNextPage,
  hasPrevPage
}) => {
  if (totalPages <= 1) return null;
  
  return (
    <div className="mt-4 flex justify-center">
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
