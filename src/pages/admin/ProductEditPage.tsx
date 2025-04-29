
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { ProductFormData, ProductStatus } from '@/types/products';
import ProductForm from '@/components/admin/products/ProductForm';

const ProductEditPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [product, setProduct] = useState<ProductFormData | null>(null);
  const [categories, setCategories] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      setError(null);
      
      try {
        // Fetch product
        const { data: productData, error: productError } = await supabase
          .from('products')
          .select('*')
          .eq('id', id)
          .single();
          
        if (productError) {
          throw productError;
        }

        // Fetch categories
        const { data: categoriesData, error: categoriesError } = await supabase
          .from('categories')
          .select('*')
          .order('name');
          
        if (categoriesError) {
          throw categoriesError;
        }
        
        // Convert product data to ProductFormData type correctly
        const formattedProduct: ProductFormData = {
          id: productData.id,
          name: productData.name,
          description: productData.description,
          price: productData.price.toString(),
          sale_price: productData.sale_price ? productData.sale_price.toString() : '',
          stock_quantity: productData.stock_quantity.toString(),
          status: productData.status as ProductStatus,
          category_id: productData.category_id,
          subcategory_id: productData.subcategory_id || '',
          image_url: productData.image_url || '',
          slug: productData.slug,
          sku: productData.sku || '',
          kiosk_token: productData.kiosk_token || ''
        };
        
        setProduct(formattedProduct);
        setCategories(categoriesData);
      } catch (err) {
        console.error('Error fetching data:', err);
        setError('Không thể tải thông tin sản phẩm. Vui lòng thử lại.');
        toast.error('Error', { description: 'Failed to fetch product data' });
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchData();
  }, [id]);

  const handleSubmit = async (formData: ProductFormData) => {
    setIsSubmitting(true);
    setError(null);
    
    try {
      // Ensure status is valid for database schema
      let status = formData.status;
      // If status is 'draft' or 'archived' but database only supports 'active', 'inactive', 'out_of_stock',
      // we need to map it to a compatible value
      if (status === 'draft' || status === 'archived') {
        console.log(`Mapping status '${status}' to 'inactive' for database compatibility`);
        status = 'inactive';
      }
      
      // Update product
      const { error: updateError } = await supabase
        .from('products')
        .update({
          name: formData.name,
          slug: formData.slug,
          description: formData.description,
          price: parseFloat(formData.price),
          sale_price: formData.sale_price ? parseFloat(formData.sale_price) : null,
          stock_quantity: parseInt(formData.stock_quantity),
          status: status,
          category_id: formData.category_id,
          subcategory_id: formData.subcategory_id || null,
          image_url: formData.image_url || null,
          sku: formData.sku || null,
          kiosk_token: formData.kiosk_token || null,
          updated_at: new Date().toISOString(),
        })
        .eq('id', id);
        
      if (updateError) {
        throw updateError;
      }
      
      toast.success('Success', { description: 'Product has been updated' });
      navigate('/admin/products');
    } catch (err) {
      console.error('Error updating product:', err);
      setError('Không thể cập nhật sản phẩm. Vui lòng thử lại.');
      toast.error('Error', { description: 'Failed to update product' });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="p-6">
        <div className="flex items-center mb-6">
          <Button variant="ghost" onClick={() => navigate('/admin/products')} className="mr-4">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Products
          </Button>
        </div>
        
        <Card>
          <CardHeader>
            <CardTitle className="text-xl">Error</CardTitle>
          </CardHeader>
          <CardContent>
            <p>{error || 'Product not found'}</p>
            <Button 
              onClick={() => navigate('/admin/products')} 
              className="mt-4"
            >
              Return to Products
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <Button variant="ghost" onClick={() => navigate('/admin/products')} className="mr-4">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Products
        </Button>
        <h1 className="text-2xl font-bold">Edit Product</h1>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Edit: {product.name}</CardTitle>
        </CardHeader>
        <CardContent>
          <ProductForm
            initialData={product}
            handleSubmit={handleSubmit}
            categories={categories}
            isEditing={true}
            isPending={isSubmitting}
          />
        </CardContent>
      </Card>
    </div>
  );
};

export default ProductEditPage;
