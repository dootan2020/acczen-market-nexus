
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export function useSubcategories(categoryId?: string) {
  return useQuery({
    queryKey: ["subcategories", categoryId],
    queryFn: async () => {
      const query = supabase
        .from("subcategories")
        .select("*");

      if (categoryId) {
        query.eq("category_id", categoryId);
      }

      query.order("name");

      const { data, error } = await query;
      
      if (error) throw error;
      return data;
    },
    enabled: true,
  });
}

export function useSubcategory(slug: string) {
  return useQuery({
    queryKey: ["subcategory", slug],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("subcategories")
        .select(`
          *,
          category:categories(*)
        `)
        .eq("slug", slug)
        .single();

      if (error) throw error;
      return data;
    },
    enabled: !!slug,
  });
}
