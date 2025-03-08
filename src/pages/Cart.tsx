
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { useSession } from "@supabase/auth-helpers-react";
import { toast } from "sonner";
import Navigation from "@/components/Navigation";
import { Trash2, LogIn } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useGuestCart, useLocalStorage } from "@/hooks/useLocalStorage";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

const Cart = () => {
  const session = useSession();
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const { getValue } = useLocalStorage();
  const isGuest = getValue("isGuest") === "true";
  const { 
    cart: guestCart, 
    removeFromCart, 
    updateQuantity: updateGuestQuantity, 
    clearCart: clearGuestCart,
    getCartTotal: getGuestCartTotal
  } = useGuestCart();

  // Query for authenticated user cart
  const { data: cartItems, isLoading } = useQuery({
    queryKey: ['cart-items'],
    queryFn: async () => {
      if (!session) return [];
      const { data, error } = await supabase
        .from('cart_items')
        .select('*')
        .eq('user_id', session?.user?.id);
      
      if (error) throw error;
      return data;
    },
    enabled: !!session,
  });

  // Mutations for authenticated user
  const deleteItemMutation = useMutation({
    mutationFn: async (itemId: string) => {
      const { error } = await supabase
        .from('cart_items')
        .delete()
        .eq('id', itemId);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cart-items'] });
      toast.success("Item removed from cart");
    },
    onError: () => {
      toast.error("Failed to remove item");
    },
  });

  const updateQuantityMutation = useMutation({
    mutationFn: async ({ itemId, quantity }: { itemId: string; quantity: number }) => {
      const { error } = await supabase
        .from('cart_items')
        .update({ quantity })
        .eq('id', itemId);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cart-items'] });
    },
    onError: () => {
      toast.error("Failed to update quantity");
    },
  });

  const handleCheckout = async () => {
    if (session) {
      // Authenticated user checkout
      if (!cartItems?.length) {
        toast.error("Your cart is empty");
        return;
      }

      const total = cartItems.reduce((sum: number, item: any) => 
        sum + (item.price * item.quantity), 0);

      // Create order
      const { data: order, error: orderError } = await supabase
        .from('orders')
        .insert({
          user_id: session?.user?.id,
          total_amount: total,
          status: 'completed'
        })
        .select()
        .single();

      if (orderError) {
        toast.error("Failed to create order");
        return;
      }

      // Create order items
      const orderItems = cartItems.map((item: any) => ({
        order_id: order.id,
        product_name: item.product_name,
        quantity: item.quantity,
        price: item.price
      }));

      const { error: itemsError } = await supabase
        .from('order_items')
        .insert(orderItems);

      if (itemsError) {
        toast.error("Failed to create order items");
        return;
      }

      // Clear cart
      const { error: clearError } = await supabase
        .from('cart_items')
        .delete()
        .eq('user_id', session?.user?.id);

      if (clearError) {
        toast.error("Failed to clear cart");
        return;
      }

      queryClient.invalidateQueries({ queryKey: ['cart-items'] });
      toast.success("Order completed successfully!");
      navigate('/profile');
    } else if (isGuest) {
      // Guest checkout
      if (!guestCart.length) {
        toast.error("Your cart is empty");
        return;
      }
      
      // For guests, we just clear the cart and show success
      clearGuestCart();
      toast.success("Your order has been placed!");
      navigate('/');
    }
  };

  const convertToAccount = () => {
    // Save guest cart to localStorage before redirecting to auth
    navigate('/auth');
  };

  if (isLoading && session) {
    return <div>Loading...</div>;
  }

  // Determine which cart to use
  const items = session ? cartItems : guestCart;
  const total = session 
    ? (cartItems?.reduce((sum: number, item: any) => sum + (item.price * item.quantity), 0) || 0)
    : getGuestCartTotal();

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <div className="container mx-auto px-4 py-8">
        <motion.h1 
          className="text-4xl font-bold mb-8 text-center"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          Your Cart
        </motion.h1>
        
        {isGuest && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6"
          >
            <Alert className="bg-primary/10 border-primary/20">
              <AlertTitle className="flex items-center gap-2">
                <LogIn className="h-4 w-4" /> You're shopping as a guest
              </AlertTitle>
              <AlertDescription className="mt-2">
                <p className="mb-2">Create an account to earn rewards points and save your order history!</p>
                <Button variant="outline" onClick={convertToAccount}>
                  Create Account
                </Button>
              </AlertDescription>
            </Alert>
          </motion.div>
        )}

        {(!items || items.length === 0) ? (
          <p className="text-center text-muted-foreground">Your cart is empty</p>
        ) : (
          <div className="space-y-4">
            {items.map((item: any) => (
              <motion.div
                key={item.id}
                className="bg-card rounded-lg shadow p-4 flex items-center justify-between"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
              >
                <div>
                  <h3 className="font-semibold">{item.product_name || item.productName}</h3>
                  <p className="text-muted-foreground">${item.price} each</p>
                </div>
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        if (session) {
                          updateQuantityMutation.mutate({
                            itemId: item.id,
                            quantity: Math.max(1, item.quantity - 1)
                          });
                        } else {
                          updateGuestQuantity(item.id, Math.max(1, item.quantity - 1));
                        }
                      }}
                    >
                      -
                    </Button>
                    <span>{item.quantity}</span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        if (session) {
                          updateQuantityMutation.mutate({
                            itemId: item.id,
                            quantity: item.quantity + 1
                          });
                        } else {
                          updateGuestQuantity(item.id, item.quantity + 1);
                        }
                      }}
                    >
                      +
                    </Button>
                  </div>
                  <Button
                    variant="destructive"
                    size="icon"
                    onClick={() => {
                      if (session) {
                        deleteItemMutation.mutate(item.id);
                      } else {
                        removeFromCart(item.id);
                      }
                    }}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </motion.div>
            ))}
            
            <div className="mt-8 p-4 bg-card rounded-lg shadow">
              <div className="flex justify-between items-center mb-4">
                <span className="text-lg font-semibold">Total:</span>
                <span className="text-lg font-bold">${total.toFixed(2)}</span>
              </div>
              
              {isGuest && (
                <div className="mb-4 p-3 bg-secondary/10 rounded text-sm text-muted-foreground">
                  Note: As a guest, you won't earn rewards points with this purchase.
                </div>
              )}
              
              <Button 
                className="w-full" 
                size="lg"
                onClick={handleCheckout}
              >
                Complete Order
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Cart;
