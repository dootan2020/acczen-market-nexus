
import React from 'react';

interface CartHeaderProps {
  title: string;
}

const CartHeader: React.FC<CartHeaderProps> = ({ title }) => {
  return (
    <div className="mb-8">
      <h1 className="text-3xl font-bold" id="cart-title">{title}</h1>
      <p className="text-muted-foreground mt-2">
        Xem lại sản phẩm và số lượng trước khi thanh toán.
      </p>
    </div>
  );
};

export default CartHeader;
