import { motion } from "framer-motion";

interface DrinkPreviewProps {
  baseColor: string;
  toppings: string[];
  milkType: string;
}

const DrinkPreview = ({ baseColor, toppings, milkType }: DrinkPreviewProps) => {
  return (
    <div className="relative w-48 h-64 mx-auto">
      {/* Cup */}
      <motion.div
        className="absolute bottom-0 w-full h-full"
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
      >
        <div className="absolute bottom-0 w-full h-[90%] bg-white/10 backdrop-blur-sm rounded-b-3xl border-2 border-white/20" />
        {/* Liquid */}
        <motion.div
          className="absolute bottom-0 w-full h-[85%] rounded-b-3xl overflow-hidden"
          initial={{ height: "0%" }}
          animate={{ height: "85%" }}
          transition={{ duration: 1, delay: 0.5 }}
        >
          <div
            className="w-full h-full"
            style={{ backgroundColor: baseColor }}
          />
        </motion.div>
        {/* Toppings */}
        <motion.div
          className="absolute top-0 w-full h-[15%] bg-opacity-80"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.5 }}
        >
          {toppings.map((topping, index) => (
            <div
              key={topping}
              className="absolute w-full h-full"
              style={{
                backgroundImage: `url(${topping})`,
                backgroundSize: "cover",
                opacity: 0.8,
                transform: `translateY(${index * 2}px)`,
              }}
            />
          ))}
        </motion.div>
      </motion.div>
    </div>
  );
};

export default DrinkPreview;