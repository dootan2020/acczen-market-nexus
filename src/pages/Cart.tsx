
import React, { useMemo } from 'react';
import { useCart } from '@/hooks/useCart';
import CartHeader from '@/components/cart/CartHeader';
import CartItem from '@/components/cart/CartItem';
import CartSummary from '@/components/cart/CartSummary';
import EmptyCart from '@/components/cart/EmptyCart';
import { useIsMobile } from "@/hooks/use-mobile";
import MobileHeader from '@/components/mobile/MobileHeader';

const Cart: React.FC = () => {
  const { cartItems, totalPrice, removeItem, updateQuantity } = useCart();
  const isMobile = useIsMobile();
  
  // Memoize the empty cart check to avoid recalculation
  const isCartEmpty = useMemo(() => cartItems.length === 0, [cartItems.length]);

  if (isCartEmpty) {
    return (
      <>
        {isMobile && <MobileHeader title="Giỏ hàng" />}
        <EmptyCart />
      </>
    );
  }

  return (
    <>
      {isMobile && <MobileHeader title="Giỏ hàng" />}
      <div className="container mx-auto px-4 py-4 md:py-8">
        {!isMobile && <CartHeader title="Giỏ hàng của bạn" />}
        <div className="grid md:grid-cols-3 gap-4 md:gap-8">
          <div className="md:col-span-2">
            {cartItems.map((item) => (
              <CartItem 
                key={item.id}
                item={item}
                onRemove={removeItem}
                onUpdateQuantity={updateQuantity}
              />
            ))}
          </div>
          <div className={isMobile ? "sticky bottom-16 z-10 bg-background pt-3 pb-3 border-t" : ""}>
            <CartSummary totalPrice={totalPrice} />
          </div>
        </div>
      </div>
    </>
  );
};

export default React.memo(Cart);
