
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X, Coffee } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate, Link } from "react-router-dom";
import { useSession, useSupabaseClient } from "@supabase/auth-helpers-react";
import { toast } from "sonner";
import CartIcon from "./CartIcon";
import { useLocalStorage } from "@/hooks/useLocalStorage";

const Navigation = () => {
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();
  const session = useSession();
  const supabase = useSupabaseClient();
  const { getValue } = useLocalStorage();
  const isGuest = getValue("isGuest") === "true";

  const menuItems = [
    { title: "Home", href: "/" },
    { title: "Menu", href: "/menu" },
    ...(session ? [
      { title: "Profile", href: "/profile" },
      { title: "Rewards", href: "/rewards" }
    ] : [])
  ];

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
    localStorage.setItem("isGuest", "true");
    toast.success("Continuing as guest");
    navigate("/menu");
    setIsOpen(false);
  };

  return (
    <>
      {/* Desktop Navigation - Only visible on medium screens and up */}
      <motion.nav 
        className="fixed top-0 left-0 z-40 w-full hidden md:block"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="flex items-center justify-between px-6 py-4 backdrop-blur-md bg-white/10">
          <div className="flex items-center space-x-6">
            {menuItems.map((item) => (
              <Link
                key={item.title}
                to={item.href}
                className="text-lg font-medium text-white transition-colors hover:text-primary relative group"
              >
                <span>{item.title}</span>
                <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-primary transition-all duration-300 group-hover:w-full"></span>
              </Link>
            ))}
          </div>
          
          <Link to="/" className="absolute left-1/2 transform -translate-x-1/2 flex items-center space-x-2">
            <Coffee className="h-8 w-8 text-white" />
            <span className="text-xl font-semibold text-white">Brew Barn</span>
          </Link>
          
          <div className="flex items-center space-x-4">
            {(session || isGuest) && <CartIcon />}
            <Button 
              variant="secondary"
              className="hover:bg-secondary/90"
              onClick={handleAuth}
            >
              {session ? "Logout" : isGuest ? "Sign In" : "Login"}
            </Button>
            {!session && !isGuest && (
              <Button 
                variant="outline" 
                className="text-white border-white hover:bg-white/20"
                onClick={continueAsGuest}
              >
                Continue as Guest
              </Button>
            )}
          </div>
        </div>
      </motion.nav>

      {/* Mobile Navigation Button - Only visible on small screens */}
      <div className="fixed right-6 top-6 z-50 flex items-center gap-2 md:hidden">
        {(session || isGuest) && <CartIcon />}
        <motion.button
          onClick={() => setIsOpen(!isOpen)}
          className="rounded-full bg-primary/10 p-3 backdrop-blur-sm transition-all hover:bg-primary/20"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          whileTap={{ scale: 0.95 }}
        >
          <motion.div animate={{ rotate: isOpen ? 90 : 0 }}>
            {isOpen ? (
              <X className="h-6 w-6 text-white" />
            ) : (
              <Menu className="h-6 w-6 text-white" />
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
            className="fixed inset-y-0 right-0 z-40 w-full max-w-sm bg-gradient-to-b from-accent/95 to-primary/90 px-6 py-24 backdrop-blur-sm md:hidden"
          >
            <div className="absolute top-6 left-6">
              <Coffee className="h-8 w-8 text-white" />
            </div>
            <nav className="flex flex-col items-center space-y-8">
              {menuItems.map((item) => (
                <Link
                  key={item.title}
                  to={item.href}
                  className="text-2xl font-medium text-accent-foreground transition-colors hover:text-primary"
                  onClick={() => setIsOpen(false)}
                >
                  <motion.span
                    whileHover={{ x: 10 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    {item.title}
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
                  className="w-full min-w-[200px] text-white border-white hover:bg-white/20"
                  onClick={continueAsGuest}
                >
                  Continue as Guest
                </Button>
              )}
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default Navigation;
