import { motion } from "framer-motion";

interface ToppingsEffectProps {
  toppings: string[];
}

const ToppingsEffect = ({ toppings }: ToppingsEffectProps) => {
  return (
    <motion.div className="absolute top-[15%] w-full">
      {toppings.map((topping, index) => (
        <motion.div
          key={topping}
          className="absolute w-full"
          style={{ top: `${index * 8}px` }}
        >
          {/* Swirling topping layer */}
          <motion.div
            className="w-full h-6 overflow-hidden"
            style={{
              background: `linear-gradient(180deg,
                rgba(255,255,255,${0.4 + index * 0.1}) 0%,
                rgba(255,255,255,${0.2 + index * 0.05}) 100%
              )`,
              filter: "blur(3px)",
            }}
            initial={{ scale: 0, opacity: 0 }}
            animate={{ 
              scale: [0.8, 1],
              opacity: 1,
              rotate: [0, 360],
            }}
            transition={{
              duration: 20,
              repeat: Infinity,
              ease: "linear",
            }}
          >
            {/* Swirl pattern */}
            <motion.div
              className="absolute inset-0"
              style={{
                background: `repeating-linear-gradient(
                  45deg,
                  transparent,
                  transparent 10px,
                  rgba(255,255,255,0.1) 10px,
                  rgba(255,255,255,0.1) 20px
                )`,
              }}
              animate={{
                x: [-20, 20],
                y: [-10, 10],
              }}
              transition={{
                duration: 8,
                repeat: Infinity,
                repeatType: "reverse",
                ease: "easeInOut",
              }}
            />
          </motion.div>
          
          {/* Floating particles with improved animation */}
          {[...Array(8)].map((_, i) => (
            <motion.div
              key={`particle-${i}`}
              className="absolute rounded-full"
              style={{
                width: 2 + Math.random() * 3 + "px",
                height: 2 + Math.random() * 3 + "px",
                background: `radial-gradient(circle, rgba(255,255,255,${0.9 + index * 0.1}) 0%, rgba(255,255,255,0) 100%)`,
                left: `${10 + (i * 10)}%`,
                filter: "blur(1px)",
              }}
              animate={{
                y: [0, -15, 0],
                x: [0, (i % 2 === 0 ? 8 : -8), 0],
                scale: [1, 1.2, 1],
                opacity: [0.4, 0.8, 0.4],
              }}
              transition={{
                duration: 3 + Math.random() * 2,
                delay: index * 0.2 + i * 0.3,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            />
          ))}
          
          {/* Sparkle effects */}
          {[...Array(5)].map((_, i) => (
            <motion.div
              key={`sparkle-${i}`}
              className="absolute"
              style={{
                width: "4px",
                height: "4px",
                left: `${20 + (i * 15)}%`,
                background: "white",
                clipPath: "polygon(50% 0%, 61% 35%, 98% 35%, 68% 57%, 79% 91%, 50% 70%, 21% 91%, 32% 57%, 2% 35%, 39% 35%)",
              }}
              animate={{
                scale: [0, 1, 0],
                rotate: [0, 180],
                opacity: [0, 1, 0],
              }}
              transition={{
                duration: 2,
                delay: i * 0.3 + Math.random(),
                repeat: Infinity,
                ease: "easeInOut",
              }}
            />
          ))}
        </motion.div>
      ))}
    </motion.div>
  );
};

export default ToppingsEffect;