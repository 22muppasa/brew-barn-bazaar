
import { motion, useAnimation } from "framer-motion";
import { useSession } from "@supabase/auth-helpers-react";
import { useLocalStorage } from "@/hooks/useLocalStorage";
import HamburgerMenu from "./HamburgerMenu";
import { useEffect } from "react";

const Header = () => {
  const session = useSession();
  const { getValue, setValue } = useLocalStorage();
  const isGuest = getValue("isGuest") === "true";
  
  useEffect(() => {
    if (!session && !isGuest) {
      setValue("isGuest", "true");
    }
  }, [session, isGuest, setValue]);

  return (
    <motion.header 
      className="relative flex h-screen items-center justify-center overflow-hidden bg-black"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 1 }}
    >
      <div className="absolute inset-0 bg-black/60 z-0"></div>
      <svg className="absolute top-0 left-0 w-full h-full z-10 opacity-20 pointer-events-none">
        <filter id="grain">
          <feTurbulence baseFrequency="0.8" numOctaves="3" stitchTiles="stitch" type="fractalNoise"></feTurbulence>
          <feColorMatrix type="saturate" values="0"></feColorMatrix>
        </filter>
        <rect width="100%" height="100%" filter="url(#grain)"></rect>
      </svg>
      <iframe 
        className="absolute w-full h-full"
        style={{
          top: 0,
          left: 0,
          width: "100%",
          height: "100%",
        }}
        src="https://player.vimeo.com/video/1068513623?h=11147670f8&badge=0&autopause=0&player_id=0&app_id=58479&background=1&autoplay=1&muted=1"
        frameBorder="0"
        allow="autoplay; fullscreen; picture-in-picture; clipboard-write; encrypted-media"
        allowFullScreen
      />
      <HamburgerMenu />
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
