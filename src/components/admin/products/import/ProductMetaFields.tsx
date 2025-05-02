
import React from 'react';
import { FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { UseFormReturn } from 'react-hook-form';
import { ImportProductFormValues } from './types';

interface ProductMetaFieldsProps {
  form: UseFormReturn<ImportProductFormValues>;
}

export default function ProductMetaFields({ form }: ProductMetaFieldsProps) {
  return (
    <>
      <FormField
        control={form.control}
        name="status"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Trạng thái</FormLabel>
            <Select onValueChange={field.onChange} defaultValue={field.value || "active"}>
              <FormControl>
                <SelectTrigger>
                  <SelectValue placeholder="Chọn trạng thái" />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                <SelectItem value="active">Đang bán</SelectItem>
                <SelectItem value="inactive">Chưa bán</SelectItem>
              </SelectContent>
            </Select>
            <FormMessage />
          </FormItem>
        )}
      />
      
      <FormField
        control={form.control}
        name="sku"
        render={({ field }) => (
          <FormItem>
            <FormLabel>SKU</FormLabel>
            <FormControl>
              <Input {...field} />
            </FormControl>
            <FormDescription>
              Mã SKU được tạo tự động
            </FormDescription>
            <FormMessage />
          </FormItem>
        )}
      />
      
      <FormField
        control={form.control}
        name="slug"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Slug</FormLabel>
            <FormControl>
              <Input {...field} />
            </FormControl>
            <FormDescription>
              Đường dẫn URL của sản phẩm
            </FormDescription>
            <FormMessage />
          </FormItem>
        )}
      />
    </>
  );
}
