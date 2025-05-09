
import { Auth } from "@supabase/auth-ui-react";
import { ThemeSupa } from "@supabase/auth-ui-shared";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { toast } from "sonner";
import HamburgerMenu from "@/components/HamburgerMenu";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Form, FormField, FormItem, FormControl } from "@/components/ui/form";
import { useForm } from "react-hook-form";

const AuthPage = () => {
  const navigate = useNavigate();
  const [view, setView] = useState<"sign_in" | "sign_up">("sign_in");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [loading, setLoading] = useState(false);

  const form = useForm({
    defaultValues: {
      terms: false
    }
  });

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

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!termsAccepted) {
      toast.error("You must accept the Terms and Conditions to sign up.");
      return;
    }
    
    setLoading(true);
    
    const { error } = await supabase.auth.signUp({
      email,
      password,
    });
    
    setLoading(false);
    
    if (error) {
      toast.error(error.message);
    } else {
      toast.success("Check your email for the confirmation link!");
    }
  };

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    
    setLoading(true);
    
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    
    setLoading(false);
    
    if (error) {
      toast.error(error.message);
    }
  };

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
          
          {/* Custom Auth UI */}
          <div className="space-y-4">
            <div className="flex border-b mb-4">
              <button 
                className={`pb-2 px-4 ${view === "sign_in" ? "border-b-2 border-primary" : ""}`}
                onClick={() => setView("sign_in")}
              >
                Sign In
              </button>
              <button 
                className={`pb-2 px-4 ${view === "sign_up" ? "border-b-2 border-primary" : ""}`}
                onClick={() => setView("sign_up")}
              >
                Sign Up
              </button>
            </div>
            
            {view === "sign_in" ? (
              <form onSubmit={handleSignIn} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="w-full p-2 border rounded"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="w-full p-2 border rounded"
                  />
                </div>
                
                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? "Signing In..." : "Sign In"}
                </Button>
              </form>
            ) : (
              <form onSubmit={handleSignUp} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="signup-email">Email</Label>
                  <input
                    id="signup-email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="w-full p-2 border rounded"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="signup-password">Password</Label>
                  <input
                    id="signup-password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="w-full p-2 border rounded"
                    minLength={6}
                  />
                </div>
                
                <div className="flex items-center space-x-2">
                  <Checkbox 
                    id="terms" 
                    checked={termsAccepted}
                    onCheckedChange={(checked) => 
                      setTermsAccepted(checked === true)
                    }
                  />
                  <Label 
                    htmlFor="terms"
                    className="text-sm text-muted-foreground"
                  >
                    I agree to the Terms and Conditions and Privacy Policy
                  </Label>
                </div>
                
                <Button type="submit" className="w-full" disabled={loading || !termsAccepted}>
                  {loading ? "Signing Up..." : "Sign Up"}
                </Button>
              </form>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default AuthPage;
