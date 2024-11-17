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
          {/* Main topping layer */}
          <motion.div
            className="w-full h-8 overflow-hidden"
            style={{
              background: `linear-gradient(180deg,
                rgba(255,255,255,${0.95 - index * 0.1}) 0%,
                rgba(255,255,255,${0.7 - index * 0.1}) 100%
              )`,
              filter: "blur(2px)",
            }}
            initial={{ scale: 0, opacity: 0 }}
            animate={{ 
              scale: 1,
              opacity: 1,
            }}
            transition={{
              duration: 0.5,
              delay: index * 0.2,
            }}
          >
            {/* Swirling pattern */}
            <motion.div
              className="absolute inset-0"
              style={{
                background: `repeating-linear-gradient(
                  45deg,
                  transparent,
                  transparent 8px,
                  rgba(255,255,255,0.2) 8px,
                  rgba(255,255,255,0.2) 16px
                )`,
              }}
              animate={{
                rotate: [0, 360],
                scale: [1, 1.1, 1],
              }}
              transition={{
                duration: 20,
                repeat: Infinity,
                ease: "linear",
              }}
            />
          </motion.div>
          
          {/* Floating cream particles */}
          {[...Array(12)].map((_, i) => (
            <motion.div
              key={`particle-${i}`}
              className="absolute rounded-full"
              style={{
                width: 3 + Math.random() * 4 + "px",
                height: 3 + Math.random() * 4 + "px",
                background: `radial-gradient(circle, rgba(255,255,255,0.95) 0%, rgba(255,255,255,0) 70%)`,
                left: `${5 + (i * 8)}%`,
                filter: "blur(1px)",
              }}
              animate={{
                y: [0, -20, 0],
                x: [0, (i % 2 === 0 ? 10 : -10), 0],
                scale: [1, 1.3, 1],
                opacity: [0.4, 1, 0.4],
              }}
              transition={{
                duration: 3 + Math.random() * 2,
                delay: i * 0.2,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            />
          ))}
          
          {/* Sparkle effects */}
          {[...Array(8)].map((_, i) => (
            <motion.div
              key={`sparkle-${i}`}
              className="absolute"
              style={{
                width: "6px",
                height: "6px",
                left: `${15 + (i * 10)}%`,
                background: "white",
                clipPath: "polygon(50% 0%, 61% 35%, 98% 35%, 68% 57%, 79% 91%, 50% 70%, 21% 91%, 32% 57%, 2% 35%, 39% 35%)",
                filter: "blur(0.5px)",
              }}
              animate={{
                scale: [0, 1.2, 0],
                rotate: [0, 180],
                opacity: [0, 0.8, 0],
              }}
              transition={{
                duration: 1.5,
                delay: i * 0.3,
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