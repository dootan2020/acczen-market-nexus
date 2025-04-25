
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export function useProducts() {
  return useQuery({
    queryKey: ["products"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("products")
        .select(`
          *,
          category:categories(*),
          subcategory:subcategories(*)
        `)
        .eq("status", "active")
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data;
    },
  });
}

export function useCategories() {
  return useQuery({
    queryKey: ["categories"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("categories")
        .select("*");

      if (error) throw error;
      return data;
    },
  });
}

export function useProductsByCategory(categorySlug?: string, subcategorySlug?: string) {
  return useQuery({
    queryKey: ["products", "category", categorySlug, "subcategory", subcategorySlug],
    queryFn: async () => {
      let query = supabase
        .from("products")
        .select(`
          *,
          category:categories(*),
          subcategory:subcategories(*)
        `)
        .eq("status", "active");

      if (categorySlug) {
        query = query.eq("category.slug", categorySlug);
      }

      if (subcategorySlug) {
        query = query.eq("subcategory.slug", subcategorySlug);
      }

      const { data, error } = await query.order("created_at", { ascending: false });

      if (error) throw error;
      return data;
    },
    enabled: !!categorySlug,
  });
}

export function useProductsBySubcategory(subcategorySlug?: string) {
  return useQuery({
    queryKey: ["products", "subcategory", subcategorySlug],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("products")
        .select(`
          *,
          category:categories(*),
          subcategory:subcategories(*)
        `)
        .eq("status", "active")
        .eq("subcategory.slug", subcategorySlug)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data;
    },
    enabled: !!subcategorySlug,
  });
}
