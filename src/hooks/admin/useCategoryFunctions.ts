
import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

interface CategoryFormData {
  name: string;
  description: string;
  image_url: string;
  slug: string;
}

export function useCategoryFunctions() {
  const queryClient = useQueryClient();
  const [isEditing, setIsEditing] = useState(false);
  const [isCategoryDialogOpen, setIsCategoryDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [currentCategory, setCurrentCategory] = useState<any>(null);
  const [formData, setFormData] = useState<CategoryFormData>({
    name: '',
    description: '',
    image_url: '',
    slug: '',
  });

  // Create/Update category mutation
  const categoryMutation = useMutation({
    mutationFn: async (data: CategoryFormData) => {
      // Generate slug if not provided
      if (!data.slug) {
        data.slug = data.name
          .toLowerCase()
          .replace(/[^\w\s]/gi, '')
          .replace(/\s+/g, '-');
      }

      if (isEditing && currentCategory) {
        // Update existing category
        const { error } = await supabase
          .from('categories')
          .update({
            name: data.name,
            description: data.description,
            image_url: data.image_url,
            slug: data.slug,
          })
          .eq('id', currentCategory.id);
        
        if (error) throw error;
        return { success: true, action: 'updated' };
      } else {
        // Create new category
        const { error } = await supabase
          .from('categories')
          .insert({
            name: data.name,
            description: data.description,
            image_url: data.image_url,
            slug: data.slug,
          });
        
        if (error) throw error;
        return { success: true, action: 'created' };
      }
    },
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: ['admin-categories'] });
      queryClient.invalidateQueries({ queryKey: ['categories'] });
      toast({
        title: `Category ${result.action}`,
        description: `The category has been successfully ${result.action}.`,
      });
      setIsCategoryDialogOpen(false);
    },
    onError: (error) => {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to save category',
      });
    },
  });

  // Delete category mutation
  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('categories')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      return { success: true };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-categories'] });
      queryClient.invalidateQueries({ queryKey: ['categories'] });
      toast({
        title: 'Category deleted',
        description: 'The category has been successfully deleted.',
      });
      setIsDeleteDialogOpen(false);
    },
    onError: (error) => {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to delete category',
      });
    },
  });

  // Handle category dialog open
  const handleAddCategory = () => {
    setIsEditing(false);
    setCurrentCategory(null);
    setFormData({
      name: '',
      description: '',
      image_url: '',
      slug: '',
    });
    setIsCategoryDialogOpen(true);
  };

  // Handle edit category
  const handleEditCategory = (category: any) => {
    setIsEditing(true);
    setCurrentCategory(category);
    setFormData({
      name: category.name,
      description: category.description || '',
      image_url: category.image_url || '',
      slug: category.slug,
    });
    setIsCategoryDialogOpen(true);
  };

  // Handle delete category
  const handleDeleteCategory = (category: any) => {
    setCurrentCategory(category);
    setIsDeleteDialogOpen(true);
  };

  // Handle form input change
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // Handle form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    categoryMutation.mutate(formData);
  };

  return {
    isEditing,
    isCategoryDialogOpen,
    setIsCategoryDialogOpen,
    isDeleteDialogOpen,
    setIsDeleteDialogOpen,
    currentCategory,
    formData,
    categoryMutation,
    deleteMutation,
    handleAddCategory,
    handleEditCategory,
    handleDeleteCategory,
    handleInputChange,
    handleSubmit
  };
}
