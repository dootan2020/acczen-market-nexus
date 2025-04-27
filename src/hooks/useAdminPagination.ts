
import { useState, useCallback } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

interface PaginationOptions {
  pageSize?: number;
  initialPage?: number;
}

interface PaginationHookResult<T> {
  data: T[] | undefined;
  isLoading: boolean;
  error: Error | null;
  currentPage: number;
  totalPages: number;
  totalCount: number;
  goToPage: (page: number) => void;
  nextPage: () => void;
  prevPage: () => void;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

export function useAdminPagination<T>(
  table: string,
  queryKey: string[],
  options: PaginationOptions = { pageSize: 10, initialPage: 1 },
  filters?: Record<string, any>,
  relations?: string
): PaginationHookResult<T> {
  const [currentPage, setCurrentPage] = useState(options.initialPage || 1);
  const pageSize = options.pageSize || 10;
  const from = (currentPage - 1) * pageSize;
  const to = from + pageSize - 1;

  // Get total count
  const { data: countData } = useQuery({
    queryKey: [...queryKey, 'count'],
    queryFn: async () => {
      let query = supabase.from(table).select('*', { count: 'exact', head: true });
      
      // Apply filters if provided
      if (filters) {
        Object.entries(filters).forEach(([key, value]) => {
          if (value !== undefined && value !== null && value !== '') {
            if (Array.isArray(value)) {
              query = query.in(key, value);
            } else if (typeof value === 'object' && value.operator) {
              // Handle custom operators like gt, lt, etc.
              const { operator, value: opValue } = value;
              if (operator === 'like') {
                query = query.ilike(key, `%${opValue}%`);
              } else {
                query = query[operator](key, opValue);
              }
            } else {
              query = query.eq(key, value);
            }
          }
        });
      }
      
      const { count, error } = await query;
      
      if (error) throw error;
      return count || 0;
    }
  });

  // Get paginated data
  const {
    data,
    isLoading,
    error,
  } = useQuery({
    queryKey: [...queryKey, currentPage, pageSize, JSON.stringify(filters)],
    queryFn: async () => {
      let query = supabase.from(table).select(relations || '*');
      
      // Apply filters if provided
      if (filters) {
        Object.entries(filters).forEach(([key, value]) => {
          if (value !== undefined && value !== null && value !== '') {
            if (Array.isArray(value)) {
              query = query.in(key, value);
            } else if (typeof value === 'object' && value.operator) {
              // Handle custom operators like gt, lt, etc.
              const { operator, value: opValue } = value;
              if (operator === 'like') {
                query = query.ilike(key, `%${opValue}%`);
              } else {
                query = query[operator](key, opValue);
              }
            } else {
              query = query.eq(key, value);
            }
          }
        });
      }
      
      // Apply pagination
      query = query.range(from, to).order('created_at', { ascending: false });
      
      const { data, error } = await query;
      
      if (error) throw error;
      return data as T[];
    }
  });

  const totalCount = countData || 0;
  const totalPages = Math.ceil(totalCount / pageSize);

  const goToPage = useCallback((page: number) => {
    const validPage = Math.max(1, Math.min(page, totalPages));
    setCurrentPage(validPage);
  }, [totalPages]);

  const nextPage = useCallback(() => {
    if (currentPage < totalPages) {
      setCurrentPage(prev => prev + 1);
    }
  }, [currentPage, totalPages]);

  const prevPage = useCallback(() => {
    if (currentPage > 1) {
      setCurrentPage(prev => prev - 1);
    }
  }, [currentPage]);

  return {
    data,
    isLoading,
    error: error as Error | null,
    currentPage,
    totalPages,
    totalCount,
    goToPage,
    nextPage,
    prevPage,
    hasNextPage: currentPage < totalPages,
    hasPrevPage: currentPage > 1
  };
}
