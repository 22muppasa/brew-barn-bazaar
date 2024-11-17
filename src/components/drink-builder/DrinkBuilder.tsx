import { useState } from "react";
import { useSession } from "@supabase/auth-helpers-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import DrinkPreview from "./DrinkPreview";
import DrinkOptions from "./DrinkOptions";
import SavedDrinks from "./SavedDrinks";

const DrinkBuilder = () => {
  const session = useSession();
  const queryClient = useQueryClient();
  const [baseDrink, setBaseDrink] = useState("espresso");
  const [milkType, setMilkType] = useState("whole");
  const [sweetness, setSweetness] = useState(50);
  const [selectedAddons, setSelectedAddons] = useState<string[]>([]);
  const [drinkName, setDrinkName] = useState("");

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

  const getPreviewColor = () => {
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

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="grid md:grid-cols-2 gap-8">
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

        <div className="flex flex-col items-center justify-center">
          <DrinkPreview
            baseColor={getPreviewColor()}
            toppings={selectedAddons.filter(a => a.includes("_cream"))}
            milkType={milkType}
          />
          <motion.div
            className="mt-4 text-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <p className="text-lg font-medium">Your Custom Drink</p>
            <p className="text-sm text-muted-foreground">
              {baseDrink} with {milkType} milk
            </p>
          </motion.div>
        </div>
      </div>

      <Button
        className="w-full mt-8"
        onClick={() => saveDrinkMutation.mutate()}
        disabled={!session}
      >
        {session ? "Save Custom Drink" : "Login to Save"}
      </Button>

      <SavedDrinks savedDrinks={savedDrinks} />
    </div>
  );
};

export default DrinkBuilder;