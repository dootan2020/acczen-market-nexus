
import React from 'react';

interface ProductPricingProps {
  price: number;
  salePrice?: number | string | null;
  stockQuantity: number;
  currency: (amount: number) => string;
}

const ProductPricing: React.FC<ProductPricingProps> = ({
  price,
  salePrice,
  stockQuantity,
  currency
}) => {
  const hasDiscount = salePrice && Number(salePrice) > 0 && Number(salePrice) < price;
  
  // Format prices using the currency formatter function
  const formattedPrice = currency(price);
  const formattedSalePrice = hasDiscount ? currency(Number(salePrice)) : null;
  
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
