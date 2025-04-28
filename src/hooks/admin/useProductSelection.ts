
import { useState } from 'react';
import { Product } from './types/productManagement.types';

export const useProductSelection = (filteredProducts: Product[] | undefined) => {
  const [selectedProducts, setSelectedProducts] = useState<string[]>([]);
  
  const handleToggleSelect = (productId: string) => {
    setSelectedProducts(prev => 
      prev.includes(productId) 
        ? prev.filter(id => id !== productId) 
        : [...prev, productId]
    );
  };

  const handleToggleSelectAll = () => {
    if (filteredProducts) {
      if (selectedProducts.length === filteredProducts.length) {
        setSelectedProducts([]);
      } else {
        setSelectedProducts(filteredProducts.map(p => p.id));
      }
    }
  };

  const handleClearSelection = () => {
    setSelectedProducts([]);
  };

  return {
    selectedProducts,
    setSelectedProducts,
    handleToggleSelect,
    handleToggleSelectAll,
    handleClearSelection
  };
};
