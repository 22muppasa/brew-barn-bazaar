import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useSession } from "@supabase/auth-helpers-react";
import { ShoppingCart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

const CartIcon = () => {
  const session = useSession();
  const navigate = useNavigate();

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
  });

  const totalItems = cartItems?.reduce((sum: number, item: any) => sum + item.quantity, 0) || 0;

  return (
    <Button
      variant="ghost"
      size="icon"
      className="relative"
      onClick={() => navigate('/cart')}
    >
      <ShoppingCart className="h-6 w-6" />
      {totalItems > 0 && (
        <span className="absolute -top-1 -right-1 bg-primary text-primary-foreground rounded-full w-5 h-5 text-xs flex items-center justify-center">
          {totalItems}
        </span>
      )}
    </Button>
  );
};

export default CartIcon;