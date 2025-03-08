
import { Auth } from "@supabase/auth-ui-react";
import { ThemeSupa } from "@supabase/auth-ui-shared";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import HamburgerMenu from "@/components/HamburgerMenu";

const AuthPage = () => {
  const navigate = useNavigate();
  const [showProfileForm, setShowProfileForm] = useState(false);
  const [formData, setFormData] = useState({
    fullName: "",
    address: "",
    city: "",
    state: "",
    zipCode: "",
    phoneNumber: ""
  });

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === "SIGNED_IN") {
        if (!session?.user?.user_metadata?.profile_completed) {
          setShowProfileForm(true);
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

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmitProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const { error } = await supabase.auth.updateUser({
        data: { 
          ...formData,
          profile_completed: true
        }
      });
      
      if (error) throw error;
      
      toast.success("Profile information saved!");
      navigate("/");
    } catch (error: any) {
      toast.error(error.message || "An error occurred while saving your profile");
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
          {showProfileForm ? (
            <>
              <h1 className="text-3xl font-bold text-center mb-6">Complete Your Profile</h1>
              <p className="text-muted-foreground text-center mb-6">
                Please provide your details to complete the registration process.
              </p>
              
              <form onSubmit={handleSubmitProfile} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="fullName">Full Name</Label>
                  <input
                    id="fullName"
                    name="fullName"
                    type="text"
                    value={formData.fullName}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="address">Address</Label>
                  <input
                    id="address"
                    name="address"
                    type="text"
                    value={formData.address}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                    required
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="city">City</Label>
                    <input
                      id="city"
                      name="city"
                      type="text"
                      value={formData.city}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                      required
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="state">State</Label>
                    <input
                      id="state"
                      name="state"
                      type="text"
                      value={formData.state}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                      required
                    />
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="zipCode">Zip Code</Label>
                    <input
                      id="zipCode"
                      name="zipCode"
                      type="text"
                      value={formData.zipCode}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                      required
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="phoneNumber">Phone Number</Label>
                    <input
                      id="phoneNumber"
                      name="phoneNumber"
                      type="tel"
                      value={formData.phoneNumber}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                      required
                    />
                  </div>
                </div>
                
                <Button type="submit" className="w-full">
                  Save Profile Information
                </Button>
              </form>
            </>
          ) : (
            <>
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
            </>
          )}
        </div>
      </motion.div>
    </div>
  );
};

export default AuthPage;
