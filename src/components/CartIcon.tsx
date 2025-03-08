
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useSession } from "@supabase/auth-helpers-react";
import { ShoppingCart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { useGuestCart, useLocalStorage } from "@/hooks/useLocalStorage";

const CartIcon = () => {
  const session = useSession();
  const navigate = useNavigate();
  const { getValue } = useLocalStorage();
  const isGuest = getValue("isGuest") === "true";
  const { getCartCount } = useGuestCart();
  
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

  // For authenticated users, use database cart items
  const totalItems = session 
    ? cartItems?.reduce((sum: number, item: any) => sum + item.quantity, 0) || 0
    : isGuest 
      ? getCartCount() 
      : 0;

  return (
    <Button
      variant="ghost"
      size="icon"
      className="relative"
      onClick={() => navigate('/cart')}
    >
      <ShoppingCart className="h-6 w-6 text-white" />
      {totalItems > 0 && (
        <span className="absolute -top-1 -right-1 bg-primary text-primary-foreground rounded-full w-5 h-5 text-xs flex items-center justify-center">
          {totalItems}
        </span>
      )}
    </Button>
  );
};

export default CartIcon;
