
import React from 'react';

interface ProductHeaderProps {
  title: string;
  subtitle?: string;
  categoryName?: string;
  stockQuantity: number;
}

const ProductHeader: React.FC<ProductHeaderProps> = ({
  title,
  subtitle,
  categoryName,
  stockQuantity
}) => {
  // Calculate a fake "sold" number for display purposes (for demonstration)
  // In a real app, this would come from actual sales data
  const soldQuantity = 10000 + (stockQuantity > 10 ? Math.round(stockQuantity * 0.5) : 50);
  
  return (
    <div className="space-y-2">
      {categoryName && (
        <div className="text-sm text-muted-foreground font-inter">
          {categoryName}
        </div>
      )}
      
      <h1 className="text-2xl md:text-3xl font-semibold font-poppins text-gray-800 tracking-tight">
        {title}
      </h1>
      
      {subtitle && (
        <p className="text-gray-600 font-inter">
          {subtitle}
        </p>
      )}
      
      <div className="flex flex-wrap gap-2 mt-2">
        <span className="inline-flex px-3 py-1 rounded-full text-sm font-semibold text-white bg-[#9c27b0]">
          Stock: {stockQuantity.toLocaleString()}
        </span>
        
        <span className="inline-flex px-3 py-1 rounded-full text-sm font-semibold text-white bg-[#ff9800]">
          Sold: {soldQuantity.toLocaleString()}
        </span>
      </div>
    </div>
  );
};

export default ProductHeader;
