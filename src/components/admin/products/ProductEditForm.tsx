
import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Loader2, Save } from 'lucide-react';

interface Category {
  id: string;
  name: string;
}

interface ProductData {
  name: string;
  price: number;
  stock_quantity: number;
  kiosk_token: string;
}

interface ProductFormValues {
  name: string;
  description: string;
  price: number;
  sale_price: number;
  category_id: string;
  slug: string;
}

interface ProductEditFormProps {
  productData: ProductData;
  onSuccess: () => void;
  onCancel: () => void;
}

export default function ProductEditForm({ productData, onSuccess, onCancel }: ProductEditFormProps) {
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  
  // Set up form with default values from productData
  const form = useForm<ProductFormValues>({
    defaultValues: {
      name: productData.name,
      description: '',
      price: productData.price * 1.2, // Add 20% markup by default
      sale_price: productData.price,
      category_id: '',
      slug: productData.name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '')
    }
  });
  
  // Fetch categories on component mount
  useEffect(() => {
    async function fetchCategories() {
      try {
        const { data, error } = await supabase
          .from('categories')
          .select('id, name')
          .order('name');
          
        if (error) throw error;
        
        setCategories(data || []);
      } catch (error) {
        console.error('Error fetching categories:', error);
        toast.error('Failed to load categories');
      }
    }
    
    fetchCategories();
  }, []);
  
  const onSubmit = async (values: ProductFormValues) => {
    setIsLoading(true);
    
    try {
      // Create product in database
      const { data, error } = await supabase
        .from('products')
        .insert([
          {
            name: values.name,
            description: values.description,
            price: values.price,
            sale_price: values.sale_price,
            stock_quantity: productData.stock_quantity,
            category_id: values.category_id,
            kiosk_token: productData.kiosk_token,
            slug: values.slug,
            status: 'active',
          }
        ])
        .select()
        .single();
        
      if (error) throw error;
      
      toast.success('Product imported successfully');
      onSuccess();
    } catch (error) {
      console.error('Error importing product:', error);
      toast.error('Failed to import product');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Edit Product Details</CardTitle>
        <CardDescription>
          Customize the product information before importing
        </CardDescription>
      </CardHeader>
      
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <CardContent className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Product Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Product name" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Product description" rows={4} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <FormField
                control={form.control}
                name="price"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Price</FormLabel>
                    <FormControl>
                      <Input 
                        type="number"
                        step="0.01" 
                        placeholder="Product price" 
                        {...field} 
                        onChange={e => field.onChange(parseFloat(e.target.value))} 
                      />
                    </FormControl>
                    <FormDescription>
                      Final selling price
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="sale_price"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Cost Price</FormLabel>
                    <FormControl>
                      <Input 
                        type="number"
                        step="0.01"
                        placeholder="Original price"
                        {...field}
                        onChange={e => field.onChange(parseFloat(e.target.value))}
                        disabled
                      />
                    </FormControl>
                    <FormDescription>
                      Original price from TaphoaMMO
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            
            <FormField
              control={form.control}
              name="category_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Category</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a category" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {categories.map((category) => (
                        <SelectItem key={category.id} value={category.id}>
                          {category.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="slug"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>URL Slug</FormLabel>
                  <FormControl>
                    <Input placeholder="product-url-slug" {...field} />
                  </FormControl>
                  <FormDescription>
                    The URL-friendly version of the product name
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
          
          <CardFooter className="flex justify-between">
            <Button variant="outline" type="button" onClick={onCancel}>
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Importing...
                </>
              ) : (
                <>
                  <Save className="mr-2 h-4 w-4" />
                  Import Product
                </>
              )}
            </Button>
          </CardFooter>
        </form>
      </Form>
    </Card>
  );
}
