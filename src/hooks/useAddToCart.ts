import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useSession } from "@supabase/auth-helpers-react";
import { toast } from "sonner";

interface AddToCartParams {
  productName: string;
  price: number;
  quantity: number;
}

export const useAddToCart = () => {
  const session = useSession();
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: async ({ productName, price, quantity }: AddToCartParams) => {
      if (!session?.user?.id) throw new Error("Must be logged in");

      const { error } = await supabase
        .from("cart_items")
        .insert({
          user_id: session.user.id,
          product_name: productName,
          quantity,
          price,
        });

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["cart-items"] });
      toast.success("Added to cart!");
    },
    onError: () => {
      toast.error("Failed to add to cart");
    },
  });

  return mutation.mutate;
};