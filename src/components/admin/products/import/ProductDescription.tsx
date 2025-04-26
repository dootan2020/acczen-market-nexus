
import React from 'react';
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Textarea } from '@/components/ui/textarea';
import { UseFormReturn } from 'react-hook-form';
import { ImportProductFormValues } from './types';

interface ProductDescriptionProps {
  form: UseFormReturn<ImportProductFormValues>;
}

export default function ProductDescription({ form }: ProductDescriptionProps) {
  return (
    <FormField
      control={form.control}
      name="description"
      render={({ field }) => (
        <FormItem className="col-span-2">
          <FormLabel>Mô tả</FormLabel>
          <FormControl>
            <Textarea 
              rows={5}
              placeholder="Mô tả sản phẩm..."
              {...field} 
            />
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );
}
