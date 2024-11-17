import { motion } from "framer-motion";

const IceEffect = () => {
  return (
    <div className="absolute inset-0 pointer-events-none">
      {[...Array(4)].map((_, i) => (
        <motion.div
          key={`ice-${i}`}
          className="absolute w-8 h-8"
          style={{
            left: `${15 + (i * 22)}%`,
            top: `${25 + (i * 12)}%`,
            background: "linear-gradient(135deg, rgba(255,255,255,0.8) 0%, rgba(255,255,255,0.2) 100%)",
            borderRadius: "20%",
            boxShadow: "inset 0 0 10px rgba(255,255,255,0.5), 0 2px 4px rgba(0,0,0,0.1)",
            backdropFilter: "blur(2px)",
            transform: `rotate(${i * 45}deg)`,
          }}
          animate={{
            y: [
              -(5 + i * 2), // Start position
              0, // Middle position
              -(3 + i * 2), // Slight bounce
              -(5 + i * 2), // Back to start
            ],
            x: [
              0,
              3 + i, 
              -2,
              0,
            ],
            rotate: [
              i * 45,
              i * 45 + 15,
              i * 45 - 10,
              i * 45,
            ],
            scale: [
              1,
              1.02,
              0.98,
              1,
            ],
          }}
          transition={{
            duration: 4 + i * 0.5,
            repeat: Infinity,
            ease: "easeInOut",
            times: [0, 0.4, 0.7, 1],
          }}
        />
      ))}
    </div>
  );
};

export default IceEffect;