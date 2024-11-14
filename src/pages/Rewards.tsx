import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { motion } from "framer-motion";
import { useSession } from "@supabase/auth-helpers-react";
import Navigation from "@/components/Navigation";
import { Progress } from "@/components/ui/progress";

const Rewards = () => {
  const session = useSession();

  const { data: rewards, isLoading } = useQuery({
    queryKey: ['rewards'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('rewards')
        .select('*')
        .eq('user_id', session?.user?.id)
        .single();
      
      if (error) throw error;
      return data;
    },
  });

  const getTierProgress = () => {
    const points = rewards?.points || 0;
    if (points < 100) return { next: 'Silver', progress: (points / 100) * 100 };
    if (points < 500) return { next: 'Gold', progress: ((points - 100) / 400) * 100 };
    if (points < 1000) return { next: 'Platinum', progress: ((points - 500) / 500) * 100 };
    return { next: 'Maximum', progress: 100 };
  };

  if (isLoading) {
    return <div>Loading...</div>;
  }

  const { next, progress } = getTierProgress();

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <div className="container mx-auto px-4 py-8">
        <motion.div
          className="max-w-2xl mx-auto"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h1 className="text-4xl font-bold mb-8 text-center">Your Rewards</h1>
          
          <div className="bg-card rounded-lg shadow-lg p-6 mb-8">
            <div className="text-center mb-6">
              <h2 className="text-2xl font-semibold mb-2">Current Tier</h2>
              <span className="text-4xl font-bold text-primary">
                {rewards?.tier || 'Bronze'}
              </span>
            </div>
            
            <div className="space-y-4">
              <div>
                <div className="flex justify-between mb-2">
                  <span>Progress to {next}</span>
                  <span>{Math.round(progress)}%</span>
                </div>
                <Progress value={progress} className="h-2" />
              </div>
              
              <div className="text-center">
                <p className="text-xl mb-2">Total Points</p>
                <span className="text-3xl font-bold text-primary">
                  {rewards?.points || 0}
                </span>
              </div>
            </div>
          </div>
          
          <div className="bg-card rounded-lg shadow-lg p-6">
            <h3 className="text-xl font-semibold mb-4">Tier Benefits</h3>
            <div className="space-y-4">
              <div>
                <h4 className="font-semibold">Bronze</h4>
                <p className="text-muted-foreground">• Earn 1 point per dollar spent</p>
              </div>
              <div>
                <h4 className="font-semibold">Silver (100 points)</h4>
                <p className="text-muted-foreground">• Earn 1.2 points per dollar spent</p>
                <p className="text-muted-foreground">• Free drink on your birthday</p>
              </div>
              <div>
                <h4 className="font-semibold">Gold (500 points)</h4>
                <p className="text-muted-foreground">• Earn 1.5 points per dollar spent</p>
                <p className="text-muted-foreground">• Monthly free drink</p>
              </div>
              <div>
                <h4 className="font-semibold">Platinum (1000 points)</h4>
                <p className="text-muted-foreground">• Earn 2 points per dollar spent</p>
                <p className="text-muted-foreground">• Priority ordering</p>
                <p className="text-muted-foreground">• Exclusive tastings</p>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Rewards;