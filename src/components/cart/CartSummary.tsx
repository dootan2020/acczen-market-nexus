
import React from 'react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { useCurrencyContext } from '@/contexts/CurrencyContext';

interface CartSummaryProps {
  totalPrice: number;
}

const CartSummary: React.FC<CartSummaryProps> = ({ totalPrice }) => {
  const { convertVNDtoUSD, formatUSD } = useCurrencyContext();
  
  return (
    <div className="bg-secondary/30 p-6 rounded-lg">
      <h2 className="text-xl font-semibold mb-4">Order Summary</h2>
      <div className="flex justify-between mb-4">
        <span>Total:</span>
        <span className="font-bold">{formatUSD(convertVNDtoUSD(totalPrice))}</span>
      </div>
      <Button className="w-full" asChild>
        <Link to="/checkout">Checkout</Link>
      </Button>
    </div>
  );
};

export default CartSummary;
