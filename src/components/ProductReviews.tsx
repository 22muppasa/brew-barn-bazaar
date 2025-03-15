
import { useState } from 'react';
import { useSession } from '@supabase/auth-helpers-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Star, StarHalf } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';

interface ReviewsProps {
  productName: string;
}

export default function ProductReviews({ productName }: ReviewsProps) {
  const session = useSession();
  const queryClient = useQueryClient();
  const [rating, setRating] = useState<number>(5);
  const [comment, setComment] = useState<string>('');
  const [showForm, setShowForm] = useState<boolean>(false);

  // Fetch reviews for this product
  const { data: reviews, isLoading } = useQuery({
    queryKey: ['product-reviews', productName],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('product_reviews')
        .select(`
          *,
          profiles(full_name)
        `)
        .eq('product_name', productName)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data;
    },
  });

  // Check if user has purchased this product
  const { data: hasPurchased } = useQuery({
    queryKey: ['has-purchased', productName, session?.user?.id],
    queryFn: async () => {
      if (!session?.user?.id) return false;

      const { data, error } = await supabase
        .from('order_items')
        .select('*')
        .eq('product_name', productName)
        .in('order_id', supabase.from('orders').select('id').eq('user_id', session.user.id));
      
      if (error) throw error;
      return data && data.length > 0;
    },
    enabled: !!session?.user?.id,
  });

  // Check if user has already reviewed this product
  const { data: userReview } = useQuery({
    queryKey: ['user-review', productName, session?.user?.id],
    queryFn: async () => {
      if (!session?.user?.id) return null;

      const { data, error } = await supabase
        .from('product_reviews')
        .select('*')
        .eq('product_name', productName)
        .eq('user_id', session.user.id)
        .single();
      
      if (error && error.code !== 'PGRST116') throw error; // PGRST116 is "No rows returned" which is expected
      return data;
    },
    enabled: !!session?.user?.id,
  });

  // Submit review mutation
  const submitReview = useMutation({
    mutationFn: async () => {
      if (!session?.user?.id) throw new Error('You must be logged in to leave a review');
      if (!hasPurchased) throw new Error('You can only review products you have purchased');
      
      const reviewData = {
        user_id: session.user.id,
        product_name: productName,
        rating,
        comment: comment.trim() || null,
      };

      if (userReview) {
        // Update existing review
        const { error } = await supabase
          .from('product_reviews')
          .update(reviewData)
          .eq('id', userReview.id);

        if (error) throw error;
        return 'updated';
      } else {
        // Create new review
        const { error } = await supabase
          .from('product_reviews')
          .insert(reviewData);

        if (error) throw error;
        return 'created';
      }
    },
    onSuccess: (result) => {
      toast.success(`Review ${result} successfully!`);
      setShowForm(false);
      queryClient.invalidateQueries({ queryKey: ['product-reviews', productName] });
      queryClient.invalidateQueries({ queryKey: ['user-review', productName, session?.user?.id] });
    },
    onError: (error: Error) => {
      toast.error(error.message);
    }
  });

  // Calculate average rating
  const averageRating = reviews?.length 
    ? (reviews.reduce((sum: number, review: any) => sum + review.rating, 0) / reviews.length).toFixed(1)
    : 'No ratings yet';

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    submitReview.mutate();
  };

  const StarRating = ({ value, onChange }: { value: number; onChange?: (rating: number) => void }) => {
    const stars = [1, 2, 3, 4, 5];
    
    return (
      <div className="flex items-center space-x-1">
        {stars.map((star) => (
          <button
            key={star}
            type="button"
            onClick={() => onChange && onChange(star)}
            className={onChange ? "cursor-pointer focus:outline-none" : "cursor-default"}
            disabled={!onChange}
          >
            <Star
              className={`h-5 w-5 ${
                star <= value ? "text-yellow-400 fill-yellow-400" : "text-gray-300"
              }`}
            />
          </button>
        ))}
      </div>
    );
  };

  const canReview = !!session && hasPurchased && !isLoading;

  if (isLoading) {
    return <div className="p-4 text-center">Loading reviews...</div>;
  }

  return (
    <div className="mt-6 p-4 bg-background rounded-lg border border-border">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold">Customer Reviews</h3>
        <div className="flex items-center space-x-2">
          <div className="text-xl font-bold">{averageRating}</div>
          {typeof averageRating === 'string' ? (
            <div className="text-muted-foreground text-sm">{averageRating}</div>
          ) : (
            <StarRating value={parseFloat(averageRating as string)} />
          )}
          <span className="text-sm text-muted-foreground">({reviews?.length || 0} reviews)</span>
        </div>
      </div>

      {canReview && !showForm && (
        <div className="mb-4">
          {userReview ? (
            <Button variant="outline" onClick={() => {
              setRating(userReview.rating);
              setComment(userReview.comment || '');
              setShowForm(true);
            }}>
              Edit Your Review
            </Button>
          ) : (
            <Button onClick={() => setShowForm(true)}>Write a Review</Button>
          )}
        </div>
      )}

      {showForm && (
        <form onSubmit={handleSubmit} className="mb-6 p-4 border rounded-lg">
          <h4 className="font-medium mb-2">
            {userReview ? 'Edit Your Review' : 'Write a Review'}
          </h4>
          <div className="mb-4">
            <label className="block text-sm font-medium mb-1">Your Rating</label>
            <StarRating value={rating} onChange={setRating} />
          </div>
          <div className="mb-4">
            <label className="block text-sm font-medium mb-1">Your Review (Optional)</label>
            <Textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Share your experience with this product..."
              className="w-full"
              rows={3}
            />
          </div>
          <div className="flex gap-2">
            <Button type="submit" disabled={submitReview.isPending}>
              {submitReview.isPending ? 'Submitting...' : userReview ? 'Update Review' : 'Submit Review'}
            </Button>
            <Button type="button" variant="outline" onClick={() => setShowForm(false)}>
              Cancel
            </Button>
          </div>
        </form>
      )}

      {!reviews?.length ? (
        <p className="text-center text-muted-foreground py-4">No reviews yet.</p>
      ) : (
        <div className="divide-y">
          {reviews.map((review: any) => (
            <div key={review.id} className="py-4">
              <div className="flex justify-between items-start">
                <div>
                  <div className="flex items-center space-x-2">
                    <p className="font-medium">
                      {review.profiles?.full_name || 'Anonymous'}
                    </p>
                    <StarRating value={review.rating} />
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {new Date(review.created_at).toLocaleDateString()}
                  </p>
                </div>
                {session?.user?.id === review.user_id && !showForm && (
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="text-xs"
                    onClick={() => {
                      setRating(review.rating);
                      setComment(review.comment || '');
                      setShowForm(true);
                    }}
                  >
                    Edit
                  </Button>
                )}
              </div>
              {review.comment && (
                <p className="mt-2 text-sm">{review.comment}</p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
