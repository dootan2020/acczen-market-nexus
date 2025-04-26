
import React, { useState } from 'react';
import { FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { UseFormReturn } from 'react-hook-form';
import { ImportProductFormValues } from './types';

interface ProductImageUploadProps {
  form: UseFormReturn<ImportProductFormValues>;
}

export default function ProductImageUpload({ form }: ProductImageUploadProps) {
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);

  const handleImageUpload = async (file: File) => {
    if (!file) return null;
    
    setUploading(true);
    try {
      const fileExt = file.name.split('.').pop();
      const filePath = `${Math.random().toString(36).slice(2)}.${fileExt}`;
      
      const { error: uploadError } = await supabase.storage
        .from('products')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('products')
        .getPublicUrl(filePath);

      form.setValue('image_url', publicUrl);
      toast.success("Upload thành công", {
        description: "Hình ảnh đã được tải lên thành công",
      });
      
      return publicUrl;
    } catch (error) {
      console.error('Error uploading image:', error);
      toast.error("Lỗi upload", {
        description: "Không thể tải lên hình ảnh. Vui lòng thử lại.",
      });
      return null;
    } finally {
      setUploading(false);
    }
  };

  return (
    <FormField
      control={form.control}
      name="image_url"
      render={({ field }) => (
        <FormItem className="col-span-2">
          <FormLabel>Hình ảnh sản phẩm</FormLabel>
          <div className="space-y-4">
            <FormControl>
              <Input {...field} type="url" placeholder="Nhập URL hình ảnh" />
            </FormControl>
            <div className="flex flex-col space-y-2">
              <Label>Hoặc tải lên hình ảnh</Label>
              <Input
                type="file"
                accept="image/*"
                onChange={async (e) => {
                  const file = e.target.files?.[0];
                  if (file) {
                    setImageFile(file);
                    const url = await handleImageUpload(file);
                    if (url) {
                      field.onChange(url);
                    }
                  }
                }}
                disabled={uploading}
              />
            </div>
            {imageFile && field.value && (
              <div className="mt-2">
                <img 
                  src={field.value} 
                  alt="Preview" 
                  className="max-w-[200px] h-auto rounded-md"
                />
              </div>
            )}
          </div>
          <FormDescription>
            Nhập URL hoặc tải lên hình ảnh sản phẩm
          </FormDescription>
          <FormMessage />
        </FormItem>
      )}
    />
  );
}
