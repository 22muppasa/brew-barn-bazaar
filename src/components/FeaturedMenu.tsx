import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useEffect } from "react";

const FeaturedMenu = () => {
  const seasonalItems = [
    {
      title: "Pumpkin Spice Latte",
      price: "5.99",
      image: "https://images.unsplash.com/photo-1447933601403-0c6688de566e",
      category: "Seasonal",
      description: "Our signature fall favorite with real pumpkin and warm spices"
    },
    {
      title: "Maple Pecan Cold Brew",
      price: "4.99",
      image: "https://images.unsplash.com/photo-1578314675249-a6910f80cc4e",
      category: "Seasonal",
      description: "Smooth cold brew with rich maple and toasted pecan notes"
    },
    {
      title: "Cinnamon Roll",
      price: "3.99",
      image: "https://images.unsplash.com/photo-1509365465985-25d11c17e812",
      category: "Seasonal",
      description: "Freshly baked with warm cinnamon and vanilla glaze"
    }
  ];

  useEffect(() => {
    const addSeasonalItems = async () => {
      for (const item of seasonalItems) {
        const { data } = await supabase
          .from('menu_items')
          .select()
          .eq('name', item.title);

        if (!data || data.length === 0) {
          await supabase.from('menu_items').insert({
            name: item.title,
            price: parseFloat(item.price),
            image_url: item.image,
            category: item.category,
            description: item.description
          });
        }
      }
    };

    addSeasonalItems();
  }, []);

  return (
    <section className="section-padding bg-background">
      <div className="container">
        <motion.div 
          className="text-center"
          initial="initial"
          whileInView="animate"
          viewport={{ once: true }}
          variants={{
            initial: { opacity: 0, y: 20 },
            animate: { opacity: 1, y: 0 }
          }}
        >
          <div className="inline-flex items-center justify-center rounded-full bg-muted px-3 py-1 text-sm font-semibold mb-4">
            Seasonal Specials
          </div>
          <h2 className="mb-12 text-4xl font-bold">Fall Favorites</h2>
        </motion.div>
        
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          {seasonalItems.map((item, index) => (
            <motion.div
              key={index}
              className="group relative overflow-hidden rounded-lg bg-card shadow-lg transition-all hover:shadow-xl"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              viewport={{ once: true }}
            >
              <div className="aspect-w-16 aspect-h-9 overflow-hidden">
                <img 
                  src={item.image} 
                  alt={item.title}
                  className="h-48 w-full object-cover transition-transform duration-300 group-hover:scale-110"
                />
              </div>
              <div className="p-6">
                <h3 className="text-xl font-semibold mb-2">{item.title}</h3>
                <p className="text-muted-foreground mb-4 text-sm">{item.description}</p>
                <div className="flex items-center justify-between">
                  <span className="text-lg font-bold text-primary">${item.price}</span>
                  <div className="inline-flex items-center justify-center rounded-full bg-muted px-2.5 py-0.5 text-xs font-semibold">
                    Seasonal
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
        
        <motion.div 
          className="mt-12 text-center"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
        >
          <Link to="/menu">
            <Button 
              size="lg"
              className="bg-primary text-white hover:bg-primary/90"
            >
              View Full Menu
            </Button>
          </Link>
        </motion.div>
      </div>
    </section>
  );
};

export default FeaturedMenu;