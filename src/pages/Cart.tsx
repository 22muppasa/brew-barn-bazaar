
import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { useSession } from "@supabase/auth-helpers-react";
import { toast } from "sonner";
import { Trash2, LogIn, ShoppingCart } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useGuestCart, useLocalStorage } from "@/hooks/useLocalStorage";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import HamburgerMenu from "@/components/HamburgerMenu";
import GuestCheckoutForm from "@/components/checkout/GuestCheckoutForm";

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
  const [checkoutMode, setCheckoutMode] = React.useState(false);

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
      // Guest checkout - show the form
      setCheckoutMode(true);
    }
  };

  const convertToAccount = () => {
    // Save guest cart to localStorage before redirecting to auth
    navigate('/auth');
  };

  if (isLoading && session) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin h-8 w-8 border-t-2 border-b-2 border-primary rounded-full"></div>
      </div>
    );
  }

  // Determine which cart to use
  const items = session ? cartItems : guestCart;
  const total = session 
    ? (cartItems?.reduce((sum: number, item: any) => sum + (item.price * item.quantity), 0) || 0)
    : getGuestCartTotal();

  // If cart is empty, show empty state
  if ((!items || items.length === 0) && !checkoutMode) {
    return (
      <div className="min-h-screen bg-background">
        <HamburgerMenu />
        <div className="container mx-auto px-4 py-24">
          <motion.div
            className="text-center"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <ShoppingCart className="mx-auto h-16 w-16 text-muted-foreground mb-4" />
            <h1 className="text-3xl font-bold mb-4">Your cart is empty</h1>
            <p className="text-muted-foreground mb-8">Add some delicious items from our menu to get started!</p>
            <Button onClick={() => navigate('/menu')}>Browse Menu</Button>
          </motion.div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <HamburgerMenu />
      <div className="container mx-auto px-4 pt-20 pb-20">
        <motion.h1 
          className="text-4xl font-bold mb-8 text-center"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          {checkoutMode ? "Checkout" : "Your Cart"}
        </motion.h1>
        
        {isGuest && !checkoutMode && (
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

        {checkoutMode ? (
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
            <div className="lg:col-span-3">
              <GuestCheckoutForm total={total} />
            </div>
            
            <div className="lg:col-span-2">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="bg-card p-6 rounded-lg shadow-md border border-muted sticky top-24"
              >
                <h2 className="text-xl font-bold mb-4">Order Summary</h2>
                <div className="space-y-3 mb-6">
                  {items.map((item: any) => (
                    <div key={item.id} className="flex justify-between items-center">
                      <div>
                        <span className="font-medium">{item.product_name || item.productName}</span>
                        <div className="text-sm text-muted-foreground">Qty: {item.quantity}</div>
                      </div>
                      <span>${((item.price || 0) * item.quantity).toFixed(2)}</span>
                    </div>
                  ))}
                </div>
                <div className="border-t border-muted pt-4">
                  <div className="flex justify-between items-center font-bold">
                    <span>Total:</span>
                    <span>${total.toFixed(2)}</span>
                  </div>
                </div>
                <Button 
                  variant="outline" 
                  className="w-full mt-6"
                  onClick={() => setCheckoutMode(false)}
                >
                  Back to Cart
                </Button>
              </motion.div>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              <div className="space-y-4">
                {items.map((item: any) => (
                  <motion.div
                    key={item.id}
                    className="bg-card rounded-lg shadow p-4 flex flex-wrap md:flex-nowrap items-center justify-between"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                  >
                    <div className="w-full md:w-auto mb-3 md:mb-0">
                      <h3 className="font-semibold">{item.product_name || item.productName}</h3>
                      <p className="text-muted-foreground">${item.price} each</p>
                    </div>
                    <div className="flex items-center gap-4 w-full md:w-auto justify-between md:justify-end">
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
                        <span className="w-6 text-center">{item.quantity}</span>
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
              </div>
            </div>
            
            <div className="lg:col-span-1">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="bg-card p-6 rounded-lg shadow-md border border-muted sticky top-24"
              >
                <h2 className="text-xl font-bold mb-4">Order Summary</h2>
                <div className="space-y-3 mb-6">
                  <div className="flex justify-between">
                    <span>Subtotal</span>
                    <span>${total.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Tax</span>
                    <span>$0.00</span>
                  </div>
                </div>
                <div className="border-t border-muted pt-4">
                  <div className="flex justify-between items-center font-bold mb-6">
                    <span>Total:</span>
                    <span>${total.toFixed(2)}</span>
                  </div>
                  
                  {isGuest && (
                    <div className="mb-4 p-3 bg-secondary/20 rounded text-sm text-muted-foreground">
                      Note: As a guest, you won't earn rewards points with this purchase.
                    </div>
                  )}
                  
                  <Button 
                    className="w-full" 
                    size="lg"
                    onClick={handleCheckout}
                  >
                    {isGuest ? "Proceed to Checkout" : "Complete Order"}
                  </Button>
                </div>
              </motion.div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Cart;
