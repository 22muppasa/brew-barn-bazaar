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

type DefaultSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
