
import React from 'react';
import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card";
import { useCurrencyContext } from '@/contexts/CurrencyContext';
import { CartItem } from '@/types/cart';

interface OrderSummaryProps {
  items: CartItem[];
  total: number;
}

const OrderSummary = ({ items, total }: OrderSummaryProps) => {
  const { formatUSD, convertVNDtoUSD } = useCurrencyContext();
  const totalUSD = convertVNDtoUSD(total);
  
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Order Summary</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {items.map((item, index) => (
          <div key={index} className="flex justify-between">
            <div>
              <p className="font-medium">{item.name}</p>
              <p className="text-sm text-muted-foreground">Quantity: {item.quantity}</p>
            </div>
            <p className="font-medium">{formatUSD(convertVNDtoUSD(item.price * item.quantity))}</p>
          </div>
        ))}
        <div className="pt-4 border-t mt-4">
          <div className="flex justify-between">
            <p>Subtotal</p>
            <p className="font-medium">{formatUSD(totalUSD)}</p>
          </div>
          <div className="flex justify-between mt-2">
            <p className="font-medium">Total</p>
            <p className="font-bold text-lg">{formatUSD(totalUSD)}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default OrderSummary;
