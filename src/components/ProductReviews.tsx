
import { useState } from "react";
import { useSession } from "@supabase/auth-helpers-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { StarIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { format } from "date-fns";

interface ProductReviewsProps {
  productName: string;
}

const ProductReviews = ({ productName }: ProductReviewsProps) => {
  const session = useSession();
  const queryClient = useQueryClient();
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState("");
  const [isEditing, setIsEditing] = useState(false);

  // Get reviews for this product
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
            .then(result => result.data?.map(order => order.id) || [])
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

  // Submit a review
  const submitReviewMutation = useMutation({
    mutationFn: async () => {
      if (!session?.user?.id) throw new Error("You must be logged in to leave a review");
      if (rating === 0) throw new Error("Please select a rating");
      
      if (userReview) {
        // Update existing review
        const { error } = await supabase
          .from('product_reviews')
          .update({
            rating,
            comment,
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
      setComment("");
      setRating(0);
      setIsEditing(false);
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
      setComment("");
      setRating(0);
      setIsEditing(false);
      queryClient.invalidateQueries({ queryKey: ['product-reviews', productName] });
      queryClient.invalidateQueries({ queryKey: ['user-review', productName, session?.user?.id] });
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to delete review");
    }
  });

  // Start editing user's review
  const handleEditReview = () => {
    if (userReview) {
      setRating(userReview.rating);
      setComment(userReview.comment || "");
      setIsEditing(true);
    }
  };

  // Calculate average rating
  const averageRating = reviews && reviews.length > 0
    ? reviews.reduce((acc, review) => acc + review.rating, 0) / reviews.length
    : 0;

  // Format the average rating to one decimal place
  const formattedRating = averageRating.toFixed(1);

  // Loading state
  if (isLoadingReviews || isCheckingPurchase || isCheckingReview) {
    return (
      <div className="py-4 text-center text-muted-foreground">
        Loading reviews...
      </div>
    );
  }

  return (
    <div className="space-y-6 py-4">
      <div className="flex flex-col items-center space-y-2">
        <h3 className="text-xl font-semibold">Customer Reviews</h3>
        <div className="flex items-center gap-2">
          <div className="flex">
            {[1, 2, 3, 4, 5].map((star) => (
              <StarIcon
                key={star}
                className={cn(
                  "h-5 w-5",
                  star <= Math.round(averageRating)
                    ? "text-yellow-400 fill-yellow-400"
                    : "text-gray-300"
                )}
              />
            ))}
          </div>
          <span className="font-medium">{formattedRating}</span>
          <span className="text-muted-foreground">({reviews?.length || 0} reviews)</span>
        </div>
      </div>

      {session?.user && (
        <div className="border rounded-lg p-4 bg-card">
          {!isEditing && userReview ? (
            <div className="space-y-2">
              <p className="font-medium">Your Review</p>
              <div className="flex">
                {[1, 2, 3, 4, 5].map((star) => (
                  <StarIcon
                    key={star}
                    className={cn(
                      "h-5 w-5",
                      star <= userReview.rating
                        ? "text-yellow-400 fill-yellow-400"
                        : "text-gray-300"
                    )}
                  />
                ))}
              </div>
              <p className="text-sm">{userReview.comment || "No comment provided."}</p>
              <div className="flex gap-2 pt-2">
                <Button size="sm" variant="outline" onClick={handleEditReview}>
                  Edit Review
                </Button>
                <Button 
                  size="sm" 
                  variant="destructive" 
                  onClick={() => deleteReviewMutation.mutate()}
                  disabled={deleteReviewMutation.isPending}
                >
                  Delete Review
                </Button>
              </div>
            </div>
          ) : hasPurchased || userReview ? (
            <div className="space-y-4">
              <p className="font-medium">
                {userReview ? "Edit Your Review" : "Write a Review"}
              </p>
              <div className="flex">
                {[1, 2, 3, 4, 5].map((star) => (
                  <StarIcon
                    key={star}
                    className={cn(
                      "h-6 w-6 cursor-pointer transition-colors",
                      star <= (hoverRating || rating)
                        ? "text-yellow-400 fill-yellow-400"
                        : "text-gray-300"
                    )}
                    onClick={() => setRating(star)}
                    onMouseEnter={() => setHoverRating(star)}
                    onMouseLeave={() => setHoverRating(0)}
                  />
                ))}
              </div>
              <Textarea
                placeholder="Share your thoughts about this product (optional)"
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                className="min-h-[100px]"
              />
              <div className="flex gap-2">
                <Button 
                  onClick={() => submitReviewMutation.mutate()}
                  disabled={submitReviewMutation.isPending || rating === 0}
                >
                  {userReview ? "Update Review" : "Submit Review"}
                </Button>
                {isEditing && (
                  <Button 
                    variant="outline" 
                    onClick={() => {
                      setIsEditing(false);
                      setRating(0);
                      setComment("");
                    }}
                  >
                    Cancel
                  </Button>
                )}
              </div>
            </div>
          ) : (
            <p className="text-center text-muted-foreground py-2">
              Purchase this item to leave a review
            </p>
          )}
        </div>
      )}

      <div className="space-y-4">
        <AnimatePresence>
          {reviews?.map((review: any) => (
            <motion.div
              key={review.id}
              className="border rounded-lg p-4 bg-card"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
            >
              <div className="flex justify-between items-start">
                <div className="flex items-center gap-2">
                  <Avatar>
                    <AvatarFallback>
                      {review.profiles?.full_name?.[0] || review.profiles?.email?.[0] || "?"}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-medium">
                      {review.profiles?.full_name || "Anonymous"}
                    </p>
                    <div className="flex">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <StarIcon
                          key={star}
                          className={cn(
                            "h-4 w-4",
                            star <= review.rating
                              ? "text-yellow-400 fill-yellow-400"
                              : "text-gray-300"
                          )}
                        />
                      ))}
                    </div>
                  </div>
                </div>
                <span className="text-xs text-muted-foreground">
                  {format(new Date(review.created_at), "MMM d, yyyy")}
                </span>
              </div>
              {review.comment && (
                <p className="mt-2 text-sm">{review.comment}</p>
              )}
            </motion.div>
          ))}
        </AnimatePresence>
        
        {reviews?.length === 0 && (
          <p className="text-center text-muted-foreground py-4">
            No reviews yet. Be the first to review this product!
          </p>
        )}
      </div>
    </div>
  );
};

export default ProductReviews;
