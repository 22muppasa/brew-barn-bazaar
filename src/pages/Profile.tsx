import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { motion } from "framer-motion";
import { useSession } from "@supabase/auth-helpers-react";
import Navigation from "@/components/Navigation";
import { Separator } from "@/components/ui/separator";

const Profile = () => {
  const session = useSession();

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

  if (profileLoading || ordersLoading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <div className="container mx-auto px-4 py-8">
        <motion.div
          className="max-w-4xl mx-auto"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h1 className="text-4xl font-bold mb-8">Profile</h1>
          
          <div className="bg-card rounded-lg shadow-lg p-6 mb-8">
            <h2 className="text-2xl font-semibold mb-4">Account Information</h2>
            <div className="space-y-2">
              <p><span className="font-medium">Email:</span> {profile?.email}</p>
              <p><span className="font-medium">Name:</span> {profile?.full_name}</p>
            </div>
          </div>

          <div className="bg-card rounded-lg shadow-lg p-6">
            <h2 className="text-2xl font-semibold mb-4">Order History</h2>
            <div className="space-y-6">
              {orders?.map((order: any) => (
                <div key={order.id} className="border rounded-lg p-4">
                  <div className="flex justify-between items-center mb-2">
                    <p className="font-medium">Order #{order.id.slice(0, 8)}</p>
                    <p className="text-muted-foreground">
                      {new Date(order.created_at).toLocaleDateString()}
                    </p>
                  </div>
                  <Separator className="my-2" />
                  <div className="space-y-2">
                    {order.order_items.map((item: any) => (
                      <div key={item.id} className="flex justify-between">
                        <span>{item.product_name} x{item.quantity}</span>
                        <span>${item.price}</span>
                      </div>
                    ))}
                  </div>
                  <Separator className="my-2" />
                  <div className="flex justify-between font-medium">
                    <span>Total</span>
                    <span>${order.total_amount}</span>
                  </div>
                </div>
              ))}
              {orders?.length === 0 && (
                <p className="text-center text-muted-foreground">No orders yet</p>
              )}
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Profile;