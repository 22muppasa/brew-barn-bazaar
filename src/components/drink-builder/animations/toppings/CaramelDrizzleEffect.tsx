import { motion } from "framer-motion";

export const CaramelDrizzleEffect = ({ index }: { index: number }) => (
  <motion.div className="absolute w-full" style={{ top: `${index * 8}px` }}>
    {/* Drizzle streams with shimmering effect */}
    {[...Array(8)].map((_, i) => (
      <motion.div
        key={`stream-${i}`}
        className="absolute h-16"
        style={{
          left: `${10 + (i * 12)}%`,
          width: "2px",
          background: "linear-gradient(180deg, rgba(193, 100, 0, 0.9), rgba(193, 100, 0, 0.3))",
          filter: "blur(0.5px) drop-shadow(0 0 3px rgba(193, 100, 0, 0.4))",
          transformOrigin: "top",
        }}
        initial={{ scaleY: 0, opacity: 0 }}
        animate={{
          scaleY: [0, 1],
          opacity: [0, 1, 0.7],
          filter: [
            "blur(0.5px) drop-shadow(0 0 3px rgba(193, 100, 0, 0.4))",
            "blur(1px) drop-shadow(0 0 5px rgba(193, 100, 0, 0.6))",
            "blur(0.5px) drop-shadow(0 0 3px rgba(193, 100, 0, 0.4))",
          ],
        }}
        transition={{
          duration: 2,
          delay: i * 0.2,
          repeat: Infinity,
          ease: "easeOut",
        }}
      />
    ))}
    {/* Caramel droplets with glowing effect */}
    {[...Array(15)].map((_, i) => (
      <motion.div
        key={`droplet-${i}`}
        className="absolute"
        style={{
          width: "4px",
          height: "4px",
          left: `${Math.random() * 100}%`,
          background: "radial-gradient(circle, rgba(193, 100, 0, 0.9) 0%, rgba(193, 100, 0, 0.6) 100%)",
          borderRadius: "50%",
          filter: "blur(0.5px) drop-shadow(0 0 3px rgba(193, 100, 0, 0.5))",
        }}
        initial={{ y: 0, opacity: 0, scale: 0 }}
        animate={{
          y: [0, 40],
          opacity: [0, 1, 0],
          scale: [0.5, 1.2, 0.5],
          filter: [
            "blur(0.5px) drop-shadow(0 0 3px rgba(193, 100, 0, 0.5))",
            "blur(1px) drop-shadow(0 0 6px rgba(193, 100, 0, 0.7))",
            "blur(0.5px) drop-shadow(0 0 3px rgba(193, 100, 0, 0.5))",
          ],
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