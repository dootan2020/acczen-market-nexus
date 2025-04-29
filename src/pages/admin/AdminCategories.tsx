
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

// Import custom hooks
import { useCategoryFunctions } from '@/hooks/admin/useCategoryFunctions';
import { useSubcategoryFunctions } from '@/hooks/admin/useSubcategoryFunctions';

// Import components
import CategoryTab from '@/components/admin/category/CategoryTab';
import SubcategoryTab from '@/components/admin/category/SubcategoryTab';

const AdminCategories = () => {
  const [activeTab, setActiveTab] = useState<string>('categories');

  // Use custom hooks
  const categoryFunctions = useCategoryFunctions();
  const subcategoryFunctions = useSubcategoryFunctions((tab) => setActiveTab(tab));

  // Fetch categories
  const { data: categories, isLoading } = useQuery({
    queryKey: ['admin-categories'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .order('name');
      
      if (error) throw error;
      return data;
    }
  });

  // Fetch all subcategories to get counts
  const { data: allSubcategories } = useQuery({
    queryKey: ['all-subcategories'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('subcategories')
        .select('id, category_id');
      
      if (error) throw error;
      return data;
    }
  });
  
  // Calculate subcategory counts for each category
  const subcategoryCounts: Record<string, number> = {};
  if (allSubcategories) {
    allSubcategories.forEach(subcategory => {
      if (!subcategoryCounts[subcategory.category_id]) {
        subcategoryCounts[subcategory.category_id] = 0;
      }
      subcategoryCounts[subcategory.category_id]++;
    });
  }

  // Get subcategory count for a category
  const getSubcategoryCount = (categoryId: string): number => {
    return subcategoryCounts[categoryId] || 0;
  };

  return (
    <div className="container px-4 sm:px-6 w-full max-w-full mx-auto overflow-hidden">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <div className="overflow-x-auto">
          <TabsList className="mb-4">
            <TabsTrigger value="categories">Categories</TabsTrigger>
            {subcategoryFunctions.selectedCategoryId && (
              <TabsTrigger value="subcategories">
                Subcategories for {categories?.find(c => c.id === subcategoryFunctions.selectedCategoryId)?.name}
              </TabsTrigger>
            )}
          </TabsList>
        </div>

        <TabsContent value="categories" className="overflow-hidden">
          <CategoryTab 
            categories={categories}
            isLoading={isLoading}
            getSubcategoryCount={getSubcategoryCount}
            handleAddCategory={categoryFunctions.handleAddCategory}
            handleEditCategory={categoryFunctions.handleEditCategory}
            handleDeleteCategory={categoryFunctions.handleDeleteCategory}
            handleManageSubcategories={subcategoryFunctions.handleManageSubcategories}
            isCategoryDialogOpen={categoryFunctions.isCategoryDialogOpen}
            setIsCategoryDialogOpen={categoryFunctions.setIsCategoryDialogOpen}
            isDeleteDialogOpen={categoryFunctions.isDeleteDialogOpen}
            setIsDeleteDialogOpen={categoryFunctions.setIsDeleteDialogOpen}
            isEditing={categoryFunctions.isEditing}
            formData={categoryFunctions.formData}
            currentCategory={categoryFunctions.currentCategory}
            categoryMutation={categoryFunctions.categoryMutation}
            deleteMutation={categoryFunctions.deleteMutation}
            handleInputChange={categoryFunctions.handleInputChange}
            handleSubmit={categoryFunctions.handleSubmit}
          />
        </TabsContent>

        <TabsContent value="subcategories" className="overflow-hidden">
          <SubcategoryTab 
            selectedCategoryId={subcategoryFunctions.selectedCategoryId}
            categoryList={categories}
            onReturnToCategories={subcategoryFunctions.handleReturnToCategories}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AdminCategories;
