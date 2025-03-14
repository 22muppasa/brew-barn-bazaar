
import { useState } from "react";
import { motion } from "framer-motion";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Instagram, Facebook, Twitter } from "lucide-react";
import ScrollToTop from "@/components/ScrollToTop";
import Header from "@/components/Header";
import FeaturedMenu from "@/components/FeaturedMenu";
import VirtualBarista from "@/components/VirtualBarista";
import { useNavigate } from "react-router-dom";
import { useSession } from "@supabase/auth-helpers-react";
import { supabase } from "@/integrations/supabase/client";

const Index = () => {
  const { toast } = useToast();
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const session = useSession();

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const { data, error } = await supabase.functions.invoke('send-welcome-email', {
        body: { email }
      });

      if (error) throw error;

      toast({
        title: "Successfully subscribed!",
        description: "Thank you for joining our newsletter. Check your email for a welcome message!",
      });
      setEmail("");
    } catch (error) {
      console.error('Newsletter subscription error:', error);
      toast({
        title: "Subscription failed",
        description: "There was an error subscribing to the newsletter. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleJoinClick = () => {
    if (!session) {
      navigate("/auth");
    } else {
      navigate("/rewards");
    }
  };

  const fadeInUp = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.5 }
  };

  return (
    <div className="min-h-screen">
      <Header />
      <FeaturedMenu />

      {/* Rewards Section */}
      <section className="section-padding bg-muted">
        <div className="container">
          <motion.div 
            className="grid gap-12 lg:grid-cols-2 lg:items-center"
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
            variants={fadeInUp}
          >
            <div>
              <span className="badge mb-4">Rewards Program</span>
              <h2 className="mb-6 text-4xl font-bold">Earn While You Sip</h2>
              <p className="mb-8 text-lg text-foreground/80">
                Join our rewards program and earn points with every purchase. 
                Redeem them for free drinks, pastries, and exclusive merchandise.
              </p>
              <Button 
                variant="secondary"
                onClick={handleJoinClick}
              >
                {session ? "View Rewards" : "Join Now"}
              </Button>
            </div>
            <div className="relative">
              <img 
                src="https://images.unsplash.com/photo-1495474472287-4d71bcdd2085"
                alt="Rewards"
                className="rounded-lg shadow-lg"
              />
            </div>
          </motion.div>
        </div>
      </section>

      {/* Social Media Section */}
      <section className="section-padding bg-background">
        <div className="container text-center">
          <motion.div
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
            variants={fadeInUp}
          >
            <span className="badge mb-4">Connect With Us</span>
            <h2 className="mb-8 text-4xl font-bold">Follow Our Journey</h2>
            <div className="flex justify-center space-x-6">
              <a href="https://www.instagram.com/brewbarnvh" target="_blank" rel="noopener noreferrer">
                <Button variant="ghost" size="icon">
                  <Instagram className="h-6 w-6" />
                </Button>
              </a>
              <Button variant="ghost" size="icon">
                <Facebook className="h-6 w-6" />
              </Button>
              <Button variant="ghost" size="icon">
                <Twitter className="h-6 w-6" />
              </Button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Newsletter Section */}
      <section className="section-padding bg-accent text-white">
        <div className="container">
          <motion.div 
            className="mx-auto max-w-2xl text-center"
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
            variants={fadeInUp}
          >
            <h2 className="mb-6 text-4xl font-bold">Stay Updated</h2>
            <p className="mb-8 text-white/90">
              Subscribe to our newsletter for exclusive offers and updates
            </p>
            <form onSubmit={handleSubscribe} className="flex gap-4">
              <Input
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="bg-white/10 text-white placeholder:text-white/60"
                required
                disabled={isLoading}
              />
              <Button 
                type="submit" 
                variant="secondary"
                disabled={isLoading}
              >
                {isLoading ? "Subscribing..." : "Subscribe"}
              </Button>
            </form>
          </motion.div>
        </div>
      </section>

      {/* Scroll To Top Button */}
      <ScrollToTop />
    </div>
  );
};

export default Index;
