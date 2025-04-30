
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export function useProduct(id: string) {
  return useQuery({
    queryKey: ["product", id],
    queryFn: async () => {
      console.log(`Fetching product detail for ID: ${id}`);
      
      // Try to get product by ID first
      const { data: productById, error: idError } = await supabase
        .from("products")
        .select(`
          *,
          category:categories(*)
        `)
        .eq("id", id)
        .maybeSingle();
      
      // If found by ID, return it
      if (productById) {
        console.log("Product detail fetched by ID:", productById?.name);
        return productById;
      }
      
      // If not found by ID, try by slug
      const { data: productBySlug, error: slugError } = await supabase
        .from("products")
        .select(`
          *,
          category:categories(*)
        `)
        .eq("slug", id)
        .maybeSingle();
        
      if (slugError) {
        console.error(`Error fetching product ${id}:`, slugError);
        throw slugError;
      }
      
      if (!productBySlug) {
        console.error(`Product not found with ID or slug: ${id}`);
        throw new Error(`Product not found with ID or slug: ${id}`);
      }
      
      console.log("Product detail fetched by slug:", productBySlug?.name);
      return productBySlug;
    },
    enabled: !!id,
    retry: 3,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

export function useRelatedProducts(categoryId: string, currentProductId: string) {
  return useQuery({
    queryKey: ["related-products", categoryId, currentProductId],
    queryFn: async () => {
      console.log(`Fetching related products for category: ${categoryId}, excluding product: ${currentProductId}`);
      const { data, error } = await supabase
        .from("products")
        .select(`
          *,
          category:categories(*)
        `)
        .eq("category_id", categoryId)
        .neq("id", currentProductId)
        .eq("status", "active")
        .order("created_at", { ascending: false })
        .limit(4);

      if (error) {
        console.error("Error fetching related products:", error);
        throw error;
      }
      
      console.log("Related products fetched:", data?.length || 0);
      return data || [];
    },
    enabled: !!categoryId && !!currentProductId,
    retry: 3,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}
