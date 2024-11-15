import { motion } from "framer-motion";
import { useEffect, useState } from "react";

const SeasonalDecorations = () => {
  const [season, setSeason] = useState<'spring' | 'summer' | 'autumn' | 'winter'>('spring');

  useEffect(() => {
    const month = new Date().getMonth();
    if (month >= 2 && month <= 4) setSeason('spring');
    else if (month >= 5 && month <= 7) setSeason('summer');
    else if (month >= 8 && month <= 10) setSeason('autumn');
    else setSeason('winter');
  }, []);

  const renderDecorations = () => {
    switch (season) {
      case 'spring':
        return Array.from({ length: 10 }).map((_, i) => (
          <motion.div
            key={i}
            className="absolute"
            initial={{ opacity: 0, scale: 0 }}
            animate={{ 
              opacity: [0, 1, 0],
              scale: [0, 1, 0],
              x: Math.random() * window.innerWidth,
              y: [0, window.innerHeight]
            }}
            transition={{ 
              duration: 10,
              repeat: Infinity,
              delay: i * 0.5
            }}
          >
            🌸
          </motion.div>
        ));
      case 'summer':
        return (
          <motion.div
            className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-32 bg-yellow-300 rounded-full blur-xl"
            initial={{ opacity: 0 }}
            animate={{ 
              opacity: [0, 0.15, 0],
              scale: [1, 1.2, 1]
            }}
            transition={{ 
              duration: 4,
              repeat: Infinity
            }}
          />
        );
      case 'autumn':
        return Array.from({ length: 15 }).map((_, i) => (
          <motion.div
            key={i}
            className="absolute text-2xl animate-fall"
            style={{ 
              left: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 5}s`
            }}
          >
            🍂
          </motion.div>
        ));
      case 'winter':
        return (
          <>
            {Array.from({ length: 20 }).map((_, i) => (
              <motion.div
                key={i}
                className="absolute text-white text-opacity-80"
                style={{ 
                  left: `${Math.random() * 100}%`,
                  animationDelay: `${Math.random() * 5}s`
                }}
                initial={{ y: -20, opacity: 0 }}
                animate={{ 
                  y: window.innerHeight,
                  opacity: [0, 1, 0]
                }}
                transition={{ 
                  duration: 6,
                  repeat: Infinity,
                  delay: i * 0.2
                }}
              >
                ❄️
              </motion.div>
            ))}
            <div className="absolute bottom-20 left-1/2 -translate-x-1/2">
              {Array.from({ length: 3 }).map((_, i) => (
                <div
                  key={i}
                  className="absolute bottom-0 left-1/2 w-3 h-8 bg-white/20 rounded-full animate-steam"
                  style={{ 
                    animationDelay: `${i * 0.5}s`
                  }}
                />
              ))}
            </div>
          </>
        );
    }
  };

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {renderDecorations()}
    </div>
  );
};

export default SeasonalDecorations;