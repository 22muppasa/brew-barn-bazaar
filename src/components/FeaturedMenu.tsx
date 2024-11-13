import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";

const FeaturedMenu = () => {
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
          {[
            {
              title: "Pumpkin Spice Latte",
              price: "$5.99",
              image: "https://images.unsplash.com/photo-1506619216599-9d16d0903dfd"
            },
            {
              title: "Maple Pecan Cold Brew",
              price: "$4.99",
              image: "https://images.unsplash.com/photo-1461023058943-07fcbe16d735"
            },
            {
              title: "Cinnamon Roll",
              price: "$3.99",
              image: "https://images.unsplash.com/photo-1509365465985-25d11c17e812"
            }
          ].map((item, index) => (
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
                <p className="mt-2 text-primary">{item.price}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturedMenu;