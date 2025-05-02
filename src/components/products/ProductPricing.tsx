
import React from 'react';
import { formatCurrency } from '@/utils/formatters';

interface ProductPricingProps {
  price: number;
  salePrice?: number | string | null;
  stockQuantity: number;
}

const ProductPricing: React.FC<ProductPricingProps> = ({
  price,
  salePrice,
  stockQuantity
}) => {
  const hasDiscount = salePrice && Number(salePrice) > 0 && Number(salePrice) < price;
  const formattedPrice = formatCurrency(price);
  const formattedSalePrice = hasDiscount ? formatCurrency(Number(salePrice)) : null;
  
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
      
      <div className="mt-1">
        <span className={`inline-flex px-3 py-1 rounded-full text-sm font-medium ${
          stockQuantity > 10 ? 'bg-green-100 text-green-800' :
          stockQuantity > 0 ? 'bg-yellow-100 text-yellow-800' :
          'bg-red-100 text-red-800'
        }`}>
          {stockQuantity > 10 ? 'In Stock' :
           stockQuantity > 0 ? `Low Stock (${stockQuantity} left)` :
           'Out of Stock'}
        </span>
      </div>
    </div>
  );
};

export default ProductPricing;
