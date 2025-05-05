
import { useState, useEffect } from 'react';
import { useCategories } from '@/hooks/useProducts';
import { useAdminPagination } from '@/hooks/useAdminPagination';
import { useProductFilters } from './useProductFilters';
import { useProductSelection } from './useProductSelection';
import { useProductDialogs } from './useProductDialogs';
import { useProductMutationHooks } from './useProductMutationHooks';
import { Product } from './types/productManagement.types';
import { ProductFormData } from '@/types/products';

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
  } = useAdminPagination<Product>(
    'products',
    ['admin-products'],
    { pageSize: 10 },
    {},
    `*, category:categories(*), subcategory:subcategories(*)`
  );

  // For manual refresh
  const refreshData = () => {
    // Manually refresh by changing the page and coming back
    if (currentPage > 1) {
      goToPage(currentPage - 1);
      setTimeout(() => goToPage(currentPage), 100);
    } else {
      goToPage(2);
      setTimeout(() => goToPage(1), 100);
    }
  };

  const {
    searchQuery,
    setSearchQuery,
    filters,
    applyFilter,
    resetFilter,
    clearFilters,
    filteredProducts
  } = useProductFilters(products);
  
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
    bulkUpdateStatusMutation
  } = useProductMutationHooks();

  const { data: categories } = useCategories();

  // Clear selection when filtered products change
  useEffect(() => {
    handleClearSelection();
  }, [JSON.stringify(filteredProducts?.map(p => p.id))]);

  // Refresh product list after mutations
  useEffect(() => {
    if (productMutation.isSuccess || deleteMutation.isSuccess || bulkDeleteMutation.isSuccess || bulkUpdateStatusMutation.isSuccess) {
      refreshData(); // Use our custom refresh function
    }
  }, [productMutation.isSuccess, deleteMutation.isSuccess, bulkDeleteMutation.isSuccess, bulkUpdateStatusMutation.isSuccess]);

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

  // Change page size - we'll simulate this with our goToPage function
  const handleChangePageSize = (size: number) => {
    // Since we don't have setPageSize, we'll just refresh the data
    refreshData();
  };

  return {
    products,
    filteredProducts,
    selectedProducts,
    searchQuery,
    setSearchQuery,
    filters,
    applyFilter,
    resetFilter,
    clearFilters,
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
    handleToggleSelect,
    handleToggleSelectAll,
    handleBulkDelete,
    handleConfirmBulkDelete,
    handleBulkActivate,
    handleBulkDeactivate,
    handleClearSelection,
    handleChangePageSize,
    refreshData,
    productMutation,
    deleteMutation,
    bulkDeleteMutation,
    bulkUpdateStatusMutation
  };
};
