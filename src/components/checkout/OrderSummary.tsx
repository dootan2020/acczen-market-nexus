
import React from 'react';
import { Percent, CircleDollarSign } from 'lucide-react';

interface OrderSummaryProps {
  subtotal: number;
  discount?: {
    percentage: number;
    amount: number;
  };
  total: number;
  currency?: string;
  isLoading?: boolean;
}

const formatCurrency = (value: number, currency: string = 'USD') => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
};

export default function OrderSummary({ subtotal, discount, total, currency = 'USD', isLoading = false }: OrderSummaryProps) {
  const hasDiscount = discount && discount.percentage > 0 && discount.amount > 0;
  
  if (isLoading) {
    return (
      <div className="animate-pulse space-y-4">
        <div className="h-4 bg-gray-200 rounded"></div>
        <div className="h-4 bg-gray-200 rounded w-3/4"></div>
        <div className="h-4 bg-gray-200 rounded w-1/2"></div>
      </div>
    );
  }
  
  return (
    <div className="bg-white rounded-lg border p-4 space-y-3">
      <h3 className="font-medium mb-2">Order Summary</h3>
      
      <div className="flex justify-between items-center">
        <span className="text-sm text-gray-500">Subtotal</span>
        <span className="font-medium">{formatCurrency(subtotal, currency)}</span>
      </div>
      
      {hasDiscount && (
        <div className="flex justify-between items-center text-green-600">
          <span className="text-sm flex items-center">
            <Percent className="h-4 w-4 mr-1" />
            Discount ({discount.percentage}%)
          </span>
          <span className="font-medium">-{formatCurrency(discount.amount, currency)}</span>
        </div>
      )}
      
      <div className="pt-2 border-t flex justify-between items-center">
        <span className="font-medium flex items-center">
          <CircleDollarSign className="h-4 w-4 mr-1" />
          Total
        </span>
        <span className="font-bold text-lg">{formatCurrency(total, currency)}</span>
      </div>
      
      {hasDiscount && (
        <div className="text-xs text-green-600 bg-green-50 p-2 rounded">
          You saved {formatCurrency(discount.amount, currency)} with your {discount.percentage}% discount!
        </div>
      )}
    </div>
  );
}
