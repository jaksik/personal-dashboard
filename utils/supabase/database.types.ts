export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      articles: {
        Row: {
          category: string | null
          created_at: string
          description: string | null
          description_snippet: string | null
          id: number
          newsletter_id: number | null
          published_at: string | null
          publisher: string | null
          source: string | null
          source_feature: boolean
          title: string | null
          title_snippet: string | null
          url: string | null
        }
        Insert: {
          category?: string | null
          created_at?: string
          description?: string | null
          description_snippet?: string | null
          id?: number
          newsletter_id?: number | null
          published_at?: string | null
          publisher?: string | null
          source?: string | null
          source_feature?: boolean
          title?: string | null
          title_snippet?: string | null
          url?: string | null
        }
        Update: {
          category?: string | null
          created_at?: string
          description?: string | null
          description_snippet?: string | null
          id?: number
          newsletter_id?: number | null
          published_at?: string | null
          publisher?: string | null
          source?: string | null
          source_feature?: boolean
          title?: string | null
          title_snippet?: string | null
          url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "articles_newsletter_id_fkey"
            columns: ["newsletter_id"]
            isOneToOne: false
            referencedRelation: "newsletters"
            referencedColumns: ["id"]
          },
        ]
      }
      job_postings: {
        Row: {
          apply_link: string | null
          company: string | null
          company_logo: string | null
          created_at: string
          description: string | null
          id: number
          job_id: string
          location: string | null
          newsletter_id: number | null
          posted_date: string | null
          remote: boolean | null
          title: string | null
        }
        Insert: {
          apply_link?: string | null
          company?: string | null
          company_logo?: string | null
          created_at?: string
          description?: string | null
          id?: number
          job_id: string
          location?: string | null
          newsletter_id?: number | null
          posted_date?: string | null
          remote?: boolean | null
          title?: string | null
        }
        Update: {
          apply_link?: string | null
          company?: string | null
          company_logo?: string | null
          created_at?: string
          description?: string | null
          id?: number
          job_id?: string
          location?: string | null
          newsletter_id?: number | null
          posted_date?: string | null
          remote?: boolean | null
          title?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "job_postings_newsletter_id_fkey"
            columns: ["newsletter_id"]
            isOneToOne: false
            referencedRelation: "newsletters"
            referencedColumns: ["id"]
          },
        ]
      }
      logs: {
        Row: {
          category: string | null
          created_at: string
          id: number
          message: string | null
          name: string | null
          status: string | null
        }
        Insert: {
          category?: string | null
          created_at?: string
          id?: number
          message?: string | null
          name?: string | null
          status?: string | null
        }
        Update: {
          category?: string | null
          created_at?: string
          id?: number
          message?: string | null
          name?: string | null
          status?: string | null
        }
        Relationships: []
      }
      newsletter_images: {
        Row: {
          blob_url: string
          created_at: string
          id: number
          model: string | null
          newsletter_id: number | null
          prompt: string | null
          provider: string | null
        }
        Insert: {
          blob_url: string
          created_at?: string
          id?: number
          model?: string | null
          newsletter_id?: number | null
          prompt?: string | null
          provider?: string | null
        }
        Update: {
          blob_url?: string
          created_at?: string
          id?: number
          model?: string | null
          newsletter_id?: number | null
          prompt?: string | null
          provider?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "newsletter_images_newsletter_id_fkey"
            columns: ["newsletter_id"]
            isOneToOne: false
            referencedRelation: "newsletters"
            referencedColumns: ["id"]
          },
        ]
      }
      newsletters: {
        Row: {
          cover_article: number | null
          cover_image: string | null
          created_at: string
          id: number
          intro: string | null
          publish_date: string | null
          status: string | null
          sub_title: string | null
          title: string | null
        }
        Insert: {
          cover_article?: number | null
          cover_image?: string | null
          created_at?: string
          id?: number
          intro?: string | null
          publish_date?: string | null
          status?: string | null
          sub_title?: string | null
          title?: string | null
        }
        Update: {
          cover_article?: number | null
          cover_image?: string | null
          created_at?: string
          id?: number
          intro?: string | null
          publish_date?: string | null
          status?: string | null
          sub_title?: string | null
          title?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "newsletters_cover_article_fkey"
            columns: ["cover_article"]
            isOneToOne: false
            referencedRelation: "articles"
            referencedColumns: ["id"]
          },
        ]
      }
      stock_prices: {
        Row: {
          close_date: string | null
          close_price: number | null
          created_at: string
          id: number
          ticker: string | null
        }
        Insert: {
          close_date?: string | null
          close_price?: number | null
          created_at?: string
          id?: number
          ticker?: string | null
        }
        Update: {
          close_date?: string | null
          close_price?: number | null
          created_at?: string
          id?: number
          ticker?: string | null
        }
        Relationships: []
      }
      stock_tickers: {
        Row: {
          active: boolean | null
          created_at: string
          id: number
          name: string | null
          ticker: string | null
        }
        Insert: {
          active?: boolean | null
          created_at?: string
          id?: number
          name?: string | null
          ticker?: string | null
        }
        Update: {
          active?: boolean | null
          created_at?: string
          id?: number
          name?: string | null
          ticker?: string | null
        }
        Relationships: []
      }
      tools: {
        Row: {
          affiliate_link: string | null
          category: string | null
          description: string | null
          id: number
          logo_url: string | null
          name: string | null
          subcategory: string | null
          url: string | null
        }
        Insert: {
          affiliate_link?: string | null
          category?: string | null
          description?: string | null
          id?: never
          logo_url?: string | null
          name?: string | null
          subcategory?: string | null
          url?: string | null
        }
        Update: {
          affiliate_link?: string | null
          category?: string | null
          description?: string | null
          id?: never
          logo_url?: string | null
          name?: string | null
          subcategory?: string | null
          url?: string | null
        }
        Relationships: []
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
  system: {
    Tables: {
      tasks: {
        Row: {
          complete: boolean | null
          component_name: string
          created_at: string
          id: number
          scheduled_date: string
          task_name: string
        }
        Insert: {
          complete?: boolean | null
          component_name: string
          created_at?: string
          id?: number
          scheduled_date: string
          task_name: string
        }
        Update: {
          complete?: boolean | null
          component_name?: string
          created_at?: string
          id?: number
          scheduled_date?: string
          task_name?: string
        }
        Relationships: []
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
  system: {
    Enums: {},
  },
} as const
