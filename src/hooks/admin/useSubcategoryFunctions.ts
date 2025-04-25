
import { useState } from 'react';
import { useSubcategoryCRUD } from '@/hooks/useSubcategories';

export function useSubcategoryFunctions(onTabChange: (tab: string) => void) {
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(null);
  
  // Handle manage subcategories
  const handleManageSubcategories = (category: any) => {
    setSelectedCategoryId(category.id);
    onTabChange('subcategories');
  };

  // Return to categories
  const handleReturnToCategories = () => {
    onTabChange('categories');
  };
  
  return {
    selectedCategoryId,
    setSelectedCategoryId,
    handleManageSubcategories,
    handleReturnToCategories
  };
}
