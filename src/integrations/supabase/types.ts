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
      api_logs: {
        Row: {
          api: string
          created_at: string
          details: Json | null
          endpoint: string
          id: string
          response_time: number | null
          status: string
        }
        Insert: {
          api: string
          created_at?: string
          details?: Json | null
          endpoint: string
          id?: string
          response_time?: number | null
          status: string
        }
        Update: {
          api?: string
          created_at?: string
          details?: Json | null
          endpoint?: string
          id?: string
          response_time?: number | null
          status?: string
        }
        Relationships: []
      }
      categories: {
        Row: {
          created_at: string
          description: string | null
          id: string
          image_url: string | null
          name: string
          slug: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          image_url?: string | null
          name: string
          slug: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          image_url?: string | null
          name?: string
          slug?: string
          updated_at?: string
        }
        Relationships: []
      }
      deposits: {
        Row: {
          amount: number
          created_at: string
          id: string
          metadata: Json | null
          payment_id: string | null
          payment_method: string
          paypal_order_id: string | null
          paypal_payer_email: string | null
          paypal_payer_id: string | null
          status: string
          transaction_hash: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          amount: number
          created_at?: string
          id?: string
          metadata?: Json | null
          payment_id?: string | null
          payment_method: string
          paypal_order_id?: string | null
          paypal_payer_email?: string | null
          paypal_payer_id?: string | null
          status?: string
          transaction_hash?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          amount?: number
          created_at?: string
          id?: string
          metadata?: Json | null
          payment_id?: string | null
          payment_method?: string
          paypal_order_id?: string | null
          paypal_payer_email?: string | null
          paypal_payer_id?: string | null
          status?: string
          transaction_hash?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      email_logs: {
        Row: {
          created_at: string
          email_type: string
          id: string
          metadata: Json | null
          recipient_email: string
          sent_at: string
          user_id: string | null
        }
        Insert: {
          created_at?: string
          email_type: string
          id?: string
          metadata?: Json | null
          recipient_email: string
          sent_at?: string
          user_id?: string | null
        }
        Update: {
          created_at?: string
          email_type?: string
          id?: string
          metadata?: Json | null
          recipient_email?: string
          sent_at?: string
          user_id?: string | null
        }
        Relationships: []
      }
      exchange_rate_history: {
        Row: {
          created_at: string
          from_currency: string
          id: string
          new_rate: number
          old_rate: number | null
          to_currency: string
          updated_by: string | null
        }
        Insert: {
          created_at?: string
          from_currency: string
          id?: string
          new_rate: number
          old_rate?: number | null
          to_currency: string
          updated_by?: string | null
        }
        Update: {
          created_at?: string
          from_currency?: string
          id?: string
          new_rate?: number
          old_rate?: number | null
          to_currency?: string
          updated_by?: string | null
        }
        Relationships: []
      }
      exchange_rates: {
        Row: {
          created_at: string
          from_currency: string
          id: string
          rate: number
          to_currency: string
          updated_at: string
          updated_by: string | null
        }
        Insert: {
          created_at?: string
          from_currency: string
          id?: string
          rate: number
          to_currency: string
          updated_at?: string
          updated_by?: string | null
        }
        Update: {
          created_at?: string
          from_currency?: string
          id?: string
          rate?: number
          to_currency?: string
          updated_at?: string
          updated_by?: string | null
        }
        Relationships: []
      }
      order_items: {
        Row: {
          created_at: string
          data: Json | null
          id: string
          order_id: string
          price: number
          product_id: string
          quantity: number
          total: number
        }
        Insert: {
          created_at?: string
          data?: Json | null
          id?: string
          order_id: string
          price: number
          product_id: string
          quantity?: number
          total: number
        }
        Update: {
          created_at?: string
          data?: Json | null
          id?: string
          order_id?: string
          price?: number
          product_id?: string
          quantity?: number
          total?: number
        }
        Relationships: [
          {
            foreignKeyName: "order_items_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "order_items_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      orders: {
        Row: {
          created_at: string
          id: string
          status: Database["public"]["Enums"]["order_status"]
          total_amount: number
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          status?: Database["public"]["Enums"]["order_status"]
          total_amount: number
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          status?: Database["public"]["Enums"]["order_status"]
          total_amount?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      products: {
        Row: {
          api_order_id: string | null
          category_id: string
          created_at: string
          description: string
          features: Json | null
          id: string
          image_url: string | null
          kiosk_token: string | null
          metadata: Json | null
          name: string
          price: number
          sale_price: number | null
          sku: string
          slug: string
          status: Database["public"]["Enums"]["product_status"]
          stock_quantity: number
          subcategory_id: string | null
          updated_at: string
        }
        Insert: {
          api_order_id?: string | null
          category_id: string
          created_at?: string
          description: string
          features?: Json | null
          id?: string
          image_url?: string | null
          kiosk_token?: string | null
          metadata?: Json | null
          name: string
          price: number
          sale_price?: number | null
          sku: string
          slug: string
          status?: Database["public"]["Enums"]["product_status"]
          stock_quantity?: number
          subcategory_id?: string | null
          updated_at?: string
        }
        Update: {
          api_order_id?: string | null
          category_id?: string
          created_at?: string
          description?: string
          features?: Json | null
          id?: string
          image_url?: string | null
          kiosk_token?: string | null
          metadata?: Json | null
          name?: string
          price?: number
          sale_price?: number | null
          sku?: string
          slug?: string
          status?: Database["public"]["Enums"]["product_status"]
          stock_quantity?: number
          subcategory_id?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "products_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "products_subcategory_id_fkey"
            columns: ["subcategory_id"]
            isOneToOne: false
            referencedRelation: "subcategories"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          balance: number
          created_at: string
          email: string
          full_name: string | null
          id: string
          role: Database["public"]["Enums"]["user_role"]
          updated_at: string
          username: string
        }
        Insert: {
          avatar_url?: string | null
          balance?: number
          created_at?: string
          email: string
          full_name?: string | null
          id: string
          role?: Database["public"]["Enums"]["user_role"]
          updated_at?: string
          username: string
        }
        Update: {
          avatar_url?: string | null
          balance?: number
          created_at?: string
          email?: string
          full_name?: string | null
          id?: string
          role?: Database["public"]["Enums"]["user_role"]
          updated_at?: string
          username?: string
        }
        Relationships: []
      }
      subcategories: {
        Row: {
          category_id: string
          created_at: string
          description: string | null
          id: string
          image_url: string | null
          name: string
          slug: string
          updated_at: string
        }
        Insert: {
          category_id: string
          created_at?: string
          description?: string | null
          id?: string
          image_url?: string | null
          name: string
          slug: string
          updated_at?: string
        }
        Update: {
          category_id?: string
          created_at?: string
          description?: string | null
          id?: string
          image_url?: string | null
          name?: string
          slug?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "subcategories_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
        ]
      }
      taphoammo_mock_orders: {
        Row: {
          created_at: string | null
          id: string
          kiosk_token: string
          order_id: string
          product_keys: Json | null
          promotion: string | null
          quantity: number
          status: string
          updated_at: string | null
          user_token: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          kiosk_token: string
          order_id: string
          product_keys?: Json | null
          promotion?: string | null
          quantity: number
          status?: string
          updated_at?: string | null
          user_token: string
        }
        Update: {
          created_at?: string | null
          id?: string
          kiosk_token?: string
          order_id?: string
          product_keys?: Json | null
          promotion?: string | null
          quantity?: number
          status?: string
          updated_at?: string | null
          user_token?: string
        }
        Relationships: []
      }
      taphoammo_mock_products: {
        Row: {
          created_at: string | null
          description: string | null
          id: string
          kiosk_token: string
          name: string
          price: number
          stock_quantity: number
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          id?: string
          kiosk_token: string
          name: string
          price: number
          stock_quantity?: number
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          id?: string
          kiosk_token?: string
          name?: string
          price?: number
          stock_quantity?: number
          updated_at?: string | null
        }
        Relationships: []
      }
      transactions: {
        Row: {
          amount: number
          created_at: string
          description: string | null
          id: string
          reference_id: string | null
          type: Database["public"]["Enums"]["transaction_type"]
          user_id: string
        }
        Insert: {
          amount: number
          created_at?: string
          description?: string | null
          id?: string
          reference_id?: string | null
          type: Database["public"]["Enums"]["transaction_type"]
          user_id: string
        }
        Update: {
          amount?: number
          created_at?: string
          description?: string | null
          id?: string
          reference_id?: string | null
          type?: Database["public"]["Enums"]["transaction_type"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      admin_update_exchange_rate: {
        Args: {
          p_from_currency: string
          p_to_currency: string
          p_new_rate: number
        }
        Returns: boolean
      }
      generate_random_order_id: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      is_admin: {
        Args: Record<PropertyKey, never>
        Returns: boolean
      }
      update_user_balance: {
        Args: { user_id: string; amount: number }
        Returns: undefined
      }
    }
    Enums: {
      order_status: "pending" | "completed" | "cancelled" | "refunded"
      product_status: "active" | "inactive" | "out_of_stock"
      transaction_type: "purchase" | "deposit" | "refund"
      user_role: "user" | "admin"
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
    Enums: {
      order_status: ["pending", "completed", "cancelled", "refunded"],
      product_status: ["active", "inactive", "out_of_stock"],
      transaction_type: ["purchase", "deposit", "refund"],
      user_role: ["user", "admin"],
    },
  },
} as const
