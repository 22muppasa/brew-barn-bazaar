import { motion } from "framer-motion";

const IceEffect = () => {
  // Generate random positions for ice cubes with better distribution
  const icePositions = Array(5).fill(0).map((_, index) => {
    // Divide the cup into sections for better distribution
    const section = index / 5;
    return {
      // Distribute across width while keeping some randomness
      left: 15 + (section * 40) + (Math.random() * 20),
      // Stagger vertical positions
      top: 15 + (Math.random() * 50),
      rotation: Math.random() * 360,
      size: 2.5 + Math.random() * 1.2,
    };
  });

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
              0,
              -3 - Math.random() * 2,
              -1 - Math.random() * 2,
              0,
            ],
            x: [
              0,
              1 + Math.random(),
              -(1 + Math.random()),
              0,
            ],
            rotate: [
              pos.rotation,
              pos.rotation + 5 + Math.random() * 3,
              pos.rotation - 3 - Math.random() * 3,
              pos.rotation,
            ],
            scale: [
              1,
              1.02,
              0.98,
              1,
            ],
          }}
          transition={{
            duration: 4 + Math.random() * 2,
            repeat: Infinity,
            ease: "easeInOut",
            delay: i * 0.2, // Stagger the animation start
          }}
        />
      ))}
    </div>
  );
};

export default IceEffect;
