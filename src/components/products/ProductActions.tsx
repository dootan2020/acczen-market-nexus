
import React, { useState } from 'react';
import { ShoppingCart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import ProductQuantity from './ProductQuantity';
import { PurchaseConfirmModal } from './purchase/PurchaseConfirmModal';

interface ProductActionsProps {
  product: {
    id: string;
    name: string;
    price: number;
    sale_price?: number | string | null;
    image_url?: string;
    stock_quantity: number;
    kiosk_token?: string;
    description?: string;
  };
}

const ProductActions: React.FC<ProductActionsProps> = ({ product }) => {
  const [quantity, setQuantity] = useState('1');
  const [isPurchaseModalOpen, setIsPurchaseModalOpen] = useState(false);
  
  const maxQuantity = Math.min(10, product.stock_quantity);
  const effectivePrice = product.sale_price && Number(product.sale_price) > 0 && Number(product.sale_price) < product.price
    ? Number(product.sale_price)
    : product.price;
  
  const handleBuyNow = () => {
    if (product.stock_quantity <= 0) {
      toast.error("This product is out of stock");
      return;
    }
    
    setIsPurchaseModalOpen(true);
  };
  
  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <label htmlFor="quantity" className="block text-sm font-medium font-poppins text-gray-700">
          Quantity
        </label>
        <ProductQuantity
          value={quantity}
          onChange={setQuantity}
          maxQuantity={maxQuantity}
          disabled={product.stock_quantity <= 0}
        />
      </div>
      
      <div className="flex gap-3">
        <Button 
          size="lg" 
          className="flex-1 bg-[#2ECC71] hover:bg-[#27AE60]"
          onClick={handleBuyNow}
          disabled={product.stock_quantity <= 0}
        >
          <ShoppingCart className="mr-2 h-4 w-4" />
          Buy Now
        </Button>
      </div>
      
      <PurchaseConfirmModal
        open={isPurchaseModalOpen}
        onOpenChange={setIsPurchaseModalOpen}
        productId={product.id}
        productName={product.name}
        productPrice={effectivePrice}
        productImage={product.image_url || '/placeholder.svg'}
        productDescription={product.description}
        quantity={parseInt(quantity) || 1}
        kioskToken={product.kiosk_token || null}
        stock={product.stock_quantity}
      />
    </div>
  );
};

export default ProductActions;
