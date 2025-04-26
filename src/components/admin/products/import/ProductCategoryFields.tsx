
import React from 'react';
import { Tables } from '@/types/supabase';
import { FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { UseFormReturn } from 'react-hook-form';
import { ImportProductFormValues } from './types';
import { useSubcategories } from '@/hooks/useSubcategories';

interface ProductCategoryFieldsProps {
  form: UseFormReturn<ImportProductFormValues>;
  categories: Tables<'categories'>[];
  categoriesLoading: boolean;
}

export default function ProductCategoryFields({ form, categories, categoriesLoading }: ProductCategoryFieldsProps) {
  const selectedCategoryId = form.watch('category_id');
  const { data: subcategories, isLoading: subcategoriesLoading } = useSubcategories(selectedCategoryId);

  return (
    <>
      <FormField
        control={form.control}
        name="category_id"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Danh mục</FormLabel>
            <Select onValueChange={(value) => {
              field.onChange(value);
              form.setValue('subcategory_id', '');
            }} defaultValue={field.value}>
              <FormControl>
                <SelectTrigger>
                  <SelectValue placeholder="Chọn danh mục" />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                {categoriesLoading ? (
                  <div className="p-2">
                    <Skeleton className="h-5 w-full mb-2" />
                    <Skeleton className="h-5 w-full mb-2" />
                    <Skeleton className="h-5 w-full" />
                  </div>
                ) : (
                  categories.map((category) => (
                    <SelectItem key={category.id} value={category.id}>
                      {category.name}
                    </SelectItem>
                  ))
                )}
              </SelectContent>
            </Select>
            <FormDescription>
              Chọn danh mục cho sản phẩm
            </FormDescription>
            <FormMessage />
          </FormItem>
        )}
      />
      
      <FormField
        control={form.control}
        name="subcategory_id"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Danh mục con</FormLabel>
            <Select 
              onValueChange={field.onChange} 
              value={field.value}
              disabled={!selectedCategoryId || subcategoriesLoading}
            >
              <FormControl>
                <SelectTrigger>
                  <SelectValue placeholder="Chọn danh mục con" />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                {subcategoriesLoading ? (
                  <div className="p-2">
                    <Skeleton className="h-5 w-full mb-2" />
                    <Skeleton className="h-5 w-full mb-2" />
                    <Skeleton className="h-5 w-full" />
                  </div>
                ) : (
                  subcategories?.map((subcategory) => (
                    <SelectItem key={subcategory.id} value={subcategory.id}>
                      {subcategory.name}
                    </SelectItem>
                  ))
                )}
              </SelectContent>
            </Select>
            <FormDescription>
              Chọn danh mục con cho sản phẩm
            </FormDescription>
            <FormMessage />
          </FormItem>
        )}
      />
    </>
  );
}
