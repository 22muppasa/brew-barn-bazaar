import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { useSession, useSupabaseClient } from "@supabase/auth-helpers-react";
import { toast } from "sonner";
import CartIcon from "./CartIcon";

const Navigation = () => {
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();
  const session = useSession();
  const supabase = useSupabaseClient();

  const menuItems = [
    { title: "Home", href: "/" },
    { title: "Menu", href: "/menu" },
    { title: "About", href: "/about" },
    { title: "Contact", href: "/contact" },
    ...(session ? [
      { title: "Profile", href: "/profile" },
      { title: "Rewards", href: "/rewards" }
    ] : [])
  ];

  const handleAuth = async () => {
    if (session) {
      await supabase.auth.signOut();
      toast.success("Successfully logged out");
    } else {
      navigate("/auth");
    }
    setIsOpen(false);
  };

  return (
    <>
      <div className="fixed right-6 top-6 z-50 flex items-center gap-2">
        {session && <CartIcon />}
        <motion.button
          onClick={() => setIsOpen(!isOpen)}
          className="rounded-full bg-primary/10 p-3 backdrop-blur-sm transition-all hover:bg-primary/20"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          whileTap={{ scale: 0.95 }}
        >
          <motion.div animate={{ rotate: isOpen ? 90 : 0 }}>
            {isOpen ? (
              <X className="h-6 w-6 text-primary-foreground" />
            ) : (
              <Menu className="h-6 w-6 text-primary-foreground" />
            )}
          </motion.div>
        </motion.button>
      </div>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, x: "100%" }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: "100%" }}
            transition={{ duration: 0.4, ease: [0.4, 0, 0.2, 1] }}
            className="fixed inset-y-0 right-0 z-40 w-full max-w-sm bg-accent/95 px-6 py-24 backdrop-blur-sm"
          >
            <nav className="flex flex-col items-center space-y-8">
              {menuItems.map((item) => (
                <motion.a
                  key={item.title}
                  href={item.href}
                  className="text-2xl font-medium text-primary-foreground transition-colors hover:text-primary"
                  whileHover={{ x: 10 }}
                  whileTap={{ scale: 0.95 }}
                >
                  {item.title}
                </motion.a>
              ))}
              <Button 
                variant="secondary"
                size="lg"
                className="w-full min-w-[200px]"
                onClick={handleAuth}
              >
                {session ? "Logout" : "Login"}
              </Button>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default Navigation;