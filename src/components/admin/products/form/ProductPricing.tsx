
import React from 'react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';

interface ProductPricingProps {
  price: string;
  salePrice: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

const ProductPricing = ({ price, salePrice, onChange }: ProductPricingProps) => {
  return (
    <div className="grid grid-cols-2 gap-4">
      <div className="space-y-2">
        <Label htmlFor="price">Price (VND)</Label>
        <Input
          id="price"
          name="price"
          type="number"
          min="0"
          step="0.01"
          value={price}
          onChange={onChange}
          required
          placeholder="Enter price in VND"
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="sale_price">Sale Price (VND)</Label>
        <Input
          id="sale_price"
          name="sale_price"
          type="number"
          min="0"
          step="0.01"
          value={salePrice}
          onChange={onChange}
          placeholder="Optional sale price in VND"
        />
      </div>
    </div>
  );
};

export default ProductPricing;
