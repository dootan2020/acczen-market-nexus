
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

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

export function useSubcategoryCRUD() {
  const queryClient = useQueryClient();

  // Create subcategory
  const createSubcategory = useMutation({
    mutationFn: async (data: {
      name: string;
      slug: string;
      category_id: string;
      description?: string;
      image_url?: string;
    }) => {
      const { error } = await supabase.from("subcategories").insert([data]);
      if (error) throw error;
      return { success: true };
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["subcategories", variables.category_id] });
      queryClient.invalidateQueries({ queryKey: ["subcategories"] });
      toast({
        title: "Subcategory created",
        description: "The subcategory has been successfully created.",
      });
    },
    onError: (error) => {
      toast({
        variant: "destructive",
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to create subcategory",
      });
    },
  });

  // Update subcategory
  const updateSubcategory = useMutation({
    mutationFn: async (data: {
      id: string;
      name: string;
      slug: string;
      category_id: string;
      description?: string;
      image_url?: string;
    }) => {
      const { id, ...updateData } = data;
      const { error } = await supabase
        .from("subcategories")
        .update(updateData)
        .eq("id", id);
      if (error) throw error;
      return { success: true };
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["subcategories", variables.category_id] });
      queryClient.invalidateQueries({ queryKey: ["subcategories"] });
      queryClient.invalidateQueries({ queryKey: ["subcategory"] });
      toast({
        title: "Subcategory updated",
        description: "The subcategory has been successfully updated.",
      });
    },
    onError: (error) => {
      toast({
        variant: "destructive",
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to update subcategory",
      });
    },
  });

  // Delete subcategory
  const deleteSubcategory = useMutation({
    mutationFn: async ({ id, category_id }: { id: string; category_id: string }) => {
      const { error } = await supabase.from("subcategories").delete().eq("id", id);
      if (error) throw error;
      return { success: true, category_id };
    },
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: ["subcategories", result.category_id] });
      queryClient.invalidateQueries({ queryKey: ["subcategories"] });
      toast({
        title: "Subcategory deleted",
        description: "The subcategory has been successfully deleted.",
      });
    },
    onError: (error) => {
      toast({
        variant: "destructive",
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to delete subcategory",
      });
    },
  });

  return {
    createSubcategory,
    updateSubcategory,
    deleteSubcategory,
  };
}
