
import React from 'react';
import { Box, CheckCircle2 } from 'lucide-react';

interface StockSoldBadgesProps {
  stock: number;
  soldCount?: number;
}

const StockSoldBadges = ({ stock, soldCount = 0 }: StockSoldBadgesProps) => {
  return (
    <div className="flex flex-wrap gap-2 mb-2">
      <div className="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold bg-purple-100 text-purple-700">
        <Box className="w-3 h-3 mr-1" />
        Kho: {stock}
      </div>
      
      {soldCount > 0 && (
        <div className="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold bg-green-100 text-green-700">
          <CheckCircle2 className="w-3 h-3 mr-1" />
          Đã bán: {soldCount.toLocaleString()}
        </div>
      )}
    </div>
  );
};

export default StockSoldBadges;
