
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import HamburgerMenu from "@/components/HamburgerMenu";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { 
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage 
} from "@/components/ui/form";
import * as z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

const profileSchema = z.object({
  fullName: z.string().min(2, "Full name must be at least 2 characters"),
  address: z.string().min(5, "Address must be at least 5 characters"),
  city: z.string().min(2, "City must be at least 2 characters"),
  state: z.string().min(2, "State must be at least 2 characters"),
  zipCode: z.string().min(5, "Zip code must be at least 5 characters"),
  phoneNumber: z.string().min(10, "Phone number must be at least 10 characters"),
  birthdate: z.string().optional(),
  favoriteProduct: z.string().optional()
});

type ProfileFormValues = z.infer<typeof profileSchema>;

const OnboardingPage = () => {
  const navigate = useNavigate();
  
  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      fullName: "",
      address: "",
      city: "",
      state: "",
      zipCode: "",
      phoneNumber: "",
      birthdate: "",
      favoriteProduct: ""
    }
  });

  useEffect(() => {
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        navigate("/auth");
      }
    };
    
    checkSession();
  }, [navigate]);

  const onSubmit = async (values: ProfileFormValues) => {
    try {
      // Update auth user metadata
      const { error: authError } = await supabase.auth.updateUser({
        data: { 
          address: values.address,
          city: values.city,
          state: values.state,
          zip_code: values.zipCode,
          phone_number: values.phoneNumber,
          birthdate: values.birthdate,
          favorite_product: values.favoriteProduct,
          profile_completed: true
        }
      });
      
      if (authError) throw authError;
      
      // Update profiles table
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        const { error: profileError } = await supabase
          .from("profiles")
          .update({ 
            full_name: values.fullName,
            phone_number: values.phoneNumber,
            address: values.address,
            city: values.city,
            state: values.state,
            zip_code: values.zipCode,
            birthdate: values.birthdate,
            favorite_product: values.favoriteProduct
          })
          .eq("id", session.user.id);
        
        if (profileError) throw profileError;
      }
      
      toast.success("Profile information saved!");
      navigate("/profile");
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
          <h1 className="text-3xl font-bold text-center mb-6">
            Complete Your Profile
          </h1>
          <p className="text-muted-foreground text-center mb-6">
            Please provide your details to complete the registration process.
          </p>
          
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="fullName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Full Name</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="address"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Address</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="city"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>City</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="state"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>State</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="zipCode"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Zip Code</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="phoneNumber"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Phone Number</FormLabel>
                      <FormControl>
                        <Input {...field} type="tel" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="birthdate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Birthdate (Optional)</FormLabel>
                      <FormControl>
                        <Input {...field} type="date" />
                      </FormControl>
                      <FormDescription>
                        For birthday rewards
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="favoriteProduct"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Favorite Drink (Optional)</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              <Button type="submit" className="w-full">
                Complete Profile
              </Button>
            </form>
          </Form>
        </div>
      </motion.div>
    </div>
  );
};

export default OnboardingPage;
