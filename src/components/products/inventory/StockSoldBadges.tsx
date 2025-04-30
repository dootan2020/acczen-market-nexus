
import React from 'react';
import { Badge } from "@/components/ui/badge";

interface StockSoldBadgesProps {
  stock: number;
  soldCount?: number;
  className?: string;
  variant?: 'default' | 'compact';
}

const StockSoldBadges: React.FC<StockSoldBadgesProps> = ({ 
  stock, 
  soldCount = 0, 
  className = '',
  variant = 'default'
}) => {
  // Determine stock status
  let stockLabel = '';
  let stockBadgeClass = '';
  
  if (stock <= 0) {
    stockLabel = 'Hết hàng';
    stockBadgeClass = 'bg-red-100 text-red-800 border-red-200';
  } else if (stock <= 5) {
    stockLabel = `Sắp hết hàng (${stock})`;
    stockBadgeClass = 'bg-amber-100 text-amber-800 border-amber-200';
  } else {
    stockLabel = `Còn hàng (${stock})`;
    stockBadgeClass = 'bg-green-100 text-green-800 border-green-200';
  }
  
  if (variant === 'compact') {
    return (
      <div className={`flex gap-1 ${className}`}>
        <Badge variant="outline" className={`text-xs ${stockBadgeClass}`}>
          {stock <= 0 ? 'Hết hàng' : `${stock} sản phẩm`}
        </Badge>
        {soldCount > 0 && (
          <Badge variant="outline" className="text-xs bg-blue-100 text-blue-800 border-blue-200">
            Đã bán: {soldCount}
          </Badge>
        )}
      </div>
    );
  }
  
  return (
    <div className={`flex flex-wrap gap-2 ${className}`}>
      <Badge variant="outline" className={stockBadgeClass}>
        {stockLabel}
      </Badge>
      {soldCount > 0 && (
        <Badge variant="outline" className="bg-blue-100 text-blue-800 border-blue-200">
          Đã bán: {soldCount}
        </Badge>
      )}
    </div>
  );
};

export default StockSoldBadges;
