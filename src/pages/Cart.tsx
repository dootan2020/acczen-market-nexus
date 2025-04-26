import React from 'react';
import { useCart } from '@/hooks/useCart';
import { useCurrencyContext } from '@/contexts/CurrencyContext';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';

const Cart: React.FC = () => {
  const { cart, removeItem, updateQuantity } = useCart();
  const { convertVNDtoUSD, formatUSD } = useCurrencyContext();
  const { items, totalPrice } = cart;

  if (items.length === 0) {
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        <h1 className="text-2xl font-bold mb-4">Giỏ hàng của bạn trống</h1>
        <p className="mb-6">Có vẻ như bạn chưa thêm sản phẩm nào vào giỏ hàng.</p>
        <Button asChild>
          <Link to="/products">Xem sản phẩm</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Giỏ hàng của bạn</h1>
      <div className="grid md:grid-cols-3 gap-8">
        <div className="md:col-span-2">
          {items.map((item) => (
            <div 
              key={item.id} 
              className="flex items-center border-b py-4 hover:bg-secondary/10 transition-colors"
            >
              <img 
                src={item.image} 
                alt={item.name} 
                className="w-24 h-24 object-cover rounded mr-4" 
              />
              <div className="flex-grow">
                <h2 className="font-semibold">{item.name}</h2>
                <p className="text-muted-foreground">
                  Price: {formatUSD(convertVNDtoUSD(item.price))}
                </p>
                <div className="flex items-center gap-2 mt-2">
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => updateQuantity(item.id, Math.max(1, item.quantity - 1))}
                  >
                    -
                  </Button>
                  <span>{item.quantity}</span>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => updateQuantity(item.id, item.quantity + 1)}
                  >
                    +
                  </Button>
                  <Button 
                    variant="destructive" 
                    size="sm"
                    onClick={() => removeItem(item.id)}
                  >
                    Xóa
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
        <div className="bg-secondary/30 p-6 rounded-lg">
          <h2 className="text-xl font-semibold mb-4">Order Summary</h2>
          <div className="flex justify-between mb-4">
            <span>Total:</span>
            <span className="font-bold">{formatUSD(convertVNDtoUSD(totalPrice))}</span>
          </div>
          <Button className="w-full" asChild>
            <Link to="/checkout">Checkout</Link>
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Cart;
