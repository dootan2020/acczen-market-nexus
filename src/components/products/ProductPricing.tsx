
import React from 'react';
import { CurrencyContextType } from '@/types/currency';

interface ProductPricingProps {
  price: number;
  salePrice?: number | string | null;
  stockQuantity: number;
  currency: CurrencyContextType;
}

const ProductPricing: React.FC<ProductPricingProps> = ({
  price,
  salePrice,
  stockQuantity,
  currency
}) => {
  const hasDiscount = salePrice && Number(salePrice) > 0 && Number(salePrice) < price;
  
  // Convert prices using the currency context
  const formattedPrice = currency.formatUSD(currency.convertVNDtoUSD(price));
  const formattedSalePrice = hasDiscount ? currency.formatUSD(currency.convertVNDtoUSD(Number(salePrice))) : null;
  
  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center gap-3">
        {hasDiscount ? (
          <>
            <span className="text-2xl md:text-3xl font-semibold font-poppins text-primary">
              {formattedSalePrice}
            </span>
            <span className="text-lg text-muted-foreground line-through font-inter">
              {formattedPrice}
            </span>
          </>
        ) : (
          <span className="text-2xl md:text-3xl font-semibold font-poppins text-gray-800">
            {formattedPrice}
          </span>
        )}
      </div>
    </div>
  );
};

export default ProductPricing;
