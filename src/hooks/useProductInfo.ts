
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { stripHtmlTags } from "@/utils/htmlUtils";

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

      // Process data if needed
      if (product && product.description) {
        // Ensure the description is a string
        if (typeof product.description !== 'string') {
          product.description = JSON.stringify(product.description);
        }
        
        // Store the clean description for display purposes
        product.cleanDescription = stripHtmlTags(product.description);
      }

      return product;
    },
    enabled: !!productId,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}
