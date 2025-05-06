
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

interface ProductCountResult {
  counts: Record<string, number>;
  isLoading: boolean;
  error: Error | null;
}

// Separate the query function to avoid deep type inference issues
const fetchProductCounts = async (): Promise<Record<string, number>> => {
  const { data, error } = await supabase
    .from('products')
    .select('category_id')
    .eq('active', true);

  if (error) throw error;

  // Count products by category
  const counts: Record<string, number> = {};
  if (data) {
    data.forEach(product => {
      const categoryId = product.category_id;
      if (categoryId) {
        counts[categoryId] = (counts[categoryId] || 0) + 1;
      }
    });
  }

  return counts;
};

export const useProductCountByCategory = (): ProductCountResult => {
  // Using old style syntax to avoid type instantiation issues
  const { data, isLoading, error } = useQuery(
    ['product-counts-by-category'],
    fetchProductCounts,
    {
      staleTime: 5 * 60 * 1000, // 5 minutes
    }
  );

  return {
    counts: data || {},
    isLoading,
    error: error as Error | null
  };
};
