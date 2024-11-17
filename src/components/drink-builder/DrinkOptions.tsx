import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";

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

interface DrinkOptionsProps {
  baseDrink: string;
  setBaseDrink: (value: string) => void;
  milkType: string;
  setMilkType: (value: string) => void;
  sweetness: number;
  setSweetness: (value: number) => void;
  selectedAddons: string[];
  setSelectedAddons: (value: string[]) => void;
  isIced: boolean;
  setIsIced: (value: boolean) => void;
}

const DrinkOptions = ({
  baseDrink,
  setBaseDrink,
  milkType,
  setMilkType,
  sweetness,
  setSweetness,
  selectedAddons,
  setSelectedAddons,
  isIced,
  setIsIced,
}: DrinkOptionsProps) => {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium mb-2">Choose your base</h3>
        <Select value={baseDrink} onValueChange={setBaseDrink}>
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
        <h3 className="text-lg font-medium mb-2">Temperature</h3>
        <div className="flex gap-2">
          <Button
            variant={!isIced ? "default" : "outline"}
            onClick={() => setIsIced(false)}
            className="w-full"
          >
            Hot
          </Button>
          <Button
            variant={isIced ? "default" : "outline"}
            onClick={() => setIsIced(true)}
            className="w-full"
          >
            Iced
          </Button>
        </div>
      </div>

      <div>
        <h3 className="text-lg font-medium mb-2">Choose milk type</h3>
        <Select value={milkType} onValueChange={setMilkType}>
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
        <p className="text-sm text-muted-foreground mt-1">{sweetness}% sweet</p>
      </div>

      <div>
        <h3 className="text-lg font-medium mb-2">Add-ons</h3>
        <div className="grid grid-cols-2 gap-2">
          {[...FLAVOR_SHOTS, ...TOPPINGS].map((addon) => (
            <Button
              key={addon.value}
              variant={selectedAddons.includes(addon.value) ? "default" : "outline"}
              onClick={() => {
                setSelectedAddons(
                  selectedAddons.includes(addon.value)
                    ? selectedAddons.filter((a) => a !== addon.value)
                    : [...selectedAddons, addon.value]
                );
              }}
              className="w-full"
            >
              {addon.label}
            </Button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default DrinkOptions;