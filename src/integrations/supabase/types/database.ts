
import { CartItem, MenuItem, Order, OrderItem, Profile, Reward, CustomDrink, DrinkAddon, ProductReview } from './tables';

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      cart_items: {
        Row: CartItem;
        Insert: Omit<CartItem, 'id' | 'created_at'> & { id?: string; created_at?: string };
        Update: Partial<CartItem>;
      };
      menu_items: {
        Row: MenuItem;
        Insert: Omit<MenuItem, 'id' | 'created_at'> & { id?: string; created_at?: string };
        Update: Partial<MenuItem>;
      };
      orders: {
        Row: Order;
        Insert: Omit<Order, 'id' | 'created_at'> & { id?: string; created_at?: string };
        Update: Partial<Order>;
      };
      order_items: {
        Row: OrderItem;
        Insert: Omit<OrderItem, 'id' | 'created_at'> & { id?: string; created_at?: string };
        Update: Partial<OrderItem>;
      };
      profiles: {
        Row: Profile;
        Insert: Omit<Profile, 'created_at'> & { created_at?: string };
        Update: Partial<Profile>;
      };
      rewards: {
        Row: Reward;
        Insert: Omit<Reward, 'id' | 'created_at'> & { id?: string; created_at?: string };
        Update: Partial<Reward>;
      };
      custom_drinks: {
        Row: CustomDrink;
        Insert: Omit<CustomDrink, 'id' | 'created_at'> & { id?: string; created_at?: string };
        Update: Partial<CustomDrink>;
      };
      drink_addons: {
        Row: DrinkAddon;
        Insert: Omit<DrinkAddon, 'id' | 'created_at'> & { id?: string; created_at?: string };
        Update: Partial<DrinkAddon>;
      };
      product_reviews: {
        Row: ProductReview;
        Insert: Omit<ProductReview, 'id' | 'created_at' | 'updated_at'> & { id?: string; created_at?: string; updated_at?: string };
        Update: Partial<ProductReview>;
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      [_ in never]: never;
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
}
