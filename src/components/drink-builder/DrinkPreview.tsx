import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import SteamEffect from "./animations/SteamEffect";
import LiquidEffect from "./animations/LiquidEffect";
import MilkPourEffect from "./animations/MilkPourEffect";
import ToppingsEffect from "./animations/ToppingsEffect";

interface DrinkPreviewProps {
  baseColor: string;
  toppings: string[];
  milkType: string;
  sweetness: number;
}

const DrinkPreview = ({ baseColor, toppings, milkType, sweetness }: DrinkPreviewProps) => {
  const [isPouring, setIsPouring] = useState(false);

  useEffect(() => {
    if (milkType) {
      setIsPouring(true);
      const timer = setTimeout(() => setIsPouring(false), 2000);
      return () => clearTimeout(timer);
    }
  }, [milkType]);

  return (
    <div className="relative w-48 h-64 mx-auto">
      <SteamEffect />

      {/* Cup */}
      <motion.div
        className="absolute bottom-0 w-full h-full"
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
      >
        {/* Cup outline and shadow */}
        <div className="absolute bottom-0 w-full h-[90%] rounded-b-3xl border-2 border-black/50 shadow-[0_0_15px_rgba(0,0,0,0.2),inset_0_0_10px_rgba(0,0,0,0.1)] overflow-hidden bg-white/5 backdrop-blur-sm">
          {/* Cup shine effect */}
          <motion.div 
            className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
            animate={{
              x: [-200, 200],
              opacity: [0, 0.4, 0]
            }}
            transition={{
              duration: 3,
              repeat: Infinity,
              repeatDelay: 2,
              ease: "easeInOut"
            }}
          />
          
          <LiquidEffect baseColor={baseColor} milkType={milkType} />
          <MilkPourEffect isPouring={isPouring} />
          
          {/* Sweetness sparkles */}
          {sweetness > 0 && (
            <motion.div
              className="absolute inset-0 pointer-events-none"
              initial={false}
            >
              {[...Array(Math.floor(sweetness / 20))].map((_, i) => (
                <motion.div
                  key={`sparkle-${i}`}
                  className="absolute w-1.5 h-1.5 rounded-full"
                  style={{
                    left: `${20 + (i * 15)}%`,
                    top: `${30 + (i * 10)}%`,
                    background: "radial-gradient(circle, rgba(255,255,255,0.9) 0%, rgba(255,255,255,0) 70%)",
                    filter: "blur(0.5px)",
                  }}
                  animate={{
                    scale: [0.5, 1.5, 0.5],
                    opacity: [0.3, 1, 0.3],
                    y: [0, -15, 0],
                  }}
                  transition={{
                    duration: 2,
                    delay: i * 0.3,
                    repeat: Infinity,
                    ease: "easeInOut",
                  }}
                />
              ))}
            </motion.div>
          )}
          
          <ToppingsEffect toppings={toppings} />
        </div>

        {/* Cup handle */}
        <div className="absolute right-[-20px] top-1/2 transform -translate-y-1/2 w-8 h-16">
          <div className="w-full h-full border-2 border-black/50 rounded-r-full" />
        </div>
      </motion.div>
    </div>
  );
};

export default DrinkPreview;