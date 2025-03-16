
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X, Coffee, ShoppingBag, User, Home, Utensils, Award, LogIn } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate, Link } from "react-router-dom";
import { useSession, useSupabaseClient } from "@supabase/auth-helpers-react";
import { toast } from "sonner";
import { useLocalStorage } from "@/hooks/useLocalStorage";
import CartIcon from "./CartIcon";

const HamburgerMenu = () => {
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();
  const session = useSession();
  const supabase = useSupabaseClient();
  const { getValue, setValue } = useLocalStorage();
  const isGuest = getValue("isGuest") === "true";

  const handleAuth = async () => {
    if (session) {
      await supabase.auth.signOut();
      toast.success("Successfully logged out");
      navigate("/");
    } else if (isGuest) {
      localStorage.removeItem("isGuest");
      localStorage.removeItem("guestCart");
      toast.success("Guest session ended");
      navigate("/auth");
    } else {
      navigate("/auth");
    }
    setIsOpen(false);
  };

  const continueAsGuest = () => {
    setValue("isGuest", "true");
    toast.success("Continuing as guest");
    navigate("/menu");
    setIsOpen(false);
  };

  const menuItems = [
    { name: "Home", icon: Home, path: "/" },
    { name: "Menu", icon: Utensils, path: "/menu" },
    { name: "Cart", icon: ShoppingBag, path: "/cart" },
  ];

  if (session) {
    menuItems.push(
      { name: "Rewards", icon: Award, path: "/rewards" },
      { name: "Profile", icon: User, path: "/profile" }
    );
  }

  return (
    <>
      <div className="fixed left-6 top-6 z-50 flex items-center gap-4 md:hidden">
        <Link to="/" className="flex items-center">
          <img 
            src="/lovable-uploads/faac9400-50f9-4072-b473-b9879c90fb87.png" 
            alt="The Brew Barn Logo" 
            className="h-12"
          />
        </Link>
      </div>
      
      <div className="fixed right-6 top-6 z-50 flex items-center gap-4 md:hidden">
        {(session || isGuest) && <CartIcon />}
        <button 
          className="rounded-full bg-white p-3 shadow-md transition-all hover:bg-secondary/20"
          onClick={() => setIsOpen(!isOpen)}
          aria-label="Menu"
        >
          <motion.div animate={{ rotate: isOpen ? 90 : 0 }}>
            {isOpen ? (
              <X className="h-6 w-6 text-foreground" />
            ) : (
              <Menu className="h-6 w-6 text-foreground" />
            )}
          </motion.div>
        </button>
      </div>

      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div
              className="fixed inset-0 bg-black/80 backdrop-blur-sm z-40 md:hidden"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
            />
            
            <motion.div
              className="fixed inset-y-0 right-0 z-40 w-full max-w-sm bg-white px-6 py-24 shadow-xl md:hidden"
              initial={{ opacity: 0, x: "100%" }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: "100%" }}
              transition={{ duration: 0.4, ease: [0.4, 0, 0.2, 1] }}
            >
              <div className="absolute top-6 left-6">
                <img 
                  src="/lovable-uploads/faac9400-50f9-4072-b473-b9879c90fb87.png" 
                  alt="The Brew Barn Logo" 
                  className="h-14"
                />
              </div>
              <nav className="flex flex-col items-center space-y-8">
                {menuItems.map((item) => (
                  <Link
                    key={item.name}
                    to={item.path}
                    className="text-2xl font-medium text-foreground transition-colors hover:text-primary"
                    onClick={() => setIsOpen(false)}
                  >
                    <motion.span
                      whileHover={{ x: 10 }}
                      whileTap={{ scale: 0.95 }}
                      className="flex items-center gap-3"
                    >
                      <item.icon className="h-6 w-6" />
                      {item.name}
                    </motion.span>
                  </Link>
                ))}
                <Button 
                  variant="secondary"
                  size="lg"
                  className="w-full min-w-[200px]"
                  onClick={handleAuth}
                >
                  {session ? "Logout" : isGuest ? "Sign In" : "Login"}
                </Button>
                {!session && !isGuest && (
                  <Button 
                    variant="outline"
                    size="lg"
                    className="w-full min-w-[200px] text-foreground border-input hover:bg-secondary/20"
                    onClick={continueAsGuest}
                  >
                    Continue as Guest
                  </Button>
                )}
              </nav>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
};

export default HamburgerMenu;
