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

  const renderSpring = () => (
    <>
      {Array.from({ length: 15 }).map((_, i) => (
        <motion.div
          key={`blossom-${i}`}
          className="absolute text-white text-2xl animate-sway"
          style={{ 
            left: `${Math.random() * 100}%`,
            top: `-20px`,
            animationDelay: `${Math.random() * 3}s`
          }}
          initial={{ opacity: 0, y: -20 }}
          animate={{
            opacity: [0, 1, 0],
            y: ['0vh', '100vh'],
            x: [0, Math.random() * 100 - 50],
            rotate: [0, 360]
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            delay: i * 0.3,
            ease: "easeInOut"
          }}
        >
          ❄️
        </motion.div>
      ))}
      <div className="absolute inset-0 bg-gradient-to-t from-white/10 to-transparent pointer-events-none" />
    </>
  );

  const renderSummer = () => (
    <>
      <motion.div
        className="absolute top-0 left-1/2 -translate-x-1/2 w-96 h-96 bg-white/20 rounded-full blur-3xl"
        style={{ transformOrigin: 'center' }}
      />
      {Array.from({ length: 8 }).map((_, i) => (
        <motion.div
          key={`summer-${i}`}
          className="absolute text-white text-2xl"
          style={{ 
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`
          }}
          animate={{
            x: [0, Math.random() * 100 - 50],
            y: [0, Math.random() * 50 - 25],
            scale: [1, 1.2, 1],
            rotate: [0, Math.random() * 30 - 15]
          }}
          transition={{
            duration: 4,
            repeat: Infinity,
            repeatType: "reverse",
            delay: i * 0.5
          }}
        >
          ❄️
        </motion.div>
      ))}
    </>
  );

  const renderAutumn = () => (
    <>
      {Array.from({ length: 20 }).map((_, i) => (
        <motion.div
          key={`leaf-${i}`}
          className="absolute text-white text-2xl animate-fall-and-spin"
          style={{ 
            left: `${Math.random() * 100}%`,
            animationDelay: `${Math.random() * 5}s`
          }}
        >
          ❄️
        </motion.div>
      ))}
      <div className="absolute inset-0 bg-gradient-to-b from-white/10 to-transparent pointer-events-none" />
    </>
  );

  const renderWinter = () => (
    <>
      {Array.from({ length: 30 }).map((_, i) => (
        <motion.div
          key={`snow-${i}`}
          className="absolute text-white text-lg"
          style={{ 
            left: `${Math.random() * 100}%`,
            top: `-20px`,
            animationDelay: `${Math.random() * 5}s`
          }}
          animate={{
            y: ['0vh', '100vh'],
            x: [0, Math.random() * 50 - 25],
            opacity: [0, 1, 0]
          }}
          transition={{
            duration: 6,
            repeat: Infinity,
            delay: i * 0.2,
            ease: "linear"
          }}
        >
          ❄️
        </motion.div>
      ))}
      <div className="absolute bottom-20 left-1/2 -translate-x-1/2 z-10">
        {Array.from({ length: 5 }).map((_, i) => (
          <motion.div
            key={`steam-${i}`}
            className="absolute bottom-0 left-1/2 w-3 h-12 bg-white/20 rounded-full animate-float-up"
            style={{ 
              animationDelay: `${i * 0.8}s`,
              filter: 'blur(4px)'
            }}
          />
        ))}
      </div>
      <div className="absolute inset-0 bg-gradient-to-b from-white/10 to-transparent pointer-events-none" />
    </>
  );

  const renderDecorations = () => {
    switch (season) {
      case 'spring': return renderSpring();
      case 'summer': return renderSummer();
      case 'autumn': return renderAutumn();
      case 'winter': return renderWinter();
    }
  };

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {renderDecorations()}
    </div>
  );
};

export default SeasonalDecorations;