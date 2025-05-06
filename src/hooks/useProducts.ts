
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export function useProducts() {
  const { isAdmin } = useAuth();
  
  return useQuery({
    queryKey: ["products"],
    queryFn: async () => {
      console.log("Fetching products data...");
      let query = supabase
        .from("products")
        .select(`
          *,
          category:categories(*),
          subcategory:subcategories(*)
        `)
        .eq("status", "active");
      
      // Only filter by visibility for non-admin users
      if (!isAdmin) {
        query = query.eq("is_visible", true);
      }
      
      const { data, error } = await query.order("created_at", { ascending: false });

      if (error) {
        console.error("Error fetching products:", error);
        throw error;
      }
      
      console.log("Products fetched:", data?.length || 0);
      return data || [];
    },
    retry: 3,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

export function useCategories() {
  return useQuery({
    queryKey: ["categories"],
    queryFn: async () => {
      console.log("Fetching categories data...");
      const { data, error } = await supabase
        .from("categories")
        .select("*");

      if (error) {
        console.error("Error fetching categories:", error);
        throw error;
      }
      
      console.log("Categories fetched:", data?.length || 0);
      return data || [];
    },
    retry: 3,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
    staleTime: 10 * 60 * 1000, // 10 minutes
  });
}

export function useProductsByCategory(categorySlug?: string, subcategorySlug?: string) {
  const { isAdmin } = useAuth();
  
  return useQuery({
    queryKey: ["products", "category", categorySlug, "subcategory", subcategorySlug],
    queryFn: async () => {
      console.log(`Fetching products by category: ${categorySlug}, subcategory: ${subcategorySlug}`);
      let query = supabase
        .from("products")
        .select(`
          *,
          category:categories(*),
          subcategory:subcategories(*)
        `)
        .eq("status", "active");

      // Only filter by visibility for non-admin users
      if (!isAdmin) {
        query = query.eq("is_visible", true);
      }
      
      if (categorySlug) {
        query = query.eq("category.slug", categorySlug);
      }

      if (subcategorySlug) {
        query = query.eq("subcategory.slug", subcategorySlug);
      }

      const { data, error } = await query.order("created_at", { ascending: false });

      if (error) {
        console.error("Error fetching products by category:", error);
        throw error;
      }
      
      console.log("Category products fetched:", data?.length || 0);
      return data || [];
    },
    enabled: !!categorySlug,
    retry: 3,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

export function useProductsBySubcategory(subcategorySlug?: string) {
  const { isAdmin } = useAuth();
  
  return useQuery({
    queryKey: ["products", "subcategory", subcategorySlug],
    queryFn: async () => {
      console.log(`Fetching products by subcategory: ${subcategorySlug}`);
      let query = supabase
        .from("products")
        .select(`
          *,
          category:categories(*),
          subcategory:subcategories(*)
        `)
        .eq("status", "active");
        
      // Only filter by visibility for non-admin users
      if (!isAdmin) {
        query = query.eq("is_visible", true);
      }
      
      if (subcategorySlug) {
        query = query.eq("subcategory.slug", subcategorySlug);
      }

      const { data, error } = await query.order("created_at", { ascending: false });

      if (error) {
        console.error("Error fetching products by subcategory:", error);
        throw error;
      }
      
      console.log("Subcategory products fetched:", data?.length || 0);
      return data || [];
    },
    enabled: !!subcategorySlug,
    retry: 3,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}
