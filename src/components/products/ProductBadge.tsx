
import React from 'react';
import { Badge } from "@/components/ui/badge";

export type BadgeType = 'featured' | 'new' | 'bestSeller' | 'sale';

interface ProductBadgeProps {
  type: BadgeType;
}

const ProductBadge: React.FC<ProductBadgeProps> = ({ type }) => {
  const getBadgeStyles = (): string => {
    switch (type) {
      case 'featured':
        return 'bg-[#2ECC71] hover:bg-[#27AE60]';
      case 'new':
        return 'bg-[#3498DB] hover:bg-[#2980B9]';
      case 'bestSeller':
        return 'bg-amber-500 hover:bg-amber-600';
      case 'sale':
        return 'bg-rose-500 hover:bg-rose-600';
      default:
        return 'bg-[#2ECC71] hover:bg-[#27AE60]';
    }
  };

  const getBadgeText = (): string => {
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
    <Badge className={`text-white ${getBadgeStyles()}`}>
      {getBadgeText()}
    </Badge>
  );
};

export default ProductBadge;
