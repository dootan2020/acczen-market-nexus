
import { useContext } from 'react';
import { CartContext } from '@/providers/CartProvider';
import { CartState, CartItem } from '@/types/cart';

interface UseCartReturn {
  cartItems: CartItem[];
  totalPrice: number;
  totalItems: number;
  addItem: (item: Omit<CartItem, 'quantity'>) => void;
  removeItem: (id: string) => void;
  updateQuantity: (id: string, quantity: number) => void;
  clearCart: () => void;
}

export function useCart(): UseCartReturn {
  const context = useContext(CartContext);
  
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  
  const { cart, addItem, removeItem, updateQuantity, clearCart } = context;
  
  return {
    cartItems: cart.items,
    totalPrice: cart.totalPrice,
    totalItems: cart.totalItems,
    addItem,
    removeItem,
    updateQuantity,
    clearCart
  };
}
