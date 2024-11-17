import { useState } from "react";
import { useSession } from "@supabase/auth-helpers-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { toast } from "sonner";
import DrinkPreview from "./DrinkPreview";

const MILK_TYPES = [
  { value: "whole", label: "Whole Milk" },
  { value: "oat", label: "Oat Milk" },
  { value: "almond", label: "Almond Milk" },
  { value: "soy", label: "Soy Milk" },
];

const FLAVOR_SHOTS = [
  { value: "vanilla", label: "Vanilla" },
  { value: "caramel", label: "Caramel" },
  { value: "hazelnut", label: "Hazelnut" },
  { value: "chocolate", label: "Chocolate" },
];

const TOPPINGS = [
  { value: "whipped_cream", label: "Whipped Cream" },
  { value: "cinnamon", label: "Cinnamon" },
  { value: "cocoa", label: "Cocoa Powder" },
  { value: "caramel_drizzle", label: "Caramel Drizzle" },
];

const DrinkBuilder = () => {
  const session = useSession();
  const queryClient = useQueryClient();
  const [baseDrink, setBaseDrink] = useState("espresso");
  const [milkType, setMilkType] = useState(MILK_TYPES[0].value);
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

      const addons = selectedAddons.map(addon => ({
        custom_drink_id: drink.id,
        addon_type: addon.includes("_cream") ? "topping" : "flavor",
        addon_name: addon,
      }));

      if (addons.length > 0) {
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
        <div className="space-y-6">
          <div>
            <h3 className="text-lg font-medium mb-2">Choose your base</h3>
            <Select
              value={baseDrink}
              onValueChange={setBaseDrink}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select base drink" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="espresso">Espresso</SelectItem>
                <SelectItem value="tea">Tea</SelectItem>
                <SelectItem value="matcha">Matcha</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <h3 className="text-lg font-medium mb-2">Choose milk type</h3>
            <Select
              value={milkType}
              onValueChange={setMilkType}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select milk type" />
              </SelectTrigger>
              <SelectContent>
                {MILK_TYPES.map((milk) => (
                  <SelectItem key={milk.value} value={milk.value}>
                    {milk.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <h3 className="text-lg font-medium mb-2">Sweetness Level</h3>
            <Slider
              value={[sweetness]}
              onValueChange={(values) => setSweetness(values[0])}
              max={100}
              step={10}
              className="w-full"
            />
            <p className="text-sm text-muted-foreground mt-1">
              {sweetness}% sweet
            </p>
          </div>

          <div>
            <h3 className="text-lg font-medium mb-2">Add-ons</h3>
            <div className="grid grid-cols-2 gap-2">
              {[...FLAVOR_SHOTS, ...TOPPINGS].map((addon) => (
                <Button
                  key={addon.value}
                  variant={selectedAddons.includes(addon.value) ? "default" : "outline"}
                  onClick={() => {
                    setSelectedAddons(prev =>
                      prev.includes(addon.value)
                        ? prev.filter(a => a !== addon.value)
                        : [...prev, addon.value]
                    );
                  }}
                  className="w-full"
                >
                  {addon.label}
                </Button>
              ))}
            </div>
          </div>

          <Button
            className="w-full"
            onClick={() => saveDrinkMutation.mutate()}
            disabled={!session}
          >
            {session ? "Save Custom Drink" : "Login to Save"}
          </Button>
        </div>

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

      {savedDrinks && savedDrinks.length > 0 && (
        <div className="mt-12">
          <h2 className="text-2xl font-bold mb-4">Your Saved Drinks</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {savedDrinks.map((drink: any) => (
              <motion.div
                key={drink.id}
                className="bg-card rounded-lg p-4 shadow-sm"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <h3 className="font-medium">{drink.name}</h3>
                <p className="text-sm text-muted-foreground">
                  {drink.base_drink} • {drink.milk_type} milk • {drink.sweetness_level}% sweet
                </p>
                {drink.drink_addons?.length > 0 && (
                  <p className="text-sm text-muted-foreground mt-1">
                    Add-ons: {drink.drink_addons.map((a: any) => a.addon_name).join(", ")}
                  </p>
                )}
              </motion.div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default DrinkBuilder;