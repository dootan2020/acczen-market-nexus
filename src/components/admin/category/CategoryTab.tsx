
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Search, Plus } from 'lucide-react';
import CategoryTable from './CategoryTable';
import CategoryForm from './CategoryForm';
import CategoryDeleteDialog from './CategoryDeleteDialog';

interface CategoryTabProps {
  categories: any[] | undefined;
  isLoading: boolean;
  getSubcategoryCount: (categoryId: string) => number;
  handleAddCategory: () => void;
  handleEditCategory: (category: any) => void;
  handleDeleteCategory: (category: any) => void;
  handleManageSubcategories: (category: any) => void;
  isCategoryDialogOpen: boolean;
  setIsCategoryDialogOpen: (isOpen: boolean) => void;
  isDeleteDialogOpen: boolean;
  setIsDeleteDialogOpen: (isOpen: boolean) => void;
  isEditing: boolean;
  formData: {
    name: string;
    description: string;
    image_url: string;
    slug: string;
  };
  currentCategory: any;
  categoryMutation: any;
  deleteMutation: any;
  handleInputChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  handleSubmit: (e: React.FormEvent) => void;
}

const CategoryTab: React.FC<CategoryTabProps> = ({
  categories,
  isLoading,
  getSubcategoryCount,
  handleAddCategory,
  handleEditCategory,
  handleDeleteCategory,
  handleManageSubcategories,
  isCategoryDialogOpen,
  setIsCategoryDialogOpen,
  isDeleteDialogOpen,
  setIsDeleteDialogOpen,
  isEditing,
  formData,
  currentCategory,
  categoryMutation,
  deleteMutation,
  handleInputChange,
  handleSubmit
}) => {
  const [searchQuery, setSearchQuery] = useState('');

  // Filter categories by search query
  const filteredCategories = categories?.filter(category => 
    category.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    category.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    category.slug.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Categories</h1>
        <Button onClick={handleAddCategory}>
          <Plus className="h-4 w-4 mr-2" />
          Add Category
        </Button>
      </div>
      
      <div className="mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input 
            className="pl-10" 
            placeholder="Search categories..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>
      
      <Card>
        <CardContent className="p-0">
          <CategoryTable 
            categories={filteredCategories}
            getSubcategoryCount={getSubcategoryCount}
            onEdit={handleEditCategory}
            onDelete={handleDeleteCategory}
            onManageSubcategories={handleManageSubcategories}
            isLoading={isLoading}
          />
        </CardContent>
      </Card>
      
      {/* Category Form Dialog */}
      <CategoryForm 
        isOpen={isCategoryDialogOpen}
        onOpenChange={setIsCategoryDialogOpen}
        isEditing={isEditing}
        formData={formData}
        onInputChange={handleInputChange}
        onSubmit={handleSubmit}
        isPending={categoryMutation.isPending}
      />
      
      {/* Delete Confirmation Dialog */}
      <CategoryDeleteDialog 
        isOpen={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
        categoryName={currentCategory?.name}
        onDelete={() => currentCategory && deleteMutation.mutate(currentCategory.id)}
        isPending={deleteMutation.isPending}
      />
    </>
  );
};

export default CategoryTab;
