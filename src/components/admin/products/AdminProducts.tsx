
import { useState } from 'react';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import ProductForm from '@/components/admin/products/ProductForm';
import ProductsTable from '@/components/admin/products/ProductsTable';
import ProductDeleteDialog from '@/components/admin/products/ProductDeleteDialog';
import { ProductSearch } from '@/components/admin/products/ProductSearch';
import { useCategories } from '@/hooks/useProducts';
import { ProductBulkActions } from '@/components/admin/products/ProductBulkActions';
import ProductBulkDeleteDialog from '@/components/admin/products/ProductBulkDeleteDialog';
import { ProductsPagination } from '@/components/admin/products/ProductsPagination';
import { useProductManagement } from '@/hooks/admin/useProductManagement';
import { ProductFormData } from '@/types/products';

const AdminProducts = () => {
  const {
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
    productMutation,
    deleteMutation,
    bulkDeleteMutation
  } = useProductManagement();

  const { data: categories } = useCategories();

  const handleSubmit = (formData: ProductFormData) => {
    productMutation.mutate({ ...formData, id: currentProduct?.id, isEditing });
    setIsProductDialogOpen(false);
  };

  return (
    <div className="container px-4 sm:px-6 w-full max-w-full mx-auto">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <h1 className="text-2xl sm:text-3xl font-bold">Products</h1>
        <Button onClick={handleAddProduct}>
          <Plus className="h-4 w-4 mr-2" />
          Add Product
        </Button>
      </div>
      
      <ProductSearch 
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
      />
      
      <ProductBulkActions 
        selectedCount={selectedProducts.length}
        filteredProducts={filteredProducts || []}
        onBulkDelete={handleBulkDelete}
        onBulkActivate={handleBulkActivate}
        onBulkDeactivate={handleBulkDeactivate}
        onClearSelection={handleClearSelection}
        disabled={isLoading}
      />
      
      <Card className="overflow-hidden">
        <CardContent className="p-0">
          {isLoading ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <ProductsTable 
                products={filteredProducts || []}
                selectedProducts={selectedProducts}
                onToggleSelect={handleToggleSelect}
                onToggleSelectAll={handleToggleSelectAll}
                onEditProduct={handleEditProduct}
                onDeleteProduct={handleDeleteProduct}
              />
            </div>
          )}
        </CardContent>
      </Card>
      
      <div className="mt-4">
        <ProductsPagination
          currentPage={currentPage}
          totalPages={totalPages}
          prevPage={prevPage}
          nextPage={nextPage}
          hasNextPage={hasNextPage}
          hasPrevPage={hasPrevPage}
          goToPage={() => {}} // Empty function that takes no arguments
        />
      </div>
      
      <Dialog open={isProductDialogOpen} onOpenChange={setIsProductDialogOpen}>
        <DialogContent className="sm:max-w-[600px] max-w-[95vw] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{isEditing ? 'Edit Product' : 'Add New Product'}</DialogTitle>
            <DialogDescription>
              {isEditing 
                ? 'Edit the product details below.'
                : 'Fill in the product details to add a new product.'
              }
            </DialogDescription>
          </DialogHeader>
          <ProductForm
            initialData={formData}
            handleSubmit={handleSubmit}
            categories={categories}
            isEditing={isEditing}
            isPending={productMutation.isPending}
          />
        </DialogContent>
      </Dialog>
      
      <ProductDeleteDialog
        isOpen={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
        productName={currentProduct?.name || ''}
        onConfirmDelete={() => {
          currentProduct && deleteMutation.mutate(currentProduct.id);
          setIsDeleteDialogOpen(false);
        }}
        isPending={deleteMutation.isPending}
      />
      
      <ProductBulkDeleteDialog
        isOpen={isBulkDeleteDialogOpen}
        onOpenChange={setIsBulkDeleteDialogOpen}
        count={selectedProducts.length}
        onConfirmDelete={() => handleConfirmBulkDelete()} // Call without arguments
        isPending={bulkDeleteMutation.isPending}
      />
    </div>
  );
};

export default AdminProducts;
