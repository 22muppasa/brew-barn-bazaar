import { useState } from "react";
import { motion } from "framer-motion";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Instagram, Facebook, Twitter } from "lucide-react";
import ScrollToTop from "@/components/ScrollToTop";
import Header from "@/components/Header";
import FeaturedMenu from "@/components/FeaturedMenu";

const Index = () => {
  const { toast } = useToast();
  const [email, setEmail] = useState("");

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    toast({
      title: "Successfully subscribed!",
      description: "Thank you for joining our newsletter.",
    });
    setEmail("");
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
              <Button variant="secondary">Join Now</Button>
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
              <Button variant="ghost" size="icon">
                <Instagram className="h-6 w-6" />
              </Button>
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
              />
              <Button type="submit" variant="secondary">
                Subscribe
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
