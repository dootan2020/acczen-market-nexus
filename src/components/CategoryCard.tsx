
import React from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Category } from '@/types/category';

interface CategoryCardProps {
  category: Category;
  productCount?: number;
  colorIndex?: number;
}

const CATEGORY_COLORS = [
  'from-blue-50 to-blue-100 border-blue-200',
  'from-green-50 to-green-100 border-green-200',
  'from-purple-50 to-purple-100 border-purple-200',
  'from-amber-50 to-amber-100 border-amber-200',
  'from-rose-50 to-rose-100 border-rose-200',
  'from-cyan-50 to-cyan-100 border-cyan-200',
];

const CATEGORY_ICONS = [
  'bg-blue-500',
  'bg-green-500',
  'bg-purple-500',
  'bg-amber-500',
  'bg-rose-500',
  'bg-cyan-500',
];

const CategoryCard: React.FC<CategoryCardProps> = ({ 
  category, 
  productCount = 0, 
  colorIndex = 0 
}) => {
  const index = colorIndex % CATEGORY_COLORS.length;
  const backgroundClass = CATEGORY_COLORS[index];
  const iconClass = CATEGORY_ICONS[index];

  return (
    <Link to={`/products?category=${category.slug}`}>
      <Card className="h-full overflow-hidden transition-all duration-200 hover:shadow-md border hover:border-primary/20 cursor-pointer">
        <div className={`h-32 bg-gradient-to-br ${backgroundClass} flex items-center justify-center relative`}>
          {category.image_url ? (
            <img 
              src={category.image_url} 
              alt={category.name} 
              className="object-cover w-full h-full hover:scale-105 transition-transform duration-200"
            />
          ) : (
            <div className={`w-16 h-16 rounded-full ${iconClass} text-white flex items-center justify-center`}>
              <span className="text-2xl">{category.name.charAt(0)}</span>
            </div>
          )}
          <Badge className="absolute top-3 right-3 bg-white text-gray-800 hover:bg-white/90">
            {productCount} {productCount === 1 ? 'product' : 'products'}
          </Badge>
        </div>
        <CardContent className="p-4">
          <h3 className="text-lg font-medium line-clamp-1">{category.name}</h3>
          {category.description && (
            <p className="text-sm text-muted-foreground mt-1 line-clamp-2">{category.description}</p>
          )}
        </CardContent>
      </Card>
    </Link>
  );
};

export default CategoryCard;
