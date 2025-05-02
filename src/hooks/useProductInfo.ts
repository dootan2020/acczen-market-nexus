
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { stripHtmlTags } from "@/utils/htmlUtils";
import { Product } from "@/types/products";

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
        
        // We'll create a clean description but without modifying the type
        // by including it in the return object directly
      }

      return {
        ...product,
        // Add the clean description as an additional property in the return
        // Not directly on the product object to avoid type issues
        cleanDescription: product?.description ? stripHtmlTags(product.description) : ''
      };
    },
    enabled: !!productId,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}
