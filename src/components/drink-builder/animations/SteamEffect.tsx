import { motion } from "framer-motion";

const SteamEffect = () => {
  return (
    <div className="absolute -top-12 left-1/2 transform -translate-x-1/2 w-32 pointer-events-none">
      {[...Array(8)].map((_, i) => (
        <motion.div
          key={`steam-${i}`}
          className="absolute w-2 h-8 origin-bottom"
          style={{
            left: `${(i % 4) * 8}px`,
            backgroundColor: "rgba(255, 255, 255, 0.15)",
            filter: "blur(8px)",
          }}
          animate={{
            y: [-10, -60],
            x: [0, (i % 2 === 0 ? 15 : -15)],
            scale: [0.8, 0],
            opacity: [0.6, 0],
          }}
          transition={{
            duration: 2.5,
            repeat: Infinity,
            delay: i * 0.2,
            ease: "easeInOut",
          }}
        />
      ))}
    </div>
  );
};

export default SteamEffect;