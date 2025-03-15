
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
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
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";

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
  const [currentStep, setCurrentStep] = useState(1);
  const totalSteps = 4;
  
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

  const nextStep = () => {
    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

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

  const renderFormStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <>
            <CardHeader className="text-center border-b pb-4">
              <CardTitle className="text-2xl font-bold text-primary">
                Personal Information
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6 px-8">
              <div className="space-y-6">
                <FormField
                  control={form.control}
                  name="fullName"
                  render={({ field }) => (
                    <FormItem className="mb-4">
                      <FormLabel className="text-base">Full Name</FormLabel>
                      <FormControl>
                        <Input 
                          {...field} 
                          className="h-12 text-base border-muted focus-visible:ring-primary" 
                          placeholder="Enter your full name"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="phoneNumber"
                  render={({ field }) => (
                    <FormItem className="mb-4">
                      <FormLabel className="text-base">Phone Number</FormLabel>
                      <FormControl>
                        <Input 
                          {...field} 
                          type="tel" 
                          className="h-12 text-base border-muted focus-visible:ring-primary" 
                          placeholder="Enter your phone number"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </CardContent>
          </>
        );
      case 2:
        return (
          <>
            <CardHeader className="text-center border-b pb-4">
              <CardTitle className="text-2xl font-bold text-primary">
                Address Information
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6 px-8">
              <div className="space-y-6">
                <FormField
                  control={form.control}
                  name="address"
                  render={({ field }) => (
                    <FormItem className="mb-4">
                      <FormLabel className="text-base">Street Address</FormLabel>
                      <FormControl>
                        <Input 
                          {...field} 
                          className="h-12 text-base border-muted focus-visible:ring-primary" 
                          placeholder="Enter your street address"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <div className="grid grid-cols-2 gap-6">
                  <FormField
                    control={form.control}
                    name="city"
                    render={({ field }) => (
                      <FormItem className="mb-4">
                        <FormLabel className="text-base">City</FormLabel>
                        <FormControl>
                          <Input 
                            {...field} 
                            className="h-12 text-base border-muted focus-visible:ring-primary" 
                            placeholder="Enter your city"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="state"
                    render={({ field }) => (
                      <FormItem className="mb-4">
                        <FormLabel className="text-base">State</FormLabel>
                        <FormControl>
                          <Input 
                            {...field} 
                            className="h-12 text-base border-muted focus-visible:ring-primary" 
                            placeholder="Enter your state"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                
                <FormField
                  control={form.control}
                  name="zipCode"
                  render={({ field }) => (
                    <FormItem className="mb-4">
                      <FormLabel className="text-base">Zip Code</FormLabel>
                      <FormControl>
                        <Input 
                          {...field} 
                          className="h-12 text-base border-muted focus-visible:ring-primary" 
                          placeholder="Enter your zip code"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </CardContent>
          </>
        );
      case 3:
        return (
          <>
            <CardHeader className="text-center border-b pb-4">
              <CardTitle className="text-2xl font-bold text-primary">
                Personal Preferences
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6 px-8">
              <div className="space-y-6">
                <FormField
                  control={form.control}
                  name="birthdate"
                  render={({ field }) => (
                    <FormItem className="mb-4">
                      <FormLabel className="text-base">Birthdate (Optional)</FormLabel>
                      <FormControl>
                        <Input 
                          {...field} 
                          type="date" 
                          className="h-12 text-base border-muted focus-visible:ring-primary" 
                        />
                      </FormControl>
                      <FormDescription className="text-sm text-muted-foreground mt-1">
                        For birthday rewards and special offers
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="favoriteProduct"
                  render={({ field }) => (
                    <FormItem className="mb-4">
                      <FormLabel className="text-base">Favorite Drink (Optional)</FormLabel>
                      <FormControl>
                        <Input 
                          {...field} 
                          className="h-12 text-base border-muted focus-visible:ring-primary" 
                          placeholder="Enter your favorite drink"
                        />
                      </FormControl>
                      <FormDescription className="text-sm text-muted-foreground mt-1">
                        We'll recommend similar drinks you might enjoy
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </CardContent>
          </>
        );
      case 4:
        return (
          <>
            <CardHeader className="text-center border-b pb-4">
              <CardTitle className="text-2xl font-bold text-primary">
                Review & Complete
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6 px-8">
              <div className="space-y-6 bg-secondary/10 p-6 rounded-lg">
                <div className="border-b pb-4">
                  <h3 className="font-medium text-lg text-primary mb-2">Personal Information</h3>
                  <p className="text-foreground"><span className="font-medium">Full Name:</span> {form.getValues("fullName")}</p>
                  <p className="text-foreground"><span className="font-medium">Phone:</span> {form.getValues("phoneNumber")}</p>
                </div>
                
                <div className="border-b pb-4">
                  <h3 className="font-medium text-lg text-primary mb-2">Address</h3>
                  <p className="text-foreground">{form.getValues("address")}</p>
                  <p className="text-foreground">{form.getValues("city")}, {form.getValues("state")} {form.getValues("zipCode")}</p>
                </div>
                
                {form.getValues("birthdate") && (
                  <div className="border-b pb-4">
                    <h3 className="font-medium text-lg text-primary mb-2">Birthdate</h3>
                    <p className="text-foreground">{form.getValues("birthdate")}</p>
                  </div>
                )}
                
                {form.getValues("favoriteProduct") && (
                  <div>
                    <h3 className="font-medium text-lg text-primary mb-2">Favorite Drink</h3>
                    <p className="text-foreground">{form.getValues("favoriteProduct")}</p>
                  </div>
                )}
              </div>
            </CardContent>
          </>
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4 sm:p-8">
      <HamburgerMenu />
      
      <div className="w-full max-w-4xl mb-6">
        <h1 className="text-3xl font-bold text-center text-primary mb-2">Complete Your Profile</h1>
        <p className="text-center text-muted-foreground">Please provide your information to complete your account setup</p>
      </div>
      
      <motion.div 
        className="w-full max-w-4xl"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <Card className="w-full shadow-lg border-muted min-h-[550px] flex flex-col">
              {renderFormStep()}
              
              <CardFooter className="flex flex-col space-y-6 mt-auto p-6 pt-4 border-t">
                {/* Dots for carousel-like pagination */}
                <div className="flex items-center justify-center space-x-2 py-2">
                  {Array.from({ length: totalSteps }).map((_, index) => (
                    <button
                      key={index}
                      type="button"
                      onClick={() => setCurrentStep(index + 1)}
                      className={`w-3 h-3 rounded-full transition-all duration-300 ${
                        currentStep === index + 1
                          ? "bg-primary scale-125"
                          : "bg-muted hover:bg-primary/50"
                      }`}
                      aria-label={`Go to step ${index + 1}`}
                    />
                  ))}
                </div>
                
                <div className="flex justify-between w-full gap-4">
                  {currentStep > 1 ? (
                    <Button 
                      type="button" 
                      variant="outline" 
                      onClick={prevStep}
                      className="w-full h-12 text-base"
                    >
                      Previous
                    </Button>
                  ) : (
                    <div className="w-full"></div>
                  )}
                  
                  {currentStep < totalSteps ? (
                    <Button 
                      type="button" 
                      onClick={nextStep}
                      className="w-full h-12 text-base"
                    >
                      Next
                    </Button>
                  ) : (
                    <Button 
                      type="submit"
                      className="w-full h-12 text-base bg-green-600 hover:bg-green-700 text-white"
                    >
                      Save & Complete
                    </Button>
                  )}
                </div>
              </CardFooter>
            </Card>
          </form>
        </Form>
      </motion.div>
    </div>
  );
};

export default OnboardingPage;
