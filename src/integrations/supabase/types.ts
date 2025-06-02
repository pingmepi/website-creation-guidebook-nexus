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
          product_id: string
          quantity: number
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          product_id: string
          quantity?: number
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          product_id?: string
          quantity?: number
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
          design_data: Json | null
          id: string
          order_id: string
          product_id: string
          quantity: number
          total_price: number
          unit_price: number
        }
        Insert: {
          created_at?: string
          design_data?: Json | null
          id?: string
          order_id: string
          product_id: string
          quantity?: number
          total_price: number
          unit_price: number
        }
        Update: {
          created_at?: string
          design_data?: Json | null
          id?: string
          order_id?: string
          product_id?: string
          quantity?: number
          total_price?: number
          unit_price?: number
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
          notes: string | null
          order_number: string
          payment_method: string | null
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
          shipping_address?: Json
          shipping_address_id?: string | null
          status?: string
          total_amount?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      products: {
        Row: {
          base_price: number
          category: string | null
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
          colors?: Json | null
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean | null
          name?: string
          sizes?: Json | null
          updated_at?: string
        }
        Relationships: []
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
      generate_order_number: {
        Args: Record<PropertyKey, never>
        Returns: string
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
