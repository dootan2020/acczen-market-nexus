
import React, { useState } from 'react';
import { useCategories } from '@/hooks/useProducts';
import { Plus, Import, RefreshCcw, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import AdminLayout from '@/components/AdminLayout';
import ProductForm from '@/components/admin/products/ProductForm';
import ProductsTable from '@/components/admin/products/ProductsTable';
import ProductDeleteDialog from '@/components/admin/products/ProductDeleteDialog';
import ProductBulkDeleteDialog from '@/components/admin/products/ProductBulkDeleteDialog';
import { useProductManagement } from '@/hooks/admin/useProductManagement';
import { ProductFormData, DatabaseProductStatus } from '@/types/products';
import { ProductFilters } from '@/components/admin/products/ProductFilters';
import { ProductBulkActions } from '@/components/admin/products/ProductBulkActions';
import { ProductsPagination } from '@/components/admin/products/ProductsPagination';
import { ImportDialog } from '@/components/admin/products/ImportDialog';
import { SyncProductsDialog } from '@/components/admin/products/SyncProductsDialog';
import { useProductImportExport } from '@/hooks/admin/useProductImportExport';
import { useSyncProducts } from '@/hooks/admin/useSyncProducts';
import { Card, CardContent } from '@/components/ui/card';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

const AdminProducts = () => {
  const {
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
    prevPage,
    nextPage,
    hasNextPage,
    hasPrevPage,
    goToPage,
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
    refreshData,
    productMutation,
    deleteMutation,
    bulkDeleteMutation
  } = useProductManagement();

  const [isImportDialogOpen, setIsImportDialogOpen] = useState(false);
  const [isSyncDialogOpen, setIsSyncDialogOpen] = useState(false);
  
  const { data: categories } = useCategories();
  
  const {
    importedData,
    setImportedData,
    isImporting,
    importErrors,
    handleImportCSV,
    handleImportExcel
  } = useProductImportExport();
  
  const { syncProducts, isSyncing } = useSyncProducts();
  
  const queryClient = useQueryClient();
  
  // Bulk import mutation - fixed to handle array of products
  const bulkImportMutation = useMutation({
    mutationFn: async (products: ProductFormData[]) => {
      // Process each product one by one to avoid type issues
      const results = [];
      
      for (const product of products) {
        // Convert product data for database insertion
        const formattedProduct = {
          name: product.name,
          description: product.description,
          price: Number(product.price),
          sale_price: product.sale_price ? Number(product.sale_price) : null,
          stock_quantity: Number(product.stock_quantity),
          slug: product.slug,
          sku: product.sku,
          // Map frontend status to database-compatible status
          status: mapToDatabaseStatus(product.status),
          category_id: product.category_id,
          subcategory_id: product.subcategory_id || null,
          image_url: product.image_url || null
        };
        
        const { data, error } = await supabase
          .from('products')
          .insert(formattedProduct);
          
        if (error) throw error;
        if (data) results.push(data);
      }
      
      return { success: true, count: products.length };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-products'] });
      setImportedData([]);
      setIsImportDialogOpen(false);
      toast.success(`${importedData.length} products have been imported successfully`);
      refreshData(); // Use our custom refresh method
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : 'Failed to import products');
    }
  });
  
  // Helper function to map frontend status to database status
  const mapToDatabaseStatus = (status: string): DatabaseProductStatus => {
    if (status === 'draft' || status === 'archived') {
      return 'inactive';
    }
    return status as DatabaseProductStatus;
  };
  
  const handleImportConfirm = async (products: ProductFormData[]) => {
    await bulkImportMutation.mutateAsync(products);
  };

  const handleSubmit = (formData: ProductFormData) => {
    productMutation.mutate({ ...formData, id: currentProduct?.id, isEditing });
    setIsProductDialogOpen(false);
  };
  
  // Calculate active filters count
  const activeFiltersCount = Object.keys(filters).length;

  return (
    <AdminLayout>
      <div className="w-full">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
          <h1 className="text-2xl sm:text-3xl font-bold">Products</h1>
          <div className="flex flex-wrap gap-2">
            <Button onClick={handleAddProduct}>
              <Plus className="h-4 w-4 mr-2" />
              Add Product
            </Button>
            <Button variant="outline" onClick={() => setIsImportDialogOpen(true)}>
              <Import className="h-4 w-4 mr-2" />
              Import
            </Button>
            <Button variant="outline" onClick={() => setIsSyncDialogOpen(true)}>
              <RefreshCcw className="h-4 w-4 mr-2" />
              Sync API
            </Button>
          </div>
        </div>
        
        <ProductFilters 
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          categories={categories}
          filters={filters}
          onFilterChange={applyFilter}
          onFilterReset={resetFilter}
          onFiltersClear={clearFilters}
          activeFiltersCount={activeFiltersCount}
        />
        
        <ProductBulkActions 
          selectedCount={selectedProducts.length}
          filteredProducts={filteredProducts || []}
          onBulkDelete={handleBulkDelete}
          onBulkActivate={handleBulkActivate}
          onBulkDeactivate={handleBulkDeactivate}
          onSyncProducts={() => setIsSyncDialogOpen(true)}
          onClearSelection={handleClearSelection}
          disabled={isLoading}
        />
        
        <Card className="overflow-hidden">
          <CardContent className="p-0">
            {isLoading ? (
              <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
              </div>
            ) : filteredProducts?.length === 0 ? (
              <div className="flex flex-col items-center justify-center p-8 text-center">
                <div className="rounded-full bg-muted p-3 mb-3">
                  <Import className="h-6 w-6 text-muted-foreground" />
                </div>
                <h3 className="text-lg font-medium">No products found</h3>
                <p className="text-sm text-muted-foreground max-w-md mt-1 mb-4">
                  {searchQuery || activeFiltersCount > 0
                    ? "No products match your search criteria. Try adjusting your filters."
                    : "Get started by adding a new product or importing from a file."}
                </p>
                <div className="flex gap-2 flex-wrap justify-center">
                  <Button onClick={handleAddProduct}>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Product
                  </Button>
                  <Button variant="outline" onClick={() => setIsImportDialogOpen(true)}>
                    <Import className="h-4 w-4 mr-2" />
                    Import Products
                  </Button>
                </div>
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
        
        {filteredProducts?.length > 0 && (
          <div className="mt-4">
            <ProductsPagination
              currentPage={currentPage}
              totalPages={totalPages}
              prevPage={prevPage}
              nextPage={nextPage}
              hasNextPage={hasNextPage}
              hasPrevPage={hasPrevPage}
              goToPage={goToPage}
            />
          </div>
        )}
        
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
          onConfirmDelete={handleConfirmBulkDelete}
          isPending={bulkDeleteMutation.isPending}
        />
        
        <ImportDialog
          isOpen={isImportDialogOpen}
          onOpenChange={setIsImportDialogOpen}
          importedProducts={importedData}
          importErrors={importErrors}
          onImportCSV={handleImportCSV}
          onImportExcel={handleImportExcel}
          onImportConfirm={handleImportConfirm}
          isLoading={isImporting}
          isPending={bulkImportMutation.isPending}
        />
        
        <SyncProductsDialog
          isOpen={isSyncDialogOpen}
          onOpenChange={setIsSyncDialogOpen}
          onSync={syncProducts}
          isPending={isSyncing}
        />
      </div>
    </AdminLayout>
  );
};

export default AdminProducts;
