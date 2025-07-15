export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instanciate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "12.2.3 (519615d)"
  }
  public: {
    Tables: {
      addresses: {
        Row: {
          city: string
          country: string
          created_at: string
          id: string
          is_default: boolean
          name: string
          postal_code: string
          state: string
          street_address: string
          updated_at: string
          user_id: string
        }
        Insert: {
          city: string
          country?: string
          created_at?: string
          id?: string
          is_default?: boolean
          name: string
          postal_code: string
          state: string
          street_address: string
          updated_at?: string
          user_id: string
        }
        Update: {
          city?: string
          country?: string
          created_at?: string
          id?: string
          is_default?: boolean
          name?: string
          postal_code?: string
          state?: string
          street_address?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      ai_generated_designs: {
        Row: {
          created_at: string
          design_image: string
          id: string
          is_favorite: boolean
          prompt: string
          theme_id: string | null
          user_id: string
        }
        Insert: {
          created_at?: string
          design_image: string
          id?: string
          is_favorite?: boolean
          prompt: string
          theme_id?: string | null
          user_id: string
        }
        Update: {
          created_at?: string
          design_image?: string
          id?: string
          is_favorite?: boolean
          prompt?: string
          theme_id?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "ai_generated_designs_theme_id_fkey"
            columns: ["theme_id"]
            isOneToOne: false
            referencedRelation: "themes"
            referencedColumns: ["id"]
          },
        ]
      }
      cart_items: {
        Row: {
          created_at: string
          id: string
          legacy_product_id: string | null
          product_id: string
          quantity: number
          selected_color: string | null
          selected_size: string | null
          updated_at: string
          user_id: string
          variant_id: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          legacy_product_id?: string | null
          product_id: string
          quantity?: number
          selected_color?: string | null
          selected_size?: string | null
          updated_at?: string
          user_id: string
          variant_id?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          legacy_product_id?: string | null
          product_id?: string
          quantity?: number
          selected_color?: string | null
          selected_size?: string | null
          updated_at?: string
          user_id?: string
          variant_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "cart_items_variant_id_fkey"
            columns: ["variant_id"]
            isOneToOne: false
            referencedRelation: "product_variants"
            referencedColumns: ["id"]
          },
        ]
      }
      custom_designs: {
        Row: {
          answers: Json | null
          base_price: number
          created_at: string
          design_data: Json
          design_image: string
          design_name: string
          id: string
          theme_name: string | null
          tshirt_color: string
          updated_at: string
          user_id: string
        }
        Insert: {
          answers?: Json | null
          base_price?: number
          created_at?: string
          design_data: Json
          design_image: string
          design_name: string
          id?: string
          theme_name?: string | null
          tshirt_color?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          answers?: Json | null
          base_price?: number
          created_at?: string
          design_data?: Json
          design_image?: string
          design_name?: string
          id?: string
          theme_name?: string | null
          tshirt_color?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      design_questions: {
        Row: {
          created_at: string
          id: string
          is_active: boolean | null
          options: Json | null
          question_text: string
          sort_order: number | null
          theme_id: string | null
          type: string
        }
        Insert: {
          created_at?: string
          id?: string
          is_active?: boolean | null
          options?: Json | null
          question_text: string
          sort_order?: number | null
          theme_id?: string | null
          type: string
        }
        Update: {
          created_at?: string
          id?: string
          is_active?: boolean | null
          options?: Json | null
          question_text?: string
          sort_order?: number | null
          theme_id?: string | null
          type?: string
        }
        Relationships: [
          {
            foreignKeyName: "design_questions_theme_id_fkey"
            columns: ["theme_id"]
            isOneToOne: false
            referencedRelation: "themes"
            referencedColumns: ["id"]
          },
        ]
      }
      design_responses: {
        Row: {
          created_at: string
          design_id: string
          id: string
          question_id: string
          response: string
        }
        Insert: {
          created_at?: string
          design_id: string
          id?: string
          question_id: string
          response: string
        }
        Update: {
          created_at?: string
          design_id?: string
          id?: string
          question_id?: string
          response?: string
        }
        Relationships: [
          {
            foreignKeyName: "design_responses_design_id_fkey"
            columns: ["design_id"]
            isOneToOne: false
            referencedRelation: "designs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "design_responses_question_id_fkey"
            columns: ["question_id"]
            isOneToOne: false
            referencedRelation: "design_questions"
            referencedColumns: ["id"]
          },
        ]
      }
      designs: {
        Row: {
          created_at: string
          description: string | null
          design_data: Json
          id: string
          is_public: boolean | null
          name: string
          preview_url: string | null
          t_shirt_color: string
          theme: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          design_data: Json
          id?: string
          is_public?: boolean | null
          name: string
          preview_url?: string | null
          t_shirt_color: string
          theme?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          description?: string | null
          design_data?: Json
          id?: string
          is_public?: boolean | null
          name?: string
          preview_url?: string | null
          t_shirt_color?: string
          theme?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      order_items: {
        Row: {
          created_at: string
          custom_design_id: string | null
          design_data: Json | null
          id: string
          legacy_product_id: string | null
          order_id: string
          product_id: string
          quantity: number
          total_price: number
          unit_price: number
          variant_id: string | null
        }
        Insert: {
          created_at?: string
          custom_design_id?: string | null
          design_data?: Json | null
          id?: string
          legacy_product_id?: string | null
          order_id: string
          product_id: string
          quantity?: number
          total_price: number
          unit_price: number
          variant_id?: string | null
        }
        Update: {
          created_at?: string
          custom_design_id?: string | null
          design_data?: Json | null
          id?: string
          legacy_product_id?: string | null
          order_id?: string
          product_id?: string
          quantity?: number
          total_price?: number
          unit_price?: number
          variant_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "order_items_custom_design_id_fkey"
            columns: ["custom_design_id"]
            isOneToOne: false
            referencedRelation: "custom_designs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "order_items_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "order_items_variant_id_fkey"
            columns: ["variant_id"]
            isOneToOne: false
            referencedRelation: "product_variants"
            referencedColumns: ["id"]
          },
        ]
      }
      orders: {
        Row: {
          created_at: string
          id: string
          notes: string | null
          order_number: string
          payment_method: string | null
          payment_transaction_id: string | null
          shipping_address: Json
          shipping_address_id: string | null
          status: string
          total_amount: number
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          notes?: string | null
          order_number: string
          payment_method?: string | null
          payment_transaction_id?: string | null
          shipping_address: Json
          shipping_address_id?: string | null
          status?: string
          total_amount: number
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          notes?: string | null
          order_number?: string
          payment_method?: string | null
          payment_transaction_id?: string | null
          shipping_address?: Json
          shipping_address_id?: string | null
          status?: string
          total_amount?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "orders_payment_transaction_id_fkey"
            columns: ["payment_transaction_id"]
            isOneToOne: false
            referencedRelation: "payment_transactions"
            referencedColumns: ["id"]
          },
        ]
      }
      payment_transactions: {
        Row: {
          amount: number
          created_at: string
          currency: string
          failure_reason: string | null
          gateway_response: Json | null
          gateway_transaction_id: string
          id: string
          order_id: string
          payment_gateway: string
          payment_method: string
          status: string
          updated_at: string
          upi_id: string | null
          upi_transaction_id: string | null
        }
        Insert: {
          amount: number
          created_at?: string
          currency?: string
          failure_reason?: string | null
          gateway_response?: Json | null
          gateway_transaction_id: string
          id?: string
          order_id: string
          payment_gateway: string
          payment_method: string
          status?: string
          updated_at?: string
          upi_id?: string | null
          upi_transaction_id?: string | null
        }
        Update: {
          amount?: number
          created_at?: string
          currency?: string
          failure_reason?: string | null
          gateway_response?: Json | null
          gateway_transaction_id?: string
          id?: string
          order_id?: string
          payment_gateway?: string
          payment_method?: string
          status?: string
          updated_at?: string
          upi_id?: string | null
          upi_transaction_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "payment_transactions_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
        ]
      }
      product_categories: {
        Row: {
          created_at: string
          description: string | null
          id: string
          is_active: boolean
          name: string
          sort_order: number | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean
          name: string
          sort_order?: number | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean
          name?: string
          sort_order?: number | null
          updated_at?: string
        }
        Relationships: []
      }
      product_variants: {
        Row: {
          color_hex: string
          color_name: string
          created_at: string
          id: string
          is_active: boolean
          low_stock_threshold: number | null
          price: number
          product_id: string
          size: string
          sku: string
          stock_quantity: number
          updated_at: string
        }
        Insert: {
          color_hex: string
          color_name: string
          created_at?: string
          id?: string
          is_active?: boolean
          low_stock_threshold?: number | null
          price: number
          product_id: string
          size: string
          sku: string
          stock_quantity?: number
          updated_at?: string
        }
        Update: {
          color_hex?: string
          color_name?: string
          created_at?: string
          id?: string
          is_active?: boolean
          low_stock_threshold?: number | null
          price?: number
          product_id?: string
          size?: string
          sku?: string
          stock_quantity?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "fk_product_variants_product_id"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      products: {
        Row: {
          base_price: number
          category: string | null
          category_id: string | null
          colors: Json | null
          created_at: string
          description: string | null
          id: string
          is_active: boolean | null
          name: string
          sizes: Json | null
          updated_at: string
        }
        Insert: {
          base_price: number
          category?: string | null
          category_id?: string | null
          colors?: Json | null
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean | null
          name: string
          sizes?: Json | null
          updated_at?: string
        }
        Update: {
          base_price?: number
          category?: string | null
          category_id?: string | null
          colors?: Json | null
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean | null
          name?: string
          sizes?: Json | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "products_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "product_categories"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          full_name: string | null
          id: string
          marketing_emails: boolean
          updated_at: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          full_name?: string | null
          id: string
          marketing_emails?: boolean
          updated_at?: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          full_name?: string | null
          id?: string
          marketing_emails?: boolean
          updated_at?: string
        }
        Relationships: []
      }
      themes: {
        Row: {
          category: string | null
          created_at: string
          description: string | null
          id: string
          is_active: boolean | null
          name: string
          thumbnail_url: string | null
        }
        Insert: {
          category?: string | null
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean | null
          name: string
          thumbnail_url?: string | null
        }
        Update: {
          category?: string | null
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean | null
          name?: string
          thumbnail_url?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      create_migration_checkpoint: {
        Args: Record<PropertyKey, never>
        Returns: {
          checkpoint_name: string
          table_name: string
          record_count: number
          timestamp_taken: string
        }[]
      }
      generate_order_number: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      generate_variant_sku: {
        Args: { product_name: string; color_name: string; size_name: string }
        Returns: string
      }
      get_color_name_from_hex: {
        Args: { hex_color: string }
        Returns: string
      }
      get_default_variant_for_product: {
        Args: {
          product_uuid: string
          preferred_color?: string
          preferred_size?: string
        }
        Returns: string
      }
      get_migration_status: {
        Args: Record<PropertyKey, never>
        Returns: {
          table_name: string
          total_records: number
          with_variants: number
          custom_designs: number
          unmapped: number
          migration_complete: boolean
        }[]
      }
      get_sample_variants: {
        Args: { limit_count?: number }
        Returns: {
          product_name: string
          sku: string
          color_name: string
          color_hex: string
          size: string
          price: number
          stock_quantity: number
        }[]
      }
      get_theme_questions: {
        Args: { theme_uuid: string }
        Returns: {
          id: string
          question_text: string
          type: string
          options: Json
          sort_order: number
        }[]
      }
      get_variant_breakdown: {
        Args: Record<PropertyKey, never>
        Returns: {
          product_name: string
          product_id: string
          color_count: number
          size_count: number
          variants_created: number
          expected_variants: number
          price: number
        }[]
      }
      map_legacy_product_id_to_uuid: {
        Args: { legacy_id: string }
        Returns: string
      }
      validate_migration_data: {
        Args: Record<PropertyKey, never>
        Returns: {
          check_name: string
          status: string
          count_value: number
          details: string
        }[]
      }
      validate_phase2_migration: {
        Args: Record<PropertyKey, never>
        Returns: {
          check_name: string
          status: string
          expected_value: number
          actual_value: number
          success: boolean
          details: string
        }[]
      }
      validate_phase3_migration: {
        Args: Record<PropertyKey, never>
        Returns: {
          check_name: string
          status: string
          total_records: number
          migrated_records: number
          success: boolean
          details: string
        }[]
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
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
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
