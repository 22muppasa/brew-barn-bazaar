
import { useState, useEffect } from 'react';

export const useLocalStorage = () => {
  const setValue = (key: string, value: string) => {
    try {
      localStorage.setItem(key, value);
      
      // Dispatch a storage event for same-tab communication
      const event = new Event('storage');
      (event as any).key = key;
      window.dispatchEvent(event);
      
      // For guest cart updates, also dispatch a custom event
      if (key === 'guestCart') {
        window.dispatchEvent(new Event('guestCartUpdated'));
      }
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
      
      // Dispatch a storage event for same-tab communication
      const event = new Event('storage');
      (event as any).key = key;
      window.dispatchEvent(event);
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
  size?: string;
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
    if (cart.length > 0) {
      try {
        setValue('guestCart', JSON.stringify(cart));
        console.log("Updated guest cart in storage:", cart);
      } catch (e) {
        console.error('Failed to save guest cart', e);
      }
    }
  }, [cart]);

  const addToCart = (item: Omit<GuestCartItem, 'id'>) => {
    console.log("Adding item to guest cart:", item);
    
    // Get current cart directly from localStorage to ensure latest data
    const currentCartString = getValue('guestCart');
    let currentCart: GuestCartItem[] = [];
    
    try {
      currentCart = currentCartString ? JSON.parse(currentCartString) : [];
    } catch (e) {
      console.error('Failed to parse current cart', e);
      currentCart = [];
    }
    
    console.log("Current cart before adding:", currentCart);
    
    // Check if item already exists in cart
    const existingItemIndex = currentCart.findIndex(
      cartItem => cartItem.productName === item.productName && cartItem.size === item.size
    );

    let updatedCart: GuestCartItem[];
    
    if (existingItemIndex >= 0) {
      // Update existing item quantity
      updatedCart = [...currentCart];
      updatedCart[existingItemIndex].quantity += item.quantity;
      console.log("Updated existing item in guest cart:", updatedCart[existingItemIndex]);
    } else {
      // Add new item
      const newItem = { ...item, id: Date.now().toString() };
      updatedCart = [...currentCart, newItem];
      console.log("Added new item to guest cart:", newItem);
    }
    
    console.log("Final updated cart:", updatedCart);
    
    // Save updated cart to localStorage
    setValue('guestCart', JSON.stringify(updatedCart));
    
    // Update state
    setCart(updatedCart);
    
    // Dispatch custom event to notify other components
    window.dispatchEvent(new Event('guestCartUpdated'));
  };

  const removeFromCart = (itemId: string) => {
    console.log("Removing item from guest cart:", itemId);
    
    // Get current cart from localStorage to ensure we have the latest
    const currentCartString = getValue('guestCart');
    let currentCart: GuestCartItem[] = [];
    
    try {
      currentCart = currentCartString ? JSON.parse(currentCartString) : [];
    } catch (e) {
      console.error('Failed to parse current cart for removal', e);
      return;
    }
    
    const newCart = currentCart.filter(item => item.id !== itemId);
    setValue('guestCart', JSON.stringify(newCart));
    setCart(newCart);
    
    // Dispatch custom event
    window.dispatchEvent(new Event('guestCartUpdated'));
  };

  const updateQuantity = (itemId: string, quantity: number) => {
    console.log("Updating quantity in guest cart:", itemId, quantity);
    
    if (quantity <= 0) {
      removeFromCart(itemId);
      return;
    }
    
    // Get current cart from localStorage to ensure we have the latest
    const currentCartString = getValue('guestCart');
    let currentCart: GuestCartItem[] = [];
    
    try {
      currentCart = currentCartString ? JSON.parse(currentCartString) : [];
    } catch (e) {
      console.error('Failed to parse current cart for quantity update', e);
      return;
    }
    
    const newCart = currentCart.map(item => 
      item.id === itemId ? { ...item, quantity } : item
    );
    setValue('guestCart', JSON.stringify(newCart));
    setCart(newCart);
    
    // Dispatch custom event
    window.dispatchEvent(new Event('guestCartUpdated'));
  };

  const clearCart = () => {
    setValue('guestCart', JSON.stringify([]));
    setCart([]);
    
    // Dispatch custom event
    window.dispatchEvent(new Event('guestCartUpdated'));
  };

  const getCartTotal = () => {
    // Get current cart from localStorage to ensure we have the latest
    const currentCartString = getValue('guestCart');
    let cartArray: GuestCartItem[] = [];
    
    try {
      cartArray = currentCartString ? JSON.parse(currentCartString) : [];
    } catch (e) {
      console.error('Failed to parse current cart for total calculation', e);
      return 0;
    }
    
    return cartArray.reduce((total, item) => total + (item.price * item.quantity), 0);
  };

  const getCartCount = () => {
    // Get current cart from localStorage to ensure we have the latest
    const currentCartString = getValue('guestCart');
    let cartArray: GuestCartItem[] = [];
    
    try {
      cartArray = currentCartString ? JSON.parse(currentCartString) : [];
      console.log("Cart count from localStorage:", cartArray.length, cartArray);
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
