import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { motion } from "framer-motion";
import { useSession } from "@supabase/auth-helpers-react";
import { useEffect, useState } from "react";
import Navigation from "@/components/Navigation";
import RewardsHeader from "@/components/rewards/RewardsHeader";
import TierBenefit from "@/components/rewards/TierBenefit";

const tiers = [
  {
    name: 'Bronze',
    points: 0,
    benefits: [
      'Earn 1 point per dollar spent',
      'Free Classic Espresso on signup'
    ],
    freeItem: {
      name: 'Classic Espresso',
      image: 'https://images.unsplash.com/photo-1610889556528-9a770e32642f'
    },
    color: 'bg-amber-700'
  },
  {
    name: 'Silver',
    points: 100,
    benefits: [
      'Earn 1.2 points per dollar spent',
      'Free Cappuccino monthly'
    ],
    freeItem: {
      name: 'Cappuccino',
      image: 'https://images.unsplash.com/photo-1534778101976-62847782c00e'
    },
    color: 'bg-gray-400'
  },
  {
    name: 'Gold',
    points: 500,
    benefits: [
      'Earn 1.5 points per dollar spent',
      'Free Caramel Latte monthly'
    ],
    freeItem: {
      name: 'Caramel Latte',
      image: 'https://images.unsplash.com/photo-1461023058943-07fcbe16d735'
    },
    color: 'bg-yellow-500'
  },
  {
    name: 'Platinum',
    points: 1000,
    benefits: [
      'Earn 2 points per dollar spent',
      'Free Frappuccino weekly'
    ],
    freeItem: {
      name: 'Frappuccino',
      image: 'https://images.unsplash.com/photo-1572490122747-3968b75cc699'
    },
    color: 'bg-gray-600'
  }
];

const Rewards = () => {
  const session = useSession();
  const [previousTier, setPreviousTier] = useState<string | null>(null);
  const [newlyAchievedTier, setNewlyAchievedTier] = useState<string | null>(null);

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

  useEffect(() => {
    if (rewards?.tier && previousTier && rewards.tier !== previousTier) {
      setNewlyAchievedTier(rewards.tier);
      const timer = setTimeout(() => setNewlyAchievedTier(null), 3000);
      return () => clearTimeout(timer);
    }
    setPreviousTier(rewards?.tier || null);
  }, [rewards?.tier]);

  const getTierProgress = () => {
    const points = rewards?.points || 0;
    if (points < 100) return { next: 'Silver', progress: (points / 100) * 100 };
    if (points < 500) return { next: 'Gold', progress: ((points - 100) / 400) * 100 };
    if (points < 1000) return { next: 'Platinum', progress: ((points - 500) / 500) * 100 };
    return { next: 'Maximum', progress: 100 };
  };

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
          
          <RewardsHeader 
            tier={rewards?.tier || 'Bronze'}
            points={rewards?.points || 0}
            nextTier={next}
            progress={progress}
          />
          
          <div className="relative mt-16">
            {tiers.map((tier, index) => (
              <TierBenefit
                key={tier.name}
                tier={tier}
                isActive={index <= currentTierIndex}
                index={index}
                isNewlyAchieved={tier.name === newlyAchievedTier}
              />
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Rewards;