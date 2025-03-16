
import { useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { useNavigate, Link } from "react-router-dom";
import { useSession, useSupabaseClient } from "@supabase/auth-helpers-react";
import { toast } from "sonner";
import CartIcon from "./CartIcon";
import { useLocalStorage } from "@/hooks/useLocalStorage";
import HamburgerMenu from "./HamburgerMenu";

const Navigation = () => {
  const navigate = useNavigate();
  const session = useSession();
  const supabase = useSupabaseClient();
  const { getValue } = useLocalStorage();
  const isGuest = getValue("isGuest") === "true";

  const leftMenuItems = [
    { title: "home", href: "/" },
    { title: "menu", href: "/menu" },
  ];

  const rightMenuItems = [
    ...(session ? [
      { title: "profile", href: "/profile" },
      { title: "rewards", href: "/rewards" }
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
  };

  const continueAsGuest = () => {
    localStorage.setItem("isGuest", "true");
    toast.success("Continuing as guest");
    navigate("/menu");
  };

  return (
    <>
      {/* Mobile Navigation - Only visible on small screens */}
      <div className="md:hidden">
        <HamburgerMenu />
      </div>

      {/* Desktop Navigation - Only visible on medium screens and up */}
      <motion.nav 
        className="fixed top-0 left-0 z-40 w-full hidden md:block"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="flex items-center justify-between px-4 sm:px-6 py-4 mx-4 sm:mx-6 my-4 bg-white rounded-xl shadow-sm">
          {/* Left Menu Items */}
          <div className="flex items-center space-x-4 lg:space-x-8">
            {leftMenuItems.map((item) => (
              <Link
                key={item.title}
                to={item.href}
                className="nav-link group"
              >
                <span>{item.title}</span>
                <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-primary transition-all duration-300 group-hover:w-full"></span>
              </Link>
            ))}
          </div>
          
          {/* Center Logo */}
          <Link to="/" className="absolute left-1/2 transform -translate-x-1/2 flex items-center">
            <img 
              src="/lovable-uploads/faac9400-50f9-4072-b473-b9879c90fb87.png" 
              alt="The Brew Barn Logo" 
              className="h-12 md:h-14 lg:h-16"
            />
          </Link>
          
          {/* Right Menu Items */}
          <div className="flex items-center space-x-3 lg:space-x-6">
            {rightMenuItems.map((item) => (
              <Link
                key={item.title}
                to={item.href}
                className="nav-link group"
              >
                <span>{item.title}</span>
                <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-primary transition-all duration-300 group-hover:w-full"></span>
              </Link>
            ))}
            
            {(session || isGuest) && <CartIcon />}
            <Button 
              variant="secondary"
              className="hover:bg-secondary/90 text-sm lg:text-base"
              onClick={handleAuth}
            >
              {session ? "Logout" : isGuest ? "Sign In" : "Login"}
            </Button>
            {!session && !isGuest && (
              <Button 
                variant="outline" 
                className="text-foreground border-input hover:bg-secondary/20 text-sm lg:text-base hidden sm:inline-flex"
                onClick={continueAsGuest}
              >
                Continue as Guest
              </Button>
            )}
          </div>
        </div>
      </motion.nav>
    </>
  );
};

export default Navigation;
