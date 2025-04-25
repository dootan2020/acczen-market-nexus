
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Plus, Search } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { toast } from '@/hooks/use-toast';
import { useCategories } from '@/hooks/useProducts';
import ProductForm from '@/components/admin/products/ProductForm';
import ProductsTable from '@/components/admin/products/ProductsTable';
import { ProductFormData } from '@/types/products';

const generateSKU = () => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let result = 'PROD-';
  for (let i = 0; i < 8; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  result += '-' + Date.now().toString().substr(-4);
  return result;
};

const AdminProducts = () => {
  const queryClient = useQueryClient();
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

  const { data: products, isLoading } = useQuery({
    queryKey: ['admin-products'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('products')
        .select(`
          *,
          category:categories(*),
          subcategory:subcategories(*)
        `)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data;
    }
  });

  const { data: categories } = useCategories();

  const productMutation = useMutation({
    mutationFn: async (data: ProductFormData) => {
      if (!data.slug) {
        data.slug = data.name
          .toLowerCase()
          .replace(/[^\w\s]/gi, '')
          .replace(/\s+/g, '-');
      }
      
      if (!data.sku) {
        data.sku = generateSKU();
      }

      const productData = {
        name: data.name,
        description: data.description,
        price: Number(data.price),
        sale_price: data.sale_price ? Number(data.sale_price) : null,
        stock_quantity: Number(data.stock_quantity),
        image_url: data.image_url,
        slug: data.slug,
        category_id: data.category_id,
        subcategory_id: data.subcategory_id || null,
        status: data.status,
        sku: data.sku,
      };

      if (isEditing && currentProduct) {
        const { error } = await supabase
          .from('products')
          .update(productData)
          .eq('id', currentProduct.id);
        
        if (error) throw error;
        return { success: true, action: 'updated' };
      } else {
        const { error } = await supabase
          .from('products')
          .insert([productData]);
        
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
      setIsProductDialogOpen(false);
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
      setIsDeleteDialogOpen(false);
    },
    onError: (error) => {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to delete product',
      });
    },
  });

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
      sku: generateSKU(),
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
    productMutation.mutate(formData);
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
      
      <div className="mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input 
            className="pl-10" 
            placeholder="Search products..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>
      
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
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Product</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete "{currentProduct?.name}"? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-end space-x-2 mt-4">
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
              Cancel
            </Button>
            <Button 
              variant="destructive"
              onClick={() => currentProduct && deleteMutation.mutate(currentProduct.id)}
              disabled={deleteMutation.isPending}
            >
              {deleteMutation.isPending ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-b-transparent mr-2"></div>
                  Deleting...
                </>
              ) : 'Delete Product'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminProducts;
