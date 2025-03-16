
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

export interface GuestCartItem {
  id: string;
  productName: string;
  price: number;
  quantity: number;
}

export const useGuestCart = () => {
  const { getValue, setValue } = useLocalStorage();
  const [cart, setCart] = useState<GuestCartItem[]>([]);

  // Load cart from localStorage on initial render
  useEffect(() => {
    try {
      const savedCart = getValue('guestCart');
      if (savedCart) {
        const parsedCart = JSON.parse(savedCart);
        setCart(parsedCart);
        console.log("Loaded guest cart from storage:", parsedCart);
      } else {
        // Initialize empty cart if none exists
        setValue('guestCart', JSON.stringify([]));
        console.log("Initialized empty guest cart");
      }
    } catch (e) {
      console.error('Failed to parse guest cart', e);
      setValue('guestCart', JSON.stringify([]));
    }
  }, []);

  // Save cart to localStorage whenever it changes
  useEffect(() => {
    try {
      setValue('guestCart', JSON.stringify(cart));
      console.log("Updated guest cart in storage:", cart);
    } catch (e) {
      console.error('Failed to save guest cart', e);
    }
  }, [cart]);

  const addToCart = (item: Omit<GuestCartItem, 'id'>) => {
    console.log("Adding item to guest cart:", item);
    
    // Force immediate update instead of relying on state updates
    const currentCart = getValue('guestCart');
    let cartArray: GuestCartItem[] = [];
    
    try {
      cartArray = currentCart ? JSON.parse(currentCart) : [];
    } catch (e) {
      console.error('Failed to parse current cart', e);
      cartArray = [];
    }
    
    const existingItemIndex = cartArray.findIndex(
      cartItem => cartItem.productName === item.productName
    );

    let updatedCart: GuestCartItem[];
    
    if (existingItemIndex >= 0) {
      updatedCart = [...cartArray];
      updatedCart[existingItemIndex].quantity += item.quantity;
      console.log("Updated existing item in guest cart:", updatedCart);
    } else {
      const newItem = { ...item, id: Date.now().toString() };
      updatedCart = [...cartArray, newItem];
      console.log("Added new item to guest cart:", newItem, "Updated cart:", updatedCart);
    }
    
    // Directly update localStorage first
    setValue('guestCart', JSON.stringify(updatedCart));
    
    // Then update state
    setCart(updatedCart);
  };

  const removeFromCart = (itemId: string) => {
    // Get current cart from localStorage to ensure we have the latest
    const currentCart = getValue('guestCart');
    let cartArray: GuestCartItem[] = [];
    
    try {
      cartArray = currentCart ? JSON.parse(currentCart) : [];
    } catch (e) {
      console.error('Failed to parse current cart for removal', e);
      return;
    }
    
    const newCart = cartArray.filter(item => item.id !== itemId);
    setValue('guestCart', JSON.stringify(newCart));
    setCart(newCart);
  };

  const updateQuantity = (itemId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(itemId);
      return;
    }
    
    // Get current cart from localStorage to ensure we have the latest
    const currentCart = getValue('guestCart');
    let cartArray: GuestCartItem[] = [];
    
    try {
      cartArray = currentCart ? JSON.parse(currentCart) : [];
    } catch (e) {
      console.error('Failed to parse current cart for quantity update', e);
      return;
    }
    
    const newCart = cartArray.map(item => 
      item.id === itemId ? { ...item, quantity } : item
    );
    setValue('guestCart', JSON.stringify(newCart));
    setCart(newCart);
  };

  const clearCart = () => {
    setValue('guestCart', JSON.stringify([]));
    setCart([]);
  };

  const getCartTotal = () => {
    // Get current cart from localStorage to ensure we have the latest
    const currentCart = getValue('guestCart');
    let cartArray: GuestCartItem[] = [];
    
    try {
      cartArray = currentCart ? JSON.parse(currentCart) : [];
    } catch (e) {
      console.error('Failed to parse current cart for total calculation', e);
      return 0;
    }
    
    return cartArray.reduce((total, item) => total + (item.price * item.quantity), 0);
  };

  const getCartCount = () => {
    // Get current cart from localStorage to ensure we have the latest
    const currentCart = getValue('guestCart');
    let cartArray: GuestCartItem[] = [];
    
    try {
      cartArray = currentCart ? JSON.parse(currentCart) : [];
    } catch (e) {
      console.error('Failed to parse current cart for count calculation', e);
      return 0;
    }
    
    return cartArray.reduce((count, item) => count + item.quantity, 0);
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
