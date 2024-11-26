import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";

const FeaturedMenu = () => {
  const { data: seasonalItems } = useQuery({
    queryKey: ['seasonal-menu-items-preview'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('menu_items')
        .select()
        .eq('category', 'Seasonal')
        .order('name')
        .limit(3); // Only show 3 featured items
      
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
          <span className="badge mb-4">Featured Seasonal Items</span>
          <h2 className="mb-12 text-4xl font-bold">Seasonal Highlights</h2>
        </motion.div>
        
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          {seasonalItems?.map((item, index) => (
            <motion.div
              key={item.id}
              className="menu-card group relative"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              viewport={{ once: true }}
            >
              <div className="menu-image overflow-hidden rounded-lg">
                <img 
                  src={item.image_url || "https://images.unsplash.com/photo-1497636577773-f1231844b336"} 
                  alt={item.name}
                  className="w-full h-48 object-cover rounded-lg transition-transform duration-300 group-hover:scale-110" 
                />
              </div>
              <div className="mt-4">
                <h3 className="text-xl font-semibold">{item.name}</h3>
                {item.description && (
                  <p className="mt-2 text-muted-foreground line-clamp-2">{item.description}</p>
                )}
                <p className="mt-2 text-primary font-semibold">${item.price.toFixed(2)}</p>
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
            <Button size="lg" variant="secondary">View All Seasonal Items</Button>
          </Link>
        </motion.div>
      </div>
    </section>
  );
};

export default FeaturedMenu;