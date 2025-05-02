
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Link } from 'react-router-dom';

interface ProductHeaderProps {
  name: string;
  category?: {
    name: string;
    id: string;
  };
}

const ProductHeader = ({ name, category }: ProductHeaderProps) => {
  return (
    <div className="mb-6">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm mb-4 text-gray-500">
        <Link to="/" className="hover:text-primary transition-colors">Home</Link>
        <span>/</span>
        <Link to="/products" className="hover:text-primary transition-colors">Products</Link>
        {category && (
          <>
            <span>/</span>
            <Link to={`/categories/${category.id}`} className="hover:text-primary transition-colors">
              {category.name}
            </Link>
          </>
        )}
      </div>
      
      {/* Product name */}
      <h1 className="text-3xl md:text-4xl font-bold text-gray-900 font-poppins">{name}</h1>
      
      {/* Category badge */}
      {category && (
        <Badge variant="outline" className="mt-3 bg-green-50 text-green-700 border-green-200 hover:bg-green-100">
          {category.name}
        </Badge>
      )}
      
      <Separator className="mt-6" />
    </div>
  );
};

export default ProductHeader;
