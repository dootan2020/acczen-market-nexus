
export interface CartItem {
  id: string;
  name: string;
  price: number;
  image: string;
  quantity: number;
}

export interface CartState {
  items: CartItem[];
  totalItems: number;
  totalPrice: number;
}

export type CartAction =
  | { type: 'ADD_ITEM'; payload: CartItem }
  | { type: 'REMOVE_ITEM'; payload: { id: string } }
  | { type: 'UPDATE_QUANTITY'; payload: { id: string; quantity: number } }
  | { type: 'CLEAR_CART' };

export interface CartContextProps {
  cart: CartState;
  addItem: (item: Omit<CartItem, 'quantity'>) => void;
  removeItem: (id: string) => void;
  updateQuantity: (id: string, quantity: number) => void;
  clearCart: () => void;
}
