
import React from 'react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';

const EmptyCart: React.FC = () => {
  return (
    <div className="container mx-auto px-4 py-8 text-center">
      <h1 className="text-2xl font-bold mb-4">Giỏ hàng của bạn trống</h1>
      <p className="mb-6">Có vẻ như bạn chưa thêm sản phẩm nào vào giỏ hàng.</p>
      <Button asChild>
        <Link to="/products">Xem sản phẩm</Link>
      </Button>
    </div>
  );
};

export default EmptyCart;
