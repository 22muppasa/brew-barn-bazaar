
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export const useMenuWithRatings = (category?: string) => {
  return useQuery({
    queryKey: ['menu-items-with-ratings', category],
    queryFn: async () => {
      // Get all menu items
      const { data: menuItems, error: menuError } = await supabase
        .from('menu_items')
        .select('*')
        .order('created_at')
        .eq('category', category || '')
        .is('category', category ? null : null);

      if (menuError) throw menuError;

      // Get all ratings
      const { data: reviews, error: reviewsError } = await supabase
        .from('product_reviews')
        .select('product_name, rating');

      if (reviewsError) throw reviewsError;

      // Process ratings by product
      const ratingsByProduct = reviews?.reduce((acc: Record<string, { total: number, count: number }>, review) => {
        if (!acc[review.product_name]) {
          acc[review.product_name] = { total: 0, count: 0 };
        }
        acc[review.product_name].total += review.rating;
        acc[review.product_name].count += 1;
        return acc;
      }, {}) || {};

      // Add ratings to menu items
      const menuWithRatings = menuItems?.map(item => {
        const ratings = ratingsByProduct[item.name] || { total: 0, count: 0 };
        const averageRating = ratings.count > 0 ? ratings.total / ratings.count : 0;
        
        return {
          ...item,
          averageRating,
          reviewCount: ratings.count
        };
      }) || [];

      return menuWithRatings;
    },
  });
};
