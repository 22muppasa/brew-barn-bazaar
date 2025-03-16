
import React, { useState, useEffect, Suspense, lazy } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { useSession } from "@supabase/auth-helpers-react";
import { toast } from "sonner";
import { Trash2, LogIn, ShoppingCart, X, Tag } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useGuestCart, useLocalStorage } from "@/hooks/useLocalStorage";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import HamburgerMenu from "@/components/HamburgerMenu";
import GuestCheckoutForm from "@/components/checkout/GuestCheckoutForm";
import CartSkeleton from "@/components/cart/CartSkeleton";

interface DiscountCode {
  code: string;
  percentage: number;
  expiry: Date;
  productType?: string;
}

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
  const [checkoutMode, setCheckoutMode] = useState(false);
  const [appliedDiscount, setAppliedDiscount] = useState<{code: string, percentage: number, productType?: string} | null>(null);
  const [availableDiscounts, setAvailableDiscounts] = useState<DiscountCode[]>([]);
  const [isContentLoaded, setIsContentLoaded] = useState(false);

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
    staleTime: 10000,
  });

  // Define items to use either cartItems for logged-in users or guestCart for guests
  const items = session ? cartItems || [] : guestCart || [];

  // Calculate subtotal, discount and total values
  const subtotal = calculateSubtotal();
  const discount = calculateDiscount();
  const total = calculateTotal();

  useEffect(() => {
    if (!isLoading) {
      const timer = setTimeout(() => setIsContentLoaded(true), 100);
      return () => clearTimeout(timer);
    }
  }, [isLoading]);

  useEffect(() => {
    const storedCodes = localStorage.getItem('activeCodes');
    if (storedCodes) {
      try {
        const parsedCodes = JSON.parse(storedCodes);
        const validCodes = parsedCodes
          .filter((code: {expiry: string}) => new Date(code.expiry) > new Date())
          .map((code: {expiry: string, code: string, percentage: number, productType?: string}) => ({
            ...code,
            expiry: new Date(code.expiry)
          }));
        setAvailableDiscounts(validCodes);
      } catch (e) {
        console.error("Error parsing discount codes:", e);
      }
    }
    
    const selectedDiscount = localStorage.getItem('selectedDiscount');
    if (selectedDiscount) {
      try {
        const discount = JSON.parse(selectedDiscount);
        setAppliedDiscount(discount);
        localStorage.removeItem('selectedDiscount');
      } catch (e) {
        console.error("Error parsing selected discount:", e);
      }
    }
  }, []);

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
      if (!cartItems?.length) {
        toast.error("Your cart is empty");
        return;
      }

      const total = calculateTotal();

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

      const { error: clearError } = await supabase
        .from('cart_items')
        .delete()
        .eq('user_id', session?.user?.id);

      if (clearError) {
        toast.error("Failed to clear cart");
        return;
      }

      if (appliedDiscount) {
        const updatedDiscounts = availableDiscounts.filter(
          discount => discount.code !== appliedDiscount.code
        );
        setAvailableDiscounts(updatedDiscounts);
        localStorage.setItem('activeCodes', JSON.stringify(updatedDiscounts.map(code => ({
          ...code,
          expiry: code.expiry.toISOString()
        }))));
      }

      queryClient.invalidateQueries({ queryKey: ['cart-items'] });
      toast.success("Order completed successfully!");
      navigate('/profile');
    } else if (isGuest) {
      setCheckoutMode(true);
    }
  };

  const convertToAccount = () => {
    navigate('/auth');
  };

  const calculateSubtotal = () => {
    const items = session ? cartItems : guestCart;
    return items?.reduce((sum: number, item: any) => 
      sum + (item.price * item.quantity), 0) || 0;
  };

  const calculateDiscount = () => {
    if (!appliedDiscount) return 0;
    
    const items = session ? cartItems : guestCart;
    
    if (appliedDiscount.productType) {
      const eligibleItems = items?.filter((item: any) => 
        (item.product_name || item.productName)
          .toLowerCase()
          .includes(appliedDiscount.productType!.toLowerCase())
      );
      
      if (eligibleItems.length === 0) {
        return 0;
      }
      
      const eligibleSubtotal = eligibleItems.reduce((sum: number, item: any) => 
        sum + (item.price * item.quantity), 0) || 0;
        
      return (eligibleSubtotal * appliedDiscount.percentage) / 100;
    } else {
      const subtotal = calculateSubtotal();
      return (subtotal * appliedDiscount.percentage) / 100;
    }
  };

  const calculateTotal = () => {
    const subtotal = calculateSubtotal();
    const discount = calculateDiscount();
    return subtotal - discount;
  };

  const applyDiscount = (code: string, percentage: number, productType?: string) => {
    setAppliedDiscount({ code, percentage, productType });
    
    const discountMessage = productType 
      ? `Applied ${percentage}% discount on ${productType} items: ${code}`
      : `Applied discount: ${code}`;
      
    toast.success(discountMessage);
  };

  const removeDiscount = () => {
    setAppliedDiscount(null);
    toast.success("Discount removed");
  };

  const formatExpiryDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', { 
      month: 'short', 
      day: 'numeric', 
      year: 'numeric' 
    }).format(date);
  };

  const hasEligibleItems = (productType: string) => {
    const items = session ? cartItems : guestCart;
    return items?.some((item: any) => 
      (item.product_name || item.productName)
        .toLowerCase()
        .includes(productType.toLowerCase())
    );
  };

  if (!isContentLoaded) {
    return <CartSkeleton />;
  }

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
                  {appliedDiscount && (
                    <div className="flex justify-between items-center text-green-600 mb-2">
                      <span>Discount ({appliedDiscount.percentage}%):</span>
                      <span>-${discount.toFixed(2)}</span>
                    </div>
                  )}
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
                      
                      {appliedDiscount?.productType && 
                       (item.product_name || item.productName)
                         .toLowerCase()
                         .includes(appliedDiscount.productType.toLowerCase()) && (
                        <span className="inline-flex items-center px-2 py-1 mt-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                          <Tag className="h-3 w-3 mr-1" />
                          {appliedDiscount.percentage}% off
                        </span>
                      )}
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
                
                {availableDiscounts.length > 0 && !appliedDiscount && (
                  <div className="mb-4">
                    <h3 className="text-sm font-medium mb-2 flex items-center gap-1">
                      <Tag className="h-3 w-3" /> Available Discounts
                    </h3>
                    <div className="space-y-2 max-h-28 overflow-y-auto pr-1 mb-3">
                      {availableDiscounts.map((discount) => {
                        const isEligible = discount.productType ? 
                          hasEligibleItems(discount.productType) : true;
                          
                        return (
                          <div 
                            key={discount.code} 
                            className={`p-2 rounded-md text-xs flex justify-between items-center ${
                              isEligible 
                                ? "bg-secondary/20" 
                                : "bg-gray-100 opacity-60"
                            }`}
                          >
                            <div>
                              <div className="font-mono font-medium">{discount.code}</div>
                              <div className="text-muted-foreground text-xs">
                                {discount.percentage}% off {discount.productType ? `on ${discount.productType}` : ''} • expires {formatExpiryDate(discount.expiry)}
                              </div>
                              {!isEligible && discount.productType && (
                                <div className="text-red-500 text-xs mt-1">
                                  No eligible {discount.productType} items in cart
                                </div>
                              )}
                            </div>
                            <Button 
                              size="sm" 
                              variant="secondary"
                              className="text-xs h-7"
                              disabled={!isEligible}
                              onClick={() => applyDiscount(discount.code, discount.percentage, discount.productType)}
                            >
                              Apply
                            </Button>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
                
                {appliedDiscount && (
                  <div className="mb-4 bg-green-50 p-3 rounded-md border border-green-100">
                    <div className="flex justify-between items-center">
                      <div>
                        <h3 className="text-sm font-medium text-green-800 flex items-center gap-1">
                          <Tag className="h-3 w-3" /> Applied Discount
                        </h3>
                        <div className="font-mono text-xs text-green-600 mt-1">{appliedDiscount.code}</div>
                        {appliedDiscount.productType && (
                          <div className="text-xs text-green-700">
                            {appliedDiscount.percentage}% off on {appliedDiscount.productType} items
                          </div>
                        )}
                      </div>
                      <Button 
                        size="sm" 
                        variant="ghost"
                        className="h-7 text-red-500 hover:text-red-700 hover:bg-red-50 p-0 w-7"
                        onClick={removeDiscount}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                )}
                
                <div className="space-y-3 mb-6">
                  <div className="flex justify-between">
                    <span>Subtotal</span>
                    <span>${subtotal.toFixed(2)}</span>
                  </div>
                  
                  {appliedDiscount && (
                    <div className="flex justify-between text-green-600">
                      <span>
                        Discount ({appliedDiscount.percentage}%
                        {appliedDiscount.productType ? ` on ${appliedDiscount.productType}` : ''})
                      </span>
                      <span>-${discount.toFixed(2)}</span>
                    </div>
                  )}
                  
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
