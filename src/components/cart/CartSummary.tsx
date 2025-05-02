
import React from 'react';
import { Button } from '@/components/ui/button';
import { ShoppingBag } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useCurrencyContext } from '@/contexts/CurrencyContext';

interface CartSummaryProps {
  totalPrice: number;
}

const CartSummary: React.FC<CartSummaryProps> = ({ totalPrice }) => {
  const { convertVNDtoUSD, formatUSD } = useCurrencyContext();
  const totalUSD = convertVNDtoUSD(totalPrice);
  
  return (
    <div className="border rounded-lg p-4 shadow-sm bg-card">
      <h2 className="text-lg font-semibold mb-4">Order Summary</h2>
      
      <div className="space-y-2">
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">Subtotal</span>
          <span>{formatUSD(totalUSD)}</span>
        </div>
        
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">Tax</span>
          <span>{formatUSD(0)}</span>
        </div>
        
        <div className="pt-2 border-t mt-2">
          <div className="flex justify-between font-medium">
            <span>Total</span>
            <span>{formatUSD(totalUSD)}</span>
          </div>
        </div>
      </div>
      
      <Button asChild className="w-full mt-4">
        <Link to="/checkout">
          <ShoppingBag className="mr-2 h-4 w-4" />
          Proceed to Checkout
        </Link>
      </Button>
    </div>
  );
};

export default CartSummary;
