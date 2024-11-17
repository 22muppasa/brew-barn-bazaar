import { motion } from "framer-motion";

export const WhippedCreamEffect = ({ index }: { index: number }) => (
  <motion.div 
    className="absolute w-full" 
    style={{ top: `${index * 8}px` }}
  >
    <motion.div
      className="w-full h-12"
      style={{
        background: "rgba(255, 255, 255, 0.7)",
        borderRadius: "8px",
        boxShadow: "0 2px 10px rgba(255, 255, 255, 0.2)",
      }}
      initial={{ scale: 0, opacity: 0 }}
      animate={{
        scale: [1, 1.05, 1],
        opacity: 1,
      }}
      transition={{
        duration: 2,
        repeat: Infinity,
        ease: "easeInOut",
      }}
    />
  </motion.div>
);