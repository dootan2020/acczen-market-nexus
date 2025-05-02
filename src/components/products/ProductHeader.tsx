
import React from 'react';
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface ProductHeaderProps {
  name: string;
  categoryName?: string;
  className?: string;
  isFeatured?: boolean;
  isNew?: boolean;
}

const ProductHeader: React.FC<ProductHeaderProps> = ({
  name,
  categoryName,
  className,
  isFeatured = false,
  isNew = false,
}) => {
  return (
    <div className={cn("space-y-3", className)}>
      {/* Category badge */}
      {categoryName && (
        <Badge 
          variant="outline" 
          className="text-xs font-medium text-muted-foreground bg-background hover:bg-muted/50"
        >
          {categoryName}
        </Badge>
      )}
      
      {/* Product title */}
      <h1 className="text-3xl font-bold font-poppins sm:text-4xl">{name}</h1>
      
      {/* Product badges */}
      <div className="flex items-center gap-2">
        {isFeatured && (
          <Badge variant="secondary" className="bg-amber-100 text-amber-800 hover:bg-amber-200 border-amber-200">
            Featured
          </Badge>
        )}
        {isNew && (
          <Badge variant="secondary" className="bg-green-100 text-green-800 hover:bg-green-200 border-green-200">
            New
          </Badge>
        )}
      </div>
    </div>
  );
};

export default ProductHeader;
