
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Plus } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { ProductFormData } from '@/types/products';
import ProductForm from '@/components/admin/products/ProductForm';
import ProductsTable from '@/components/admin/products/ProductsTable';
import ProductDeleteDialog from '@/components/admin/products/ProductDeleteDialog';
import { ProductSearch } from '@/components/admin/products/ProductSearch';
import { useCategories } from '@/hooks/useProducts';
import { useProductMutations } from '@/hooks/useProductMutations';
import { useAdminPagination } from '@/hooks/useAdminPagination';

const AdminProducts = () => {
  const { productMutation, deleteMutation } = useProductMutations();
  const [searchQuery, setSearchQuery] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [isProductDialogOpen, setIsProductDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [currentProduct, setCurrentProduct] = useState<any>(null);
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

  // Use pagination hook
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
  } = useAdminPagination(
    'products',
    ['admin-products'],
    { pageSize: 10 },
    {},
    `*, category:categories(*), subcategory:subcategories(*)`
  );

  const { data: categories } = useCategories();

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

  const handleEditProduct = (product: any) => {
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

  const handleDeleteProduct = (product: any) => {
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

  const filteredProducts = products?.filter(product => 
    product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    product.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    product.slug.toLowerCase().includes(searchQuery.toLowerCase())
  );

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
                onEditProduct={handleEditProduct}
                onDeleteProduct={handleDeleteProduct}
              />
            </div>
          )}
        </CardContent>
      </Card>
      
      {/* Pagination controls */}
      {totalPages > 1 && (
        <div className="flex justify-center mt-4">
          <div className="flex items-center gap-2">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={prevPage}
              disabled={!hasPrevPage}
            >
              Previous
            </Button>
            <span className="text-sm">
              Page {currentPage} of {totalPages}
            </span>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={nextPage}
              disabled={!hasNextPage}
            >
              Next
            </Button>
          </div>
        </div>
      )}
      
      {/* Product Dialog (Add/Edit) */}
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
      
      {/* Delete Confirmation Dialog */}
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
    </div>
  );
};

export default AdminProducts;
