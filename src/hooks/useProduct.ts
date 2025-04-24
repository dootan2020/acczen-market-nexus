
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export function useProduct(slug: string) {
  return useQuery({
    queryKey: ["product", slug],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("products")
        .select(`
          *,
          category:categories(*)
        `)
        .eq("slug", slug)
        .single();

      if (error) {
        throw error;
      }
      
      return data;
    },
    enabled: !!slug,
  });
}

export function useRelatedProducts(categoryId: string, currentProductId: string) {
  return useQuery({
    queryKey: ["related-products", categoryId, currentProductId],
    queryFn: async () => {
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
        throw error;
      }
      
      return data;
    },
    enabled: !!categoryId && !!currentProductId,
  });
}
