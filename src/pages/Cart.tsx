
import React from 'react';
import { useCart } from '@/hooks/useCart';
import CartHeader from '@/components/cart/CartHeader';
import CartItem from '@/components/cart/CartItem';
import CartSummary from '@/components/cart/CartSummary';
import EmptyCart from '@/components/cart/EmptyCart';

const Cart: React.FC = () => {
  const { cartItems, totalPrice, removeItem, updateQuantity } = useCart();

  if (cartItems.length === 0) {
    return <EmptyCart />;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <CartHeader title="Your Cart" />
      <div className="grid md:grid-cols-3 gap-8">
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
        <div>
          <CartSummary totalPrice={totalPrice} />
        </div>
      </div>
    </div>
  );
};

export default Cart;
