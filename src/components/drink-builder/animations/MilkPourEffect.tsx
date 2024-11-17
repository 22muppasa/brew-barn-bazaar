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
          
          {/* Splash particles */}
          {[...Array(12)].map((_, i) => (
            <motion.div
              key={`splash-${i}`}
              className="absolute w-1 h-1"
              style={{
                left: "50%",
                background: "radial-gradient(circle, rgba(255,255,255,0.8) 0%, rgba(255,255,255,0) 100%)",
                filter: "blur(1px)",
              }}
              initial={{ 
                top: "85%",
                scale: 0,
                x: 0,
                opacity: 0,
              }}
              animate={{
                top: ["85%", `${75 + Math.random() * 15}%`],
                x: [(i % 2 === 0 ? 10 : -10) * Math.random() * 4, 0],
                scale: [0, 1.5, 0],
                opacity: [0, 1, 0],
              }}
              transition={{
                duration: 0.8,
                delay: 0.8 + (i * 0.06),
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