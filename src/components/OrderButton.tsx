
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { useEffect, useState } from "react";

const OrderButton = () => {
  const [scrollToTopVisible, setScrollToTopVisible] = useState(false);

  useEffect(() => {
    const toggleVisibility = () => {
      if (window.pageYOffset > 300) {
        setScrollToTopVisible(true);
      } else {
        setScrollToTopVisible(false);
      }
    };

    window.addEventListener("scroll", toggleVisibility);
    return () => window.removeEventListener("scroll", toggleVisibility);
  }, []);

  return (
    <AnimatePresence>
      <motion.div 
        className={`fixed right-6 bottom-6 z-50 ${scrollToTopVisible ? 'right-20' : 'right-6'}`}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
        style={{ 
          transition: 'right 0.3s ease-in-out' 
        }}
      >
        <Link to="/menu">
          <Button 
            size="lg"
            className="bg-primary text-white hover:bg-primary/90 shadow-lg"
          >
            Order Now
          </Button>
        </Link>
      </motion.div>
    </AnimatePresence>
  );
};

export default OrderButton;
