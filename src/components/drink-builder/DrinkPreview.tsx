import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import SteamEffect from "./animations/SteamEffect";
import LiquidEffect from "./animations/LiquidEffect";
import MilkPourEffect from "./animations/MilkPourEffect";
import ToppingsEffect from "./animations/ToppingsEffect";
import IceEffect from "./animations/IceEffect";

interface DrinkPreviewProps {
  baseColor: string;
  toppings: string[];
  milkType: string;
  sweetness: number;
  isIced: boolean;
}

const DrinkPreview = ({ baseColor, toppings, milkType, sweetness, isIced }: DrinkPreviewProps) => {
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
      {!isIced && <SteamEffect />}

      {/* Cup */}
      <motion.div
        className="absolute bottom-0 w-full h-full"
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
      >
        {/* Cup outline and shadow */}
        <div className="absolute bottom-0 w-full h-[90%] rounded-b-3xl border-[3px] border-black shadow-[0_0_20px_rgba(0,0,0,0.3),inset_0_0_15px_rgba(0,0,0,0.2)] overflow-hidden bg-white/10 backdrop-blur-sm">
          {/* Glass reflection effect */}
          <div className="absolute inset-0 bg-gradient-to-br from-white/30 to-transparent pointer-events-none" />
          
          {/* Cup shine effect */}
          <motion.div 
            className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent"
            animate={{
              x: [-200, 200],
              opacity: [0, 0.5, 0]
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
          
          {/* Ice cubes effect */}
          {isIced && <IceEffect />}
          
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

        {/* Enhanced Cup handle */}
        <div className="absolute right-[-24px] top-1/2 transform -translate-y-1/2 w-10 h-20">
          <div className="w-full h-full border-[3px] border-black rounded-r-full shadow-lg bg-white/10 backdrop-blur-sm" />
        </div>

        {/* Cup rim highlight */}
        <div className="absolute top-[10%] w-full h-[2px] bg-white/40" />
      </motion.div>
    </div>
  );
};

export default DrinkPreview;