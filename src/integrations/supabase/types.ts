export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      cart_items: {
        Row: {
          created_at: string
          id: string
          price: number
          product_name: string
          quantity: number
          user_id: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          price: number
          product_name: string
          quantity: number
          user_id?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          price?: number
          product_name?: string
          quantity?: number
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "cart_items_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      custom_drinks: {
        Row: {
          base_drink: string
          created_at: string
          id: string
          milk_type: string
          name: string
          sweetness_level: number
          user_id: string | null
        }
        Insert: {
          base_drink: string
          created_at?: string
          id?: string
          milk_type: string
          name: string
          sweetness_level: number
          user_id?: string | null
        }
        Update: {
          base_drink?: string
          created_at?: string
          id?: string
          milk_type?: string
          name?: string
          sweetness_level?: number
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "custom_drinks_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      drink_addons: {
        Row: {
          addon_name: string
          addon_type: string
          created_at: string
          custom_drink_id: string | null
          id: string
        }
        Insert: {
          addon_name: string
          addon_type: string
          created_at?: string
          custom_drink_id?: string | null
          id?: string
        }
        Update: {
          addon_name?: string
          addon_type?: string
          created_at?: string
          custom_drink_id?: string | null
          id?: string
        }
        Relationships: [
          {
            foreignKeyName: "drink_addons_custom_drink_id_fkey"
            columns: ["custom_drink_id"]
            isOneToOne: false
            referencedRelation: "custom_drinks"
            referencedColumns: ["id"]
          },
        ]
      }
      menu_items: {
        Row: {
          category: string
          created_at: string
          description: string | null
          id: string
          image_url: string | null
          name: string
          price: number
        }
        Insert: {
          category: string
          created_at?: string
          description?: string | null
          id?: string
          image_url?: string | null
          name: string
          price: number
        }
        Update: {
          category?: string
          created_at?: string
          description?: string | null
          id?: string
          image_url?: string | null
          name?: string
          price?: number
        }
        Relationships: []
      }
      order_items: {
        Row: {
          created_at: string
          id: string
          order_id: string | null
          price: number
          product_name: string
          quantity: number
        }
        Insert: {
          created_at?: string
          id?: string
          order_id?: string | null
          price: number
          product_name: string
          quantity: number
        }
        Update: {
          created_at?: string
          id?: string
          order_id?: string | null
          price?: number
          product_name?: string
          quantity?: number
        }
        Relationships: [
          {
            foreignKeyName: "order_items_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
        ]
      }
      orders: {
        Row: {
          created_at: string
          id: string
          status: string
          total_amount: number
          user_id: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          status?: string
          total_amount: number
          user_id?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          status?: string
          total_amount?: number
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "orders_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      product_reviews: {
        Row: {
          comment: string | null
          created_at: string
          id: string
          product_name: string
          rating: number
          updated_at: string
          user_id: string
        }
        Insert: {
          comment?: string | null
          created_at?: string
          id?: string
          product_name: string
          rating: number
          updated_at?: string
          user_id: string
        }
        Update: {
          comment?: string | null
          created_at?: string
          id?: string
          product_name?: string
          rating?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          address: string | null
          birthdate: string | null
          city: string | null
          created_at: string
          email: string | null
          favorite_product: string | null
          full_name: string | null
          id: string
          phone_number: string | null
          show_on_leaderboard: boolean | null
          state: string | null
          zip_code: string | null
        }
        Insert: {
          address?: string | null
          birthdate?: string | null
          city?: string | null
          created_at?: string
          email?: string | null
          favorite_product?: string | null
          full_name?: string | null
          id: string
          phone_number?: string | null
          show_on_leaderboard?: boolean | null
          state?: string | null
          zip_code?: string | null
        }
        Update: {
          address?: string | null
          birthdate?: string | null
          city?: string | null
          created_at?: string
          email?: string | null
          favorite_product?: string | null
          full_name?: string | null
          id?: string
          phone_number?: string | null
          show_on_leaderboard?: boolean | null
          state?: string | null
          zip_code?: string | null
        }
        Relationships: []
      }
      rewards: {
        Row: {
          created_at: string
          id: string
          points: number | null
          tier: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          points?: number | null
          tier?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          points?: number | null
          tier?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "rewards_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type PublicSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  PublicTableNameOrOptions extends
    | keyof (PublicSchema["Tables"] & PublicSchema["Views"])
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
        Database[PublicTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
      Database[PublicTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : PublicTableNameOrOptions extends keyof (PublicSchema["Tables"] &
        PublicSchema["Views"])
    ? (PublicSchema["Tables"] &
        PublicSchema["Views"])[PublicTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  PublicEnumNameOrOptions extends
    | keyof PublicSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends PublicEnumNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = PublicEnumNameOrOptions extends { schema: keyof Database }
  ? Database[PublicEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : PublicEnumNameOrOptions extends keyof PublicSchema["Enums"]
    ? PublicSchema["Enums"][PublicEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof PublicSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof PublicSchema["CompositeTypes"]
    ? PublicSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never
