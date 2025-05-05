
import { useState, useCallback, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Database } from '@/integrations/supabase/types';
import { toast } from '@/hooks/use-toast';

// Use these more specific types from the generated Database type
type TableName = keyof Database['public']['Tables'];

interface PaginationOptions {
  pageSize?: number;
  initialPage?: number;
  staleTime?: number;
  cacheTime?: number;
  retries?: number;
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
  refresh: () => void; // Added refresh function
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
  const staleTime = options.staleTime || 5 * 60 * 1000; // 5 minutes default
  const cacheTime = options.cacheTime || 10 * 60 * 1000; // 10 minutes default
  const retries = options.retries !== undefined ? options.retries : 2;
  
  // Calculate pagination ranges
  const from = useMemo(() => (currentPage - 1) * pageSize, [currentPage, pageSize]);
  const to = useMemo(() => from + pageSize - 1, [from, pageSize]);

  // Get total count
  const { 
    data: countData,
    refetch: refetchCount 
  } = useQuery({
    queryKey: [...queryKey, 'count', JSON.stringify(filters)],
    queryFn: async () => {
      try {
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
      } catch (error) {
        console.error(`Error fetching count for ${table}:`, error);
        toast({
          title: 'Error fetching data',
          description: 'Failed to get total count',
          variant: 'destructive'
        });
        throw error;
      }
    },
    staleTime,
    gcTime: cacheTime,
    retry: retries
  });

  // Get paginated data
  const {
    data,
    isLoading,
    error,
    refetch
  } = useQuery({
    queryKey: [...queryKey, currentPage, pageSize, JSON.stringify(filters)],
    queryFn: async () => {
      try {
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
      } catch (error) {
        console.error(`Error fetching data for ${table}:`, error);
        toast({
          title: 'Error fetching data',
          description: 'Failed to retrieve data from server',
          variant: 'destructive'
        });
        throw error;
      }
    },
    staleTime,
    gcTime: cacheTime,
    retry: retries,
    keepPreviousData: true // Keep previous data while loading new data
  });

  const totalCount = countData || 0;
  const totalPages = Math.max(1, Math.ceil(totalCount / pageSize));

  const goToPage = useCallback((page: number) => {
    const validPage = Math.max(1, Math.min(page, totalPages || 1));
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

  // Function to refresh data
  const refresh = useCallback(() => {
    refetch();
    refetchCount();
  }, [refetch, refetchCount]);

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
    refresh
  };
}
