import { motion } from "framer-motion";

const IceEffect = () => {
  // Generate random positions for ice cubes
  const icePositions = Array(4).fill(0).map(() => ({
    left: 15 + Math.random() * 60, // Random position between 15% and 75%
    top: 20 + Math.random() * 50,  // Random position between 20% and 70%
    rotation: Math.random() * 360,  // Random initial rotation
    size: 6 + Math.random() * 4,    // Random size between 6 and 10
  }));

  return (
    <div className="absolute inset-0 pointer-events-none">
      {icePositions.map((pos, i) => (
        <motion.div
          key={`ice-${i}`}
          className="absolute"
          style={{
            width: `${pos.size}rem`,
            height: `${pos.size}rem`,
            left: `${pos.left}%`,
            top: `${pos.top}%`,
            background: "linear-gradient(135deg, rgba(255,255,255,0.8) 0%, rgba(255,255,255,0.2) 100%)",
            borderRadius: "20%",
            boxShadow: "inset 0 0 10px rgba(255,255,255,0.5), 0 2px 4px rgba(0,0,0,0.1)",
            backdropFilter: "blur(2px)",
            transform: `rotate(${pos.rotation}deg)`,
          }}
          animate={{
            y: [
              -(5 + Math.random() * 5),
              Math.random() * 3,
              -(3 + Math.random() * 4),
              -(5 + Math.random() * 5),
            ],
            x: [
              0,
              3 + Math.random() * 4,
              -(2 + Math.random() * 3),
              0,
            ],
            rotate: [
              pos.rotation,
              pos.rotation + 15 + Math.random() * 10,
              pos.rotation - 10 - Math.random() * 10,
              pos.rotation,
            ],
            scale: [
              1,
              1 + Math.random() * 0.04,
              1 - Math.random() * 0.02,
              1,
            ],
          }}
          transition={{
            duration: 4 + Math.random() * 2,
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