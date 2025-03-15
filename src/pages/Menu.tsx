import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { useSession } from "@supabase/auth-helpers-react";
import { toast } from "sonner";
import { useState } from "react";
import DrinkBuilder from "@/components/drink-builder/DrinkBuilder";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { useGuestCart, useLocalStorage } from "@/hooks/useLocalStorage";
import HamburgerMenu from "@/components/HamburgerMenu";
import VirtualBarista from "@/components/VirtualBarista";
import ProductReviews from "@/components/ProductReviews";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Star } from "lucide-react";

const Menu = () => {
  const session = useSession();
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [showDrinkBuilder, setShowDrinkBuilder] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<string | null>(null);
  const { getValue } = useLocalStorage();
  const isGuest = getValue("isGuest") === "true";
  const { addToCart } = useGuestCart();

  const { data: menuItems, isLoading } = useQuery({
    queryKey: ['menu-items'],
    queryFn: async () => {
      const winterSpecials = [
        {
          name: "Peppermint Mocha",
          price: 5.99,
          image_url: "https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd",
          category: "Seasonal",
          description: "A festive blend of rich chocolate and cool peppermint"
        },
        {
          name: "Hot Chocolate Supreme",
          price: 4.99,
          image_url: "https://images.unsplash.com/photo-1542990253-0d0f5be5f0ed",
          category: "Seasonal",
          description: "Luxurious hot chocolate topped with whipped cream"
        },
        {
          name: "Gingerbread Latte",
          price: 5.49,
          image_url: "https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd",
          category: "Seasonal",
          description: "Warm spiced latte with gingerbread flavoring"
        }
      ];

      for (const item of winterSpecials) {
        const { data: existing } = await supabase
          .from('menu_items')
          .select()
          .eq('name', item.name)
          .limit(1);

        if (!existing?.length) {
          await supabase
            .from('menu_items')
            .insert(item);
        }
      }

      const { data, error } = await supabase
        .from('menu_items')
        .select('*')
        .neq('category', 'Seasonal')
        .order('category');
      
      if (error) throw error;
      return data;
    },
  });

  const { data: productRatings } = useQuery({
    queryKey: ['product-ratings'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('product_reviews')
        .select('product_name, rating');
      
      if (error) throw error;
      
      const ratingMap: Record<string, { avg: number; count: number }> = {};
      data.forEach(review => {
        if (!ratingMap[review.product_name]) {
          ratingMap[review.product_name] = { avg: 0, count: 0 };
        }
        ratingMap[review.product_name].avg += review.rating;
        ratingMap[review.product_name].count += 1;
      });
      
      Object.keys(ratingMap).forEach(product => {
        ratingMap[product].avg = 
          ratingMap[product].avg / ratingMap[product].count;
      });
      
      return ratingMap;
    },
  });

  const addToCartHandler = async (item: any) => {
    if (session) {
      const { error } = await supabase
        .from('cart_items')
        .insert({
          user_id: session.user.id,
          product_name: item.name,
          quantity: 1,
          price: item.price,
        });

      if (error) {
        toast.error("Failed to add item to cart");
        return;
      }
    } else if (isGuest) {
      addToCart({
        productName: item.name,
        price: item.price,
        quantity: 1
      });
    } else {
      toast.error("Please login or continue as guest to add items to cart");
      return;
    }

    toast.success("Added to cart!");
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  const categories = ["all", ...new Set(menuItems?.map((item: any) => item.category))];
  const filteredItems = selectedCategory === "all" 
    ? menuItems 
    : menuItems?.filter((item: any) => item.category === selectedCategory);

  return (
    <div className="min-h-screen bg-background">
      <HamburgerMenu />
      <div className="container mx-auto px-4 py-8 pt-20">
        <motion.h1 
          className="text-3xl md:text-4xl font-bold mb-8 text-center"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          Our Menu
        </motion.h1>

        {!session && !isGuest && (
          <motion.div 
            className="mb-8 p-4 bg-secondary/20 rounded-lg text-center"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <p className="mb-3">Create an account to earn rewards with every purchase!</p>
            <div className="flex justify-center gap-3">
              <Button 
                variant="default" 
                onClick={() => {
                  localStorage.setItem("isGuest", "true");
                  window.location.reload();
                }}
              >
                Continue as Guest
              </Button>
              <Button 
                variant="secondary"
                onClick={() => window.location.href = "/auth"}
              >
                Sign Up
              </Button>
            </div>
          </motion.div>
        )}

        <div className="flex justify-center mb-8">
          <Button
            variant={showDrinkBuilder ? "default" : "outline"}
            onClick={() => setShowDrinkBuilder(!showDrinkBuilder)}
            className="w-full max-w-md"
          >
            {showDrinkBuilder ? "View Menu" : "Create Custom Drink"}
          </Button>
        </div>

        {showDrinkBuilder ? (
          <DrinkBuilder />
        ) : (
          <div className="flex flex-col md:flex-row gap-6">
            <ScrollArea className="w-full md:w-48 md:flex-shrink-0 mb-6 md:mb-0">
              <div className="flex md:flex-col gap-2 pb-4 md:pb-0">
                {categories.map((category) => (
                  <Button
                    key={category}
                    variant={selectedCategory === category ? "default" : "outline"}
                    onClick={() => setSelectedCategory(category)}
                    className="flex-shrink-0 whitespace-nowrap justify-start text-left capitalize"
                  >
                    {category === "all" ? "All Items" : category}
                  </Button>
                ))}
              </div>
              <ScrollBar orientation="horizontal" className="md:hidden" />
            </ScrollArea>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
              {filteredItems?.map((item: any) => (
                <motion.div
                  key={item.id}
                  className="bg-card rounded-lg shadow-lg overflow-hidden h-full border border-muted hover:shadow-xl transition-all duration-300"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  whileHover={{ scale: 1.02 }}
                  layout
                >
                  <div className="relative h-40 sm:h-48 overflow-hidden">
                    <img 
                      src={item.image_url} 
                      alt={item.name}
                      className="w-full h-full object-cover transition-transform duration-300 hover:scale-110"
                      onError={(e) => {
                        e.currentTarget.src = 'https://images.unsplash.com/photo-1497636577773-f1231844b336';
                      }}
                    />
                  </div>
                  <div className="p-4">
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="text-lg sm:text-xl font-semibold">{item.name}</h3>
                      
                      <Dialog>
                        <DialogTrigger asChild>
                          <button 
                            className="flex items-center text-sm text-muted-foreground hover:text-foreground"
                            onClick={() => setSelectedProduct(item.name)}
                          >
                            <div className="flex items-center gap-1">
                              <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                              <span>
                                {productRatings?.[item.name]?.avg 
                                  ? productRatings[item.name].avg.toFixed(1) 
                                  : "-"}
                              </span>
                              <span className="text-xs">
                                ({productRatings?.[item.name]?.count || 0})
                              </span>
                            </div>
                          </button>
                        </DialogTrigger>
                        <DialogContent className="max-w-lg">
                          <DialogHeader>
                            <DialogTitle>{item.name} Reviews</DialogTitle>
                          </DialogHeader>
                          {selectedProduct === item.name && (
                            <ProductReviews productName={item.name} />
                          )}
                        </DialogContent>
                      </Dialog>
                    </div>
                    
                    <p className="text-muted-foreground mb-4 text-sm sm:text-base">{item.description}</p>
                    <div className="flex justify-between items-center gap-2">
                      <span className="text-base sm:text-lg font-bold">${item.price.toFixed(2)}</span>
                      <Button 
                        onClick={() => addToCartHandler(item)}
                        size="sm"
                        className="transition-all duration-300 hover:scale-105"
                      >
                        Add to Cart
                      </Button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        )}
      </div>
      
      <VirtualBarista />
    </div>
  );
};

export default Menu;
