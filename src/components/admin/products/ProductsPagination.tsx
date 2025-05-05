
import React from 'react';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight, MoreHorizontal } from 'lucide-react';

export interface ProductsPaginationProps {
  currentPage: number;
  totalPages: number;
  prevPage: () => void;
  nextPage: () => void;
  hasNextPage: boolean;
  hasPrevPage: boolean;
  goToPage?: (page: number) => void;
}

export function ProductsPagination({
  currentPage,
  totalPages,
  prevPage,
  nextPage,
  hasNextPage,
  hasPrevPage,
  goToPage
}: ProductsPaginationProps) {
  // Generate page numbers to show
  const getPageNumbers = () => {
    const pages = [];
    
    // Always show first page
    if (totalPages > 0) {
      pages.push(1);
    }
    
    // Calculate range of pages to show around current page
    let start = Math.max(2, currentPage - 1);
    let end = Math.min(totalPages - 1, currentPage + 1);
    
    // Add ellipsis after first page if needed
    if (start > 2) {
      pages.push('ellipsis-start');
    }
    
    // Add pages in the middle
    for (let i = start; i <= end; i++) {
      pages.push(i);
    }
    
    // Add ellipsis before last page if needed
    if (end < totalPages - 1) {
      pages.push('ellipsis-end');
    }
    
    // Always show last page if it exists
    if (totalPages > 1) {
      pages.push(totalPages);
    }
    
    return pages;
  };
  
  const pageNumbers = getPageNumbers();
  
  const handleGoToPage = (page: number) => {
    if (goToPage) {
      goToPage(page);
    }
  };
  
  if (totalPages <= 1) return null;
  
  return (
    <div className="flex items-center justify-between py-4">
      <div className="flex-1 text-sm text-muted-foreground">
        Page {currentPage} of {totalPages}
      </div>
      
      <div className="flex items-center space-x-2">
        <Button
          variant="outline"
          size="sm"
          onClick={prevPage}
          disabled={!hasPrevPage}
        >
          <ChevronLeft className="h-4 w-4" />
          <span className="sr-only">Previous Page</span>
        </Button>
        
        <div className="hidden md:flex space-x-2">
          {pageNumbers.map((page, i) => {
            if (page === 'ellipsis-start' || page === 'ellipsis-end') {
              return (
                <Button 
                  key={`${page}-${i}`} 
                  variant="outline" 
                  size="sm" 
                  disabled 
                  className="px-2"
                >
                  <MoreHorizontal className="h-4 w-4" />
                  <span className="sr-only">More Pages</span>
                </Button>
              );
            }
            
            return (
              <Button
                key={`page-${page}`}
                variant={currentPage === page ? "default" : "outline"}
                size="sm"
                onClick={() => handleGoToPage(page as number)}
              >
                {page}
              </Button>
            );
          })}
        </div>
        
        <Button
          variant="outline"
          size="sm"
          onClick={nextPage}
          disabled={!hasNextPage}
        >
          <ChevronRight className="h-4 w-4" />
          <span className="sr-only">Next Page</span>
        </Button>
      </div>
    </div>
  );
}
