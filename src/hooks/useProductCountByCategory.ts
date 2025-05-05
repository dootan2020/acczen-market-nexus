
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

interface ProductCountResult {
  counts: Record<string, number>;
  isLoading: boolean;
  error: Error | null;
}

export const useProductCountByCategory = (): ProductCountResult => {
  const { data, isLoading, error } = useQuery({
    queryKey: ['product-counts-by-category'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('products')
        .select('category_id')
        .eq('active', true);

      if (error) throw error;

      // Count products by category
      const counts: Record<string, number> = {};
      data.forEach(product => {
        const categoryId = product.category_id;
        if (categoryId) {
          counts[categoryId] = (counts[categoryId] || 0) + 1;
        }
      });

      return counts;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  return {
    counts: data || {},
    isLoading,
    error: error as Error
  };
};
