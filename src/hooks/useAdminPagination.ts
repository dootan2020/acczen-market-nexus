
import { useState, useEffect, useCallback } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

interface PaginationOptions {
  page?: number;
  pageSize?: number;
  filter?: Record<string, any>;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  searchTerm?: string;
  searchColumn?: string;
}

export interface PaginationResult<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  pageCount: number;
  isLoading: boolean;
  error: Error | null;
  isFetching: boolean;
  currentPage: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
  setPage: (page: number) => void;
  setPageSize: (size: number) => void;
  setFilter: (filter: Record<string, any>) => void;
  setSorting: (column: string, order: 'asc' | 'desc') => void;
  setSearchTerm: (term: string) => void;
  refetch: () => void;
  goToPage: (page: number) => void;
  prevPage: () => void;
  nextPage: () => void;
}

// Type safety for table names
type TableNames = 'products' | 'orders' | 'deposits' | 'profiles' | 'categories' | 'subcategories';

/**
 * Hook for admin pagination with TanStack Query v5
 */
export function useAdminPagination<T>(
  tableName: TableNames,
  queryKey: string | string[],
  options: PaginationOptions = {},
  initialFilter: Record<string, any> = {},
  customSelect?: string
): PaginationResult<T> {
  // State
  const [page, setPage] = useState(options.page || 1);
  const [pageSize, setPageSize] = useState(options.pageSize || 10);
  const [filter, setFilter] = useState<Record<string, any>>(initialFilter || {});
  const [sortBy, setSortBy] = useState<string>(options.sortBy || 'created_at');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>(options.sortOrder || 'desc');
  const [searchTerm, setSearchTerm] = useState<string>(options.searchTerm || '');
  const [searchColumn, setSearchColumn] = useState<string>(options.searchColumn || '');
  
  // Derived state
  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;
  
  // Reset to page 1 when filters or search changes
  useEffect(() => {
    setPage(1);
  }, [filter, searchTerm]);

  // Create a properly typed query key array
  const createQueryKey = useCallback(() => {
    const baseKey = Array.isArray(queryKey) ? queryKey : [queryKey];
    
    // Create a serialized version of complex objects to avoid recursion issues
    const serializedFilter = JSON.stringify(filter);
    
    return [
      ...baseKey,
      `page-${page}`,
      `size-${pageSize}`,
      `filter-${serializedFilter}`,
      `sort-${sortBy}`,
      `order-${sortOrder}`,
      `search-${searchTerm}`,
      `column-${searchColumn}`
    ];
  }, [filter, page, pageSize, queryKey, searchColumn, searchTerm, sortBy, sortOrder]);

  // Fetch data with pagination
  const { data: queryData, isLoading, error, isFetching, refetch } = useQuery({
    queryKey: createQueryKey(),
    queryFn: async () => {
      // Start with the base query
      let query = supabase
        .from(tableName)
        .select(customSelect || '*', { count: 'exact' });
      
      // Apply search if provided
      if (searchTerm && searchColumn) {
        query = query.ilike(searchColumn, `%${searchTerm}%`);
      }
      
      // Apply filters
      Object.entries(filter).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          if (Array.isArray(value)) {
            query = query.in(key, value);
          } else if (typeof value === 'object' && value !== null) {
            // Handle range filters with gt, lt, etc.
            Object.entries(value).forEach(([operator, operatorValue]) => {
              if (operatorValue !== undefined && operatorValue !== null && operatorValue !== '') {
                switch (operator) {
                  case 'gt': query = query.gt(key, operatorValue); break;
                  case 'gte': query = query.gte(key, operatorValue); break;
                  case 'lt': query = query.lt(key, operatorValue); break;
                  case 'lte': query = query.lte(key, operatorValue); break;
                  case 'neq': query = query.neq(key, operatorValue); break;
                  case 'like': query = query.like(key, `%${operatorValue}%`); break;
                  case 'ilike': query = query.ilike(key, `%${operatorValue}%`); break;
                }
              }
            });
          } else {
            query = query.eq(key, value);
          }
        }
      });
      
      // Apply sorting
      if (sortBy) {
        query = query.order(sortBy, { ascending: sortOrder === 'asc' });
      }
      
      // Apply pagination
      const { data, count, error } = await query
        .range(from, to);
      
      if (error) throw error;
      
      return {
        data: data as T[],
        count: count || 0
      };
    },
    meta: {
      onError: (error: Error) => {
        console.error("Pagination query error:", error);
      }
    }
  });

  // Extract data and count from the query result
  const data = queryData?.data || [];
  const count = queryData?.count || 0;
  
  // Calculate page count
  const pageCount = Math.ceil(count / pageSize);
  const totalPages = pageCount;
  const currentPage = page;
  
  // Calculate if there are next/previous pages
  const hasNextPage = page < pageCount;
  const hasPrevPage = page > 1;
  
  // Handler for sorting
  const setSorting = useCallback((column: string, order: 'asc' | 'desc') => {
    setSortBy(column);
    setSortOrder(order);
  }, []);

  // Navigation functions
  const goToPage = useCallback((newPage: number) => {
    if (newPage >= 1 && newPage <= pageCount) {
      setPage(newPage);
    }
  }, [pageCount]);

  const nextPage = useCallback(() => {
    if (hasNextPage) {
      setPage(page + 1);
    }
  }, [page, hasNextPage]);

  const prevPage = useCallback(() => {
    if (hasPrevPage) {
      setPage(page - 1);
    }
  }, [page, hasPrevPage]);

  return {
    data,
    total: count,
    page,
    pageSize,
    pageCount,
    isLoading,
    error: error as Error | null,
    isFetching,
    setPage,
    setPageSize,
    setFilter,
    setSorting,
    setSearchTerm,
    refetch,
    currentPage,
    totalPages,
    hasNextPage,
    hasPrevPage,
    goToPage,
    prevPage,
    nextPage
  };
}
