
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Trophy } from "lucide-react";
import { useState } from "react";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";

interface RewardsHeaderProps {
  tier: string;
  points: number;
  nextTier: string;
  progress: number;
}

interface LeaderboardUser {
  username: string;
  points: number;
  tier: string;
}

const RewardsHeader = ({ tier, points, nextTier, progress }: RewardsHeaderProps) => {
  const [isOpen, setIsOpen] = useState(false);

  const { data: leaderboard, isLoading } = useQuery({
    queryKey: ['leaderboard'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('rewards')
        .select('points, tier, profiles(full_name)')
        .order('points', { ascending: false })
        .limit(10);
      
      if (error) throw error;
      
      return data.map((item: any) => ({
        username: item.profiles?.full_name || 'Anonymous User',
        points: item.points,
        tier: item.tier
      }));
    },
  });

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
    >
      <Card className="p-8 mb-8 bg-gradient-to-br from-primary/10 to-transparent backdrop-blur-sm relative">
        <Sheet open={isOpen} onOpenChange={setIsOpen}>
          <SheetTrigger asChild>
            <Button 
              variant="ghost" 
              size="icon" 
              className="absolute top-4 right-4 bg-primary/10 hover:bg-primary/20"
              aria-label="View Leaderboard"
            >
              <Trophy className="h-5 w-5" />
            </Button>
          </SheetTrigger>
          <SheetContent>
            <SheetHeader>
              <SheetTitle className="text-center text-2xl mb-6">Rewards Leaderboard</SheetTitle>
            </SheetHeader>
            {isLoading ? (
              <div className="flex justify-center mt-8">Loading leaderboard...</div>
            ) : (
              <div className="space-y-4 mt-4">
                {leaderboard?.map((user, index) => (
                  <div 
                    key={index} 
                    className={`flex items-center justify-between p-3 rounded-lg ${
                      index === 0 ? 'bg-yellow-500/10 border border-yellow-500/20' : 
                      index === 1 ? 'bg-gray-400/10 border border-gray-400/20' : 
                      index === 2 ? 'bg-amber-700/10 border border-amber-700/20' : 
                      'bg-background/80'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`h-8 w-8 rounded-full flex items-center justify-center ${
                        index === 0 ? 'bg-yellow-500 text-yellow-950' : 
                        index === 1 ? 'bg-gray-400 text-gray-950' : 
                        index === 2 ? 'bg-amber-700 text-amber-950' : 
                        'bg-muted text-muted-foreground'
                      }`}>
                        {index + 1}
                      </div>
                      <div>
                        <div className="font-medium">{user.username}</div>
                        <div className="text-xs text-muted-foreground">{user.tier}</div>
                      </div>
                    </div>
                    <div className="font-bold">{user.points} pts</div>
                  </div>
                ))}
                
                {(!leaderboard || leaderboard.length === 0) && (
                  <div className="text-center py-8 text-muted-foreground">
                    No users on the leaderboard yet.
                  </div>
                )}
              </div>
            )}
          </SheetContent>
        </Sheet>
        
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
