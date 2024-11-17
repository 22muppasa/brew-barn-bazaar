import { motion } from "framer-motion";

interface SavedDrinksProps {
  savedDrinks: any[];
}

const SavedDrinks = ({ savedDrinks }: SavedDrinksProps) => {
  if (!savedDrinks || savedDrinks.length === 0) return null;

  return (
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
  );
};

export default SavedDrinks;