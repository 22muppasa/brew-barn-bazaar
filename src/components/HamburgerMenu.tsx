
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X, Coffee, ShoppingBag, User, Home, Utensils, Award, LogIn } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate, Link } from "react-router-dom";
import { useSession, useSupabaseClient } from "@supabase/auth-helpers-react";
import { toast } from "sonner";
import { useLocalStorage } from "@/hooks/useLocalStorage";

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
      <button 
        className="btn-hamburger"
        onClick={() => setIsOpen(!isOpen)}
        aria-label="Menu"
      >
        {isOpen ? (
          <X className="h-6 w-6 text-primary" />
        ) : (
          <Menu className="h-6 w-6 text-primary" />
        )}
      </button>

      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div
              className="hamburger-overlay"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
            />
            
            <motion.div
              className="hamburger-menu"
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 25 }}
            >
              <div className="p-6 flex flex-col h-full">
                <div className="flex items-center gap-3 mb-8">
                  <Coffee className="h-8 w-8 text-primary" />
                  <span className="text-xl font-bold">Brew Barn</span>
                </div>

                <nav className="flex-1">
                  <ul className="space-y-4">
                    {menuItems.map((item) => (
                      <li key={item.name}>
                        <Link 
                          to={item.path} 
                          className="flex items-center gap-3 p-3 rounded-md hover:bg-secondary/50 transition-colors"
                          onClick={() => setIsOpen(false)}
                        >
                          <item.icon className="h-5 w-5 text-primary" />
                          <span>{item.name}</span>
                        </Link>
                      </li>
                    ))}
                  </ul>
                </nav>

                <div className="mt-auto pt-6 border-t border-muted space-y-4">
                  {session ? (
                    <Button
                      variant="outline"
                      className="w-full justify-start"
                      onClick={handleAuth}
                    >
                      <LogIn className="h-5 w-5 mr-2" />
                      Sign Out
                    </Button>
                  ) : (
                    <>
                      <Button
                        variant="default"
                        className="w-full justify-start"
                        onClick={handleAuth}
                      >
                        <LogIn className="h-5 w-5 mr-2" />
                        Sign In
                      </Button>
                      
                      {!isGuest && (
                        <Button
                          variant="outline"
                          className="w-full justify-start"
                          onClick={continueAsGuest}
                        >
                          <User className="h-5 w-5 mr-2" />
                          Continue as Guest
                        </Button>
                      )}
                    </>
                  )}
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
};

export default HamburgerMenu;
