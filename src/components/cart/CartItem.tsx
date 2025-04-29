
import React from 'react';
import { X, MinusCircle, PlusCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { CartItemType } from '@/types/cart';

type CartItemProps = {
  item: CartItemType;
  onRemove: (id: string) => void;
  onUpdateQuantity: (id: string, quantity: number) => void;
};

const CartItem: React.FC<CartItemProps> = ({ item, onRemove, onUpdateQuantity }) => {
  const { id, name, price, quantity, image } = item;
  const formattedPrice = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(price);
  const formattedTotal = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(price * quantity);

  return (
    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 pb-6 border-b">
      <div className="flex items-start sm:items-center w-full sm:w-auto">
        <div className="relative h-16 w-16 flex-shrink-0 bg-muted rounded-md overflow-hidden mr-3 sm:mr-4">
          {image ? (
            <img
              src={image}
              alt={name}
              className="h-full w-full object-cover"
              onError={(e) => {
                (e.target as HTMLImageElement).src = '/placeholder.svg';
              }}
            />
          ) : (
            <div className="flex items-center justify-center h-full w-full bg-muted">
              <span className="text-muted-foreground text-xs">No Image</span>
            </div>
          )}
        </div>
        
        <div className="flex-1 min-w-0 mr-2 sm:mr-4">
          <h3 className="font-medium text-base mb-1 line-clamp-2">{name}</h3>
          <p className="text-sm text-muted-foreground block sm:hidden">
            {formattedPrice} × {quantity} = {formattedTotal}
          </p>
        </div>
      </div>
      
      <div className="flex flex-row sm:flex-col items-center justify-between w-full sm:w-auto mt-4 sm:mt-0">
        <div className="flex items-center justify-between min-w-28">
          <Button
            variant="outline"
            size="icon"
            className="h-8 w-8 rounded-full text-primary"
            onClick={() => onUpdateQuantity(id, Math.max(1, quantity - 1))}
            disabled={quantity <= 1}
          >
            <MinusCircle className="h-4 w-4" />
          </Button>
          
          <span className="mx-3 font-medium">{quantity}</span>
          
          <Button
            variant="outline"
            size="icon"
            className="h-8 w-8 rounded-full text-primary"
            onClick={() => onUpdateQuantity(id, quantity + 1)}
          >
            <PlusCircle className="h-4 w-4" />
          </Button>
        </div>
        
        <div className="hidden sm:flex flex-col items-end min-w-28">
          <p className="font-medium">{formattedTotal}</p>
          <p className="text-sm text-muted-foreground">
            {formattedPrice} × {quantity}
          </p>
        </div>
        
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8"
          onClick={() => onRemove(id)}
        >
          <X className="h-4 w-4" />
          <span className="sr-only">Remove</span>
        </Button>
      </div>
    </div>
  );
};

export default CartItem;
