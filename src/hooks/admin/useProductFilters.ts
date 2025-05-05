
import { useState, useMemo, useCallback } from 'react';
import { Product } from './types/productManagement.types';

interface FilterOptions {
  category?: string;
  status?: string;
  minPrice?: number;
  maxPrice?: number;
  inStock?: boolean;
}

export const useProductFilters = (products: Product[] | undefined) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState<FilterOptions>({});
  
  // Apply single filter
  const applyFilter = useCallback((key: keyof FilterOptions, value: any) => {
    setFilters(prev => ({
      ...prev,
      [key]: value
    }));
  }, []);
  
  // Clear all filters
  const clearFilters = useCallback(() => {
    setFilters({});
    setSearchQuery('');
  }, []);
  
  // Reset a specific filter
  const resetFilter = useCallback((key: keyof FilterOptions) => {
    setFilters(prev => {
      const newFilters = { ...prev };
      delete newFilters[key];
      return newFilters;
    });
  }, []);
  
  // Filter products by search query and filter options
  const filteredProducts = useMemo(() => {
    if (!products) return [];
    
    // First filter by search query
    let result = products.filter(product => 
      product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.sku?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.slug.toLowerCase().includes(searchQuery.toLowerCase())
    );
    
    // Then apply additional filters
    if (filters.category) {
      result = result.filter(product => product.category_id === filters.category);
    }
    
    if (filters.status) {
      result = result.filter(product => product.status === filters.status);
    }
    
    if (filters.minPrice !== undefined) {
      result = result.filter(product => product.price >= filters.minPrice!);
    }
    
    if (filters.maxPrice !== undefined) {
      result = result.filter(product => product.price <= filters.maxPrice!);
    }
    
    if (filters.inStock !== undefined) {
      result = result.filter(product => 
        filters.inStock ? product.stock_quantity > 0 : product.stock_quantity === 0
      );
    }
    
    return result;
  }, [products, searchQuery, filters]);

  return {
    searchQuery,
    setSearchQuery,
    filters,
    applyFilter,
    resetFilter,
    clearFilters,
    filteredProducts
  };
};
