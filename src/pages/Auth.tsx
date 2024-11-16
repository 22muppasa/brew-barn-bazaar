import { Auth } from "@supabase/auth-ui-react";
import { ThemeSupa } from "@supabase/auth-ui-shared";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { motion } from "framer-motion";
import { toast } from "sonner";
import type { Session } from "@supabase/supabase-js";

const AuthPage = () => {
  const navigate = useNavigate();

  useEffect(() => {
    // Listen for auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log("Auth state changed:", event, session?.user?.email);
      
      if (event === "SIGNED_IN" || event === "SIGNED_UP") {
        try {
          const { error } = await supabase.functions.invoke('send-auth-email', {
            body: { 
              email: session?.user?.email,
              type: event === "SIGNED_UP" ? "signup" : "signin"
            },
          });
          
          if (error) {
            console.error('Error sending auth email:', error);
            toast.error('Failed to send welcome email');
          } else {
            toast.success('Welcome email sent successfully!');
          }
        } catch (error) {
          console.error('Error invoking auth email function:', error);
          toast.error('Failed to send welcome email');
        }
        
        navigate("/");
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [navigate]);

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
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