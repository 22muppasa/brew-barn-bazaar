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

  return { setValue, getValue, removeValue, clearStorage, ensureGuestMode };
};

export const useGuestCart = () => {
  const { getValue, setValue } = useLocalStorage();
  const [cart, setCart] = useState<GuestCartItem[]>([]);

  useEffect(() => {
    const savedCart = getValue('guestCart');
    if (savedCart) {
      try {
        setCart(JSON.parse(savedCart));
      } catch (e) {
        console.error('Failed to parse guest cart', e);
        setValue('guestCart', JSON.stringify([]));
      }
    }
  }, []);

  useEffect(() => {
    setValue('guestCart', JSON.stringify(cart));
  }, [cart]);

  const addToCart = (item: Omit<GuestCartItem, 'id'>) => {
    setCart(prevCart => {
      const existingItemIndex = prevCart.findIndex(
        cartItem => cartItem.productName === item.productName
      );

      if (existingItemIndex >= 0) {
        const updatedCart = [...prevCart];
        updatedCart[existingItemIndex].quantity += item.quantity;
        return updatedCart;
      } else {
        return [...prevCart, { ...item, id: Date.now().toString() }];
      }
    });
  };

  const removeFromCart = (itemId: string) => {
    setCart(prevCart => prevCart.filter(item => item.id !== itemId));
  };

  const updateQuantity = (itemId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(itemId);
      return;
    }
    
    setCart(prevCart => 
      prevCart.map(item => 
        item.id === itemId ? { ...item, quantity } : item
      )
    );
  };

  const clearCart = () => {
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
