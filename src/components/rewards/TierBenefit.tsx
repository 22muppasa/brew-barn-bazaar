import { motion } from "framer-motion";
import { Card } from "@/components/ui/card";

interface TierBenefitProps {
  tier: {
    name: string;
    points: number;
    benefits: string[];
    freeItem: {
      name: string;
      image: string;
    };
    color: string;
  };
  isActive: boolean;
  index: number;
}

const TierBenefit = ({ tier, isActive, index }: TierBenefitProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, x: -50 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ 
        duration: 0.5,
        delay: index * 0.3,
        ease: [0.43, 0.13, 0.23, 0.96]
      }}
      className={`relative pl-8 pb-12 border-l-2 ${
        isActive ? 'border-primary' : 'border-muted'
      }`}
    >
      {/* Animated tier node */}
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{
          type: "spring",
          stiffness: 260,
          damping: 20,
          delay: index * 0.3 + 0.2
        }}
        className={`absolute -left-[11px] w-5 h-5 rounded-full ${
          isActive 
            ? `${tier.color} ring-4 ring-primary shadow-lg` 
            : 'bg-muted'
        }`}
      />
      
      {/* Tier content */}
      <div className="ml-6">
        <motion.h3 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.3 + 0.1 }}
          className="text-xl font-semibold mb-2"
        >
          {tier.name}
        </motion.h3>
        <motion.p 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: index * 0.3 + 0.2 }}
          className="text-muted-foreground mb-4"
        >
          {tier.points} points
        </motion.p>
        
        <Card className="p-4 hover:shadow-lg transition-shadow duration-300">
          <div className="flex items-start gap-6">
            {/* Animated free item image */}
            <motion.div 
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{
                type: "spring",
                stiffness: 260,
                damping: 20,
                delay: index * 0.3 + 0.3
              }}
              className="w-24 h-24 rounded-full overflow-hidden flex-shrink-0 border-4 border-primary shadow-xl hover:scale-105 transition-transform duration-300"
            >
              <img 
                src={tier.freeItem.image} 
                alt={tier.freeItem.name}
                className="w-full h-full object-cover"
              />
            </motion.div>
            
            {/* Benefits list with staggered animation */}
            <ul className="space-y-3 flex-grow">
              {tier.benefits.map((benefit, i) => (
                <motion.li
                  key={i}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ 
                    delay: index * 0.3 + 0.4 + (i * 0.1),
                    type: "spring",
                    stiffness: 100
                  }}
                  className="flex items-start text-sm group"
                >
                  <span className="mr-2 text-primary group-hover:scale-125 transition-transform duration-300">•</span>
                  <span className="group-hover:text-primary transition-colors duration-300">
                    {benefit}
                  </span>
                </motion.li>
              ))}
            </ul>
          </div>
        </Card>
      </div>
    </motion.div>
  );
};

export default TierBenefit;