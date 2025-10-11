import { createContext, useContext, useReducer, useEffect } from "react";

const WishlistContext = createContext();

const initialState = {
  wishlistItems: [],
};

const wishlistReducer = (state, action) => {
  switch (action.type) {
    case "ADD_TO_WISHLIST": {
      const item = action.payload;
      const exists = state.wishlistItems.find((i) => i._id === item._id);
      if (exists) {
        return state; // Item already in wishlist
      }
      return {
        ...state,
        wishlistItems: [...state.wishlistItems, { ...item, addedAt: new Date().toISOString() }],
      };
    }

    case "REMOVE_FROM_WISHLIST":
      return {
        ...state,
        wishlistItems: state.wishlistItems.filter((i) => i._id !== action.payload),
      };

    case "CLEAR_WISHLIST":
      return { ...state, wishlistItems: [] };

    case "MOVE_TO_CART": {
      // Remove from wishlist and return the item to be added to cart
      const itemToMove = state.wishlistItems.find((i) => i._id === action.payload);
      if (itemToMove) {
        return {
          ...state,
          wishlistItems: state.wishlistItems.filter((i) => i._id !== action.payload),
        };
      }
      return state;
    }

    default:
      return state;
  }
};

export const WishlistProvider = ({ children }) => {
  // Load initial state from localStorage or use default initialState
  const storedWishlistItems = localStorage.getItem('wishlistItems');
  const initialWishlistState = storedWishlistItems ? { wishlistItems: JSON.parse(storedWishlistItems) } : initialState;

  const [state, dispatch] = useReducer(wishlistReducer, initialWishlistState);

  // Save wishlist items to localStorage whenever the state changes
  useEffect(() => {
    localStorage.setItem('wishlistItems', JSON.stringify(state.wishlistItems));
  }, [state.wishlistItems]);

  const addToWishlist = (item) => {
    dispatch({ type: "ADD_TO_WISHLIST", payload: item });
  };

  const removeFromWishlist = (itemId) => {
    dispatch({ type: "REMOVE_FROM_WISHLIST", payload: itemId });
  };

  const clearWishlist = () => {
    dispatch({ type: "CLEAR_WISHLIST" });
  };

  const moveToCart = (itemId) => {
    dispatch({ type: "MOVE_TO_CART", payload: itemId });
    return state.wishlistItems.find((i) => i._id === itemId);
  };

  const isInWishlist = (itemId) => {
    return state.wishlistItems.some((item) => item._id === itemId);
  };

  return (
    <WishlistContext.Provider value={{ 
      wishlistItems: state.wishlistItems, 
      addToWishlist, 
      removeFromWishlist, 
      clearWishlist, 
      moveToCart,
      isInWishlist,
      wishlistCount: state.wishlistItems.length
    }}>
      {children}
    </WishlistContext.Provider>
  );
};

export const useWishlist = () => {
  const context = useContext(WishlistContext);
  if (!context) {
    throw new Error('useWishlist must be used within a WishlistProvider');
  }
  return context;
};
