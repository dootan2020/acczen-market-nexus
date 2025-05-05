
import React from 'react';
import { Button } from '@/components/ui/button';

interface UsersPaginationProps {
  currentPage: number;
  totalPages: number;
  prevPage: () => void;
  nextPage: () => void;
  hasNextPage: boolean;
  hasPrevPage: boolean;
  goToPage?: (page: number) => void;
}

export const UsersPagination = ({
  currentPage,
  totalPages,
  prevPage,
  nextPage,
  hasNextPage,
  hasPrevPage,
  goToPage,
}: UsersPaginationProps) => {
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
