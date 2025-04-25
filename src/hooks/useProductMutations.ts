
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { ProductFormData } from "@/types/products";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { generateSKU } from "@/utils/product-utils";
import { Json } from "@/types/supabase";

export const useProductMutations = () => {
  const queryClient = useQueryClient();

  const productMutation = useMutation({
    mutationFn: async (data: ProductFormData & { id?: string; isEditing: boolean }) => {
      const { isEditing, ...productData } = data;
      
      if (!productData.slug) {
        productData.slug = productData.name
          .toLowerCase()
          .replace(/[^\w\s]/gi, '')
          .replace(/\s+/g, '-');
      }
      
      if (!productData.sku) {
        productData.sku = generateSKU();
      }

      // Convert string values to appropriate types for database
      const formattedProductData = {
        ...productData,
        price: parseFloat(productData.price),
        sale_price: productData.sale_price ? parseFloat(productData.sale_price) : null,
        stock_quantity: parseInt(productData.stock_quantity, 10),
      };

      if (isEditing) {
        const { error } = await supabase
          .from('products')
          .update(formattedProductData)
          .eq('id', data.id);
        
        if (error) throw error;
        return { success: true, action: 'updated' };
      } else {
        const { error } = await supabase
          .from('products')
          .insert([formattedProductData]);
        
        if (error) throw error;
        return { success: true, action: 'created' };
      }
    },
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: ['admin-products'] });
      queryClient.invalidateQueries({ queryKey: ['products'] });
      toast({
        title: `Product ${result.action}`,
        description: `The product has been successfully ${result.action}.`,
      });
    },
    onError: (error) => {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to save product',
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('products')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      return { success: true };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-products'] });
      queryClient.invalidateQueries({ queryKey: ['products'] });
      toast({
        title: 'Product deleted',
        description: 'The product has been successfully deleted.',
      });
    },
    onError: (error) => {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to delete product',
      });
    },
  });

  return {
    productMutation,
    deleteMutation,
  };
};
