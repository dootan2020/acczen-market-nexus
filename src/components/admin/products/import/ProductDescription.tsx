
import React from 'react';
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { UseFormReturn } from 'react-hook-form';
import { ImportProductFormValues } from './types';
import RichTextEditor from './RichTextEditor';

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
            <RichTextEditor 
              value={field.value || ''} 
              onChange={field.onChange}
            />
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );
}
