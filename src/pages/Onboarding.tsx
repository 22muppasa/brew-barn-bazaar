import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
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
import { ChevronLeft, ChevronRight, Check, Coffee } from "lucide-react";

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
  const [isSubmitting, setIsSubmitting] = useState(false);
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
      setIsSubmitting(true);
      
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
      
      // Simulate a delay for the loading animation
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      toast.success("Profile information saved!");
      navigate("/");
    } catch (error: any) {
      setIsSubmitting(false);
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
  
  // Loading screen component
  const LoadingScreen = () => (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-background/95 backdrop-blur-sm"
    >
      <motion.div
        animate={{ 
          scale: [1, 1.1, 1],
          rotate: [0, 10, -10, 0]
        }}
        transition={{ 
          duration: 2,
          repeat: Infinity,
          ease: "easeInOut"
        }}
        className="mb-8"
      >
        <Coffee className="h-20 w-20 text-primary" />
      </motion.div>
      
      <motion.h2 
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="text-2xl font-bold mb-4 text-primary"
      >
        Setting Up Your Profile
      </motion.h2>
      
      <div className="relative w-64 h-2 bg-primary/20 rounded-full overflow-hidden">
        <motion.div 
          className="absolute top-0 left-0 h-full bg-primary"
          initial={{ width: "0%" }}
          animate={{ width: "100%" }}
          transition={{ duration: 1.5, ease: "easeInOut" }}
        />
      </div>
      
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="mt-8 text-muted-foreground text-center max-w-md"
      >
        <p>We're preparing your personalized experience</p>
        <p className="text-sm mt-2">You'll be redirected to the home page shortly</p>
      </motion.div>
    </motion.div>
  );

  return (
    <div className="min-h-screen bg-background bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgdmlld0JveD0iMCAwIDYwIDYwIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiM4MDAwMDAiIGZpbGwtb3BhY2l0eT0iMC4wMyI+PHBhdGggZD0iTTM2IDM0djZoLTZ2LTZoLTZ2LTZoNnYtNmg2djZoNnY2aC02eiIvPjwvZz48L2c+PC9zdmc+')] flex flex-col items-center justify-center p-4 sm:p-8">
      <AnimatePresence>
        {isSubmitting && <LoadingScreen />}
      </AnimatePresence>
      
      <HamburgerMenu />
      
      <div className="w-full max-w-3xl mb-6">
        <motion.h1 
          className="text-4xl font-bold text-center text-primary mb-2"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
        >
          Complete Your Profile
        </motion.h1>
        <motion.p 
          className="text-center text-muted-foreground"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          Please provide your information to complete your account setup
        </motion.p>
      </div>
      
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8 w-full max-w-3xl">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            className="w-full"
          >
            <Card className="w-full shadow-xl border-muted min-h-[500px] flex flex-col overflow-hidden rounded-3xl bg-card/95 backdrop-blur-sm border">
              <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-primary/10 to-accent/10 rounded-bl-full" />
              <div className="absolute bottom-0 left-0 w-24 h-24 bg-gradient-to-tr from-secondary/20 to-primary/5 rounded-tr-full" />
              
              <AnimatePresence mode="wait">
                <motion.div
                  key={currentStep}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.3 }}
                  className="flex-1 flex flex-col"
                >
                  {renderFormStep()}
                </motion.div>
              </AnimatePresence>
            </Card>
          </motion.div>
          
          <motion.div 
            className="flex items-center justify-center space-y-0 mt-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <div className="flex items-center justify-center gap-4 w-full">
              {/* Previous Button */}
              {currentStep > 1 ? (
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Button 
                    type="button" 
                    variant="pagination" 
                    size="circle"
                    onClick={prevStep}
                    className="shadow-md hover:shadow-lg border border-muted relative overflow-hidden group"
                    disabled={isSubmitting}
                  >
                    <span className="absolute inset-0 bg-gradient-to-tr from-primary/5 to-accent/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    <ChevronLeft className="h-5 w-5" />
                  </Button>
                </motion.div>
              ) : (
                <div className="w-12 h-12"></div> /* Spacer for alignment */
              )}
              
              {/* Dots for carousel-like pagination */}
              <div className="flex items-center justify-center space-x-3 px-8">
                {Array.from({ length: totalSteps }).map((_, index) => (
                  <motion.button
                    key={index}
                    type="button"
                    onClick={() => !isSubmitting && setCurrentStep(index + 1)}
                    className={`w-3.5 h-3.5 rounded-full transition-all duration-300 border ${
                      currentStep === index + 1
                        ? "bg-primary border-primary scale-125"
                        : "bg-muted/50 border-muted hover:bg-primary/50"
                    }`}
                    whileHover={{ scale: 1.2 }}
                    whileTap={{ scale: 0.9 }}
                    aria-label={`Go to step ${index + 1}`}
                    disabled={isSubmitting}
                  />
                ))}
              </div>
              
              {/* Next/Submit Button */}
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                {currentStep < totalSteps ? (
                  <Button 
                    type="button" 
                    variant="pagination"
                    size="circle"
                    onClick={nextStep}
                    className="shadow-md hover:shadow-lg border border-muted relative overflow-hidden group"
                    disabled={isSubmitting}
                  >
                    <span className="absolute inset-0 bg-gradient-to-tr from-primary/5 to-accent/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    <ChevronRight className="h-5 w-5" />
                  </Button>
                ) : (
                  <Button 
                    type="submit"
                    size="circle"
                    className="bg-green-600 hover:bg-green-700 text-white shadow-md hover:shadow-lg relative overflow-hidden group"
                    disabled={isSubmitting}
                  >
                    <span className="absolute inset-0 bg-gradient-to-tr from-green-500/20 to-green-600/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    {isSubmitting ? (
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                        className="h-5 w-5 border-2 border-white border-t-transparent rounded-full"
                      />
                    ) : (
                      <Check className="h-5 w-5" />
                    )}
                  </Button>
                )}
              </motion.div>
            </div>
          </motion.div>
        </form>
      </Form>
    </div>
  );
};

export default OnboardingPage;
