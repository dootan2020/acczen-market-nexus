
import { CheckCircle2, AlertCircle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface StockBadgeProps {
  stock: number;
}

const StockBadge = ({ stock }: StockBadgeProps) => {
  if (stock <= 0) {
    return (
      <Badge variant="destructive" className="mb-2">
        <AlertCircle className="w-3 h-3 mr-1" /> Hết hàng
      </Badge>
    );
  } else if (stock < 5) {
    return (
      <Badge variant="secondary" className="bg-yellow-500 hover:bg-yellow-600 mb-2">
        <AlertCircle className="w-3 h-3 mr-1" /> Sắp hết hàng (còn {stock})
      </Badge>
    );
  }
  
  return (
    <Badge variant="secondary" className="bg-green-500 hover:bg-green-600 text-white mb-2">
      <CheckCircle2 className="w-3 h-3 mr-1" /> Còn hàng ({stock > 99 ? '99+' : stock})
    </Badge>
  );
};

export default StockBadge;
