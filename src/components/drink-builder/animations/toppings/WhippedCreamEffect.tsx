import { motion } from "framer-motion";

export const WhippedCreamEffect = ({ index }: { index: number }) => (
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