import { useState } from "react";
import { useSession } from "@supabase/auth-helpers-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import DrinkPreview from "./DrinkPreview";
import DrinkOptions from "./DrinkOptions";
import SavedDrinks from "./SavedDrinks";
import { useAddToCart } from "@/hooks/useAddToCart";

const DrinkBuilder = () => {
  const session = useSession();
  const queryClient = useQueryClient();
  const [baseDrink, setBaseDrink] = useState("espresso");
  const [milkType, setMilkType] = useState("whole");
  const [sweetness, setSweetness] = useState(50);
  const [selectedAddons, setSelectedAddons] = useState<string[]>([]);
  const [drinkName, setDrinkName] = useState("");
  const addToCart = useAddToCart();

  const { data: savedDrinks } = useQuery({
    queryKey: ["custom-drinks"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("custom_drinks")
        .select("*, drink_addons(*)")
        .eq("user_id", session?.user?.id);
      
      if (error) throw error;
      return data;
    },
    enabled: !!session?.user?.id,
  });

  const saveDrinkMutation = useMutation({
    mutationFn: async () => {
      if (!session?.user?.id) throw new Error("Must be logged in");

      const { data: drink, error: drinkError } = await supabase
        .from("custom_drinks")
        .insert({
          user_id: session.user.id,
          name: drinkName || "My Custom Drink",
          base_drink: baseDrink,
          milk_type: milkType,
          sweetness_level: sweetness,
        })
        .select()
        .single();

      if (drinkError) throw drinkError;

      if (selectedAddons.length > 0) {
        const addons = selectedAddons.map(addon => ({
          custom_drink_id: drink.id,
          addon_type: addon.includes("_cream") ? "topping" : "flavor",
          addon_name: addon,
        }));

        const { error: addonsError } = await supabase
          .from("drink_addons")
          .insert(addons);

        if (addonsError) throw addonsError;
      }

      return drink;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["custom-drinks"] });
      toast.success("Drink saved successfully!");
    },
    onError: () => {
      toast.error("Failed to save drink");
    },
  });

  const handleAddToCart = async () => {
    const basePrice = 4.99;
    const addonPrice = selectedAddons.length * 0.75;
    const totalPrice = basePrice + addonPrice;
    
    await addToCart({
      productName: drinkName || "Custom Drink",
      price: totalPrice,
      quantity: 1
    });
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <motion.div 
        className="grid md:grid-cols-2 gap-8"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
        >
          <DrinkOptions
            baseDrink={baseDrink}
            setBaseDrink={setBaseDrink}
            milkType={milkType}
            setMilkType={setMilkType}
            sweetness={sweetness}
            setSweetness={setSweetness}
            selectedAddons={selectedAddons}
            setSelectedAddons={setSelectedAddons}
          />
        </motion.div>

        <motion.div 
          className="flex flex-col items-center justify-center space-y-6"
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.4 }}
        >
          <DrinkPreview
            baseColor={getPreviewColor(baseDrink)}
            toppings={selectedAddons.filter(a => a.includes("_cream"))}
            milkType={milkType}
            sweetness={sweetness}
          />
          
          <motion.div
            className="w-full max-w-md space-y-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
          >
            <Input
              placeholder="Name your drink"
              value={drinkName}
              onChange={(e) => setDrinkName(e.target.value)}
              className="text-center"
            />
            
            <div className="flex gap-4">
              <Button
                className="w-full"
                onClick={() => saveDrinkMutation.mutate()}
                disabled={!session}
              >
                {session ? "Save Drink" : "Login to Save"}
              </Button>
              
              <Button
                className="w-full"
                variant="secondary"
                onClick={handleAddToCart}
                disabled={!session}
              >
                Add to Cart
              </Button>
            </div>
          </motion.div>
        </motion.div>
      </motion.div>

      {savedDrinks && savedDrinks.length > 0 && (
        <SavedDrinks savedDrinks={savedDrinks} />
      )}
    </div>
  );
};

const getPreviewColor = (baseDrink: string) => {
  switch (baseDrink) {
    case "espresso":
      return "rgb(86, 45, 29)";
    case "tea":
      return "rgb(173, 114, 87)";
    case "matcha":
      return "rgb(134, 187, 106)";
    default:
      return "rgb(121, 85, 61)";
  }
};

export default DrinkBuilder;