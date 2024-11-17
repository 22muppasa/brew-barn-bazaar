import { motion } from "framer-motion";

export const CocoaEffect = ({ index }: { index: number }) => (
  <motion.div className="absolute w-full" style={{ top: `${index * 8}px` }}>
    <motion.div
      className="absolute inset-0"
      style={{
        background: "radial-gradient(circle at 50% 0%, rgba(65, 25, 0, 0.4) 0%, transparent 70%)",
      }}
      animate={{
        scale: [1, 1.1, 1],
        opacity: [0.3, 0.6, 0.3],
      }}
      transition={{
        duration: 2,
        repeat: Infinity,
        ease: "easeInOut",
      }}
    />
    {[...Array(25)].map((_, i) => (
      <motion.div
        key={i}
        className="absolute"
        style={{
          width: 1 + Math.random() * 3,
          height: 1 + Math.random() * 3,
          left: `${Math.random() * 100}%`,
          background: "radial-gradient(circle, rgba(65, 25, 0, 0.9) 0%, rgba(65, 25, 0, 0.6) 100%)",
          borderRadius: "50%",
          filter: "blur(0.5px) drop-shadow(0 1px 2px rgba(65, 25, 0, 0.4))",
        }}
        initial={{ y: -10, opacity: 0, scale: 0 }}
        animate={{
          y: [0, 30],
          opacity: [0, 1, 0],
          scale: [0.5, 1.5, 0.5],
          rotate: [0, 180],
        }}
        transition={{
          duration: 2,
          delay: i * 0.1,
          repeat: Infinity,
          ease: [0.4, 0, 0.2, 1],
        }}
      />
    ))}
  </motion.div>
);