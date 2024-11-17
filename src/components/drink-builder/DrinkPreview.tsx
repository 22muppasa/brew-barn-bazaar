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
        {/* Cup shine effect */}
        <motion.div 
          className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent"
          animate={{
            x: [-200, 200],
            opacity: [0, 0.3, 0]
          }}
          transition={{
            duration: 3,
            repeat: Infinity,
            repeatDelay: 2,
            ease: "easeInOut"
          }}
        />
        
        {/* Cup body */}
        <div className="absolute bottom-0 w-full h-[90%] backdrop-blur-sm rounded-b-3xl border-2 border-white/20 shadow-lg overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-b from-white/10 to-transparent" />
          
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
                  className="absolute w-1 h-1"
                  style={{
                    left: `${20 + (i * 15)}%`,
                    top: `${30 + (i * 10)}%`,
                    background: "radial-gradient(circle, rgba(255,255,255,0.8) 0%, rgba(255,255,255,0) 100%)",
                    filter: "blur(1px)",
                  }}
                  animate={{
                    scale: [0.5, 1.5, 0.5],
                    opacity: [0.3, 0.8, 0.3],
                    y: [0, -10, 0],
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
      </motion.div>
    </div>
  );
};

export default DrinkPreview;