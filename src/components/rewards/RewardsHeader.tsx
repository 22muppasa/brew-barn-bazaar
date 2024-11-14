import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { motion } from "framer-motion";

interface RewardsHeaderProps {
  tier: string;
  points: number;
  nextTier: string;
  progress: number;
}

const RewardsHeader = ({ tier, points, nextTier, progress }: RewardsHeaderProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
    >
      <Card className="p-8 mb-8 bg-gradient-to-br from-primary/10 to-transparent backdrop-blur-sm">
        <motion.div 
          className="text-center mb-8"
          initial={{ scale: 0.9 }}
          animate={{ scale: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <h2 className="text-2xl font-semibold mb-3">Current Tier</h2>
          <span className="text-5xl font-bold text-primary bg-clip-text text-transparent bg-gradient-to-r from-primary to-accent">
            {tier}
          </span>
        </motion.div>
        
        <div className="space-y-6">
          <div>
            <motion.div 
              className="flex justify-between mb-2"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
            >
              <span>Progress to {nextTier}</span>
              <span>{Math.round(progress)}%</span>
            </motion.div>
            <motion.div
              initial={{ scaleX: 0 }}
              animate={{ scaleX: 1 }}
              transition={{ duration: 0.8, delay: 0.5 }}
            >
              <Progress value={progress} className="h-3 rounded-full" />
            </motion.div>
          </div>
          
          <motion.div 
            className="text-center p-4 bg-primary/5 rounded-lg"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
          >
            <p className="text-xl mb-2">Total Points</p>
            <motion.span 
              className="text-4xl font-bold text-primary"
              initial={{ scale: 0.5 }}
              animate={{ scale: 1 }}
              transition={{ 
                type: "spring",
                stiffness: 260,
                damping: 20,
                delay: 0.7
              }}
            >
              {points}
            </motion.span>
          </motion.div>
        </div>
      </Card>
    </motion.div>
  );
};

export default RewardsHeader;