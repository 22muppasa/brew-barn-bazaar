
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { motion, AnimatePresence } from "framer-motion";
import { useSession } from "@supabase/auth-helpers-react";
import Navigation from "@/components/Navigation";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

const Profile = () => {
  const session = useSession();
  const navigate = useNavigate();

  const { data: orders, isLoading: ordersLoading } = useQuery({
    queryKey: ['orders'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('orders')
        .select(`
          *,
          order_items (*)
        `)
        .eq('user_id', session?.user?.id)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data;
    },
  });

  const { data: customDrinks, isLoading: drinksLoading } = useQuery({
    queryKey: ['custom-drinks'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('custom_drinks')
        .select(`
          *,
          drink_addons (*)
        `)
        .eq('user_id', session?.user?.id)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data;
    },
  });

  const { data: profile, isLoading: profileLoading } = useQuery({
    queryKey: ['profile'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', session?.user?.id)
        .single();
      
      if (error) throw error;
      return data;
    },
  });

  if (profileLoading || ordersLoading || drinksLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <div className="container mx-auto px-4 py-8">
        <motion.div
          className="max-w-4xl mx-auto space-y-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <motion.div
            className="bg-card rounded-lg shadow-lg p-6"
            whileHover={{ scale: 1.02 }}
            transition={{ type: "spring", stiffness: 300 }}
          >
            <h2 className="text-2xl font-semibold mb-4">Account Information</h2>
            <div className="space-y-2">
              <p><span className="font-medium">Email:</span> {profile?.email}</p>
              <p><span className="font-medium">Name:</span> {profile?.full_name}</p>
            </div>
          </motion.div>

          <motion.div
            className="bg-card rounded-lg shadow-lg p-6"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-semibold">My Custom Drinks</h2>
              <Button onClick={() => navigate("/menu")}>Create New Drink</Button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <AnimatePresence>
                {customDrinks?.map((drink: any) => (
                  <motion.div
                    key={drink.id}
                    className="bg-background/50 backdrop-blur-sm rounded-lg p-4 border border-border"
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    whileHover={{ scale: 1.02 }}
                  >
                    <h3 className="font-medium text-lg">{drink.name}</h3>
                    <p className="text-muted-foreground">
                      {drink.base_drink} with {drink.milk_type} milk
                    </p>
                    {drink.drink_addons?.length > 0 && (
                      <p className="text-sm text-muted-foreground mt-1">
                        Add-ons: {drink.drink_addons.map((a: any) => a.addon_name).join(", ")}
                      </p>
                    )}
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          </motion.div>

          <motion.div
            className="bg-card rounded-lg shadow-lg p-6"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
          >
            <h2 className="text-2xl font-semibold mb-4">Order History</h2>
            <div className="space-y-6">
              <AnimatePresence>
                {orders?.map((order: any) => (
                  <motion.div
                    key={order.id}
                    className="border rounded-lg p-4"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    whileHover={{ scale: 1.01 }}
                  >
                    <div className="flex justify-between items-center mb-2">
                      <p className="font-medium">Order #{order.id.slice(0, 8)}</p>
                      <p className="text-muted-foreground">
                        {new Date(order.created_at).toLocaleDateString()}
                      </p>
                    </div>
                    <Separator className="my-2" />
                    <div className="space-y-2">
                      {order.order_items.map((item: any) => (
                        <motion.div
                          key={item.id}
                          className="flex justify-between"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                        >
                          <span>{item.product_name} x{item.quantity}</span>
                          <span>${item.price}</span>
                        </motion.div>
                      ))}
                    </div>
                    <Separator className="my-2" />
                    <div className="flex justify-between font-medium">
                      <span>Total</span>
                      <span>${order.total_amount}</span>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
              {orders?.length === 0 && (
                <p className="text-center text-muted-foreground">No orders yet</p>
              )}
            </div>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
};

export default Profile;
