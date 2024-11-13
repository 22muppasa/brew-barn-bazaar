import { useState } from "react";
import { motion } from "framer-motion";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Instagram, Facebook, Twitter } from "lucide-react";
import ScrollToTop from "@/components/ScrollToTop";

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
      {/* Full-screen Header */}
      <motion.header 
        className="relative flex h-screen items-center justify-center overflow-hidden bg-accent"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1 }}
      >
        <div className="absolute inset-0 bg-gradient-to-r from-accent to-accent/90" />
        <motion.div 
          className="relative z-10 text-center"
          initial={{ y: 50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.5, duration: 0.8 }}
        >
          <h1 className="mb-6 text-7xl font-bold text-white sm:text-8xl lg:text-9xl">
            The Brew Barn
          </h1>
          <p className="mb-8 text-xl text-white/90">
            Artisanal coffee & community
          </p>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1, duration: 0.5 }}
          >
            <Button 
              size="lg"
              className="bg-primary text-white hover:bg-primary/90"
            >
              Explore Menu
            </Button>
          </motion.div>
        </motion.div>
        <motion.div 
          className="absolute bottom-8 left-1/2 -translate-x-1/2"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.5, duration: 0.5 }}
        >
          <div className="animate-bounce text-white">
            <svg 
              className="h-6 w-6"
              fill="none"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path d="M19 14l-7 7m0 0l-7-7m7 7V3"></path>
            </svg>
          </div>
        </motion.div>
      </motion.header>

      {/* Hero Section */}
      <section className="hero-section">
        <div className="absolute inset-0 bg-gradient-to-r from-accent to-accent/90" />
        <div className="relative flex min-h-[80vh] items-center justify-center text-center">
          <motion.div 
            className="max-w-3xl px-4"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <span className="badge mb-4">Now Open in Downtown</span>
            <h2 className="mb-6 text-5xl font-bold text-white sm:text-6xl lg:text-7xl">
              Welcome to The Brew Barn
            </h2>
            <p className="mb-8 text-lg text-white/90">
              Artisanal coffee, freshly baked goods, and a warm community space
            </p>
            <Button 
              size="lg"
              className="bg-primary text-white hover:bg-primary/90"
            >
              View Menu
            </Button>
          </motion.div>
        </div>
      </section>

      {/* Featured Menu Section */}
      <section className="section-padding bg-background">
        <div className="container">
          <motion.div 
            className="text-center"
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
            variants={fadeInUp}
          >
            <span className="badge mb-4">Seasonal Specials</span>
            <h2 className="mb-12 text-4xl font-bold">Fall Favorites</h2>
          </motion.div>
          
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {[
              {
                title: "Pumpkin Spice Latte",
                price: "$5.99",
                image: "https://images.unsplash.com/photo-1506619216599-9d16d0903dfd"
              },
              {
                title: "Maple Pecan Cold Brew",
                price: "$4.99",
                image: "https://images.unsplash.com/photo-1461023058943-07fcbe16d735"
              },
              {
                title: "Cinnamon Roll",
                price: "$3.99",
                image: "https://images.unsplash.com/photo-1509365465985-25d11c17e812"
              }
            ].map((item, index) => (
              <motion.div
                key={index}
                className="menu-card"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                viewport={{ once: true }}
              >
                <div className="menu-image">
                  <img src={item.image} alt={item.title} />
                </div>
                <div className="mt-4">
                  <h3 className="text-xl font-semibold">{item.title}</h3>
                  <p className="mt-2 text-primary">{item.price}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

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
