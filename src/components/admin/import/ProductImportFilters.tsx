
import React from 'react';
import { Slider } from '@/components/ui/slider';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ImportFilters } from '@/pages/admin/AdminProductImport';

interface ProductImportFiltersProps {
  filters: ImportFilters;
  onFilterChange: (filters: Partial<ImportFilters>) => void;
  markupPercentage: number;
  onMarkupChange: (value: number) => void;
  categories: Array<{ id: string; name: string }>;
}

export const ProductImportFilters: React.FC<ProductImportFiltersProps> = ({
  filters,
  onFilterChange,
  markupPercentage,
  onMarkupChange,
  categories
}) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div className="space-y-4">
        <div className="space-y-2">
          <label htmlFor="category" className="text-sm font-medium">
            Category
          </label>
          <Select
            value={filters.category}
            onValueChange={(value) => onFilterChange({ category: value })}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">All Categories</SelectItem>
              {categories.map((category) => (
                <SelectItem key={category.id} value={category.id}>
                  {category.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        
        <div className="space-y-2">
          <label className="text-sm font-medium">
            Minimum Rating: {filters.minRating} stars
          </label>
          <Slider
            value={[filters.minRating]}
            min={0}
            max={5}
            step={0.5}
            onValueChange={(value) => onFilterChange({ minRating: value[0] })}
          />
        </div>
      </div>
      
      <div className="space-y-4">
        <div className="space-y-2">
          <label className="text-sm font-medium">
            Minimum Stock: {filters.minStock} items
          </label>
          <Slider
            value={[filters.minStock]}
            min={0}
            max={100}
            step={1}
            onValueChange={(value) => onFilterChange({ minStock: value[0] })}
          />
        </div>
        
        <div className="space-y-2">
          <label className="text-sm font-medium">
            Price Markup: {markupPercentage}%
          </label>
          <Slider
            value={[markupPercentage]}
            min={0}
            max={100}
            step={1}
            onValueChange={(value) => onMarkupChange(value[0])}
          />
          <p className="text-xs text-muted-foreground">
            This percentage will be added to the original price when importing
          </p>
        </div>
      </div>
    </div>
  );
};
