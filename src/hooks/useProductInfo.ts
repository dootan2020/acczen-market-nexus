
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export function useProductInfo(productId: string | null) {
  return useQuery({
    queryKey: ["product-info", productId],
    queryFn: async () => {
      if (!productId) {
        return null;
      }

      const { data: product, error } = await supabase
        .from("products")
        .select(`
          *,
          category:categories(*)
        `)
        .eq("id", productId)
        .single();

      if (error) {
        console.error("Error fetching product info:", error);
        throw error;
      }

      return product;
    },
    enabled: !!productId,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}
