
import React from 'react';
import { DialogFooter } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { DialogClose } from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import SubcategorySelector from '@/components/SubcategorySelector';
import { ProductStatus } from '@/types/products';

interface ProductFormData {
  name: string;
  description: string;
  price: string;
  sale_price: string;
  stock_quantity: string;
  image_url: string;
  slug: string;
  category_id: string;
  subcategory_id: string;
  status: ProductStatus;
  sku: string;
}

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
  return (
    <form onSubmit={handleSubmit}>
      <div className="grid gap-4 py-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="name">Product Name</Label>
            <Input
              id="name"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="slug">Slug</Label>
            <Input
              id="slug"
              name="slug"
              value={formData.slug}
              onChange={handleInputChange}
              placeholder="auto-generated-if-empty"
            />
          </div>
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="description">Description</Label>
          <Textarea
            id="description"
            name="description"
            value={formData.description}
            onChange={handleInputChange}
            rows={3}
          />
        </div>
        
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="price">Price (VND)</Label>
            <Input
              id="price"
              name="price"
              type="number"
              min="0"
              step="0.01"
              value={formData.price}
              onChange={handleInputChange}
              required
              placeholder="Enter price in VND"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="sale_price">Sale Price (VND)</Label>
            <Input
              id="sale_price"
              name="sale_price"
              type="number"
              min="0"
              step="0.01"
              value={formData.sale_price}
              onChange={handleInputChange}
              placeholder="Optional sale price in VND"
            />
          </div>
        </div>
        
        <div className="grid grid-cols-3 gap-4">
          <div className="space-y-2">
            <Label htmlFor="stock_quantity">Stock Quantity</Label>
            <Input
              id="stock_quantity"
              name="stock_quantity"
              type="number"
              min="0"
              value={formData.stock_quantity}
              onChange={handleInputChange}
              required
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
            <Label htmlFor="status">Status</Label>
            <Select 
              name="status" 
              value={formData.status}
              onValueChange={(value) => handleInputChange({
                target: { name: 'status', value }
              } as React.ChangeEvent<HTMLInputElement>)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
                <SelectItem value="out_of_stock">Out of Stock</SelectItem>
              </SelectContent>
            </Select>
          </div>
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
