
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate, Link } from "react-router-dom";
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
    } else {
      navigate("/auth");
    }
    setIsOpen(false);
  };

  return (
    <>
      {/* Navbar container - fixed to the top */}
      <div className="fixed top-0 left-0 right-0 z-50 p-4 flex items-center justify-between lg:justify-start">
        {/* Left side menu items for larger screens */}
        <div className="hidden lg:flex items-center gap-8">
          {menuItems.slice(0, 2).map((item) => (
            <Link
              key={item.title}
              to={item.href}
              className="text-amber-200 hover:text-amber-100 transition-colors"
            >
              {item.title}
            </Link>
          ))}
        </div>

        {/* Center logo */}
        <div className="lg:flex-1 flex justify-center">
          <Link to="/" className="text-amber-200 font-bold text-2xl font-serif">
            Brew Barn
          </Link>
        </div>

        {/* Right side menu items for larger screens */}
        <div className="hidden lg:flex items-center gap-8">
          {session && menuItems.slice(2).map((item) => (
            <Link
              key={item.title}
              to={item.href}
              className="text-amber-200 hover:text-amber-100 transition-colors"
            >
              {item.title}
            </Link>
          ))}

          <Button 
            variant="secondary"
            size="sm"
            className="bg-amber-700/30 text-amber-200 hover:bg-amber-700/50 backdrop-blur-sm border border-amber-600/20"
            onClick={handleAuth}
          >
            {session ? "Logout" : "Login"}
          </Button>
          
          {session && <CartIcon />}
        </div>

        {/* Mobile hamburger menu toggle button - only visible on small screens */}
        <div className="flex lg:hidden items-center gap-2">
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
                <X className="h-6 w-6 text-amber-200" />
              ) : (
                <Menu className="h-6 w-6 text-amber-200" />
              )}
            </motion.div>
          </motion.button>
        </div>
      </div>

      {/* Mobile menu drawer - only for small screens */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, x: "100%" }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: "100%" }}
            transition={{ duration: 0.4, ease: [0.4, 0, 0.2, 1] }}
            className="fixed inset-y-0 right-0 z-40 w-full max-w-sm bg-accent/95 px-6 py-24 backdrop-blur-sm lg:hidden"
          >
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
