
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useSession } from "@supabase/auth-helpers-react";
import { toast } from "sonner";
import { useGuestCart, useLocalStorage, GuestCartItem } from "./useLocalStorage";

interface AddToCartParams {
  productName: string;
  price: number;
  quantity: number;
  size?: string;
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
    mutationFn: async ({ productName, price, quantity, size }: AddToCartParams) => {
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

        // For authenticated users, check if item already exists in cart with the same size
        // Break this into separate steps to avoid deep type instantiation
        const query = supabase
          .from("cart_items")
          .select("*")
          .eq("user_id", session.user.id)
          .eq("product_name", productName)
          .eq("size", size || "medium");
          
        const { data: existingItem, error: queryError } = await query;
        
        if (queryError && queryError.code !== 'PGRST116') { // PGRST116 means no rows returned
          throw queryError;
        }

        if (existingItem && existingItem.length > 0) {
          // Update existing item quantity
          const { error } = await supabase
            .from("cart_items")
            .update({
              quantity: existingItem[0].quantity + quantity
            })
            .eq("id", existingItem[0].id);

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
              size: size || "medium",
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
        
        // Add item to guest cart with explicitly typed parameters
        const cartItem: Omit<GuestCartItem, "id"> = {
          productName,
          price,
          quantity,
          size: size || "medium"
        };
        
        addToGuestCart(cartItem);
        
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
