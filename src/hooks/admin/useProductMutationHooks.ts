
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { ProductFormData, ProductStatus } from '@/types/products';

export const useProductMutationHooks = () => {
  const queryClient = useQueryClient();

  // Create/update product mutation
  const productMutation = useMutation({
    mutationFn: async (data: ProductFormData & { id?: string, isEditing?: boolean }) => {
      const { id, isEditing, ...productData } = data;
      
      // Convert numeric strings to numbers
      const formattedData = {
        ...productData,
        price: Number(productData.price),
        sale_price: productData.sale_price ? Number(productData.sale_price) : null,
        stock_quantity: Number(productData.stock_quantity),
        // Map frontend status to database-compatible status
        status: productData.status === 'draft' || productData.status === 'archived' ? 'inactive' : productData.status,
      };
      
      if (isEditing && id) {
        const { error } = await supabase
          .from('products')
          .update(formattedData as any)
          .eq('id', id);
          
        if (error) throw error;
        return { id };
      } else {
        const { data, error } = await supabase
          .from('products')
          .insert(formattedData as any)
          .select();
          
        if (error) throw error;
        return data[0];
      }
    },
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['admin-products'] });
      toast({
        title: variables.isEditing ? 'Product Updated' : 'Product Created',
        description: variables.isEditing 
          ? `${variables.name} has been updated successfully.`
          : `${variables.name} has been created successfully.`,
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

  // Delete product mutation
  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('products')
        .delete()
        .eq('id', id);
        
      if (error) throw error;
      return { id };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-products'] });
      toast({
        title: 'Product Deleted',
        description: 'The product has been deleted successfully.',
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

  // Bulk delete products mutation
  const bulkDeleteMutation = useMutation({
    mutationFn: async (ids: string[]) => {
      const { error } = await supabase
        .from('products')
        .delete()
        .in('id', ids);
        
      if (error) throw error;
      return { count: ids.length };
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['admin-products'] });
      toast({
        title: 'Products Deleted',
        description: `${data.count} products have been deleted successfully.`,
      });
    },
    onError: (error) => {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to delete products',
      });
    },
  });

  // Bulk update status mutation
  const bulkUpdateStatusMutation = useMutation({
    mutationFn: async ({ ids, status }: { ids: string[], status: ProductStatus }) => {
      const { error } = await supabase
        .from('products')
        .update({ status: status as any })
        .in('id', ids);
        
      if (error) throw error;
      return { count: ids.length, status };
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['admin-products'] });
      toast({
        title: 'Products Updated',
        description: `${data.count} products have been set to ${data.status}.`,
      });
    },
    onError: (error) => {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to update products',
      });
    },
  });

  return {
    productMutation,
    deleteMutation,
    bulkDeleteMutation,
    bulkUpdateStatusMutation
  };
};
