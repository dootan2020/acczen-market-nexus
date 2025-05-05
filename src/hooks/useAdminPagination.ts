
import { useState, useEffect, useCallback } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { PostgrestFilterBuilder } from '@supabase/postgrest-js';

interface PaginationOptions {
  page: number;
  pageSize: number;
  filter?: Record<string, any>;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  searchTerm?: string;
  searchColumn?: string;
}

interface PaginationResult<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  pageCount: number;
  isLoading: boolean;
  error: Error | null;
  isFetching: boolean;
  setPage: (page: number) => void;
  setPageSize: (size: number) => void;
  setFilter: (filter: Record<string, any>) => void;
  setSorting: (column: string, order: 'asc' | 'desc') => void;
  setSearchTerm: (term: string) => void;
  refetch: () => void;
}

// Type safety for table names
type TableNames = 'products' | 'orders' | 'deposits' | 'profiles' | 'categories' | 'subcategories';

export function useAdminPagination<T>(
  tableName: TableNames, 
  options: PaginationOptions, 
  customSelect?: string
): PaginationResult<T> {
  // State
  const [page, setPage] = useState(options.page || 1);
  const [pageSize, setPageSize] = useState(options.pageSize || 10);
  const [filter, setFilter] = useState<Record<string, any>>(options.filter || {});
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

  // Fetch data with pagination
  const { data, isLoading, error, isFetching, refetch } = useQuery<{data: T[], count: number }>({
    queryKey: ['admin', tableName, page, pageSize, filter, sortBy, sortOrder, searchTerm, searchColumn],
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
      const { data, error, count } = await query
        .range(from, to);
      
      if (error) throw error;
      
      return {
        data: data as T[],
        count: count || 0
      };
    },
    keepPreviousData: true,
    staleTime: 30000 // 30 seconds
  });

  // Calculate page count
  const pageCount = Math.ceil((data?.count || 0) / pageSize);
  
  // Handler for sorting
  const setSorting = useCallback((column: string, order: 'asc' | 'desc') => {
    setSortBy(column);
    setSortOrder(order);
  }, []);

  return {
    data: data?.data || [],
    total: data?.count || 0,
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
    refetch
  };
}
