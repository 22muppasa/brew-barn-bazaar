
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useEffect, useState } from "react";

const FeaturedMenu = () => {
  const [currentSeason, setCurrentSeason] = useState<'spring' | 'summer' | 'autumn' | 'winter'>('winter');

  useEffect(() => {
    const month = new Date().getMonth();
    if (month >= 2 && month <= 4) setCurrentSeason('spring');
    else if (month >= 5 && month <= 7) setCurrentSeason('summer');
    else if (month >= 8 && month <= 10) setCurrentSeason('autumn');
    else setCurrentSeason('winter');
  }, []);

  const seasonalItems = {
    winter: [
      {
        title: "Peppermint Mocha",
        price: "5.99",
        image: "https://i.ibb.co/W4mTVTgD/0466c5dd-5dd6-414d-abe5-f26f1088cace.webp",
        category: "Seasonal"
      },
      {
        title: "Hot Chocolate Supreme",
        price: "4.99",
        image: "https://i.ibb.co/hJrYVkFN/b1f2e493-3e79-4793-a80e-ca029364c6dc.webp",
        category: "Seasonal"
      },
      {
        title: "Gingerbread Latte",
        price: "5.49",
        image: "https://i.ibb.co/TDqQcJqx/a0a8e33f-1d52-47b5-b07b-2d7142a2d897.webp",
        category: "Seasonal"
      }
    ],
    spring: [
      {
        title: "Cherry Blossom Latte",
        price: "5.99",
        image: "https://i.ibb.co/cK1xgwSj/DALL-E-2025-03-15-23-06-58-A-beautifully-crafted-cherry-blossom-latte-in-a-ceramic-cup-The-latte-has.webp",
        category: "Seasonal"
      },
      {
        title: "Lavender Tea",
        price: "4.49",
        image: "https://images.unsplash.com/photo-1594631252845-29fc4cc8cde9",
        category: "Seasonal"
      },
      {
        title: "Spring Berry Refresher",
        price: "4.99",
        image: "https://images.unsplash.com/photo-1595981267035-7b04ca84a82d",
        category: "Seasonal"
      }
    ],
    summer: [
      {
        title: "Iced Passion Fruit Tea",
        price: "4.99",
        image: "https://images.unsplash.com/photo-1499638673689-79a0b5115d87",
        category: "Seasonal"
      },
      {
        title: "Coconut Cold Brew",
        price: "5.49",
        image: "https://images.unsplash.com/photo-1461023058943-07fcbe16d735",
        category: "Seasonal"
      },
      {
        title: "Mango Dragonfruit Refresher",
        price: "5.99",
        image: "https://images.unsplash.com/photo-1546173159-315724a31696",
        category: "Seasonal"
      }
    ],
    autumn: [
      {
        title: "Pumpkin Spice Latte",
        price: "5.99",
        image: "https://images.unsplash.com/photo-1447933601403-0c6688de566e",
        category: "Seasonal"
      },
      {
        title: "Maple Pecan Cold Brew",
        price: "4.99",
        image: "https://images.unsplash.com/photo-1461023058943-07fcbe16d735",
        category: "Seasonal"
      },
      {
        title: "Cinnamon Roll",
        price: "3.99",
        image: "https://images.unsplash.com/photo-1509365465985-25d11c17e812",
        category: "Seasonal"
      }
    ]
  };

  useEffect(() => {
    const addSeasonalItems = async () => {
      const currentItems = seasonalItems[currentSeason];
      for (const item of currentItems) {
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
  }, [currentSeason]);

  const seasonTitles = {
    winter: "Winter Warmers",
    spring: "Spring Blossoms",
    summer: "Summer Refreshers",
    autumn: "Fall Favorites"
  };

  return (
    <section className="section-padding bg-background">
      <div className="container px-4 sm:px-6 lg:px-8 mx-auto">
        <motion.div 
          className="text-center mb-8 sm:mb-12"
          initial="initial"
          whileInView="animate"
          viewport={{ once: true }}
          variants={{
            initial: { opacity: 0, y: 20 },
            animate: { opacity: 1, y: 0 }
          }}
        >
          <span className="badge mb-2 sm:mb-4">Seasonal Specials</span>
          <h2 className="text-3xl sm:text-4xl font-bold">{seasonTitles[currentSeason]}</h2>
        </motion.div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
          {seasonalItems[currentSeason].map((item, index) => (
            <motion.div
              key={index}
              className="menu-card h-full flex flex-col"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              viewport={{ once: true }}
            >
              <div className="menu-image h-48 sm:h-56 md:h-64 w-full">
                <img src={item.image} alt={item.title} className="w-full h-full object-cover rounded-md" />
              </div>
              <div className="mt-4 flex flex-col flex-grow">
                <h3 className="text-lg sm:text-xl font-semibold">{item.title}</h3>
                <p className="mt-2 text-primary font-medium">${item.price}</p>
              </div>
            </motion.div>
          ))}
        </div>
        
        <motion.div 
          className="mt-8 sm:mt-12 text-center"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
        >
          <Link to="/menu">
            <Button size="lg" className="w-full sm:w-auto px-8">View Full Menu</Button>
          </Link>
        </motion.div>
      </div>
    </section>
  );
};

export default FeaturedMenu;
