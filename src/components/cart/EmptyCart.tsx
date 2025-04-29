
import React from 'react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { ShoppingCart } from 'lucide-react';

const EmptyCart: React.FC = () => {
  return (
    <div className="container mx-auto px-4 py-16 text-center">
      <div className="flex justify-center mb-6">
        <div className="rounded-full bg-muted p-6">
          <ShoppingCart className="h-12 w-12 text-muted-foreground" />
        </div>
      </div>
      <h1 className="text-2xl font-bold mb-4">Giỏ hàng của bạn đang trống</h1>
      <p className="mb-6 text-muted-foreground max-w-md mx-auto">
        Bạn chưa thêm sản phẩm nào vào giỏ hàng. Hãy khám phá các sản phẩm của chúng tôi để tìm thấy những gì bạn cần.
      </p>
      <div className="flex flex-col sm:flex-row justify-center gap-3">
        <Button asChild size="lg">
          <Link to="/products">Xem sản phẩm</Link>
        </Button>
        <Button asChild variant="outline" size="lg">
          <Link to="/">Quay về trang chủ</Link>
        </Button>
      </div>
    </div>
  );
};

export default EmptyCart;
