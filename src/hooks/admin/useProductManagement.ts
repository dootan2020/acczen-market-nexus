
import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { useAdminPagination } from '@/hooks/useAdminPagination';
import { ProductFormData, ProductStatus } from '@/types/products';
import { useCategories } from '@/hooks/useProducts';

interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  sale_price?: number;
  stock_quantity: number;
  image_url?: string;
  slug: string;
  category_id: string;
  subcategory_id?: string;
  status: ProductStatus;
  sku: string;
  category?: any;
  subcategory?: any;
}

export const useProductManagement = () => {
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedProducts, setSelectedProducts] = useState<string[]>([]);
  const [isEditing, setIsEditing] = useState(false);
  const [isProductDialogOpen, setIsProductDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isBulkDeleteDialogOpen, setIsBulkDeleteDialogOpen] = useState(false);
  const [currentProduct, setCurrentProduct] = useState<Product | null>(null);
  const [formData, setFormData] = useState<ProductFormData>({
    name: '',
    description: '',
    price: '',
    sale_price: '',
    stock_quantity: '',
    image_url: '',
    slug: '',
    category_id: '',
    subcategory_id: '',
    status: 'active',
    sku: '',
  });

  // Fetch products with pagination
  const { 
    data: products, 
    isLoading,
    currentPage,
    totalPages,
    goToPage,
    prevPage,
    nextPage,
    hasNextPage,
    hasPrevPage
  } = useAdminPagination<Product>(
    'products',
    ['admin-products'],
    { pageSize: 10 },
    {},
    `*, category:categories(*), subcategory:subcategories(*)`
  );

  const { data: categories } = useCategories();

  // Filter products by search query
  const filteredProducts = products?.filter(product => 
    product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    product.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    product.slug.toLowerCase().includes(searchQuery.toLowerCase())
  );

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
      };
      
      if (isEditing && id) {
        const { error } = await supabase
          .from('products')
          .update(formattedData)
          .eq('id', id);
          
        if (error) throw error;
        return { id };
      } else {
        const { data, error } = await supabase
          .from('products')
          .insert(formattedData)
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
      setSelectedProducts([]);
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
        .update({ status })
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
      setSelectedProducts([]);
    },
    onError: (error) => {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to update products',
      });
    },
  });

  // Handler functions
  const handleAddProduct = () => {
    setIsEditing(false);
    setCurrentProduct(null);
    setFormData({
      name: '',
      description: '',
      price: '',
      sale_price: '',
      stock_quantity: '0',
      image_url: '',
      slug: '',
      category_id: categories?.[0]?.id || '',
      subcategory_id: '',
      status: 'active' as ProductStatus,
      sku: '',
    });
    setIsProductDialogOpen(true);
  };

  const handleEditProduct = (product: Product) => {
    setIsEditing(true);
    setCurrentProduct(product);
    setFormData({
      name: product.name,
      description: product.description || '',
      price: product.price.toString(),
      sale_price: product.sale_price ? product.sale_price.toString() : '',
      stock_quantity: product.stock_quantity.toString(),
      image_url: product.image_url || '',
      slug: product.slug,
      category_id: product.category_id,
      subcategory_id: product.subcategory_id || '',
      status: product.status,
      sku: product.sku,
    });
    setIsProductDialogOpen(true);
  };

  const handleDeleteProduct = (product: Product) => {
    setCurrentProduct(product);
    setIsDeleteDialogOpen(true);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleCategoryChange = (value: string) => {
    setFormData(prev => ({ ...prev, category_id: value, subcategory_id: '' }));
  };

  const handleSubcategoryChange = (value: string) => {
    setFormData(prev => ({ ...prev, subcategory_id: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    productMutation.mutate({ ...formData, id: currentProduct?.id, isEditing });
    setIsProductDialogOpen(false);
  };

  // Bulk action handlers
  const handleToggleSelect = (productId: string) => {
    setSelectedProducts(prev => 
      prev.includes(productId) 
        ? prev.filter(id => id !== productId) 
        : [...prev, productId]
    );
  };

  const handleToggleSelectAll = () => {
    if (filteredProducts) {
      if (selectedProducts.length === filteredProducts.length) {
        setSelectedProducts([]);
      } else {
        setSelectedProducts(filteredProducts.map(p => p.id));
      }
    }
  };

  const handleBulkDelete = () => {
    setIsBulkDeleteDialogOpen(true);
  };

  const handleConfirmBulkDelete = () => {
    bulkDeleteMutation.mutate(selectedProducts);
    setIsBulkDeleteDialogOpen(false);
  };

  const handleBulkActivate = () => {
    bulkUpdateStatusMutation.mutate({ ids: selectedProducts, status: 'active' });
  };

  const handleBulkDeactivate = () => {
    bulkUpdateStatusMutation.mutate({ ids: selectedProducts, status: 'inactive' });
  };

  const handleClearSelection = () => {
    setSelectedProducts([]);
  };

  return {
    products,
    filteredProducts,
    selectedProducts,
    searchQuery,
    setSearchQuery,
    isEditing,
    isProductDialogOpen,
    setIsProductDialogOpen,
    isDeleteDialogOpen,
    setIsDeleteDialogOpen,
    isBulkDeleteDialogOpen,
    setIsBulkDeleteDialogOpen,
    currentProduct,
    formData,
    isLoading,
    currentPage,
    totalPages,
    goToPage,
    prevPage,
    nextPage,
    hasNextPage,
    hasPrevPage,
    handleAddProduct,
    handleEditProduct,
    handleDeleteProduct,
    handleInputChange,
    handleCategoryChange,
    handleSubcategoryChange,
    handleSubmit,
    handleToggleSelect,
    handleToggleSelectAll,
    handleBulkDelete,
    handleConfirmBulkDelete,
    handleBulkActivate,
    handleBulkDeactivate,
    handleClearSelection,
    productMutation,
    deleteMutation,
    bulkDeleteMutation,
    bulkUpdateStatusMutation
  };
};
