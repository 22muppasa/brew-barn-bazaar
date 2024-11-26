import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";

const FeaturedMenu = () => {
  const { data: seasonalItems } = useQuery({
    queryKey: ['seasonal-menu-items'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('menu_items')
        .select()
        .eq('category', 'Seasonal')
        .order('name');
      
      if (error) throw error;
      return data || [];
    }
  });

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
          {seasonalItems?.map((item, index) => (
            <motion.div
              key={item.id}
              className="menu-card"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              viewport={{ once: true }}
            >
              <div className="menu-image">
                <img 
                  src={item.image_url || "https://images.unsplash.com/photo-1497636577773-f1231844b336"} 
                  alt={item.name} 
                />
              </div>
              <div className="mt-4">
                <h3 className="text-xl font-semibold">{item.name}</h3>
                <p className="mt-2 text-primary">${item.price.toFixed(2)}</p>
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