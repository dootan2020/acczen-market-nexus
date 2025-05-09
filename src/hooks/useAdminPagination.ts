import { useState, useCallback } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Database } from '@/integrations/supabase/types';

// Use these more specific types from the generated Database type
type TableName = keyof Database['public']['Tables'];

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
  refetch: () => Promise<any>; // Added refetch method to the return type
}

type FilterOperator = {
  operator: 'eq' | 'neq' | 'gt' | 'lt' | 'gte' | 'lte' | 'like' | 'ilike' | 'in';
  value: any;
};

export function useAdminPagination<T>(
  table: TableName,
  queryKey: string[],
  options: PaginationOptions = { pageSize: 10, initialPage: 1 },
  filters?: Record<string, any>,
  relations?: string
): PaginationHookResult<T> {
  const [currentPage, setCurrentPage] = useState(options.initialPage || 1);
  const pageSize = options.pageSize || 10;
  const from = (currentPage - 1) * pageSize;
  const to = from + pageSize - 1;

  // Get total count - using a simplified query key to avoid deep nesting
  const { data: countData } = useQuery({
    queryKey: [...queryKey, 'count', JSON.stringify(filters)],
    queryFn: async () => {
      // Use cast to explicitly tell TypeScript we know what we're doing with dynamic table name
      const tableRef = supabase.from(table as any);
      let query = tableRef.select('*', { count: 'exact', head: true });
      
      // Apply filters if provided
      if (filters) {
        Object.entries(filters).forEach(([key, value]) => {
          if (value !== undefined && value !== null && value !== '') {
            if (Array.isArray(value)) {
              query = query.in(key, value);
            } else if (typeof value === 'object' && value && 'operator' in value) {
              // Handle custom operators like gt, lt, etc.
              const { operator, value: opValue } = value as FilterOperator;
              if (operator === 'like') {
                query = query.ilike(key, `%${opValue}%`);
              } else if (operator === 'in') {
                query = query.in(key, opValue);
              } else if (operator === 'eq') {
                query = query.eq(key, opValue);
              } else if (operator === 'neq') {
                query = query.neq(key, opValue);
              } else if (operator === 'gt') {
                query = query.gt(key, opValue);
              } else if (operator === 'lt') {
                query = query.lt(key, opValue);
              } else if (operator === 'gte') {
                query = query.gte(key, opValue);
              } else if (operator === 'lte') {
                query = query.lte(key, opValue);
              } else if (operator === 'ilike') {
                query = query.ilike(key, `%${opValue}%`);
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

  // Get paginated data - using a simplified query key
  const {
    data,
    isLoading,
    error,
    refetch, // Extract refetch from useQuery
  } = useQuery({
    queryKey: [...queryKey, 'page-' + currentPage, 'size-' + pageSize, JSON.stringify(filters)],
    queryFn: async () => {
      // Use cast to explicitly tell TypeScript we know what we're doing with dynamic table name
      const tableRef = supabase.from(table as any);
      
      // Initialize the query with the select statement
      let query = relations ? tableRef.select(relations) : tableRef.select('*');
      
      // Apply filters if provided
      if (filters) {
        Object.entries(filters).forEach(([key, value]) => {
          if (value !== undefined && value !== null && value !== '') {
            if (Array.isArray(value)) {
              query = query.in(key, value);
            } else if (typeof value === 'object' && value && 'operator' in value) {
              // Handle custom operators like gt, lt, etc.
              const { operator, value: opValue } = value as FilterOperator;
              if (operator === 'like') {
                query = query.ilike(key, `%${opValue}%`);
              } else if (operator === 'in') {
                query = query.in(key, opValue);
              } else if (operator === 'eq') {
                query = query.eq(key, opValue);
              } else if (operator === 'neq') {
                query = query.neq(key, opValue);
              } else if (operator === 'gt') {
                query = query.gt(key, opValue);
              } else if (operator === 'lt') {
                query = query.lt(key, opValue);
              } else if (operator === 'gte') {
                query = query.gte(key, opValue);
              } else if (operator === 'lte') {
                query = query.lte(key, opValue);
              } else if (operator === 'ilike') {
                query = query.ilike(key, `%${opValue}%`);
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

  // Sửa lại goToPage để nhận tham số page
  const goToPage = useCallback((page: number) => {
    // Kiểm tra và đảm bảo trang nằm trong khoảng hợp lệ
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
    hasPrevPage: currentPage > 1,
    refetch // Include refetch in the return object
  };
}
