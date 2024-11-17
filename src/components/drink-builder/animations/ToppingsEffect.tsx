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
          {/* Topping layer with gradient */}
          <motion.div
            className="w-full h-4"
            style={{
              background: `linear-gradient(180deg,
                rgba(255,255,255,${0.3 + index * 0.1}) 0%,
                rgba(255,255,255,${0.1 + index * 0.05}) 100%
              )`,
              filter: "blur(2px)",
            }}
            initial={{ scale: 0, opacity: 0 }}
            animate={{ 
              scale: [0.8, 1],
              opacity: 1,
            }}
            transition={{
              duration: 1,
              delay: 0.2 * index,
              ease: "easeOut",
            }}
          />
          
          {/* Floating particles */}
          {[...Array(6)].map((_, i) => (
            <motion.div
              key={`particle-${i}`}
              className="absolute w-1.5 h-1.5 rounded-full"
              style={{
                background: `radial-gradient(circle, rgba(255,255,255,${0.8 + index * 0.1}) 0%, rgba(255,255,255,0) 100%)`,
                left: `${15 + (i * 15)}%`,
                filter: "blur(1px)",
              }}
              animate={{
                y: [0, -8, 0],
                x: [0, (i % 2 === 0 ? 5 : -5), 0],
                opacity: [0.4, 0.8, 0.4],
              }}
              transition={{
                duration: 3,
                delay: index * 0.2 + i * 0.3,
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