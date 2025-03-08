
import { motion, AnimatePresence } from "framer-motion";

interface MilkPourEffectProps {
  isPouring: boolean;
}

const MilkPourEffect = ({ isPouring }: MilkPourEffectProps) => {
  return (
    <AnimatePresence>
      {isPouring && (
        <>
          {/* Main pour stream */}
          <motion.div
            className="absolute w-1 bg-gradient-to-b from-white/90 to-white/40"
            initial={{ height: 0, top: 0 }}
            animate={{ 
              height: ["0%", "85%"],
              top: ["0%", "15%"],
            }}
            exit={{ opacity: 0 }}
            transition={{ 
              duration: 1.5,
              ease: "easeOut",
            }}
            style={{ 
              left: "calc(50% - 0.125rem)",
              filter: "blur(1px)",
            }}
          />
          
          {/* Dispersion effect at bottom */}
          <motion.div
            className="absolute bottom-[15%] left-1/2 -translate-x-1/2"
            initial={{ scale: 0, opacity: 0 }}
            animate={{
              scale: [0, 2.5],
              opacity: [0, 0.6, 0],
            }}
            transition={{
              duration: 1.2,
              repeat: Infinity,
              repeatDelay: 0.1,
            }}
            style={{
              width: "20px",
              height: "20px",
              background: "radial-gradient(circle, rgba(255,255,255,0.8) 0%, rgba(255,255,255,0) 70%)",
              filter: "blur(2px)",
            }}
          />
          
          {/* Splash particles with improved animation */}
          {[...Array(16)].map((_, i) => (
            <motion.div
              key={`splash-${i}`}
              className="absolute w-1 h-1"
              style={{
                left: "50%",
                background: "radial-gradient(circle, rgba(255,255,255,0.8) 0%, rgba(255,255,255,0) 100%)",
                filter: "blur(1px)",
              }}
              initial={{ 
                bottom: "15%",
                scale: 0,
                x: 0,
                opacity: 0,
              }}
              animate={{
                bottom: ["15%", `${25 + Math.random() * 15}%`],
                x: [
                  0,
                  (i % 2 === 0 ? 1 : -1) * (10 + Math.random() * 15),
                  (i % 2 === 0 ? 0.5 : -0.5) * (5 + Math.random() * 10)
                ],
                scale: [0, 1.5, 0],
                opacity: [0, 0.8, 0],
              }}
              transition={{
                duration: 1 + Math.random() * 0.5,
                delay: 0.8 + (i * 0.04),
                ease: "easeOut",
              }}
            />
          ))}
        </>
      )}
    </AnimatePresence>
  );
};

export default MilkPourEffect;
