
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { 
  Crown, 
  Medal, 
  Sparkles, 
  Star, 
  Trophy, 
  Flame,
  ArrowUp
} from "lucide-react";
import { useState } from "react";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { ScrollTransform } from "@/components/ui/scroll-transform";
import { Skeleton } from "@/components/ui/skeleton";

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
  is_anonymous: boolean;
}

const RewardsHeader = ({ tier, points, nextTier, progress }: RewardsHeaderProps) => {
  const [isOpen, setIsOpen] = useState(false);

  const { data: leaderboard, isLoading } = useQuery({
    queryKey: ['leaderboard'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('rewards')
        .select('points, tier, user_id, profiles(full_name, show_on_leaderboard)')
        .order('points', { ascending: false })
        .limit(10);
      
      if (error) throw error;
      
      return data.map((item: any) => {
        const showOnLeaderboard = item.profiles?.show_on_leaderboard !== false;
        return {
          username: showOnLeaderboard ? (item.profiles?.full_name || 'Anonymous User') : 'Anonymous User',
          points: item.points,
          tier: item.tier,
          is_anonymous: !showOnLeaderboard
        };
      });
    },
  });

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } }
  };

  const getTierColor = (tier: string) => {
    switch(tier) {
      case 'Platinum': return 'bg-gradient-to-r from-gray-300 to-gray-500 text-white';
      case 'Gold': return 'bg-gradient-to-r from-yellow-300 to-amber-500 text-yellow-900';
      case 'Silver': return 'bg-gradient-to-r from-gray-200 to-gray-400 text-gray-800';
      case 'Bronze': 
      default: return 'bg-gradient-to-r from-amber-600 to-amber-800 text-amber-50';
    }
  };

  const getRankIcon = (index: number) => {
    if (index === 0) return (
      <motion.div 
        className="absolute -top-1 -right-1"
        animate={{ 
          rotate: [0, 10, -10, 0],
          scale: [1, 1.1, 1]
        }}
        transition={{ 
          duration: 2,
          repeat: Infinity,
          repeatType: "reverse"
        }}
      >
        <Crown className="h-6 w-6 text-yellow-500 drop-shadow-lg" />
      </motion.div>
    );
    
    if (index === 1) return (
      <motion.div 
        className="absolute -top-0 -right-0"
        animate={{ scale: [1, 1.05, 1] }}
        transition={{ 
          duration: 1.5,
          repeat: Infinity,
          repeatType: "reverse"
        }}
      >
        <Medal className="h-5 w-5 text-gray-400" />
      </motion.div>
    );
    
    if (index === 2) return (
      <motion.div 
        className="absolute -top-0 -right-0"
        animate={{ scale: [1, 1.05, 1] }}
        transition={{ 
          duration: 1.5,
          repeat: Infinity,
          repeatType: "reverse"
        }}
      >
        <Medal className="h-5 w-5 text-amber-700" />
      </motion.div>
    );
    
    return null;
  };

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
              <motion.div
                whileHover={{ rotate: 20, scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
              >
                <Trophy className="h-5 w-5" />
              </motion.div>
            </Button>
          </SheetTrigger>
          <SheetContent className="bg-gradient-to-b from-background to-background/95 border-l-primary/20 overflow-y-auto sm:max-w-md w-full">
            <SheetHeader>
              <SheetTitle className="text-center mb-6">
                <motion.div
                  initial={{ y: -20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ duration: 0.6, type: "spring" }}
                  className="flex items-center justify-center gap-2"
                >
                  <div className="relative">
                    <Trophy className="h-8 w-8 text-yellow-500" />
                    <motion.div
                      className="absolute -top-1 -right-1"
                      animate={{ 
                        scale: [1, 1.2, 1],
                        rotate: [0, 5, -5, 0]
                      }}
                      transition={{ 
                        duration: 2,
                        repeat: Infinity,
                        repeatType: "reverse"
                      }}
                    >
                      <Sparkles className="h-4 w-4 text-yellow-300" />
                    </motion.div>
                  </div>
                  <h2 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-yellow-400 via-amber-500 to-yellow-600">
                    Rewards Leaderboard
                  </h2>
                </motion.div>
              </SheetTitle>
            </SheetHeader>
            
            {isLoading ? (
              <div className="space-y-4 px-1">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="relative">
                    <Skeleton className="h-24 w-full rounded-xl" />
                  </div>
                ))}
              </div>
            ) : (
              <motion.div 
                className="space-y-4 pb-10"
                variants={container}
                initial="hidden"
                animate="show"
              >
                {leaderboard?.map((user, index) => (
                  <motion.div 
                    key={index}
                    variants={item}
                    className="relative"
                  >
                    <motion.div
                      whileHover={{ y: -4, scale: 1.02 }}
                      transition={{ type: "spring", stiffness: 400, damping: 17 }}
                      className={`rounded-xl overflow-hidden shadow-md border ${index < 3 ? 'border-yellow-500/30' : 'border-primary/10'}`}
                    >
                      <div className={`
                        w-full relative py-4 px-5
                        ${index === 0 ? 'bg-gradient-to-r from-yellow-400 to-amber-500' : 
                          index === 1 ? 'bg-gradient-to-r from-gray-200 to-gray-400' : 
                          index === 2 ? 'bg-gradient-to-r from-amber-600 to-amber-800' : 
                          'bg-gradient-to-r from-primary/5 to-primary/10'
                        }
                      `}>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-4">
                            <div className={`
                              relative flex items-center justify-center h-12 w-12 min-w-[3rem] rounded-full
                              ${index === 0 ? 'bg-yellow-200 text-yellow-800' : 
                               index === 1 ? 'bg-gray-100 text-gray-800' : 
                               index === 2 ? 'bg-amber-200 text-amber-900' : 
                               'bg-white/80 text-gray-700'}
                              text-xl font-bold shadow-inner
                            `}>
                              {index + 1}
                              {getRankIcon(index)}
                            </div>
                            
                            <div className="min-w-0 flex-1">
                              <div className="flex items-center gap-2 flex-wrap">
                                <h3 className={`
                                  font-bold text-lg truncate max-w-[120px] sm:max-w-[180px]
                                  ${index === 0 ? 'text-yellow-900' : 
                                   index === 1 ? 'text-gray-800' : 
                                   index === 2 ? 'text-amber-50' : 
                                   'text-primary'}
                                `}>
                                  {user.username}
                                </h3>
                                {user.is_anonymous && (
                                  <span className={`
                                    text-xs px-1.5 py-0.5 rounded-full 
                                    ${index < 3 ? 'bg-white/30 text-gray-800' : 'bg-primary/10 text-primary/70'}
                                  `}>
                                    anonymous
                                  </span>
                                )}
                              </div>
                              
                              <motion.div 
                                whileHover={{ scale: 1.05 }}
                                className={`inline-block text-xs rounded-full px-2 py-0.5 mt-1.5 ${getTierColor(user.tier)}`}
                              >
                                {user.tier}
                              </motion.div>
                            </div>
                          </div>
                          
                          <div className="flex flex-col items-end">
                            <motion.div 
                              whileHover={{ scale: 1.1 }}
                              className={`
                                flex items-center gap-1 px-3 py-1.5 rounded-full font-bold
                                ${index === 0 ? 'bg-yellow-200 text-yellow-800' : 
                                 index === 1 ? 'bg-gray-100 text-gray-800' : 
                                 index === 2 ? 'bg-amber-200 text-amber-900' : 
                                 'bg-white/80 text-gray-700'}
                              `}
                            >
                              {index < 3 && (
                                <Flame 
                                  className={`h-4 w-4 ${
                                    index === 0 ? 'text-amber-600' : 
                                    index === 1 ? 'text-gray-500' : 
                                    'text-amber-700'
                                  }`} 
                                />
                              )}
                              <span>{user.points}</span>
                              <span className="text-xs opacity-80">pts</span>
                            </motion.div>
                            
                            {index === 0 && (
                              <motion.div 
                                className="flex items-center gap-1 text-xs mt-1 text-yellow-800 mr-2"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ delay: 0.5 }}
                              >
                                <ArrowUp className="h-3 w-3" />
                                <span>Leader</span>
                              </motion.div>
                            )}
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  </motion.div>
                ))}
                
                {(!leaderboard || leaderboard.length === 0) && (
                  <ScrollTransform effect="fade" direction="up" className="text-center py-12">
                    <div className="p-8 rounded-xl border border-primary/10 bg-primary/5">
                      <Trophy className="h-12 w-12 mx-auto text-muted-foreground mb-4 opacity-50" />
                      <p className="text-muted-foreground text-lg">No users on the leaderboard yet.</p>
                      <p className="text-xs mt-2 text-muted-foreground/70">Be the first to earn rewards points!</p>
                    </div>
                  </ScrollTransform>
                )}
              </motion.div>
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
