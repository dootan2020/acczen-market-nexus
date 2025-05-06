
import { useEffect, useState } from 'react';
import { useCategories } from '@/hooks/useCategories';
import CategoryCard from '@/components/CategoryCard';
import { Container } from '@/components/ui/container';
import { useProductCountByCategory } from '@/hooks/useProductCountByCategory';

// Định nghĩa rõ kiểu dữ liệu cho category từ useCategories
interface Category {
  created_at: string;
  id: string;
  name: string;
  slug: string;
  // Thêm các trường tùy chọn nếu có thể
  description?: string;
  image_url?: string;
}

export default function Categories() {
  const { categories, loading: loadingCategories } = useCategories();
  const { categoryCounts, isLoading: loadingCounts } = useProductCountByCategory();
  
  // State to hold the categories enriched with product counts
  const [enrichedCategories, setEnrichedCategories] = useState<Array<{
    id: string;
    name: string;
    description: string | null;
    image_url: string | null;
    productCount: number;
  }>>([]);
  
  // Whenever categories or counts change, update the enriched categories
  useEffect(() => {
    if (categories) {
      const enriched = categories.map((category: Category) => ({
        id: category.id,
        name: category.name,
        description: category.description || null,
        image_url: category.image_url || null,
        productCount: categoryCounts[category.id] || 0
      }));
      setEnrichedCategories(enriched);
    }
  }, [categories, categoryCounts]);
  
  return (
    <Container className="py-8">
      <h1 className="text-3xl font-bold mb-8 text-center">Browse Categories</h1>
      
      {loadingCategories || loadingCounts ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <div 
              key={i} 
              className="h-64 bg-gray-200 rounded-lg animate-pulse"
            />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {enrichedCategories.map((category, index) => (
            <CategoryCard 
              key={category.id}
              category={{
                id: category.id,
                name: category.name,
                slug: '', // Providing default value for required property
                description: category.description || undefined,
                image_url: category.image_url || undefined
              }}
              productCount={category.productCount}
              colorIndex={index}
            />
          ))}
          
          {enrichedCategories.length === 0 && (
            <div className="col-span-3 text-center py-12">
              <h2 className="text-xl font-medium text-gray-600">No categories found</h2>
              <p className="text-gray-500 mt-2">Check back later for new products and categories</p>
            </div>
          )}
        </div>
      )}
    </Container>
  );
}
