import { motion } from "framer-motion";

interface DrinkPreviewProps {
  baseColor: string;
  toppings: string[];
  milkType: string;
}

const DrinkPreview = ({ baseColor, toppings, milkType }: DrinkPreviewProps) => {
  return (
    <div className="relative w-48 h-64 mx-auto">
      {/* Steam effect */}
      <motion.div
        className="absolute -top-8 left-1/2 transform -translate-x-1/2"
        initial={{ opacity: 0, y: 0 }}
        animate={{ opacity: [0, 1, 0], y: -20 }}
        transition={{ duration: 2, repeat: Infinity, repeatType: "reverse" }}
      >
        <div className="flex gap-2">
          {[...Array(3)].map((_, i) => (
            <motion.div
              key={i}
              className="w-1 h-3 bg-gray-200 rounded-full"
              animate={{ height: ["12px", "16px", "12px"] }}
              transition={{
                duration: 1,
                repeat: Infinity,
                delay: i * 0.2,
              }}
            />
          ))}
        </div>
      </motion.div>

      {/* Cup */}
      <motion.div
        className="absolute bottom-0 w-full h-full"
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
      >
        <div className="absolute bottom-0 w-full h-[90%] bg-white/10 backdrop-blur-sm rounded-b-3xl border-2 border-white/20 shadow-lg" />
        
        {/* Liquid */}
        <motion.div
          className="absolute bottom-0 w-full h-[85%] rounded-b-3xl overflow-hidden"
          initial={{ height: "0%" }}
          animate={{ height: "85%" }}
          transition={{ duration: 1, delay: 0.5 }}
        >
          <motion.div
            className="w-full h-full"
            style={{ backgroundColor: baseColor }}
            animate={{
              background: [
                `linear-gradient(0deg, ${baseColor} 0%, ${baseColor} 100%)`,
                `linear-gradient(0deg, ${baseColor} 0%, ${baseColor}dd 100%)`,
                `linear-gradient(0deg, ${baseColor} 0%, ${baseColor} 100%)`,
              ],
            }}
            transition={{ duration: 2, repeat: Infinity }}
          />
        </motion.div>

        {/* Toppings */}
        <motion.div
          className="absolute top-[15%] w-full"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.5 }}
        >
          {toppings.map((topping, index) => (
            <motion.div
              key={topping}
              className="absolute w-full h-4 bg-opacity-80"
              style={{
                backgroundImage: `url(${topping})`,
                backgroundSize: "cover",
                top: `${index * 8}px`,
              }}
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 1.5 + index * 0.2 }}
            />
          ))}
        </motion.div>
      </motion.div>
    </div>
  );
};

export default DrinkPreview;