
import { Auth } from "@supabase/auth-ui-react";
import { ThemeSupa } from "@supabase/auth-ui-shared";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { toast } from "sonner";
import HamburgerMenu from "@/components/HamburgerMenu";

const AuthPage = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === "SIGNED_IN") {
        if (!session?.user?.user_metadata?.profile_completed) {
          navigate("/onboarding");
          toast.success("Successfully signed in! Please complete your profile.");
        } else {
          navigate("/");
          toast.success("Successfully signed in!");
        }
      }
      if (event === "SIGNED_OUT") {
        toast.success("Successfully signed out!");
      }
      if (event === "PASSWORD_RECOVERY") {
        toast.info("Password recovery email sent");
      }
      if (event === "USER_UPDATED" && !session?.user.email_confirmed_at) {
        toast.error("This email is already registered. Please sign in instead.");
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [navigate]);

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <HamburgerMenu />
      
      <motion.div 
        className="w-full max-w-md"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="bg-card rounded-lg shadow-lg p-6">
          <h1 className="text-3xl font-bold text-center mb-6">Welcome to Brew Barn</h1>
          <Auth
            supabaseClient={supabase}
            appearance={{
              theme: ThemeSupa,
              variables: {
                default: {
                  colors: {
                    brand: '#7c3aed',
                    brandAccent: '#6d28d9',
                  },
                },
              },
            }}
            providers={[]}
          />
        </div>
      </motion.div>
    </div>
  );
};

export default AuthPage;
