
import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";

interface PurchasesPaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

export const PurchasesPagination = ({
  currentPage,
  totalPages,
  onPageChange
}: PurchasesPaginationProps) => {
  if (totalPages <= 1) return null;

  // Calculate what page numbers to show
  const getPageNumbers = () => {
    const pageNumbers = [];
    const maxPagesToShow = 5;
    
    if (totalPages <= maxPagesToShow) {
      // Show all pages if total is less than or equal to maxPagesToShow
      for (let i = 1; i <= totalPages; i++) {
        pageNumbers.push(i);
      }
    } else {
      // Always include first page
      pageNumbers.push(1);
      
      // Calculate start and end of page range around current page
      let startPage = Math.max(2, currentPage - 1);
      let endPage = Math.min(totalPages - 1, currentPage + 1);
      
      // Adjust start and end to ensure we show up to maxPagesToShow-2 pages (excluding first and last)
      if (endPage - startPage < maxPagesToShow - 3) {
        if (startPage === 2) {
          endPage = Math.min(totalPages - 1, maxPagesToShow - 2);
        } else if (endPage === totalPages - 1) {
          startPage = Math.max(2, totalPages - maxPagesToShow + 2);
        }
      }
      
      // Add ellipsis after first page if needed
      if (startPage > 2) {
        pageNumbers.push('ellipsis-start');
      }
      
      // Add page numbers
      for (let i = startPage; i <= endPage; i++) {
        pageNumbers.push(i);
      }
      
      // Add ellipsis before last page if needed
      if (endPage < totalPages - 1) {
        pageNumbers.push('ellipsis-end');
      }
      
      // Always include last page if there is more than one page
      if (totalPages > 1) {
        pageNumbers.push(totalPages);
      }
    }
    
    return pageNumbers;
  };

  return (
    <Pagination className="my-6">
      <PaginationContent>
        <PaginationItem>
          <PaginationPrevious 
            href="#" 
            onClick={(e) => {
              e.preventDefault();
              if (currentPage > 1) onPageChange(currentPage - 1);
            }}
            aria-disabled={currentPage === 1}
            tabIndex={currentPage === 1 ? -1 : undefined}
            className={currentPage === 1 ? "pointer-events-none opacity-50" : ""}
            icon={<ChevronLeft className="h-4 w-4" />}
          />
        </PaginationItem>
        
        {getPageNumbers().map((pageNum, i) => {
          if (pageNum === 'ellipsis-start' || pageNum === 'ellipsis-end') {
            return (
              <PaginationItem key={`ellipsis-${i}`}>
                <span className="flex h-9 w-9 items-center justify-center text-sm">...</span>
              </PaginationItem>
            );
          }
          
          return (
            <PaginationItem key={pageNum}>
              <PaginationLink 
                href="#" 
                onClick={(e) => {
                  e.preventDefault();
                  onPageChange(Number(pageNum));
                }}
                isActive={pageNum === currentPage}
                className="rounded-full"
              >
                {pageNum}
              </PaginationLink>
            </PaginationItem>
          );
        })}
        
        <PaginationItem>
          <PaginationNext 
            href="#" 
            onClick={(e) => {
              e.preventDefault();
              if (currentPage < totalPages) onPageChange(currentPage + 1);
            }}
            aria-disabled={currentPage === totalPages}
            tabIndex={currentPage === totalPages ? -1 : undefined}
            className={currentPage === totalPages ? "pointer-events-none opacity-50" : ""}
            icon={<ChevronRight className="h-4 w-4" />}
          />
        </PaginationItem>
      </PaginationContent>
    </Pagination>
  );
};
