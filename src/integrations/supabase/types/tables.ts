
export type CartItem = {
  created_at: string;
  id: string;
  price: number;
  product_name: string;
  quantity: number;
  user_id: string | null;
}

export type MenuItem = {
  id: string;
  name: string;
  description: string | null;
  price: number;
  category: string;
  image_url: string | null;
  created_at: string;
}

export type Order = {
  id: string;
  user_id: string | null;
  total_amount: number;
  status: string;
  created_at: string;
}

export type OrderItem = {
  id: string;
  order_id: string | null;
  product_name: string;
  quantity: number;
  price: number;
  created_at: string;
}

export type Profile = {
  id: string;
  email: string | null;
  full_name: string | null;
  created_at: string;
  phone_number: string | null;
  address: string | null;
  city: string | null;
  state: string | null;
  zip_code: string | null;
  birthdate: string | null;
  favorite_product: string | null;
}

export type Reward = {
  id: string;
  user_id: string | null;
  points: number | null;
  tier: string | null;
  created_at: string;
}

export type CustomDrink = {
  id: string;
  user_id: string | null;
  name: string;
  base_drink: string;
  milk_type: string;
  sweetness_level: number;
  created_at: string;
}

export type DrinkAddon = {
  id: string;
  custom_drink_id: string;
  addon_type: string;
  addon_name: string;
  created_at: string;
}

export type ProductReview = {
  id: string;
  user_id: string;
  product_name: string;
  rating: number;
  comment: string | null;
  created_at: string;
}
