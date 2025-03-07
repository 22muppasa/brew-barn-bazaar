
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import Navigation from "./Navigation";
import { Link } from "react-router-dom";
import { useSession } from "@supabase/auth-helpers-react";

const Header = () => {
  const session = useSession();

  return (
    <motion.header 
      className="relative flex h-screen items-center justify-center overflow-hidden"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 1 }}
    >
      <iframe 
        className="absolute"
        style={{
          top: "50%",
          left: "50%",
          width: "120%",
          height: "120%",
          transform: "translate(-50%, -50%) scale(1.2)",
        }}
        src="https://player.vimeo.com/video/1062622357?h=616a82d686&badge=0&autopause=0&player_id=0&app_id=58479&background=1&autoplay=1&loop=1&muted=1"
        frameBorder="0"
        allow="autoplay; fullscreen; picture-in-picture; clipboard-write; encrypted-media"
        allowFullScreen
      />
      
      {/* Blur and sepia overlay */}
      <div 
        className="absolute inset-0 bg-amber-900/50 backdrop-blur-sm z-[1]"
        style={{ 
          mixBlendMode: "multiply",
          backgroundImage: "linear-gradient(to bottom, rgba(139, 69, 19, 0.3), rgba(165, 115, 67, 0.5))"
        }}
      />

      {/* Grain texture overlay - now with increased opacity and double layering for more noise */}
      <div 
        className="absolute inset-0 z-[2] opacity-40 pointer-events-none"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
          mixBlendMode: "multiply"
        }}
      />
      
      {/* Second grain layer for more intensity */}
      <div 
        className="absolute inset-0 z-[2] opacity-20 pointer-events-none"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 100 100' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.4' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
          mixBlendMode: "overlay"
        }}
      />

      <Navigation />
      <motion.div 
        className="relative z-10 text-center"
        initial={{ y: 50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.5, duration: 0.8 }}
      >
        <h1 className="mb-6 text-7xl font-bold text-amber-200 sm:text-8xl lg:text-9xl">
          The Brew Barn
        </h1>
        <p className="mb-8 text-xl text-amber-100/90">
          Artisanal coffee & community
        </p>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1, duration: 0.5 }}
          className="flex flex-col sm:flex-row gap-4 justify-center items-center"
        >
          <Link to="/menu">
            <Button 
              size="lg"
              className="bg-amber-700 text-amber-100 hover:bg-amber-800 border border-amber-600"
            >
              Explore Menu
            </Button>
          </Link>
          <Link to={session ? "/rewards" : "/auth"}>
            <Button 
              size="lg"
              variant="outline"
              className="border-amber-400 text-amber-200 hover:bg-amber-800/30"
            >
              {session ? "View Rewards" : "Join Now"}
            </Button>
          </Link>
        </motion.div>
      </motion.div>
      <motion.div 
        className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.5, duration: 0.5 }}
      >
        <div className="animate-bounce text-amber-200">
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
  );
};

export default Header;
