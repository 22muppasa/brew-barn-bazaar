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
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.2 }}
      className={`relative pl-8 pb-12 border-l-2 ${
        isActive ? 'border-primary' : 'border-muted'
      }`}
    >
      {/* Tier node */}
      <div
        className={`absolute -left-[11px] w-5 h-5 rounded-full ${
          isActive ? tier.color + ' ring-4 ring-primary' : 'bg-muted'
        }`}
      />
      
      {/* Tier content */}
      <div className="ml-6">
        <h3 className="text-xl font-semibold mb-2">{tier.name}</h3>
        <p className="text-muted-foreground mb-4">{tier.points} points</p>
        
        <Card className="p-4">
          <div className="flex items-start gap-4">
            {/* Free item image */}
            <div className="w-20 h-20 rounded-full overflow-hidden flex-shrink-0 border-2 border-primary">
              <img 
                src={tier.freeItem.image} 
                alt={tier.freeItem.name}
                className="w-full h-full object-cover"
              />
            </div>
            
            {/* Benefits list */}
            <ul className="space-y-2 flex-grow">
              {tier.benefits.map((benefit, i) => (
                <motion.li
                  key={i}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.2 + 0.1 + (i * 0.1) }}
                  className="flex items-start text-sm"
                >
                  <span className="mr-2">•</span>
                  {benefit}
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