
import React from 'react';
import { Badge } from "@/components/ui/badge";

export type BadgeType = 'featured' | 'new' | 'bestSeller' | 'sale';

interface ProductBadgeProps {
  type: BadgeType;
  label?: string;
  percentage?: number; // For sale badges to show discount percentage
}

const ProductBadge: React.FC<ProductBadgeProps> = ({ type, label, percentage }) => {
  // Don't show sale badge if percentage is 0
  if (type === 'sale' && percentage === 0) {
    return null;
  }
  
  const getBadgeStyles = (): string => {
    switch (type) {
      case 'featured':
        return 'bg-[#19C37D] hover:bg-[#15a76b] shadow-sm';
      case 'new':
        return 'bg-[#3498DB] hover:bg-[#2980B9] shadow-sm';
      case 'bestSeller':
        return 'bg-amber-500 hover:bg-amber-600 shadow-sm';
      case 'sale':
        return 'bg-rose-500 hover:bg-rose-600 shadow-sm';
      default:
        return 'bg-[#19C37D] hover:bg-[#15a76b] shadow-sm';
    }
  };

  const getBadgeText = (): string => {
    if (label) {
      return label;
    }
    
    if (type === 'sale' && percentage && percentage > 0) {
      return `-${percentage}%`;
    }
    
    switch (type) {
      case 'featured':
        return 'Featured';
      case 'new':
        return 'New';
      case 'bestSeller':
        return 'Best Seller';
      case 'sale':
        return 'Sale';
      default:
        return '';
    }
  };

  return (
    <Badge className={`text-white px-2 py-1 font-medium ${getBadgeStyles()} animate-fade-in`}>
      {getBadgeText()}
    </Badge>
  );
};

export default ProductBadge;
