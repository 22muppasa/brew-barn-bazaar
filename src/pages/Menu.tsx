import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { useSession } from "@supabase/auth-helpers-react";
import { toast } from "sonner";
import Navigation from "@/components/Navigation";
import { useState } from "react";

const Menu = () => {
  const session = useSession();
  const [selectedCategory, setSelectedCategory] = useState<string>("all");

  const { data: menuItems, isLoading } = useQuery({
    queryKey: ['menu-items'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('menu_items')
        .select('*')
        .order('category');
      
      if (error) throw error;
      return data;
    },
  });

  const addToCart = async (item: any) => {
    if (!session) {
      toast.error("Please login to add items to cart");
      return;
    }

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

  // Updated menu item images that match their names
  const menuItemImages = {
    // Hot Drinks
    'Classic Espresso': 'https://images.unsplash.com/photo-1510591509098-f4fdc6d0ff04',
    'Cappuccino': 'https://images.unsplash.com/photo-1572442388796-11668a67e53d',
    'Caramel Latte': 'https://images.unsplash.com/photo-1586347437004-8f2957d9c09e',
    'Americano': 'https://images.unsplash.com/photo-1551030173-122aabc4489c',
    'Mocha': 'https://images.unsplash.com/photo-1578314675249-a6910f80239c',
    
    // Cold Drinks
    'Iced Coffee': 'https://images.unsplash.com/photo-1517701604599-bb29b565090c',
    'Frappuccino': 'https://images.unsplash.com/photo-1586347437004-8f2957d9c09e',
    'Cold Brew': 'https://images.unsplash.com/photo-1461023058943-07fcbe16d735',
    'Iced Latte': 'https://images.unsplash.com/photo-1517701604599-bb29b565090c',
    
    // Seasonal Items
    'Pumpkin Spice Latte': 'https://images.unsplash.com/photo-1572785031839-8d006462dcd4',
    'Maple Pecan Cold Brew': 'https://images.unsplash.com/photo-1461023058943-07fcbe16d735',
    'Cinnamon Roll': 'https://images.unsplash.com/photo-1509365465985-25d11c17e812',
    
    // Pastries
    'Croissant': 'https://images.unsplash.com/photo-1555507036-ab1f4038808a',
    'Chocolate Muffin': 'https://images.unsplash.com/photo-1607958996333-41aef7caefaa',
    'Blueberry Scone': 'https://images.unsplash.com/photo-1600180004657-cc8815d4fbd6',
    'Danish Pastry': 'https://images.unsplash.com/photo-1509983165097-0c31a863e3f3'
  };

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <div className="container mx-auto px-4 py-8">
        <motion.h1 
          className="text-4xl font-bold mb-8 text-center"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          Our Menu
        </motion.h1>
        
        <div className="flex gap-6">
          {/* Vertical Category Bar */}
          <motion.div 
            className="w-48 flex-shrink-0 space-y-2 sticky top-24 self-start"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
          >
            {categories.map((category) => (
              <Button
                key={category}
                variant={selectedCategory === category ? "default" : "outline"}
                onClick={() => setSelectedCategory(category)}
                className="w-full justify-start text-left capitalize"
              >
                {category === "all" ? "All Items" : category}
              </Button>
            ))}
          </motion.div>

          {/* Menu Items Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 flex-grow">
            {filteredItems?.map((item: any) => (
              <motion.div
                key={item.id}
                className="bg-card rounded-lg shadow-lg overflow-hidden"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                whileHover={{ scale: 1.02 }}
                layout
              >
                <div className="relative h-48 overflow-hidden">
                  <img 
                    src={menuItemImages[item.name] || item.image_url} 
                    alt={item.name}
                    className="w-full h-full object-cover transition-transform duration-300 hover:scale-110"
                  />
                </div>
                <div className="p-4">
                  <h3 className="text-xl font-semibold mb-2">{item.name}</h3>
                  <p className="text-muted-foreground mb-4">{item.description}</p>
                  <div className="flex justify-between items-center">
                    <span className="text-lg font-bold">${item.price.toFixed(2)}</span>
                    <Button 
                      onClick={() => addToCart(item)}
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
      </div>
    </div>
  );
};

export default Menu;