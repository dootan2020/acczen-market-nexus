
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export function useProduct(id: string) {
  return useQuery({
    queryKey: ["product", id],
    queryFn: async () => {
      console.log(`Fetching product detail for ID: ${id}`);
      const { data, error } = await supabase
        .from("products")
        .select(`
          *,
          category:categories(*)
        `)
        .eq("id", id)
        .single();

      if (error) {
        console.error(`Error fetching product ${id}:`, error);
        throw error;
      }
      
      console.log("Product detail fetched:", data?.name);
      return data;
    },
    enabled: !!id,
    retry: 2,
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
    retry: 2,
  });
}
