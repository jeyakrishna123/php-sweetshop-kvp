import { createContext, useContext, useReducer, useEffect } from "react";

const CartContext = createContext();

const initialState = {
  cartItems: [],
};

const cartReducer = (state, action) => {
  switch (action.type) {
    case "ADD_TO_CART": {
      const item = action.payload;
      const exists = state.cartItems.find((i) => i._id === item._id);
      
      // Check stock availability
      const currentQuantity = exists ? exists.quantity : 0;
      const newQuantity = currentQuantity + (item.quantity || 1);
      
      if (item.stock && newQuantity > item.stock) {
        // Don't add if it would exceed stock
        return state;
      }
      
      if (exists) {
        return {
          ...state,
          cartItems: state.cartItems.map((i) =>
            i._id === item._id ? { ...i, quantity: newQuantity } : i
          ),
        };
      }
      return {
        ...state,
        cartItems: [...state.cartItems, { ...item, quantity: item.quantity || 1 }],
      };
    }

    case "REMOVE_FROM_CART":
      return {
        ...state,
        cartItems: state.cartItems.filter((i) => i._id !== action.payload),
      };

    case "CLEAR_CART":
      // Clear from localStorage as well
      if (typeof window !== 'undefined') {
        localStorage.removeItem('cartItems');
      }
      return { ...state, cartItems: [] };

    case "UPDATE_QUANTITY":
      return {
        ...state,
        cartItems: state.cartItems.map((item) =>
          item._id === action.payload.productId
            ? { ...item, quantity: Math.min(action.payload.quantity, item.stock || 999) }
            : item
        ),
      };

    case "INCREASE_QUANTITY":
      return {
        ...state,
        cartItems: state.cartItems.map((item) =>
          item._id === action.payload
            ? { ...item, quantity: Math.min(item.quantity + 1, item.stock || 999) }
            : item
        ),
      };

    case "DECREASE_QUANTITY":
      return {
        ...state,
        cartItems: state.cartItems.map((item) =>
          item._id === action.payload && item.quantity > 1
            ? { ...item, quantity: item.quantity - 1 }
            : item
        ),
      };

    case "SET_CART":
      return {
        ...state,
        cartItems: action.payload
      };

    default:
      return state;
  }
};

export const CartProvider = ({ children }) => {
  // Load initial state from localStorage or use default initialState
  const storedCartItems = typeof window !== 'undefined' ? localStorage.getItem('cartItems') : null;
  const initialCartState = storedCartItems ? { cartItems: JSON.parse(storedCartItems) } : initialState;

  const [state, dispatch] = useReducer(cartReducer, initialCartState);

  // Save cart items to localStorage whenever the state changes
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('cartItems', JSON.stringify(state.cartItems));
    }
  }, [state.cartItems]);

  // Calculate cart totals
  const cartTotal = state.cartItems.reduce((total, item) => total + (item.price * item.quantity), 0);
  const cartCount = state.cartItems.length; // Number of unique products
  const cartItemCount = state.cartItems.reduce((count, item) => count + item.quantity, 0); // Total quantity of items

  return (
    <CartContext.Provider value={{ 
      cart: state.cartItems, 
      cartItems: state.cartItems, 
      cartTotal,
      cartCount,
      cartItemCount,
      dispatch 
    }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};
