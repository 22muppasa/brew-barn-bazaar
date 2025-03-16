
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Trophy } from "lucide-react";
import { useState } from "react";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { ScrollTransform } from "@/components/ui/scroll-transform";
import { Skeleton } from "@/components/ui/skeleton";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

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

  const getMedalStyles = (index: number) => {
    if (index === 0) return { bg: "bg-gradient-to-br from-yellow-300 to-yellow-500", text: "text-yellow-950", border: "border-yellow-400", shadow: "shadow-lg shadow-yellow-500/20" };
    if (index === 1) return { bg: "bg-gradient-to-br from-gray-300 to-gray-400", text: "text-gray-950", border: "border-gray-300", shadow: "shadow-md shadow-gray-500/20" };
    if (index === 2) return { bg: "bg-gradient-to-br from-amber-600 to-amber-800", text: "text-amber-50", border: "border-amber-700", shadow: "shadow-md shadow-amber-700/20" };
    return { bg: "bg-gradient-to-br from-primary/5 to-primary/10", text: "text-primary-foreground", border: "border-primary/10", shadow: "shadow-sm" };
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
              <SheetTitle className="text-center text-3xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-primary via-accent to-primary">
                <motion.div
                  initial={{ y: -20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ duration: 0.6, type: "spring" }}
                  className="flex items-center justify-center gap-2"
                >
                  <Trophy className="h-7 w-7 text-yellow-500" />
                  <span>Rewards Leaderboard</span>
                </motion.div>
              </SheetTitle>
            </SheetHeader>
            
            {isLoading ? (
              <div className="flex flex-col space-y-3 px-1">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="flex items-center justify-between p-4 rounded-xl">
                    <div className="flex items-center gap-3">
                      <Skeleton className="h-10 w-10 rounded-full" />
                      <div className="space-y-2">
                        <Skeleton className="h-4 w-24" />
                        <Skeleton className="h-3 w-16" />
                      </div>
                    </div>
                    <Skeleton className="h-8 w-16 rounded-lg" />
                  </div>
                ))}
              </div>
            ) : (
              <div className="mt-4 pb-8">
                {/* Desktop and Tablet View */}
                <div className="hidden sm:block">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-12">Rank</TableHead>
                        <TableHead>User</TableHead>
                        <TableHead className="text-right">Points</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {leaderboard?.map((user, index) => {
                        const medal = getMedalStyles(index);
                        return (
                          <TableRow key={index} className="hover:bg-primary/5">
                            <TableCell className="font-medium">
                              <div className={`h-8 w-8 rounded-full flex items-center justify-center ${medal.bg} ${medal.text} text-sm font-bold`}>
                                {index + 1}
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="font-medium flex items-center gap-1">
                                {user.username}
                                {user.is_anonymous && (
                                  <span className="text-xs bg-primary/10 px-1.5 py-0.5 rounded-full text-primary/70">
                                    anonymous
                                  </span>
                                )}
                                <span className="text-xs text-muted-foreground ml-2 bg-primary/5 px-1.5 py-0.5 rounded-full">
                                  {user.tier}
                                </span>
                              </div>
                            </TableCell>
                            <TableCell className="text-right font-semibold">
                              {user.points}
                              <span className="text-xs ml-1 text-primary/80">pts</span>
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </div>

                {/* Mobile View */}
                <motion.div 
                  className="sm:hidden space-y-3"
                  variants={container}
                  initial="hidden"
                  animate="show"
                >
                  {leaderboard?.map((user, index) => {
                    const medal = getMedalStyles(index);
                    return (
                      <motion.div 
                        key={index}
                        variants={item}
                        className={`flex items-center justify-between p-3 rounded-xl border ${medal.border} ${medal.shadow} backdrop-blur-sm`}
                        whileHover={{ y: -2, transition: { duration: 0.2 } }}
                      >
                        <div className="flex items-center gap-3">
                          <div className={`h-9 w-9 rounded-full flex items-center justify-center ${medal.bg} ${medal.text} text-sm font-bold`}>
                            {index + 1}
                          </div>
                          <div>
                            <div className="font-bold text-sm flex items-center gap-1">
                              {user.username}
                              {user.is_anonymous && (
                                <motion.span 
                                  className="text-xs bg-primary/10 px-1 py-0.5 rounded-full text-primary/70"
                                  initial={{ scale: 0.8 }}
                                  animate={{ scale: 1 }}
                                  transition={{ duration: 0.2 }}
                                >
                                  anon
                                </motion.span>
                              )}
                            </div>
                            <div className="text-xs text-muted-foreground rounded-full px-1.5 py-0.5 bg-primary/5 inline-block mt-1">{user.tier}</div>
                          </div>
                        </div>
                        <motion.div 
                          className="font-bold text-base bg-primary/10 px-2 py-1 rounded-lg"
                          whileHover={{ scale: 1.05 }}
                        >
                          {user.points} 
                          <span className="text-xs ml-1 text-primary/80">pts</span>
                        </motion.div>
                      </motion.div>
                    );
                  })}
                </motion.div>
                
                {(!leaderboard || leaderboard.length === 0) && (
                  <ScrollTransform effect="fade" direction="up" className="text-center py-12">
                    <div className="p-8 rounded-xl border border-primary/10 bg-primary/5">
                      <Trophy className="h-12 w-12 mx-auto text-muted-foreground mb-4 opacity-50" />
                      <p className="text-muted-foreground text-lg">No users on the leaderboard yet.</p>
                      <p className="text-xs mt-2 text-muted-foreground/70">Be the first to earn rewards points!</p>
                    </div>
                  </ScrollTransform>
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
