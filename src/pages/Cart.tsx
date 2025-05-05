
import React from 'react';
import { useCart } from '@/hooks/useCart';
import CartHeader from '@/components/cart/CartHeader';
import CartItem from '@/components/cart/CartItem';
import CartSummary from '@/components/cart/CartSummary';
import EmptyCart from '@/components/cart/EmptyCart';
import { useErrorHandler } from '@/hooks/useErrorHandler';
import { toast } from 'sonner';
import ErrorBoundary from '@/components/ui/ErrorBoundary';
import { EmptyState } from '@/components/ui/empty-state';
import { ShoppingCart, AlertTriangle } from 'lucide-react';

const CartContent: React.FC = () => {
  const { cartItems, totalPrice, removeItem, updateQuantity } = useCart();
  const { handleError, withErrorHandler } = useErrorHandler({
    showToast: true,
    fallbackValue: { success: false }
  });

  // Enhanced remove item with error handling
  const handleRemoveItem = (id: string) => {
    withErrorHandler(async () => {
      try {
        await removeItem(id);
        toast.success('Item removed from cart');
      } catch (error) {
        handleError(error, { 
          showToast: true,
          logToConsole: true
        });
        return false;
      }
      return true;
    });
  };

  // Enhanced update quantity with error handling
  const handleUpdateQuantity = (id: string, quantity: number) => {
    withErrorHandler(async () => {
      try {
        // Validate quantity
        if (quantity <= 0) {
          throw new Error('Quantity must be greater than zero');
        }
        
        await updateQuantity(id, quantity);
        return true;
      } catch (error) {
        handleError(error);
        return false;
      }
    });
  };

  // Handle empty cart state
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
              onRemove={handleRemoveItem}
              onUpdateQuantity={handleUpdateQuantity}
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

// Error Fallback Component
const CartErrorFallback = ({ error, resetErrorBoundary }: { 
  error: Error, 
  resetErrorBoundary: () => void 
}) => {
  return (
    <div className="container mx-auto px-4 py-8">
      <EmptyState
        icon={<AlertTriangle />}
        title="There was a problem loading your cart"
        description={`Error: ${error.message || 'Unknown error occurred'}`}
        action={{
          label: "Try Again",
          onClick: resetErrorBoundary
        }}
        className="my-12"
      />
    </div>
  );
};

// Wrapper component with ErrorBoundary
const Cart: React.FC = () => {
  return (
    <ErrorBoundary fallback={<CartErrorFallback error={new Error()} resetErrorBoundary={() => window.location.reload()} />}>
      <CartContent />
    </ErrorBoundary>
  );
};

export default Cart;
