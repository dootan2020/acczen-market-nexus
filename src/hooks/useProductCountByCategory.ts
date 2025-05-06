
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export const useProductCountByCategory = () => {
  const { data, isLoading, error } = useQuery({
    queryKey: ['productCountByCategory'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('products')
        .select('category_id, subcategory_id')
        .not('category_id', 'is', null);

      if (error) throw error;

      // Count products by category
      const categoryCounts: Record<string, number> = {};
      const subcategoryCounts: Record<string, number> = {};

      data.forEach((product) => {
        const categoryId = product.category_id;
        const subcategoryId = product.subcategory_id;

        if (categoryId) {
          categoryCounts[categoryId] = (categoryCounts[categoryId] || 0) + 1;
        }
        
        if (subcategoryId) {
          subcategoryCounts[subcategoryId] = (subcategoryCounts[subcategoryId] || 0) + 1;
        }
      });

      return {
        categoryCounts,
        subcategoryCounts,
      };
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  return {
    categoryCounts: data?.categoryCounts || {},
    subcategoryCounts: data?.subcategoryCounts || {},
    isLoading,
    error,
  };
};
