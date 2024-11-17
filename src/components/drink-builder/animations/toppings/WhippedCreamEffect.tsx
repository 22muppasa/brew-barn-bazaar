import { motion } from "framer-motion";

export const WhippedCreamEffect = ({ index }: { index: number }) => (
  <motion.div 
    className="absolute w-full" 
    style={{ top: `${index * 8}px` }}
  >
    <motion.div
      className="w-full h-12"
      style={{
        background: "rgba(255, 255, 255, 0.9)",
        borderRadius: "8px",
        boxShadow: "0 2px 10px rgba(255, 255, 255, 0.3)",
      }}
      initial={{ scale: 0, opacity: 0 }}
      animate={{
        scale: [1, 1.05, 1],
        opacity: 1,
        rotateZ: [0, 2, -2, 0],
      }}
      transition={{
        duration: 2,
        repeat: Infinity,
        ease: "easeInOut",
      }}
    />
  </motion.div>
);