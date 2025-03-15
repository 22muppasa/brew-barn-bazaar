
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useState } from "react";
import { toast } from "sonner";
import { useSession } from "@supabase/auth-helpers-react";

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
      
      if (error) throw error;
      return data || [];
    },
  });
  
  // Check if user has purchased this product
  const { data: hasPurchased, isLoading: isCheckingPurchase } = useQuery({
    queryKey: ['has-purchased', productName, session?.user?.id],
    queryFn: async () => {
      if (!session?.user?.id) return false;
      
      const { data, error } = await supabase
        .from('order_items')
        .select('*')
        .eq('product_name', productName)
        .in('order_id', 
          supabase
            .from('orders')
            .select('id')
            .eq('user_id', session.user.id)
        );
      
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
            // No need to update created_at as we already have it
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
