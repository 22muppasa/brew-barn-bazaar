import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { motion } from "framer-motion";
import { useSession } from "@supabase/auth-helpers-react";
import Navigation from "@/components/Navigation";
import { Progress } from "@/components/ui/progress";
import { Card } from "@/components/ui/card";

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

  const tiers = [
    {
      name: 'Bronze',
      points: 0,
      benefits: ['Earn 1 point per dollar spent', 'Free Classic Espresso on signup'],
      freeItem: {
        name: 'Classic Espresso',
        image: 'https://images.unsplash.com/photo-1618160702438-9b02ab6515c9'
      },
      color: 'bg-amber-700'
    },
    {
      name: 'Silver',
      points: 100,
      benefits: ['Earn 1.2 points per dollar spent', 'Free Cappuccino monthly'],
      freeItem: {
        name: 'Cappuccino',
        image: 'https://images.unsplash.com/photo-1482938289607-e9573fc25ebb'
      },
      color: 'bg-gray-400'
    },
    {
      name: 'Gold',
      points: 500,
      benefits: ['Earn 1.5 points per dollar spent', 'Free Caramel Latte monthly'],
      freeItem: {
        name: 'Caramel Latte',
        image: 'https://images.unsplash.com/photo-1509316975850-ff9c5deb0cd9'
      },
      color: 'bg-yellow-500'
    },
    {
      name: 'Platinum',
      points: 1000,
      benefits: ['Earn 2 points per dollar spent', 'Free Frappuccino weekly'],
      freeItem: {
        name: 'Frappuccino',
        image: 'https://images.unsplash.com/photo-1500375592092-40eb2168fd21'
      },
      color: 'bg-gray-600'
    }
  ];

  const getCurrentTierIndex = () => {
    const points = rewards?.points || 0;
    if (points >= 1000) return 3;
    if (points >= 500) return 2;
    if (points >= 100) return 1;
    return 0;
  };

  if (isLoading) {
    return <div>Loading...</div>;
  }

  const { next, progress } = getTierProgress();
  const currentTierIndex = getCurrentTierIndex();

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <div className="container mx-auto px-4 py-8">
        <motion.div
          className="max-w-4xl mx-auto"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h1 className="text-4xl font-bold mb-8 text-center">Your Rewards</h1>
          
          <Card className="p-6 mb-8">
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
          </Card>
          
          <div className="relative mt-16">
            {/* Timeline line */}
            <div className="absolute top-1/2 left-0 w-full h-1 bg-muted -translate-y-1/2" />
            
            {/* Timeline nodes */}
            <div className="relative flex justify-between">
              {tiers.map((tier, index) => (
                <motion.div
                  key={tier.name}
                  className="relative"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.2 }}
                >
                  {/* Timeline node */}
                  <div className={`
                    w-8 h-8 rounded-full ${tier.color} 
                    ${index <= currentTierIndex ? 'ring-4 ring-primary' : 'opacity-50'}
                    relative z-10 mx-auto
                  `} />
                  
                  {/* Tier name and points */}
                  <div className="absolute -top-10 left-1/2 -translate-x-1/2 whitespace-nowrap">
                    <p className="font-semibold">{tier.name}</p>
                    <p className="text-sm text-muted-foreground">{tier.points} points</p>
                  </div>
                  
                  {/* Benefits card with free item image */}
                  <motion.div
                    className={`absolute top-12 left-1/2 -translate-x-1/2 w-64 
                      ${index <= currentTierIndex ? 'opacity-100' : 'opacity-50'}`}
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ delay: index * 0.2 + 0.2 }}
                  >
                    <Card className="p-4">
                      <div className="flex items-start gap-4">
                        {/* Free item image */}
                        <div className="w-16 h-16 rounded-full overflow-hidden flex-shrink-0">
                          <img 
                            src={tier.freeItem.image} 
                            alt={tier.freeItem.name}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        
                        {/* Benefits list */}
                        <ul className="text-sm space-y-2 flex-grow">
                          {tier.benefits.map((benefit, i) => (
                            <motion.li
                              key={i}
                              initial={{ opacity: 0, x: -20 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ delay: index * 0.2 + 0.4 + (i * 0.1) }}
                              className="flex items-start"
                            >
                              <span className="mr-2">•</span>
                              {benefit}
                            </motion.li>
                          ))}
                        </ul>
                      </div>
                    </Card>
                  </motion.div>
                </motion.div>
              ))}
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Rewards;