
import { CheckCircle2, AlertCircle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface StockBadgeProps {
  stock: number;
  className?: string;
  variant?: 'default' | 'secondary' | 'destructive' | 'outline';
}

const StockBadge = ({ stock, className = '', variant }: StockBadgeProps) => {
  if (stock <= 0) {
    return (
      <Badge variant="destructive" className={`mb-2 ${className}`}>
        <AlertCircle className="w-3 h-3 mr-1" /> Out of Stock
      </Badge>
    );
  } else if (stock < 5) {
    return (
      <Badge variant={variant || "secondary"} className={`bg-yellow-500 hover:bg-yellow-600 mb-2 ${className}`}>
        <AlertCircle className="w-3 h-3 mr-1" /> Low Stock ({stock})
      </Badge>
    );
  }
  
  return (
    <Badge variant={variant || "secondary"} className={`bg-green-500 hover:bg-green-600 text-white mb-2 ${className}`}>
      <CheckCircle2 className="w-3 h-3 mr-1" /> In Stock ({stock > 99 ? '99+' : stock})
    </Badge>
  );
};

export default StockBadge;
