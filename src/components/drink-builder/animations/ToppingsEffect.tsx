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
  <motion.div
    className="absolute w-full"
    style={{ top: `${index * 8}px` }}
  >
    <motion.div
      className="w-full h-10 overflow-hidden"
      style={{
        background: "linear-gradient(180deg, rgba(255,255,255,0.95) 0%, rgba(255,255,255,0.7) 100%)",
        filter: "blur(2px)",
      }}
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ duration: 0.5, delay: index * 0.2 }}
    >
      <motion.div
        className="absolute inset-0"
        style={{
          background: "repeating-linear-gradient(45deg, transparent, transparent 8px, rgba(255,255,255,0.2) 8px, rgba(255,255,255,0.2) 16px)",
        }}
        animate={{ rotate: [0, 360] }}
        transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
      />
    </motion.div>
  </motion.div>
);

const CinnamonEffect = ({ index }: { index: number }) => (
  <motion.div className="absolute w-full" style={{ top: `${index * 8}px` }}>
    {[...Array(12)].map((_, i) => (
      <motion.div
        key={i}
        className="absolute w-1 h-1 rounded-full"
        style={{
          left: `${Math.random() * 100}%`,
          background: "rgba(165, 42, 42, 0.7)",
        }}
        initial={{ y: -10, opacity: 0 }}
        animate={{
          y: [0, 20],
          opacity: [0, 1, 0],
          rotate: [0, 360],
        }}
        transition={{
          duration: 2,
          delay: i * 0.2,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />
    ))}
  </motion.div>
);

const CocoaEffect = ({ index }: { index: number }) => (
  <motion.div className="absolute w-full" style={{ top: `${index * 8}px` }}>
    {[...Array(15)].map((_, i) => (
      <motion.div
        key={i}
        className="absolute"
        style={{
          width: 2 + Math.random() * 3,
          height: 2 + Math.random() * 3,
          left: `${Math.random() * 100}%`,
          background: "rgba(65, 25, 0, 0.8)",
          borderRadius: "50%",
        }}
        initial={{ y: -5, opacity: 0 }}
        animate={{
          y: [0, 15],
          opacity: [0, 0.8, 0],
          scale: [1, 0.8],
        }}
        transition={{
          duration: 1.5,
          delay: i * 0.1,
          repeat: Infinity,
          ease: "easeOut",
        }}
      />
    ))}
  </motion.div>
);

const CaramelDrizzleEffect = ({ index }: { index: number }) => (
  <motion.div className="absolute w-full" style={{ top: `${index * 8}px` }}>
    {[...Array(8)].map((_, i) => (
      <motion.div
        key={i}
        className="absolute h-12 w-[2px]"
        style={{
          left: `${10 + (i * 12)}%`,
          background: "linear-gradient(180deg, rgba(193, 100, 0, 0.8) 0%, rgba(193, 100, 0, 0.2) 100%)",
          filter: "blur(0.5px)",
        }}
        initial={{ height: 0, opacity: 0 }}
        animate={{
          height: [0, 48],
          opacity: [0, 1, 0.7],
        }}
        transition={{
          duration: 2,
          delay: i * 0.3,
          repeat: Infinity,
          ease: "easeOut",
        }}
      />
    ))}
    {[...Array(12)].map((_, i) => (
      <motion.div
        key={`drop-${i}`}
        className="absolute w-1.5 h-1.5 rounded-full"
        style={{
          left: `${Math.random() * 100}%`,
          background: "rgba(193, 100, 0, 0.8)",
          filter: "blur(0.5px)",
        }}
        initial={{ y: 0, opacity: 0 }}
        animate={{
          y: [0, 30],
          opacity: [0, 1, 0],
          scale: [1, 0.5],
        }}
        transition={{
          duration: 1.5,
          delay: i * 0.2,
          repeat: Infinity,
          ease: "easeIn",
        }}
      />
    ))}
  </motion.div>
);

export default ToppingsEffect;