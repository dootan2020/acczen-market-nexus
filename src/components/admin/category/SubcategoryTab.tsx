
import React from 'react';
import { Button } from '@/components/ui/button';
import SubcategoriesTable from '@/components/admin/subcategories/SubcategoriesTable';

interface SubcategoryTabProps {
  selectedCategoryId: string | null;
  categoryList: any[] | undefined;
  onReturnToCategories: () => void;
}

const SubcategoryTab: React.FC<SubcategoryTabProps> = ({
  selectedCategoryId,
  categoryList,
  onReturnToCategories
}) => {
  const categoryName = categoryList?.find(c => c.id === selectedCategoryId)?.name || '';

  if (!selectedCategoryId) {
    return (
      <div className="text-center p-8">
        <p>No category selected. Please select a category first.</p>
        <Button className="mt-4" onClick={onReturnToCategories}>
          Back to Categories
        </Button>
      </div>
    );
  }

  return (
    <div className="mb-4">
      <Button 
        variant="outline" 
        onClick={onReturnToCategories}
        className="mb-4"
      >
        ← Back to Categories
      </Button>
      
      <SubcategoriesTable 
        categoryId={selectedCategoryId} 
        categoryName={categoryName}
      />
    </div>
  );
};

export default SubcategoryTab;
