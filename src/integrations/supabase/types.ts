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
      api_circuit_breakers: {
        Row: {
          api_name: string
          created_at: string
          failure_count: number
          id: string
          is_open: boolean
          last_failure_time: string | null
          reset_timeout: number
          threshold: number
          updated_at: string
        }
        Insert: {
          api_name: string
          created_at?: string
          failure_count?: number
          id?: string
          is_open?: boolean
          last_failure_time?: string | null
          reset_timeout?: number
          threshold?: number
          updated_at?: string
        }
        Update: {
          api_name?: string
          created_at?: string
          failure_count?: number
          id?: string
          is_open?: boolean
          last_failure_time?: string | null
          reset_timeout?: number
          threshold?: number
          updated_at?: string
        }
        Relationships: []
      }
      api_health: {
        Row: {
          api_name: string
          consecutive_success: number | null
          created_at: string
          error_count: number
          half_open: boolean | null
          id: string
          is_open: boolean
          last_error: string | null
          opened_at: string | null
          updated_at: string
        }
        Insert: {
          api_name: string
          consecutive_success?: number | null
          created_at?: string
          error_count?: number
          half_open?: boolean | null
          id?: string
          is_open?: boolean
          last_error?: string | null
          opened_at?: string | null
          updated_at?: string
        }
        Update: {
          api_name?: string
          consecutive_success?: number | null
          created_at?: string
          error_count?: number
          half_open?: boolean | null
          id?: string
          is_open?: boolean
          last_error?: string | null
          opened_at?: string | null
          updated_at?: string
        }
        Relationships: []
      }
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
      discount_history: {
        Row: {
          change_note: string | null
          changed_by: string | null
          created_at: string | null
          expiry_date: string | null
          id: string
          new_percentage: number | null
          previous_percentage: number | null
          user_id: string | null
        }
        Insert: {
          change_note?: string | null
          changed_by?: string | null
          created_at?: string | null
          expiry_date?: string | null
          id?: string
          new_percentage?: number | null
          previous_percentage?: number | null
          user_id?: string | null
        }
        Update: {
          change_note?: string | null
          changed_by?: string | null
          created_at?: string | null
          expiry_date?: string | null
          id?: string
          new_percentage?: number | null
          previous_percentage?: number | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "discount_history_changed_by_fkey"
            columns: ["changed_by"]
            isOneToOne: false
            referencedRelation: "discount_analytics"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "discount_history_changed_by_fkey"
            columns: ["changed_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "discount_history_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "discount_analytics"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "discount_history_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      email_logs: {
        Row: {
          created_at: string
          email_type: string
          id: string
          metadata: Json | null
          recipient_email: string
          sent_at: string
          status: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string
          email_type: string
          id?: string
          metadata?: Json | null
          recipient_email: string
          sent_at?: string
          status?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string
          email_type?: string
          id?: string
          metadata?: Json | null
          recipient_email?: string
          sent_at?: string
          status?: string | null
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
      inventory_cache: {
        Row: {
          cached_until: string
          created_at: string
          id: string
          kiosk_token: string
          last_checked_at: string
          last_sync_status: string
          price: number
          product_id: string | null
          retry_count: number
          source: string
          stock_quantity: number
          sync_message: string | null
          updated_at: string
        }
        Insert: {
          cached_until?: string
          created_at?: string
          id?: string
          kiosk_token: string
          last_checked_at?: string
          last_sync_status?: string
          price?: number
          product_id?: string | null
          retry_count?: number
          source?: string
          stock_quantity?: number
          sync_message?: string | null
          updated_at?: string
        }
        Update: {
          cached_until?: string
          created_at?: string
          id?: string
          kiosk_token?: string
          last_checked_at?: string
          last_sync_status?: string
          price?: number
          product_id?: string | null
          retry_count?: number
          source?: string
          stock_quantity?: number
          sync_message?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "inventory_cache_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      inventory_sync_history: {
        Row: {
          created_at: string
          id: string
          kiosk_token: string
          message: string | null
          new_price: number | null
          new_quantity: number
          old_price: number | null
          old_quantity: number
          product_id: string | null
          status: string
          sync_type: string
        }
        Insert: {
          created_at?: string
          id?: string
          kiosk_token: string
          message?: string | null
          new_price?: number | null
          new_quantity: number
          old_price?: number | null
          old_quantity: number
          product_id?: string | null
          status?: string
          sync_type: string
        }
        Update: {
          created_at?: string
          id?: string
          kiosk_token?: string
          message?: string | null
          new_price?: number | null
          new_quantity?: number
          old_price?: number | null
          old_quantity?: number
          product_id?: string | null
          status?: string
          sync_type?: string
        }
        Relationships: [
          {
            foreignKeyName: "inventory_sync_history_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      notification_preferences: {
        Row: {
          created_at: string | null
          id: string
          is_enabled: boolean
          notification_type: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          is_enabled?: boolean
          notification_type: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          is_enabled?: boolean
          notification_type?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      notification_settings: {
        Row: {
          created_at: string
          id: string
          is_enabled: boolean
          notification_type: string
          recipient_roles: string[]
          threshold_value: number | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          is_enabled?: boolean
          notification_type: string
          recipient_roles?: string[]
          threshold_value?: number | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          is_enabled?: boolean
          notification_type?: string
          recipient_roles?: string[]
          threshold_value?: number | null
          updated_at?: string
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
      payment_verifications: {
        Row: {
          created_at: string | null
          deposit_id: string | null
          id: string
          last_checked_at: string | null
          status: string
          transaction_hash: string | null
          updated_at: string | null
          verification_attempts: number | null
          verification_data: Json | null
        }
        Insert: {
          created_at?: string | null
          deposit_id?: string | null
          id?: string
          last_checked_at?: string | null
          status?: string
          transaction_hash?: string | null
          updated_at?: string | null
          verification_attempts?: number | null
          verification_data?: Json | null
        }
        Update: {
          created_at?: string | null
          deposit_id?: string | null
          id?: string
          last_checked_at?: string | null
          status?: string
          transaction_hash?: string | null
          updated_at?: string | null
          verification_attempts?: number | null
          verification_data?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "payment_verifications_deposit_id_fkey"
            columns: ["deposit_id"]
            isOneToOne: false
            referencedRelation: "deposits"
            referencedColumns: ["id"]
          },
        ]
      }
      product_cache: {
        Row: {
          kiosk_token: string
          name: string | null
          price: number | null
          product_id: string
          stock_quantity: number
          updated_at: string
        }
        Insert: {
          kiosk_token: string
          name?: string | null
          price?: number | null
          product_id: string
          stock_quantity?: number
          updated_at?: string
        }
        Update: {
          kiosk_token?: string
          name?: string | null
          price?: number | null
          product_id?: string
          stock_quantity?: number
          updated_at?: string
        }
        Relationships: []
      }
      product_reviews: {
        Row: {
          comment: string | null
          created_at: string
          helpful_count: number | null
          id: string
          is_verified_purchase: boolean | null
          product_id: string
          rating: number
          updated_at: string
          user_id: string
        }
        Insert: {
          comment?: string | null
          created_at?: string
          helpful_count?: number | null
          id?: string
          is_verified_purchase?: boolean | null
          product_id: string
          rating: number
          updated_at?: string
          user_id: string
        }
        Update: {
          comment?: string | null
          created_at?: string
          helpful_count?: number | null
          id?: string
          is_verified_purchase?: boolean | null
          product_id?: string
          rating?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "product_reviews_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
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
          is_visible: boolean
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
          is_visible?: boolean
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
          is_visible?: boolean
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
          discount_expires_at: string | null
          discount_note: string | null
          discount_percentage: number | null
          discount_updated_at: string | null
          discount_updated_by: string | null
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
          discount_expires_at?: string | null
          discount_note?: string | null
          discount_percentage?: number | null
          discount_updated_at?: string | null
          discount_updated_by?: string | null
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
          discount_expires_at?: string | null
          discount_note?: string | null
          discount_percentage?: number | null
          discount_updated_at?: string | null
          discount_updated_by?: string | null
          email?: string
          full_name?: string | null
          id?: string
          role?: Database["public"]["Enums"]["user_role"]
          updated_at?: string
          username?: string
        }
        Relationships: [
          {
            foreignKeyName: "profiles_discount_updated_by_fkey"
            columns: ["discount_updated_by"]
            isOneToOne: false
            referencedRelation: "discount_analytics"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "profiles_discount_updated_by_fkey"
            columns: ["discount_updated_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      stock_notifications: {
        Row: {
          created_at: string
          email: string
          id: string
          is_notified: boolean
          product_id: string | null
          updated_at: string
          user_id: string | null
        }
        Insert: {
          created_at?: string
          email: string
          id?: string
          is_notified?: boolean
          product_id?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          is_notified?: boolean
          product_id?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "stock_notifications_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
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
      sync_configuration: {
        Row: {
          created_at: string
          id: string
          is_active: boolean
          name: string
          priority: number
          schedule_interval: number
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          is_active?: boolean
          name: string
          priority?: number
          schedule_interval?: number
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          is_active?: boolean
          name?: string
          priority?: number
          schedule_interval?: number
          updated_at?: string
        }
        Relationships: []
      }
      sync_job_queue: {
        Row: {
          attempts: number
          completed_at: string | null
          created_at: string
          data: Json
          id: string
          job_type: string
          max_attempts: number
          next_attempt_at: string
          priority: number
          result: Json | null
          status: string
          updated_at: string
        }
        Insert: {
          attempts?: number
          completed_at?: string | null
          created_at?: string
          data?: Json
          id?: string
          job_type: string
          max_attempts?: number
          next_attempt_at?: string
          priority?: number
          result?: Json | null
          status?: string
          updated_at?: string
        }
        Update: {
          attempts?: number
          completed_at?: string | null
          created_at?: string
          data?: Json
          id?: string
          job_type?: string
          max_attempts?: number
          next_attempt_at?: string
          priority?: number
          result?: Json | null
          status?: string
          updated_at?: string
        }
        Relationships: []
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
      user_tokens: {
        Row: {
          created_at: string
          description: string | null
          expires_at: string | null
          id: string
          is_favorite: boolean | null
          name: string
          status: string
          token: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          expires_at?: string | null
          id?: string
          is_favorite?: boolean | null
          name: string
          status?: string
          token: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          description?: string | null
          expires_at?: string | null
          id?: string
          is_favorite?: boolean | null
          name?: string
          status?: string
          token?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      discount_analytics: {
        Row: {
          discount_expires_at: string | null
          discount_note: string | null
          discount_percentage: number | null
          discount_updated_at: string | null
          email: string | null
          full_name: string | null
          order_count: number | null
          total_discount_amount: number | null
          user_id: string | null
          username: string | null
        }
        Insert: {
          discount_expires_at?: string | null
          discount_note?: string | null
          discount_percentage?: number | null
          discount_updated_at?: string | null
          email?: string | null
          full_name?: string | null
          order_count?: never
          total_discount_amount?: never
          user_id?: string | null
          username?: string | null
        }
        Update: {
          discount_expires_at?: string | null
          discount_note?: string | null
          discount_percentage?: number | null
          discount_updated_at?: string | null
          email?: string | null
          full_name?: string | null
          order_count?: never
          total_discount_amount?: never
          user_id?: string | null
          username?: string | null
        }
        Relationships: []
      }
      discount_distribution: {
        Row: {
          discount_range: string | null
          user_count: number | null
        }
        Relationships: []
      }
    }
    Functions: {
      add_loyalty_points: {
        Args: {
          p_user_id: string
          p_points: number
          p_transaction_type: Database["public"]["Enums"]["loyalty_transaction_type"]
          p_reference_id: string
          p_description: string
        }
        Returns: string
      }
      admin_update_exchange_rate: {
        Args: {
          p_from_currency: string
          p_to_currency: string
          p_new_rate: number
        }
        Returns: boolean
      }
      admin_update_user_discount: {
        Args:
          | {
              p_user_id: string
              p_discount_percentage: number
              p_discount_note: string
            }
          | {
              p_user_id: string
              p_discount_percentage: number
              p_discount_note: string
              p_expires_at?: string
            }
        Returns: string
      }
      calculate_loyalty_discount: {
        Args: { user_id: string; order_amount: number }
        Returns: number
      }
      calculate_order_loyalty_points: {
        Args: { order_amount: number }
        Returns: number
      }
      calculate_user_discount: {
        Args: { p_user_id: string; p_amount: number }
        Returns: number
      }
      check_if_should_open_circuit: {
        Args: Record<PropertyKey, never>
        Returns: boolean
      }
      generate_random_order_id: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      get_discount_distribution: {
        Args: Record<PropertyKey, never>
        Returns: {
          discount_range: string
          user_count: number
        }[]
      }
      get_user_loyalty_info: {
        Args: { p_user_id: string }
        Returns: {
          user_id: string
          loyalty_points: number
          current_tier_name: string
          current_tier_discount: number
          current_tier_perks: string[]
          current_tier_icon: string
          next_tier_name: string
          next_tier_min_points: number
          points_to_next_tier: number
        }[]
      }
      increment_error_count: {
        Args: Record<PropertyKey, never>
        Returns: number
      }
      is_admin: {
        Args: Record<PropertyKey, never>
        Returns: boolean
      }
      reset_expired_discounts: {
        Args: Record<PropertyKey, never>
        Returns: number
      }
      update_opened_at_if_needed: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      update_user_balance: {
        Args: { user_id: string; amount: number }
        Returns: undefined
      }
      update_user_loyalty_tier: {
        Args: { user_id: string }
        Returns: string
      }
    }
    Enums: {
      loyalty_transaction_type: "earned" | "redeemed" | "expired" | "adjusted"
      order_status:
        | "pending"
        | "completed"
        | "cancelled"
        | "refunded"
        | "failed"
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
      loyalty_transaction_type: ["earned", "redeemed", "expired", "adjusted"],
      order_status: ["pending", "completed", "cancelled", "refunded", "failed"],
      product_status: ["active", "inactive", "out_of_stock"],
      transaction_type: ["purchase", "deposit", "refund"],
      user_role: ["user", "admin"],
    },
  },
} as const
