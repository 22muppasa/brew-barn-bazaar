import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";

const Navigation = () => {
  const [isOpen, setIsOpen] = useState(false);

  const menuItems = [
    { title: "Home", href: "/" },
    { title: "Menu", href: "/menu" },
    { title: "About", href: "/about" },
    { title: "Rewards", href: "/rewards" },
    { title: "Contact", href: "/contact" },
  ];

  const menuVariants = {
    closed: {
      opacity: 0,
      x: "100%",
      transition: {
        duration: 0.4,
        ease: [0.4, 0, 0.2, 1],
      },
    },
    open: {
      opacity: 1,
      x: 0,
      transition: {
        duration: 0.4,
        ease: [0.4, 0, 0.2, 1],
      },
    },
  };

  const containerVariants = {
    initial: { opacity: 0 },
    animate: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2,
      },
    },
    exit: {
      opacity: 0,
      transition: {
        staggerChildren: 0.05,
        staggerDirection: -1,
      },
    },
  };

  const itemVariants = {
    initial: { y: 20, opacity: 0 },
    animate: { y: 0, opacity: 1 },
    exit: { y: -20, opacity: 0 },
  };

  return (
    <>
      <motion.button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed right-6 top-6 z-50 rounded-full bg-primary/10 p-3 backdrop-blur-sm transition-all hover:bg-primary/20 hover:scale-105"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        whileTap={{ scale: 0.95 }}
        aria-label="Toggle Menu"
      >
        <motion.div
          animate={{ rotate: isOpen ? 90 : 0 }}
          transition={{ duration: 0.2 }}
        >
          {isOpen ? (
            <X className="h-6 w-6 text-primary-foreground" />
          ) : (
            <Menu className="h-6 w-6 text-primary-foreground" />
          )}
        </motion.div>
      </motion.button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial="closed"
            animate="open"
            exit="closed"
            variants={menuVariants}
            className="fixed inset-y-0 right-0 z-40 w-full max-w-sm bg-accent/95 px-6 py-24 backdrop-blur-sm"
          >
            <motion.nav
              className="flex flex-col items-center space-y-8"
              variants={containerVariants}
              initial="initial"
              animate="animate"
              exit="exit"
            >
              {menuItems.map((item) => (
                <motion.a
                  key={item.title}
                  href={item.href}
                  className="relative text-2xl font-medium text-primary-foreground transition-colors hover:text-primary"
                  variants={itemVariants}
                  whileHover={{ x: 10 }}
                  whileTap={{ scale: 0.95 }}
                >
                  {item.title}
                </motion.a>
              ))}
              <motion.div
                variants={itemVariants}
                className="mt-8 flex flex-col gap-4"
              >
                <Button 
                  variant="secondary"
                  size="lg"
                  className="w-full min-w-[200px]"
                >
                  Sign Up
                </Button>
              </motion.div>
            </motion.nav>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default Navigation;