
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

      try {
        // Convert string values to appropriate types for database
        const formattedProductData = {
          ...productData,
          price: parseFloat(productData.price),
          sale_price: productData.sale_price ? parseFloat(productData.sale_price) : null,
          stock_quantity: parseInt(productData.stock_quantity, 10),
        };
        
        console.log('Saving product data:', formattedProductData);

        if (isEditing) {
          const { data, error } = await supabase
            .from('products')
            .update(formattedProductData)
            .eq('id', data.id)
            .select();
          
          if (error) {
            console.error('Product update error:', error);
            throw error;
          }
          
          console.log('Product updated successfully:', data);
          return { success: true, action: 'updated' };
        } else {
          const { data, error } = await supabase
            .from('products')
            .insert([formattedProductData])
            .select();
          
          if (error) {
            console.error('Product creation error:', error);
            throw error;
          }
          
          console.log('Product created successfully:', data);
          return { success: true, action: 'created' };
        }
      } catch (error) {
        console.error('Product mutation error:', error);
        throw error;
      }
    },
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: ['admin-products'] });
      queryClient.invalidateQueries({ queryKey: ['products'] });
      toast({
        title: `Sản phẩm đã được ${result.action === 'updated' ? 'cập nhật' : 'tạo mới'}`,
        description: `Sản phẩm đã được ${result.action === 'updated' ? 'cập nhật' : 'tạo mới'} thành công.`,
      });
    },
    onError: (error) => {
      toast({
        variant: 'destructive',
        title: 'Lỗi',
        description: error instanceof Error ? error.message : 'Không thể lưu sản phẩm',
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      try {
        const { error } = await supabase
          .from('products')
          .delete()
          .eq('id', id);
        
        if (error) {
          console.error('Product deletion error:', error);
          throw error;
        }
        
        return { success: true };
      } catch (error) {
        console.error('Product deletion error:', error);
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-products'] });
      queryClient.invalidateQueries({ queryKey: ['products'] });
      toast({
        title: 'Đã xóa sản phẩm',
        description: 'Sản phẩm đã được xóa thành công.',
      });
    },
    onError: (error) => {
      toast({
        variant: 'destructive',
        title: 'Lỗi',
        description: error instanceof Error ? error.message : 'Không thể xóa sản phẩm',
      });
    },
  });

  return {
    productMutation,
    deleteMutation,
  };
};
