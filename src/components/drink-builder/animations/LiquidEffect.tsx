
import { motion } from "framer-motion";

interface LiquidEffectProps {
  baseColor: string;
  milkType: string;
}

const LiquidEffect = ({ baseColor, milkType }: LiquidEffectProps) => {
  return (
    <motion.div
      className="absolute bottom-0 w-full overflow-hidden rounded-b-3xl"
      initial={{ height: "0%" }}
      animate={{ height: "85%" }}
      transition={{ duration: 1.5, ease: "easeInOut" }}
    >
      <motion.div
        className="relative w-full h-full"
        style={{ backgroundColor: baseColor }}
      >
        {/* Wave effect */}
        <motion.div
          className="absolute inset-0"
          style={{
            background: `linear-gradient(180deg, 
              ${baseColor}00 0%, 
              ${baseColor} 50%, 
              ${baseColor} 100%
            )`,
          }}
          animate={{
            y: [-8, 0, -8],
          }}
          transition={{
            duration: 4,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
        
        {/* Milk swirl effect */}
        {milkType && (
          <motion.div
            className="absolute inset-0"
            style={{
              background: `radial-gradient(circle at 50% 50%, 
                rgba(255,255,255,0.2) 0%, 
                transparent 70%
              )`,
            }}
            animate={{
              rotate: [0, 360],
              scale: [1, 1.2, 1],
            }}
            transition={{
              duration: 8,
              repeat: Infinity,
              ease: "linear",
            }}
          />
        )}
      </motion.div>
    </motion.div>
  );
};

export default LiquidEffect;
