import { motion } from "framer-motion";

interface ToppingsEffectProps {
  toppings: string[];
}

const ToppingsEffect = ({ toppings }: ToppingsEffectProps) => {
  return (
    <motion.div className="absolute top-[15%] w-full">
      {toppings.map((topping, index) => {
        switch (topping) {
          case "whipped_cream":
            return <WhippedCreamEffect key={topping} index={index} />;
          case "cinnamon":
            return <CinnamonEffect key={topping} index={index} />;
          case "cocoa":
            return <CocoaEffect key={topping} index={index} />;
          case "caramel_drizzle":
            return <CaramelDrizzleEffect key={topping} index={index} />;
          default:
            return null;
        }
      })}
    </motion.div>
  );
};

const WhippedCreamEffect = ({ index }: { index: number }) => (
  <motion.div className="absolute w-full" style={{ top: `${index * 8}px` }}>
    <motion.div
      className="w-full h-12 overflow-hidden"
      style={{
        background: "linear-gradient(180deg, rgba(255,255,255,0.95) 0%, rgba(255,255,255,0.7) 100%)",
        filter: "blur(2px)",
        borderRadius: "50%",
      }}
      initial={{ scale: 0, opacity: 0 }}
      animate={{
        scale: [1, 1.05, 1],
        opacity: 1,
        rotateZ: [0, 5, -5, 0],
      }}
      transition={{
        duration: 2,
        repeat: Infinity,
        ease: "easeInOut",
      }}
    >
      {[...Array(6)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute w-full h-full"
          style={{
            background: "radial-gradient(circle, rgba(255,255,255,0.8) 0%, transparent 70%)",
            transform: `rotate(${i * 60}deg)`,
          }}
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.5, 0.8, 0.5],
          }}
          transition={{
            duration: 3,
            delay: i * 0.5,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
      ))}
    </motion.div>
  </motion.div>
);

const CinnamonEffect = ({ index }: { index: number }) => (
  <motion.div className="absolute w-full" style={{ top: `${index * 8}px` }}>
    {[...Array(15)].map((_, i) => (
      <motion.div
        key={i}
        className="absolute w-1.5 h-1.5"
        style={{
          left: `${Math.random() * 100}%`,
          background: "rgba(165, 42, 42, 0.7)",
          borderRadius: "2px",
          filter: "blur(0.5px) drop-shadow(0 0 2px rgba(165, 42, 42, 0.3))",
        }}
        initial={{ y: -20, opacity: 0, scale: 0 }}
        animate={{
          y: [0, 40],
          opacity: [0, 1, 0],
          scale: [0.5, 1.2, 0.5],
          rotate: [0, 360],
        }}
        transition={{
          duration: 2,
          delay: i * 0.1,
          repeat: Infinity,
          ease: [0.4, 0, 0.2, 1],
        }}
      />
    ))}
    <motion.div
      className="absolute inset-0"
      style={{
        background: "radial-gradient(circle at 50% 0%, rgba(165, 42, 42, 0.2) 0%, transparent 70%)",
      }}
      animate={{
        scale: [1, 1.2, 1],
        opacity: [0.3, 0.6, 0.3],
      }}
      transition={{
        duration: 2,
        repeat: Infinity,
        ease: "easeInOut",
      }}
    />
  </motion.div>
);

const CocoaEffect = ({ index }: { index: number }) => (
  <motion.div className="absolute w-full" style={{ top: `${index * 8}px` }}>
    <motion.div
      className="absolute inset-0"
      style={{
        background: "radial-gradient(circle at 50% 0%, rgba(65, 25, 0, 0.3) 0%, transparent 70%)",
      }}
      animate={{
        scale: [1, 1.1, 1],
        opacity: [0.3, 0.5, 0.3],
      }}
      transition={{
        duration: 2,
        repeat: Infinity,
        ease: "easeInOut",
      }}
    />
    {[...Array(20)].map((_, i) => (
      <motion.div
        key={i}
        className="absolute"
        style={{
          width: 1 + Math.random() * 3,
          height: 1 + Math.random() * 3,
          left: `${Math.random() * 100}%`,
          background: "rgba(65, 25, 0, 0.8)",
          borderRadius: "50%",
          filter: "blur(0.5px) drop-shadow(0 0 1px rgba(65, 25, 0, 0.3))",
        }}
        initial={{ y: -10, opacity: 0, scale: 0 }}
        animate={{
          y: [0, 30],
          opacity: [0, 1, 0],
          scale: [0.5, 1.5, 0.5],
          rotate: [0, 180],
        }}
        transition={{
          duration: 1.5,
          delay: i * 0.1,
          repeat: Infinity,
          ease: [0.4, 0, 0.2, 1],
        }}
      />
    ))}
  </motion.div>
);

const CaramelDrizzleEffect = ({ index }: { index: number }) => (
  <motion.div className="absolute w-full" style={{ top: `${index * 8}px` }}>
    {/* Drizzle streams */}
    {[...Array(8)].map((_, i) => (
      <motion.div
        key={`stream-${i}`}
        className="absolute h-16"
        style={{
          left: `${10 + (i * 12)}%`,
          width: "2px",
          background: "linear-gradient(180deg, rgba(193, 100, 0, 0.8) 0%, rgba(193, 100, 0, 0.2) 100%)",
          filter: "blur(0.5px) drop-shadow(0 0 2px rgba(193, 100, 0, 0.3))",
          transformOrigin: "top",
        }}
        initial={{ scaleY: 0, opacity: 0 }}
        animate={{
          scaleY: [0, 1],
          opacity: [0, 1, 0.7],
        }}
        transition={{
          duration: 1.5,
          delay: i * 0.2,
          repeat: Infinity,
          ease: "easeOut",
        }}
      />
    ))}
    {/* Caramel droplets */}
    {[...Array(12)].map((_, i) => (
      <motion.div
        key={`droplet-${i}`}
        className="absolute"
        style={{
          width: "4px",
          height: "4px",
          left: `${Math.random() * 100}%`,
          background: "rgba(193, 100, 0, 0.8)",
          borderRadius: "50%",
          filter: "blur(0.5px) drop-shadow(0 0 2px rgba(193, 100, 0, 0.3))",
        }}
        initial={{ y: 0, opacity: 0, scale: 0 }}
        animate={{
          y: [0, 40],
          opacity: [0, 1, 0],
          scale: [0.5, 1.2, 0.5],
        }}
        transition={{
          duration: 1.2,
          delay: i * 0.1,
          repeat: Infinity,
          ease: [0.4, 0, 0.2, 1],
        }}
      />
    ))}
    {/* Shimmering effect */}
    <motion.div
      className="absolute inset-0"
      style={{
        background: "radial-gradient(circle at 50% 0%, rgba(193, 100, 0, 0.2) 0%, transparent 70%)",
      }}
      animate={{
        scale: [1, 1.2, 1],
        opacity: [0.3, 0.6, 0.3],
      }}
      transition={{
        duration: 2,
        repeat: Infinity,
        ease: "easeInOut",
      }}
    />
  </motion.div>
);

export default ToppingsEffect;