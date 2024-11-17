import { motion } from "framer-motion";

export const CinnamonEffect = ({ index }: { index: number }) => (
  <motion.div className="absolute w-full" style={{ top: `${index * 8}px` }}>
    {[...Array(15)].map((_, i) => (
      <motion.div
        key={i}
        className="absolute w-1.5 h-1.5"
        style={{
          left: `${Math.random() * 100}%`,
          background: "linear-gradient(135deg, rgba(165, 42, 42, 0.9), rgba(139, 69, 19, 0.7))",
          borderRadius: "1px",
          filter: "blur(0.5px) drop-shadow(0 2px 4px rgba(165, 42, 42, 0.4))",
        }}
        initial={{ y: -20, opacity: 0, scale: 0 }}
        animate={{
          y: [0, 40],
          opacity: [0, 1, 0],
          scale: [0.5, 1.2, 0.5],
          rotate: [0, 360],
        }}
        transition={{
          duration: 3,
          delay: i * 0.2,
          repeat: Infinity,
          ease: [0.4, 0, 0.2, 1],
        }}
      />
    ))}
    <motion.div
      className="absolute inset-0"
      style={{
        background: "radial-gradient(circle at 50% 0%, rgba(165, 42, 42, 0.3) 0%, transparent 70%)",
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