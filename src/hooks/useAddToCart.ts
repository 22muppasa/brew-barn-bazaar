
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
  const { getValue } = useLocalStorage();
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

        // For authenticated users, use Supabase
        const { error } = await supabase
          .from("cart_items")
          .insert({
            user_id: session.user.id,
            product_name: productName,
            quantity,
            price,
          });

        if (error) throw error;
      } else if (isGuest) {
        // For guest users, use local storage
        addToGuestCart({
          productName,
          price,
          quantity
        });
      } else {
        throw new Error("Must be logged in or continue as guest");
      }
    },
    onSuccess: () => {
      if (session) {
        queryClient.invalidateQueries({ queryKey: ["cart-items"] });
      }
      toast.success("Added to cart!");
    },
    onError: (error: Error) => {
      console.error("Add to cart error:", error);
      
      if (error.message === "Must be logged in or continue as guest") {
        toast.error("Please login or continue as guest to add items to cart");
      } else {
        toast.error("Failed to add to cart");
      }
    },
  });

  return mutation.mutate;
};
