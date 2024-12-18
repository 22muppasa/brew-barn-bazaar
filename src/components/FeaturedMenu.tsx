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
      image: "https://i.ibb.co/7ykDWbb/DALL-E-2024-11-27-13-25-39-A-pumpkin-spice-latte-served-in-a-white-ceramic-cup-with-a-saucer-topped.webp",
      category: "Seasonal Specials"
    },
    {
      title: "Maple Pecan Cold Brew",
      price: "4.99",
      image: "https://images.unsplash.com/photo-1461023058943-07fcbe16d735",
      category: "Seasonal Specials"
    },
    {
      title: "Cinnamon Roll",
      price: "3.99",
      image: "https://images.unsplash.com/photo-1509365465985-25d11c17e812",
      category: "Seasonal Specials"
    }
  ];

  useEffect(() => {
    const addSeasonalItems = async () => {
      for (const item of seasonalItems) {
        const { data, error } = await supabase
          .from('menu_items')
          .select()
          .eq('name', item.title)
          .limit(1);

        if (!data?.length) {
          await supabase.from('menu_items').insert({
            name: item.title,
            price: parseFloat(item.price),
            image_url: item.image,
            category: item.category
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
          <span className="badge mb-4">Seasonal Specials</span>
          <h2 className="mb-12 text-4xl font-bold">Fall Favorites</h2>
        </motion.div>
        
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          {seasonalItems.map((item, index) => (
            <motion.div
              key={index}
              className="menu-card"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              viewport={{ once: true }}
            >
              <div className="menu-image">
                <img src={item.image} alt={item.title} />
              </div>
              <div className="mt-4">
                <h3 className="text-xl font-semibold">{item.title}</h3>
                <p className="mt-2 text-primary">${item.price}</p>
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
            <Button size="lg">View Full Menu</Button>
          </Link>
        </motion.div>
      </div>
    </section>
  );
};

export default FeaturedMenu;
