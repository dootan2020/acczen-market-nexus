
import { useState } from 'react';
import { Product } from './types/productManagement.types';
import { ProductFormData } from '@/types/products';

export const useProductDialogs = () => {
  const [isEditing, setIsEditing] = useState(false);
  const [isProductDialogOpen, setIsProductDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isBulkDeleteDialogOpen, setIsBulkDeleteDialogOpen] = useState(false);
  const [currentProduct, setCurrentProduct] = useState<Product | null>(null);
  const [formData, setFormData] = useState<ProductFormData>({
    name: '',
    description: '',
    price: '',
    sale_price: '',
    stock_quantity: '',
    image_url: '',
    slug: '',
    category_id: '',
    subcategory_id: '',
    status: 'active',
    sku: '',
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleCategoryChange = (value: string) => {
    setFormData(prev => ({ ...prev, category_id: value, subcategory_id: '' }));
  };

  const handleSubcategoryChange = (value: string) => {
    setFormData(prev => ({ ...prev, subcategory_id: value }));
  };

  return {
    isEditing,
    setIsEditing,
    isProductDialogOpen,
    setIsProductDialogOpen,
    isDeleteDialogOpen,
    setIsDeleteDialogOpen,
    isBulkDeleteDialogOpen,
    setIsBulkDeleteDialogOpen,
    currentProduct,
    setCurrentProduct,
    formData,
    setFormData,
    handleInputChange,
    handleCategoryChange,
    handleSubcategoryChange,
  };
};
