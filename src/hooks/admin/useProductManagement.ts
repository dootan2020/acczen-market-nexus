
import { useState } from 'react';
import { useCategories } from '@/hooks/useProducts';
import { useAdminPagination } from '@/hooks/useAdminPagination';
import { useProductFilters } from './useProductFilters';
import { useProductSelection } from './useProductSelection';
import { useProductDialogs } from './useProductDialogs';
import { useProductMutationHooks } from './useProductMutationHooks';
import { Product } from './types/productManagement.types';
import { ProductFormData } from '@/types/products';
import { toast } from 'sonner';

export const useProductManagement = () => {
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
    hasPrevPage,
    refetch
  } = useAdminPagination<Product>(
    'products',
    ['admin-products'],
    { pageSize: 10 },
    {},
    `*, category:categories(*), subcategory:subcategories(*)`
  );

  const [showOutOfStock, setShowOutOfStock] = useState(true);
  const [showHidden, setShowHidden] = useState(true);

  const { searchQuery, setSearchQuery, filteredProducts: initialFilteredProducts } = useProductFilters(products);
  
  // Apply additional filters (out of stock, visibility)
  const filteredProducts = initialFilteredProducts?.filter(product => {
    // Filter by stock if needed
    if (!showOutOfStock && product.stock_quantity <= 0) {
      return false;
    }
    
    // Filter by visibility if needed
    if (!showHidden && product.is_visible === false) {
      return false;
    }
    
    return true;
  });
  
  const {
    selectedProducts,
    setSelectedProducts,
    handleToggleSelect,
    handleToggleSelectAll,
    handleClearSelection
  } = useProductSelection(filteredProducts);

  const {
    isEditing,
    setIsEditing,
    isProductDialogOpen,
    setIsProductDialogOpen,
    isDeleteDialogOpen,
    setIsDeleteDialogOpen,
    isBulkDeleteDialogOpen,
    setIsBulkDeleteDialogOpen,
    currentProduct,
    setCurrentProduct,
    formData,
    setFormData,
    handleInputChange,
    handleCategoryChange,
    handleSubcategoryChange
  } = useProductDialogs();

  const {
    productMutation,
    deleteMutation,
    bulkDeleteMutation,
    bulkUpdateStatusMutation,
    updateProductVisibilityMutation,
    bulkUpdateVisibilityMutation,
    hideOutOfStockProductsMutation
  } = useProductMutationHooks();

  const { data: categories } = useCategories();

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
      status: 'active',
      sku: '',
      is_visible: true
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
      is_visible: product.is_visible
    });
    setIsProductDialogOpen(true);
  };

  const handleDeleteProduct = (product: Product) => {
    setCurrentProduct(product);
    setIsDeleteDialogOpen(true);
  };

  // Bulk action handlers
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
  
  // Product visibility handlers
  const handleToggleVisibility = (productId: string, isVisible: boolean) => {
    updateProductVisibilityMutation.mutate({ id: productId, isVisible });
  };
  
  const handleBulkShow = () => {
    if (selectedProducts.length === 0) {
      toast.error("No products selected");
      return;
    }
    
    bulkUpdateVisibilityMutation.mutate({ ids: selectedProducts, isVisible: true });
    handleClearSelection();
  };
  
  const handleBulkHide = () => {
    if (selectedProducts.length === 0) {
      toast.error("No products selected");
      return;
    }
    
    bulkUpdateVisibilityMutation.mutate({ ids: selectedProducts, isVisible: false });
    handleClearSelection();
  };
  
  const handleHideOutOfStockProducts = () => {
    hideOutOfStockProductsMutation.mutate();
  };
  
  const handleToggleShowOutOfStock = () => {
    setShowOutOfStock(!showOutOfStock);
  };
  
  const handleToggleShowHidden = () => {
    setShowHidden(!showHidden);
  };
  
  // Count stats
  const outOfStockCount = products?.filter(p => p.stock_quantity <= 0).length || 0;
  const hiddenProductsCount = products?.filter(p => p.is_visible === false).length || 0;

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
    refetch,
    showOutOfStock,
    showHidden,
    outOfStockCount,
    hiddenProductsCount,
    handleAddProduct,
    handleEditProduct,
    handleDeleteProduct,
    handleInputChange,
    handleCategoryChange,
    handleSubcategoryChange,
    handleToggleSelect,
    handleToggleSelectAll,
    handleBulkDelete,
    handleConfirmBulkDelete,
    handleBulkActivate,
    handleBulkDeactivate,
    handleClearSelection,
    handleToggleVisibility,
    handleBulkShow,
    handleBulkHide,
    handleHideOutOfStockProducts,
    handleToggleShowOutOfStock,
    handleToggleShowHidden,
    productMutation,
    deleteMutation,
    bulkDeleteMutation,
    bulkUpdateStatusMutation
  };
};
