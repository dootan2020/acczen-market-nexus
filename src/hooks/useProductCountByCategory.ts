
import { useQuery } from '@tanstack/react-query';
import { useProducts } from './useProducts';

export function useProductCountByCategory() {
  const { data: products, isLoading, error } = useProducts();
  
  const productCountQuery = useQuery({
    queryKey: ['product-count-by-category'],
    queryFn: () => {
      if (!products || products.length === 0) return {};
      
      // Count products per category
      const counts: Record<string, number> = {};
      
      products.forEach(product => {
        if (product.category) {
          const categoryId = product.category.id;
          if (counts[categoryId]) {
            counts[categoryId]++;
          } else {
            counts[categoryId] = 1;
          }
        }
      });
      
      return counts;
    },
    enabled: !!products && !isLoading,
  });
  
  return {
    counts: productCountQuery.data || {},
    isLoading: isLoading || productCountQuery.isLoading,
    error: error || productCountQuery.error
  };
}
