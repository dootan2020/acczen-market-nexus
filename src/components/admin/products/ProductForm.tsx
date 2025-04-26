
import React from 'react';
import { DialogFooter, DialogClose } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { ProductFormData } from '@/types/products';
import ProductBasicInfo from './form/ProductBasicInfo';
import ProductDescription from './form/ProductDescription';
import ProductPricing from './form/ProductPricing';
import ProductInventory from './form/ProductInventory';
import SubcategorySelector from '@/components/SubcategorySelector';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';

interface ProductFormProps {
  formData: ProductFormData;
  handleInputChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  handleSubmit: (e: React.FormEvent) => void;
  handleCategoryChange: (value: string) => void;
  handleSubcategoryChange: (value: string) => void;
  categories?: any[];
  isEditing: boolean;
  isPending: boolean;
}

const ProductForm: React.FC<ProductFormProps> = ({
  formData,
  handleInputChange,
  handleSubmit,
  handleCategoryChange,
  handleSubcategoryChange,
  categories,
  isEditing,
  isPending,
}) => {
  const handleStatusChange = (value: string) => {
    handleInputChange({
      target: { name: 'status', value }
    } as React.ChangeEvent<HTMLInputElement>);
  };

  return (
    <form onSubmit={handleSubmit}>
      <div className="grid gap-4 py-4">
        <ProductBasicInfo 
          name={formData.name}
          slug={formData.slug}
          onChange={handleInputChange}
        />
        
        <ProductDescription 
          description={formData.description}
          onChange={handleInputChange}
        />
        
        <ProductPricing 
          price={formData.price}
          salePrice={formData.sale_price}
          onChange={handleInputChange}
        />
        
        <div className="grid grid-cols-2 gap-4">
          <ProductInventory 
            stockQuantity={formData.stock_quantity}
            status={formData.status}
            onChange={handleInputChange}
            onStatusChange={handleStatusChange}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="category_id">Category</Label>
          <Select 
            name="category_id" 
            value={formData.category_id}
            onValueChange={handleCategoryChange}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select a category" />
            </SelectTrigger>
            <SelectContent>
              {categories?.map(category => (
                <SelectItem key={category.id} value={category.id}>
                  {category.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="subcategory_id">Subcategory</Label>
          <SubcategorySelector 
            categoryId={formData.category_id}
            value={formData.subcategory_id}
            onValueChange={handleSubcategoryChange}
          />
          {!formData.category_id && (
            <p className="text-sm text-muted-foreground">Select a category first</p>
          )}
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="image_url">Image URL</Label>
          <Input
            id="image_url"
            name="image_url"
            value={formData.image_url}
            onChange={handleInputChange}
            placeholder="https://example.com/image.jpg"
          />
          {formData.image_url && (
            <div className="mt-2 relative w-20 h-20">
              <img 
                src={formData.image_url} 
                alt="Product preview" 
                className="rounded object-cover w-full h-full"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = 'https://placehold.co/400x400?text=Invalid+Image';
                }}
              />
            </div>
          )}
        </div>
      </div>

      <DialogFooter>
        <DialogClose asChild>
          <Button type="button" variant="outline">Cancel</Button>
        </DialogClose>
        <Button 
          type="submit"
          disabled={isPending}
        >
          {isPending ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-2 border-b-transparent mr-2"></div>
              Saving...
            </>
          ) : (
            isEditing ? 'Update Product' : 'Add Product'
          )}
        </Button>
      </DialogFooter>
    </form>
  );
};

export default ProductForm;
