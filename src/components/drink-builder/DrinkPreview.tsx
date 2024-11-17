import { motion, AnimatePresence } from "framer-motion";

interface DrinkPreviewProps {
  baseColor: string;
  toppings: string[];
  milkType: string;
  sweetness: number;
}

const DrinkPreview = ({ baseColor, toppings, milkType, sweetness }: DrinkPreviewProps) => {
  return (
    <div className="relative w-48 h-64 mx-auto">
      {/* Enhanced Steam effect */}
      <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 w-32">
        {[...Array(6)].map((_, i) => (
          <motion.div
            key={`steam-${i}`}
            className="absolute w-2 h-2 bg-white/20 rounded-full blur-sm"
            style={{ 
              left: `${(i % 3) * 12}px`,
              filter: 'blur(4px)'
            }}
            animate={{
              y: [-10, -40],
              x: [0, (i % 2 === 0 ? 10 : -10)],
              scale: [0, 1.5, 0],
              opacity: [0, 0.4, 0]
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              delay: i * 0.3,
              ease: "easeInOut"
            }}
          />
        ))}
      </div>

      {/* Cup */}
      <motion.div
        className="absolute bottom-0 w-full h-full"
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
      >
        {/* Cup shine effect */}
        <motion.div 
          className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent"
          animate={{
            x: [-200, 200],
            opacity: [0, 0.5, 0]
          }}
          transition={{
            duration: 3,
            repeat: Infinity,
            repeatDelay: 2
          }}
        />
        
        <div className="absolute bottom-0 w-full h-[90%] bg-white/10 backdrop-blur-sm rounded-b-3xl border-2 border-white/20 shadow-lg overflow-hidden">
          {/* Cup texture */}
          <div className="absolute inset-0 bg-gradient-to-b from-white/5 to-transparent" />
        </div>
        
        {/* Base Liquid with wave effect */}
        <motion.div
          className="absolute bottom-0 w-full h-[85%] rounded-b-3xl overflow-hidden"
          initial={{ height: "0%" }}
          animate={{ height: "85%" }}
          transition={{ duration: 1, delay: 0.5 }}
        >
          <motion.div
            className="w-full h-full relative"
            style={{ backgroundColor: baseColor }}
          >
            {/* Wave effect */}
            <motion.div
              className="absolute inset-0"
              style={{
                background: `linear-gradient(180deg, 
                  ${baseColor}00 0%, 
                  ${baseColor} 50%, 
                  ${baseColor} 100%)`
              }}
              animate={{
                y: [-10, 0, -10]
              }}
              transition={{
                duration: 3,
                repeat: Infinity,
                ease: "easeInOut"
              }}
            />
          </motion.div>
        </motion.div>

        {/* Enhanced Milk Pour Animation */}
        <AnimatePresence>
          {milkType && (
            <>
              {/* Milk stream */}
              <motion.div
                className="absolute w-2 bg-white/80"
                initial={{ height: 0, top: 0 }}
                animate={{ 
                  height: ["0%", "100%", "0%"],
                  top: ["0%", "85%", "85%"],
                  opacity: [0, 1, 0]
                }}
                transition={{ duration: 2 }}
                style={{ left: "calc(50% - 0.25rem)" }}
              />
              {/* Milk splash particles */}
              {[...Array(8)].map((_, i) => (
                <motion.div
                  key={`splash-${i}`}
                  className="absolute w-1 h-1 bg-white/60 rounded-full"
                  style={{ left: "50%" }}
                  initial={{ top: "85%", scale: 0 }}
                  animate={{
                    top: ["85%", `${80 + Math.random() * 10}%`],
                    x: [(i % 2 === 0 ? 10 : -10) * Math.random() * 3, 0],
                    scale: [0, 1, 0],
                    opacity: [0, 1, 0]
                  }}
                  transition={{
                    duration: 0.5,
                    delay: 1 + (i * 0.1),
                    ease: "easeOut"
                  }}
                />
              ))}
            </>
          )}
        </AnimatePresence>

        {/* Enhanced Sweetness Swirl */}
        {sweetness > 0 && (
          <>
            <motion.div
              className="absolute bottom-[15%] w-full h-[70%]"
              initial={{ opacity: 0, rotate: 0 }}
              animate={{ 
                opacity: sweetness / 100,
                rotate: 360,
                background: `conic-gradient(from 0deg at 50% 50%, 
                  transparent 0%, 
                  rgba(255,255,255,0.3) ${sweetness}%, 
                  transparent ${sweetness}%)`
              }}
              transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
            />
            {/* Sparkle effects */}
            {[...Array(3)].map((_, i) => (
              <motion.div
                key={`sparkle-${i}`}
                className="absolute w-1 h-1 bg-white rounded-full"
                style={{
                  left: `${30 + (i * 20)}%`,
                  top: `${40 + (i * 15)}%`
                }}
                animate={{
                  scale: [0, 1, 0],
                  opacity: [0, 0.8, 0]
                }}
                transition={{
                  duration: 1.5,
                  repeat: Infinity,
                  delay: i * 0.5
                }}
              />
            ))}
          </>
        )}

        {/* Enhanced Toppings */}
        <motion.div
          className="absolute top-[15%] w-full"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.5 }}
        >
          {toppings.map((topping, index) => (
            <motion.div
              key={topping}
              className="absolute w-full"
              style={{
                top: `${index * 8}px`,
              }}
            >
              {/* Topping layer */}
              <motion.div
                className="w-full h-4"
                style={{
                  background: `rgba(255,255,255,${0.3 + index * 0.1})`,
                }}
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ 
                  delay: 1.5 + index * 0.2,
                  type: "spring",
                  stiffness: 200,
                  damping: 10
                }}
              />
              {/* Topping particles */}
              {[...Array(4)].map((_, i) => (
                <motion.div
                  key={`particle-${i}`}
                  className="absolute w-1 h-1 rounded-full"
                  style={{
                    background: `rgba(255,255,255,${0.6 + index * 0.1})`,
                    left: `${20 + (i * 20)}%`,
                    top: `${Math.random() * 4}px`
                  }}
                  animate={{
                    y: [0, -4, 0],
                    opacity: [0, 1, 0]
                  }}
                  transition={{
                    duration: 1,
                    delay: 1.5 + index * 0.2 + i * 0.1,
                    repeat: Infinity,
                    repeatDelay: 2
                  }}
                />
              ))}
            </motion.div>
          ))}
        </motion.div>
      </motion.div>
    </div>
  );
};

export default DrinkPreview;