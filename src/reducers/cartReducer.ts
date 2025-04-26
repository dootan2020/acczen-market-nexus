
import { CartState, CartAction } from '@/types/cart';

export const initialState: CartState = {
  items: [],
  totalItems: 0,
  totalPrice: 0,
};

export function cartReducer(state: CartState, action: CartAction): CartState {
  switch (action.type) {
    case 'ADD_ITEM': {
      const existingItemIndex = state.items.findIndex(item => item.id === action.payload.id);
      
      if (existingItemIndex > -1) {
        const updatedItems = [...state.items];
        updatedItems[existingItemIndex].quantity += 1;
        
        return {
          ...state,
          items: updatedItems,
          totalItems: state.totalItems + 1,
          totalPrice: state.totalPrice + action.payload.price
        };
      } else {
        const newItem = { ...action.payload, quantity: 1 };
        
        return {
          ...state,
          items: [...state.items, newItem],
          totalItems: state.totalItems + 1,
          totalPrice: state.totalPrice + action.payload.price
        };
      }
    }

    case 'REMOVE_ITEM': {
      const existingItem = state.items.find(item => item.id === action.payload.id);
      
      if (!existingItem) {
        return state;
      }

      return {
        ...state,
        items: state.items.filter(item => item.id !== action.payload.id),
        totalItems: state.totalItems - existingItem.quantity,
        totalPrice: state.totalPrice - (existingItem.price * existingItem.quantity)
      };
    }

    case 'UPDATE_QUANTITY': {
      const existingItemIndex = state.items.findIndex(item => item.id === action.payload.id);
      
      if (existingItemIndex === -1) {
        return state;
      }

      const existingItem = state.items[existingItemIndex];
      const quantityDiff = action.payload.quantity - existingItem.quantity;
      
      if (action.payload.quantity <= 0) {
        return {
          ...state,
          items: state.items.filter(item => item.id !== action.payload.id),
          totalItems: state.totalItems - existingItem.quantity,
          totalPrice: state.totalPrice - (existingItem.price * existingItem.quantity)
        };
      }

      const updatedItems = [...state.items];
      updatedItems[existingItemIndex] = {
        ...existingItem,
        quantity: action.payload.quantity
      };

      return {
        ...state,
        items: updatedItems,
        totalItems: state.totalItems + quantityDiff,
        totalPrice: state.totalPrice + (quantityDiff * existingItem.price)
      };
    }

    case 'CLEAR_CART':
      return initialState;

    default:
      return state;
  }
}
