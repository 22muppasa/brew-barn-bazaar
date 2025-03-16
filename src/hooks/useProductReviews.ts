
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useSession } from "@supabase/auth-helpers-react";
import { toast } from "sonner";

export const useProductReviews = (productName: string) => {
  const session = useSession();
  const queryClient = useQueryClient();
  
  // Get reviews for a product
  const { data: reviews, isLoading: isLoadingReviews } = useQuery({
    queryKey: ['product-reviews', productName],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('product_reviews')
        .select(`
          *,
          profiles (full_name, email)
        `)
        .eq('product_name', productName)
        .order('created_at', { ascending: false });
      
      if (error) {
        console.error("Error fetching reviews:", error);
        throw error;
      }
      
      console.log(`Fetched ${data?.length || 0} reviews for ${productName}`);
      return data || [];
    },
  });
  
  // Check if user has purchased this product
  const { data: hasPurchased, isLoading: isCheckingPurchase } = useQuery({
    queryKey: ['has-purchased', productName, session?.user?.id],
    queryFn: async () => {
      if (!session?.user?.id) return false;
      
      // First get all the user's order IDs
      const { data: orders, error: orderError } = await supabase
        .from('orders')
        .select('id')
        .eq('user_id', session.user.id);
        
      if (orderError) throw orderError;
      const orderIds = orders?.map(order => order.id) || [];
      
      if (orderIds.length === 0) return false;
      
      // Then check if any of those orders contain this product
      const { data, error } = await supabase
        .from('order_items')
        .select('*')
        .eq('product_name', productName)
        .in('order_id', orderIds);
      
      if (error) throw error;
      return data && data.length > 0;
    },
    enabled: !!session?.user?.id,
  });
  
  // Check if user has already reviewed this product
  const { data: userReview, isLoading: isCheckingReview } = useQuery({
    queryKey: ['user-review', productName, session?.user?.id],
    queryFn: async () => {
      if (!session?.user?.id) return null;
      
      const { data, error } = await supabase
        .from('product_reviews')
        .select('*')
        .eq('product_name', productName)
        .eq('user_id', session.user.id)
        .single();
      
      if (error && error.code !== 'PGRST116') throw error;
      return data;
    },
    enabled: !!session?.user?.id,
  });
  
  // Create or update a review
  const submitReviewMutation = useMutation({
    mutationFn: async ({ rating, comment }: { rating: number; comment?: string }) => {
      if (!session?.user?.id) throw new Error("You must be logged in to leave a review");
      
      if (userReview) {
        // Update existing review
        const { error } = await supabase
          .from('product_reviews')
          .update({
            rating,
            comment,
            updated_at: new Date().toISOString(),
          })
          .eq('id', userReview.id);
        
        if (error) throw error;
        return "Review updated successfully";
      } else {
        // Create new review
        const { error } = await supabase
          .from('product_reviews')
          .insert({
            user_id: session.user.id,
            product_name: productName,
            rating,
            comment,
          });
        
        if (error) throw error;
        return "Review submitted successfully";
      }
    },
    onSuccess: (message) => {
      toast.success(message);
      queryClient.invalidateQueries({ queryKey: ['product-reviews', productName] });
      queryClient.invalidateQueries({ queryKey: ['user-review', productName, session?.user?.id] });
      // Also invalidate product ratings to update the average rating display
      queryClient.invalidateQueries({ queryKey: ['product-ratings'] });
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to submit review");
    }
  });
  
  // Delete a review
  const deleteReviewMutation = useMutation({
    mutationFn: async () => {
      if (!userReview || !session?.user?.id) throw new Error("No review to delete");
      
      const { error } = await supabase
        .from('product_reviews')
        .delete()
        .eq('id', userReview.id);
      
      if (error) throw error;
      return "Review deleted successfully";
    },
    onSuccess: (message) => {
      toast.success(message);
      queryClient.invalidateQueries({ queryKey: ['product-reviews', productName] });
      queryClient.invalidateQueries({ queryKey: ['user-review', productName, session?.user?.id] });
      // Also invalidate product ratings to update the average rating display
      queryClient.invalidateQueries({ queryKey: ['product-ratings'] });
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to delete review");
    }
  });
  
  // Calculate average rating
  const averageRating = reviews && reviews.length > 0
    ? reviews.reduce((acc, review) => acc + review.rating, 0) / reviews.length
    : 0;
  
  return {
    reviews,
    isLoadingReviews,
    hasPurchased: !!hasPurchased,
    isCheckingPurchase,
    userReview,
    isCheckingReview,
    submitReview: submitReviewMutation.mutate,
    isSubmittingReview: submitReviewMutation.isPending,
    deleteReview: deleteReviewMutation.mutate,
    isDeletingReview: deleteReviewMutation.isPending,
    averageRating,
    reviewCount: reviews?.length || 0,
    canReview: !!session?.user && !!hasPurchased && !userReview,
    canEditReview: !!userReview
  };
};
