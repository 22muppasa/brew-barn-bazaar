
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import Navigation from "./Navigation";
import { Link } from "react-router-dom";
import { useSession } from "@supabase/auth-helpers-react";
import { useLocalStorage } from "@/hooks/useLocalStorage";

const Header = () => {
  const session = useSession();
  const { getValue, setValue } = useLocalStorage();
  const isGuest = getValue("isGuest") === "true";

  const continueAsGuest = () => {
    setValue("isGuest", "true");
    window.location.href = "/menu";
  };

  return (
    <motion.header 
      className="relative flex h-screen items-center justify-center overflow-hidden"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 1 }}
    >
      <div className="absolute inset-0 bg-black/50 z-0"></div>
      <svg className="absolute top-0 left-0 w-full h-full z-10 opacity-30 pointer-events-none">
        <filter id="grain">
          <feTurbulence baseFrequency="0.8" numOctaves="3" stitchTiles="stitch" type="fractalNoise"></feTurbulence>
          <feColorMatrix type="saturate" values="0"></feColorMatrix>
        </filter>
        <rect width="100%" height="100%" filter="url(#grain)"></rect>
      </svg>
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
      <Navigation />
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
          className="flex flex-col sm:flex-row gap-4 justify-center items-center"
        >
          <Link to="/menu">
            <Button 
              size="lg"
              className="bg-primary text-white hover:bg-primary/90"
            >
              Explore Menu
            </Button>
          </Link>
          {!session && !isGuest ? (
            <div className="flex flex-col sm:flex-row gap-3">
              <Link to="/auth">
                <Button 
                  size="lg"
                  variant="secondary"
                  className="hover:bg-secondary/90"
                >
                  Join for Rewards
                </Button>
              </Link>
              <Button 
                size="lg"
                variant="outline"
                className="text-white border-white hover:bg-white/20"
                onClick={continueAsGuest}
              >
                Continue as Guest
              </Button>
            </div>
          ) : (
            <Link to={session ? "/rewards" : "/cart"}>
              <Button 
                size="lg"
                variant="secondary"
                className="hover:bg-secondary/90"
              >
                {session ? "View Rewards" : "View Cart"}
              </Button>
            </Link>
          )}
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
  );
};

export default Header;
