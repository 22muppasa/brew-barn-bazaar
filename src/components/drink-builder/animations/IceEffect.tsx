import { motion } from "framer-motion";

const IceEffect = () => {
  return (
    <div className="absolute inset-0 pointer-events-none">
      {[...Array(4)].map((_, i) => (
        <motion.div
          key={`ice-${i}`}
          className="absolute w-8 h-8"
          style={{
            left: `${20 + (i * 20)}%`,
            top: `${20 + (i * 15)}%`,
            background: "linear-gradient(135deg, rgba(255,255,255,0.8) 0%, rgba(255,255,255,0.2) 100%)",
            borderRadius: "20%",
            boxShadow: "inset 0 0 10px rgba(255,255,255,0.5)",
            backdropFilter: "blur(2px)",
          }}
          initial={{ rotate: 0, y: -20 }}
          animate={{
            rotate: [0, 10, -10, 0],
            y: [-20, 0, -10, -20],
          }}
          transition={{
            duration: 3,
            delay: i * 0.5,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
      ))}
    </div>
  );
};

export default IceEffect;