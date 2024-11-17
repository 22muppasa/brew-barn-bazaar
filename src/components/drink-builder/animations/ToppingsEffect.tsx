import { motion } from "framer-motion";
import { WhippedCreamEffect } from "./toppings/WhippedCreamEffect";
import { CinnamonEffect } from "./toppings/CinnamonEffect";
import { CocoaEffect } from "./toppings/CocoaEffect";
import { CaramelDrizzleEffect } from "./toppings/CaramelDrizzleEffect";

interface ToppingsEffectProps {
  toppings: string[];
}

const ToppingsEffect = ({ toppings }: ToppingsEffectProps) => {
  return (
    <motion.div className="absolute top-[15%] w-full">
      {toppings.map((topping, index) => {
        switch (topping) {
          case "whipped_cream":
            return <WhippedCreamEffect key={topping} index={index} />;
          case "cinnamon":
            return <CinnamonEffect key={topping} index={index} />;
          case "cocoa":
            return <CocoaEffect key={topping} index={index} />;
          case "caramel_drizzle":
            return <CaramelDrizzleEffect key={topping} index={index} />;
          default:
            return null;
        }
      })}
    </motion.div>
  );
};

export default ToppingsEffect;