
import React from 'react';
import { Button } from '@/components/ui/button';
import { CartItem as CartItemType } from '@/types/cart';
import { useCurrencyContext } from '@/contexts/CurrencyContext';

interface CartItemProps {
  item: CartItemType;
  onRemove: (id: string) => void;
  onUpdateQuantity: (id: string, quantity: number) => void;
}

const CartItem: React.FC<CartItemProps> = ({ item, onRemove, onUpdateQuantity }) => {
  const { convertVNDtoUSD, formatUSD } = useCurrencyContext();
  
  return (
    <div className="flex items-center border-b py-4 hover:bg-secondary/10 transition-colors">
      <img 
        src={item.image} 
        alt={item.name} 
        className="w-24 h-24 object-cover rounded mr-4" 
      />
      <div className="flex-grow">
        <h2 className="font-semibold">{item.name}</h2>
        <p className="text-muted-foreground">
          Price: {formatUSD(convertVNDtoUSD(item.price))}
        </p>
        <div className="flex items-center gap-2 mt-2">
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => onUpdateQuantity(item.id, Math.max(1, item.quantity - 1))}
          >
            -
          </Button>
          <span>{item.quantity}</span>
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => onUpdateQuantity(item.id, item.quantity + 1)}
          >
            +
          </Button>
          <Button 
            variant="destructive" 
            size="sm"
            onClick={() => onRemove(item.id)}
          >
            Xóa
          </Button>
        </div>
      </div>
    </div>
  );
};

export default CartItem;
