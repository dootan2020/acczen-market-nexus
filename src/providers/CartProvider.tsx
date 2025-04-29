
import React, { createContext, useEffect, useReducer } from 'react';
import { toast } from 'sonner';
import { CartContextProps, CartItem } from '@/types/cart';
import { cartReducer, initialState } from '@/reducers/cartReducer';

export const CartContext = createContext<CartContextProps | undefined>(undefined);

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Make sure we're explicitly using React.useReducer here to avoid any reference issues
  const [cart, dispatch] = React.useReducer(cartReducer, initialState, () => {
    // Load cart from localStorage on init
    if (typeof window !== 'undefined') {
      try {
        const savedCart = localStorage.getItem('cart');
        return savedCart ? JSON.parse(savedCart) : initialState;
      } catch (e) {
        console.error('Failed to load cart from localStorage:', e);
        return initialState;
      }
    }
    return initialState;
  });

  // Save cart to localStorage whenever it changes
  useEffect(() => {
    try {
      localStorage.setItem('cart', JSON.stringify(cart));
    } catch (e) {
      console.error('Failed to save cart to localStorage:', e);
    }
  }, [cart]);

  const addItem = (item: Omit<CartItem, 'quantity'>) => {
    dispatch({
      type: 'ADD_ITEM',
      payload: { ...item, quantity: 1 }
    });
    
    toast("Added to cart", {
      description: `${item.name} has been added to your cart`,
    });
  };

  const removeItem = (id: string) => {
    dispatch({
      type: 'REMOVE_ITEM',
      payload: { id }
    });
    
    toast("Removed from cart", {
      description: "Item has been removed from your cart",
    });
  };

  const updateQuantity = (id: string, quantity: number) => {
    dispatch({
      type: 'UPDATE_QUANTITY',
      payload: { id, quantity }
    });
  };

  const clearCart = () => {
    dispatch({ type: 'CLEAR_CART' });
    
    toast("Cart cleared", {
      description: "All items have been removed from your cart",
    });
  };

  return (
    <CartContext.Provider
      value={{
        cart,
        addItem,
        removeItem,
        updateQuantity,
        clearCart
      }}
    >
      {children}
    </CartContext.Provider>
  );
};
