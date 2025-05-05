
import { useState, useMemo } from 'react';
import { Product } from './types/productManagement.types';

export const useProductFilters = (products: Product[] | undefined) => {
  const [searchQuery, setSearchQuery] = useState('');
  
  // Filter products by search query
  const filteredProducts = useMemo(() => {
    if (!products) return [];
    
    return products.filter(product => 
      product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.slug.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [products, searchQuery]);

  return {
    searchQuery,
    setSearchQuery,
    filteredProducts
  };
};
