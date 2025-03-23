
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useSession } from "@supabase/auth-helpers-react";
import { ShoppingCart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { useGuestCart, useLocalStorage } from "@/hooks/useLocalStorage";
import { useEffect, useState, memo } from "react";

// Using memo to prevent unnecessary re-renders
const CartIcon = memo(() => {
  const session = useSession();
  const { getValue } = useLocalStorage();
  const { getCartCount } = useGuestCart();
  const [guestCartCount, setGuestCartCount] = useState(0);
  
  // For authenticated users, get cart items from database
  const { data: cartItems } = useQuery({
    queryKey: ['cart-items'],
    queryFn: async () => {
      if (!session) return [];
      const { data, error } = await supabase
        .from('cart_items')
        .select('*')
        .eq('user_id', session.user.id);
      
      if (error) throw error;
      return data;
    },
    enabled: !!session,
  });

  // Update guest cart count whenever localStorage changes
  useEffect(() => {
    if (!session) {
      const updateCartCount = () => {
        const count = getCartCount();
        setGuestCartCount(count);
      };
      
      // Update immediately
      updateCartCount();
      
      // Set up storage event listener for cross-tab communication
      const handleStorageChange = (e: StorageEvent) => {
        if (e.key === 'guestCart') {
          updateCartCount();
        }
      };
      
      // Set up custom event listener for same-tab updates
      const handleCustomEvent = () => {
        updateCartCount();
      };
      
      window.addEventListener('storage', handleStorageChange);
      window.addEventListener('guestCartUpdated', handleCustomEvent);
      
      return () => {
        window.removeEventListener('storage', handleStorageChange);
        window.removeEventListener('guestCartUpdated', handleCustomEvent);
      };
    }
  }, [session, getCartCount]);

  // For authenticated users, use database cart items; for guests, use local cart count
  const totalItems = session 
    ? cartItems?.reduce((sum: number, item: any) => sum + item.quantity, 0) || 0
    : guestCartCount;

  return (
    <Button
      variant="ghost"
      size="icon"
      className="relative hidden md:flex"
      asChild
    >
      <Link to="/cart">
        <ShoppingCart className="h-6 w-6 text-foreground" />
        {totalItems > 0 && (
          <span className="absolute -top-1 -right-1 bg-primary text-primary-foreground rounded-full w-5 h-5 text-xs flex items-center justify-center">
            {totalItems}
          </span>
        )}
      </Link>
    </Button>
  );
});

CartIcon.displayName = "CartIcon";

export default CartIcon;
