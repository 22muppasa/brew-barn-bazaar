
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useSession } from "@supabase/auth-helpers-react";
import { toast } from "sonner";
import { useGuestCart, useLocalStorage } from "./useLocalStorage";

interface AddToCartParams {
  productName: string;
  price: number;
  quantity: number;
}

export const useAddToCart = () => {
  const session = useSession();
  const queryClient = useQueryClient();
  const { getValue, setValue } = useLocalStorage();
  
  // Auto-enable guest mode for non-logged in users
  if (!session && getValue("isGuest") !== "true") {
    setValue("isGuest", "true");
  }
  
  const isGuest = getValue("isGuest") === "true";
  const { addToCart: addToGuestCart } = useGuestCart();

  const mutation = useMutation({
    mutationFn: async ({ productName, price, quantity }: AddToCartParams) => {
      if (session?.user?.id) {
        // Check if profile is complete
        const { data: profile, error: profileError } = await supabase
          .from("profiles")
          .select("full_name")
          .eq("id", session.user.id)
          .single();
        
        if (profileError) throw profileError;
        
        // If the user doesn't have a full name or it's empty, show incomplete profile warning
        if (!profile?.full_name || profile.full_name.trim() === '') {
          toast.warning(
            "Your profile seems incomplete. Please update your account information.", 
            {
              action: {
                label: "Update Profile",
                onClick: () => window.location.href = "/auth"
              }
            }
          );
        }

        // For authenticated users, check if item already exists in cart
        const { data: cartItems, error: queryError } = await supabase
          .from("cart_items")
          .select("*")
          .eq("user_id", session.user.id)
          .eq("product_name", productName);
        
        if (queryError) {
          throw queryError;
        }

        // Check if there are any cart items
        const existingItem = cartItems && cartItems.length > 0 ? cartItems[0] : null;

        if (existingItem) {
          // Update existing item quantity
          const { error } = await supabase
            .from("cart_items")
            .update({
              quantity: existingItem.quantity + quantity
            })
            .eq("id", existingItem.id);

          if (error) throw error;
        } else {
          // Add new item to cart
          const { error } = await supabase
            .from("cart_items")
            .insert({
              user_id: session.user.id,
              product_name: productName,
              quantity,
              price,
            });
  
          if (error) throw error;
        }
        return { success: true };
      } else {
        // Non-logged in users are automatically in guest mode
        // Force guest mode to be true
        if (getValue("isGuest") !== "true") {
          setValue("isGuest", "true");
        }
        
        // Add item to guest cart
        addToGuestCart({
          productName,
          price,
          quantity
        });
        
        // Return a resolved result for guest flow
        return { success: true, guest: true };
      }
    },
    onSuccess: (result) => {
      if (session) {
        queryClient.invalidateQueries({ queryKey: ["cart-items"] });
      }
      
      toast.success("Added to cart!");
    },
    onError: (error: Error) => {
      console.error("Add to cart error:", error);
      toast.error("Failed to add to cart");
    },
  });

  return mutation.mutate;
};
