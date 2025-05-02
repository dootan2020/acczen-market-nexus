
import React from 'react';
import { Badge } from '@/components/ui/badge';

interface ProductHeaderProps {
  title: string;
  subtitle?: string;
  categoryName?: string;
}

const ProductHeader: React.FC<ProductHeaderProps> = ({ 
  title, 
  subtitle, 
  categoryName 
}) => {
  return (
    <div className="space-y-2">
      {categoryName && (
        <Badge 
          className="bg-accent text-accent-foreground hover:bg-accent/80 mb-2"
        >
          {categoryName}
        </Badge>
      )}
      <h1 className="text-3xl md:text-4xl font-semibold font-poppins leading-tight text-gray-800">
        {title}
      </h1>
      {subtitle && (
        <p className="text-muted-foreground font-inter">
          {subtitle}
        </p>
      )}
    </div>
  );
};

export default ProductHeader;
