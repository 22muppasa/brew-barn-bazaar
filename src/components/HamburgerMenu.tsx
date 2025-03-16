
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X, Home, Utensils, ShoppingBag, Award, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate, Link, useLocation } from "react-router-dom";
import { useSession, useSupabaseClient } from "@supabase/auth-helpers-react";
import { toast } from "sonner";
import { useLocalStorage } from "@/hooks/useLocalStorage";
import CartIcon from "./CartIcon";

const HamburgerMenu = () => {
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
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
      <div className="fixed left-4 top-4 z-50 flex items-center gap-4 md:hidden">
        <Link to="/" className="flex items-center">
          <img 
            src="/lovable-uploads/faac9400-50f9-4072-b473-b9879c90fb87.png" 
            alt="The Brew Barn Logo" 
            className="h-10 sm:h-12"
          />
        </Link>
      </div>
      
      <div className="fixed right-4 top-4 z-50 flex items-center gap-2 md:hidden">
        {(session || isGuest) && <CartIcon />}
        <button 
          className="rounded-full bg-white p-2 sm:p-3 shadow-md transition-all hover:bg-secondary/20"
          onClick={() => setIsOpen(!isOpen)}
          aria-label="Menu"
        >
          <motion.div animate={{ rotate: isOpen ? 90 : 0 }}>
            {isOpen ? (
              <X className="h-5 w-5 sm:h-6 sm:w-6 text-foreground" />
            ) : (
              <Menu className="h-5 w-5 sm:h-6 sm:w-6 text-foreground" />
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
              className="fixed inset-y-0 right-0 z-40 w-full max-w-xs bg-white px-6 py-20 shadow-xl md:hidden overflow-y-auto"
              initial={{ opacity: 0, x: "100%" }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: "100%" }}
              transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
            >
              <div className="absolute top-4 left-4">
                <img 
                  src="/lovable-uploads/faac9400-50f9-4072-b473-b9879c90fb87.png" 
                  alt="The Brew Barn Logo" 
                  className="h-12"
                />
              </div>
              <nav className="flex flex-col items-start space-y-6">
                {menuItems.map((item) => (
                  <Link
                    key={item.name}
                    to={item.path}
                    className={`text-xl font-medium transition-colors hover:text-primary flex items-center gap-3 w-full ${
                      location.pathname === item.path ? "text-primary" : "text-foreground"
                    }`}
                    onClick={() => setIsOpen(false)}
                  >
                    <motion.div
                      whileHover={{ x: 10 }}
                      whileTap={{ scale: 0.95 }}
                      className="flex items-center gap-3 w-full"
                    >
                      <item.icon className="h-5 w-5" />
                      {item.name}
                    </motion.div>
                  </Link>
                ))}
                <div className="pt-4 w-full space-y-3">
                  <Button 
                    variant="secondary"
                    size="lg"
                    className="w-full"
                    onClick={handleAuth}
                  >
                    {session ? "Logout" : isGuest ? "Sign In" : "Login"}
                  </Button>
                  {!session && !isGuest && (
                    <Button 
                      variant="outline"
                      size="lg"
                      className="w-full text-foreground border-input hover:bg-secondary/20"
                      onClick={continueAsGuest}
                    >
                      Continue as Guest
                    </Button>
                  )}
                </div>
              </nav>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
};

export default HamburgerMenu;
