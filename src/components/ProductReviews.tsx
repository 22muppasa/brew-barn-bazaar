
import { useState } from "react";
import { useSession } from "@supabase/auth-helpers-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { StarIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { format } from "date-fns";
import { useProductReviews } from "@/hooks/useProductReviews";

interface ProductReviewsProps {
  productName: string;
}

const ProductReviews = ({ productName }: ProductReviewsProps) => {
  const session = useSession();
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState("");
  const [isEditing, setIsEditing] = useState(false);

  const {
    reviews,
    isLoadingReviews,
    hasPurchased,
    isCheckingPurchase,
    userReview,
    isCheckingReview,
    submitReview,
    isSubmittingReview,
    deleteReview,
    isDeletingReview,
    averageRating,
    reviewCount,
    canReview,
    canEditReview
  } = useProductReviews(productName);

  // Start editing user's review
  const handleEditReview = () => {
    if (userReview) {
      setRating(userReview.rating);
      setComment(userReview.comment || "");
      setIsEditing(true);
    }
  };

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
          <span className="text-muted-foreground">({reviewCount} reviews)</span>
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
                  onClick={() => deleteReview()}
                  disabled={isDeletingReview}
                >
                  Delete Review
                </Button>
              </div>
            </div>
          ) : canReview || canEditReview ? (
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
                  onClick={() => submitReview({ rating, comment })}
                  disabled={isSubmittingReview || rating === 0}
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
