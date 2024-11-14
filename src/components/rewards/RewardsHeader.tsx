import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";

interface RewardsHeaderProps {
  tier: string;
  points: number;
  nextTier: string;
  progress: number;
}

const RewardsHeader = ({ tier, points, nextTier, progress }: RewardsHeaderProps) => {
  return (
    <Card className="p-6 mb-8">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-semibold mb-2">Current Tier</h2>
        <span className="text-4xl font-bold text-primary">{tier}</span>
      </div>
      
      <div className="space-y-4">
        <div>
          <div className="flex justify-between mb-2">
            <span>Progress to {nextTier}</span>
            <span>{Math.round(progress)}%</span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>
        
        <div className="text-center">
          <p className="text-xl mb-2">Total Points</p>
          <span className="text-3xl font-bold text-primary">{points}</span>
        </div>
      </div>
    </Card>
  );
};

export default RewardsHeader;