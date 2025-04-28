
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
    bulkDeleteMutation
  } = useProductManagement();

  const { data: categories } = useCategories();

  return (
    <div className="container mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Products</h1>
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
        onBulkDelete={handleBulkDelete}
        onBulkActivate={handleBulkActivate}
        onBulkDeactivate={handleBulkDeactivate}
        onClearSelection={handleClearSelection}
      />
      
      <Card>
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
      
      <ProductsPagination
        currentPage={currentPage}
        totalPages={totalPages}
        prevPage={prevPage}
        nextPage={nextPage}
        hasNextPage={hasNextPage}
        hasPrevPage={hasPrevPage}
      />
      
      <Dialog open={isProductDialogOpen} onOpenChange={setIsProductDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
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
            formData={formData}
            handleInputChange={handleInputChange}
            handleSubmit={handleSubmit}
            handleCategoryChange={handleCategoryChange}
            handleSubcategoryChange={handleSubcategoryChange}
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
        onConfirmDelete={handleConfirmBulkDelete}
        isPending={bulkDeleteMutation.isPending}
      />
    </div>
  );
};

export default AdminProducts;
