
import { useState, useEffect, useCallback } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface PaginationOptions {
  pageSize?: number;
  initialPage?: number;
}

interface FilterOptions {
  [key: string]: any;
}

/**
 * Custom hook for pagination in admin panels
 * @param tableName Supabase table name
 * @param queryKey React Query key
 * @param options Pagination options (pageSize, initialPage)
 * @param filterOptions Filter options for the query
 * @param selectQuery Select query for the table
 * @returns Pagination state and handlers
 */
export function useAdminPagination<T>(
  tableName: string,
  queryKey: (string | number)[],
  options: PaginationOptions = {},
  filterOptions: FilterOptions = {},
  selectQuery: string = '*'
) {
  const { pageSize = 10, initialPage = 1 } = options;
  const [currentPage, setCurrentPage] = useState(initialPage);
  const [totalCount, setTotalCount] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [isInitialized, setIsInitialized] = useState(false);

  // Count total number of items for pagination
  const fetchTotalCount = useCallback(async () => {
    try {
      // Initialize query with filters
      let query = supabase.from(tableName).select('id', { count: 'exact' });

      // Apply all filters
      Object.entries(filterOptions).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          if (typeof value === 'object' && 'operator' in value && 'value' in value) {
            // Handle specific operators like gt, lt, etc.
            switch (value.operator) {
              case 'gt':
                query = query.gt(key, value.value);
                break;
              case 'lt':
                query = query.lt(key, value.value);
                break;
              case 'gte':
                query = query.gte(key, value.value);
                break;
              case 'lte':
                query = query.lte(key, value.value);
                break;
              case 'neq':
                query = query.neq(key, value.value);
                break;
              case 'like':
                query = query.like(key, `%${value.value}%`);
                break;
              case 'ilike':
                query = query.ilike(key, `%${value.value}%`);
                break;
              default:
                query = query.eq(key, value.value);
            }
          } else {
            // Simple equality filter
            query = query.eq(key, value);
          }
        }
      });

      // Execute count query
      const { count, error } = await query;

      if (error) {
        throw error;
      }

      return count || 0;
    } catch (error) {
      console.error(`Error fetching total count for ${tableName}:`, error);
      toast.error(`Failed to load pagination data. Please try again.`);
      return 0;
    }
  }, [tableName, filterOptions]);

  // Calculate total pages whenever total count changes
  useEffect(() => {
    const calculateTotalPages = async () => {
      const count = await fetchTotalCount();
      setTotalCount(count);
      setTotalPages(Math.max(1, Math.ceil(count / pageSize)));
      setIsInitialized(true);
    };

    calculateTotalPages();
  }, [fetchTotalCount, pageSize]);

  // Reset pagination when filters change
  useEffect(() => {
    if (isInitialized) {
      setCurrentPage(1);
    }
  }, [JSON.stringify(filterOptions), isInitialized]);

  // Fetch data with pagination
  const { data, isLoading, error, refetch } = useQuery<T[]>({
    queryKey: [...queryKey, currentPage, pageSize, JSON.stringify(filterOptions)],
    queryFn: async () => {
      try {
        // Calculate pagination values
        const from = (currentPage - 1) * pageSize;
        const to = from + pageSize - 1;

        // Initialize query with filters
        let query = supabase
          .from(tableName)
          .select(selectQuery)
          .range(from, to);

        // Apply all filters
        Object.entries(filterOptions).forEach(([key, value]) => {
          if (value !== undefined && value !== null && value !== '') {
            if (typeof value === 'object' && 'operator' in value && 'value' in value) {
              // Handle specific operators like gt, lt, etc.
              switch (value.operator) {
                case 'gt':
                  query = query.gt(key, value.value);
                  break;
                case 'lt':
                  query = query.lt(key, value.value);
                  break;
                case 'gte':
                  query = query.gte(key, value.value);
                  break;
                case 'lte':
                  query = query.lte(key, value.value);
                  break;
                case 'neq':
                  query = query.neq(key, value.value);
                  break;
                case 'like':
                  query = query.like(key, `%${value.value}%`);
                  break;
                case 'ilike':
                  query = query.ilike(key, `%${value.value}%`);
                  break;
                default:
                  query = query.eq(key, value.value);
              }
            } else if (Array.isArray(value)) {
              // Handle array of values for 'in' operations
              query = query.in(key, value);
            } else {
              // Simple equality filter
              query = query.eq(key, value);
            }
          }
        });

        // Execute the query
        const { data, error } = await query;

        if (error) {
          throw error;
        }

        return (data as T[]) || [];
      } catch (error) {
        console.error(`Error fetching ${tableName}:`, error);
        toast.error(`Failed to load data. Please try again.`);
        return [];
      }
    },
    staleTime: 1000 * 60, // 1 minute
    gcTime: 1000 * 60 * 5, // 5 minutes
    refetchOnWindowFocus: false,
  });

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

  const goToPage = useCallback((page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  }, [totalPages]);

  return {
    data,
    isLoading,
    error,
    refetch,
    currentPage,
    totalPages,
    totalCount,
    pageSize,
    nextPage,
    prevPage,
    goToPage,
    hasNextPage: currentPage < totalPages,
    hasPrevPage: currentPage > 1
  };
}
