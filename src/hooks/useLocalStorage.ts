
import { useState, useEffect } from 'react';

export const useLocalStorage = () => {
  const setValue = (key: string, value: string) => {
    try {
      localStorage.setItem(key, value);
    } catch (error) {
      console.error(`Error saving to localStorage: ${error}`);
    }
  };

  const getValue = (key: string): string | null => {
    try {
      return localStorage.getItem(key);
    } catch (error) {
      console.error(`Error reading from localStorage: ${error}`);
      return null;
    }
  };

  const removeValue = (key: string) => {
    try {
      localStorage.removeItem(key);
    } catch (error) {
      console.error(`Error removing from localStorage: ${error}`);
    }
  };

  const clearStorage = () => {
    try {
      localStorage.clear();
    } catch (error) {
      console.error(`Error clearing localStorage: ${error}`);
    }
  };

  const ensureGuestMode = (session: any) => {
    if (!session && getValue("isGuest") !== "true") {
      setValue("isGuest", "true");
      return true; // Guest mode was activated
    }
    return false; // No change needed
  };

  // Initialize guest mode automatically for non-logged in users
  useEffect(() => {
    // Auto-enable guest mode for non-logged in users
    if (getValue("isGuest") !== "true") {
      setValue("isGuest", "true");
      console.log("Guest mode automatically enabled");
    }
  }, []);

  return { setValue, getValue, removeValue, clearStorage, ensureGuestMode };
};

export const useGuestCart = () => {
  const { getValue, setValue } = useLocalStorage();
  const [cart, setCart] = useState<GuestCartItem[]>([]);

  // Load cart from localStorage on initial render
  useEffect(() => {
    const savedCart = getValue('guestCart');
    if (savedCart) {
      try {
        setCart(JSON.parse(savedCart));
        console.log("Loaded guest cart from storage:", savedCart);
      } catch (e) {
        console.error('Failed to parse guest cart', e);
        setValue('guestCart', JSON.stringify([]));
      }
    } else {
      // Initialize empty cart if none exists
      setValue('guestCart', JSON.stringify([]));
      console.log("Initialized empty guest cart");
    }
  }, []);

  // Save cart to localStorage whenever it changes
  useEffect(() => {
    setValue('guestCart', JSON.stringify(cart));
    console.log("Updated guest cart in storage:", cart);
  }, [cart]);

  const addToCart = (item: Omit<GuestCartItem, 'id'>) => {
    console.log("Adding item to guest cart:", item);
    
    setCart(prevCart => {
      const existingItemIndex = prevCart.findIndex(
        cartItem => cartItem.productName === item.productName
      );

      if (existingItemIndex >= 0) {
        const updatedCart = [...prevCart];
        updatedCart[existingItemIndex].quantity += item.quantity;
        console.log("Updated existing item in guest cart:", updatedCart);
        return updatedCart;
      } else {
        const newItem = { ...item, id: Date.now().toString() };
        const newCart = [...prevCart, newItem];
        console.log("Added new item to guest cart:", newItem);
        return newCart;
      }
    });
  };

  const removeFromCart = (itemId: string) => {
    setCart(prevCart => {
      const newCart = prevCart.filter(item => item.id !== itemId);
      setValue('guestCart', JSON.stringify(newCart)); // Save immediately
      return newCart;
    });
  };

  const updateQuantity = (itemId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(itemId);
      return;
    }
    
    setCart(prevCart => {
      const newCart = prevCart.map(item => 
        item.id === itemId ? { ...item, quantity } : item
      );
      setValue('guestCart', JSON.stringify(newCart)); // Save immediately
      return newCart;
    });
  };

  const clearCart = () => {
    setValue('guestCart', JSON.stringify([]));
    setCart([]);
  };

  const getCartTotal = () => {
    return cart.reduce((total, item) => total + (item.price * item.quantity), 0);
  };

  const getCartCount = () => {
    return cart.reduce((count, item) => count + item.quantity, 0);
  };

  return {
    cart,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    getCartTotal,
    getCartCount
  };
};

export interface GuestCartItem {
  id: string;
  productName: string;
  price: number;
  quantity: number;
}
