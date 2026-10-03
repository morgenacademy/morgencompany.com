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
      course_enrollments: {
        Row: {
          id: string
          user_id: string
          course_id: string
          enrolled_at: string
          payment_id: string | null
        }
        Insert: {
          id?: string
          user_id: string
          course_id: string
          enrolled_at?: string
          payment_id?: string | null
        }
        Update: {
          id?: string
          user_id?: string
          course_id?: string
          enrolled_at?: string
          payment_id?: string | null
        }
        Relationships: []
      }
      contact_requests: {
        Row: {
          created_at: string
          email: string
          id: string
          message: string
          name: string
          newsletter: boolean
        }
        Insert: {
          created_at?: string
          email: string
          id?: string
          message: string
          name: string
          newsletter?: boolean
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          message?: string
          name?: string
          newsletter?: boolean
        }
        Relationships: []
      }
      incompany_requests: {
        Row: {
          created_at: string
          email: string
          id: string
          name: string
          newsletter: boolean
          remarks: string | null
        }
        Insert: {
          created_at?: string
          email: string
          id?: string
          name: string
          newsletter?: boolean
          remarks?: string | null
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          name?: string
          newsletter?: boolean
          remarks?: string | null
        }
        Relationships: []
      }
      live_session_registrations: {
        Row: {
          company: string | null
          created_at: string
          email: string
          id: string
          name: string
          newsletter: boolean
          notes: string | null
          scheduled_for: string
          seats: number
          session_id: string
          session_title: string
        }
        Insert: {
          company?: string | null
          created_at?: string
          email: string
          id?: string
          name: string
          newsletter?: boolean
          notes?: string | null
          scheduled_for: string
          seats?: number
          session_id: string
          session_title: string
        }
        Update: {
          company?: string | null
          created_at?: string
          email?: string
          id?: string
          name?: string
          newsletter?: boolean
          notes?: string | null
          scheduled_for?: string
          seats?: number
          session_id?: string
          session_title?: string
        }
        Relationships: []
      }
      lesson_videos: {
        Row: {
          course_id: string
          id: string
          lesson_id: string
          updated_at: string
          video_url: string
        }
        Insert: {
          course_id: string
          id?: string
          lesson_id: string
          updated_at?: string
          video_url?: string
        }
        Update: {
          course_id?: string
          id?: string
          lesson_id?: string
          updated_at?: string
          video_url?: string
        }
        Relationships: []
      }
      newsletter_signups: {
        Row: {
          created_at: string
          email: string
          first_name: string | null
          id: string
        }
        Insert: {
          created_at?: string
          email: string
          first_name?: string | null
          id?: string
        }
        Update: {
          created_at?: string
          email?: string
          first_name?: string | null
          id?: string
        }
        Relationships: []
      }
      payments: {
        Row: {
          amount: number
          course_id: string
          created_at: string
          id: string
          mollie_payment_id: string | null
          status: string
          updated_at: string
          user_email: string
        }
        Insert: {
          amount: number
          course_id: string
          created_at?: string
          id?: string
          mollie_payment_id?: string | null
          status?: string
          updated_at?: string
          user_email: string
        }
        Update: {
          amount?: number
          course_id?: string
          created_at?: string
          id?: string
          mollie_payment_id?: string | null
          status?: string
          updated_at?: string
          user_email?: string
        }
        Relationships: []
      }
      portal_companies: {
        Row: {
          created_at: string
          id: string
          is_active: boolean
          logo_url: string | null
          name: string
          password_hash: string
          slug: string
        }
        Insert: {
          created_at?: string
          id?: string
          is_active?: boolean
          logo_url?: string | null
          name: string
          password_hash: string
          slug: string
        }
        Update: {
          created_at?: string
          id?: string
          is_active?: boolean
          logo_url?: string | null
          name?: string
          password_hash?: string
          slug?: string
        }
        Relationships: []
      }
      portal_feedback: {
        Row: {
          company_id: string
          created_at: string
          feedback_improve: string | null
          feedback_liked: string | null
          feedback_other: string | null
          id: string
          rating_applicability: number | null
          rating_overall: number
          rating_relevance: number | null
          rating_tempo: string | null
          respondent_function: string | null
          respondent_name: string | null
          takeaways: string[] | null
          training_id: string
        }
        Insert: {
          company_id: string
          created_at?: string
          feedback_improve?: string | null
          feedback_liked?: string | null
          feedback_other?: string | null
          id?: string
          rating_applicability?: number | null
          rating_overall: number
          rating_relevance?: number | null
          rating_tempo?: string | null
          respondent_function?: string | null
          respondent_name?: string | null
          takeaways?: string[] | null
          training_id: string
        }
        Update: {
          company_id?: string
          created_at?: string
          feedback_improve?: string | null
          feedback_liked?: string | null
          feedback_other?: string | null
          id?: string
          rating_applicability?: number | null
          rating_overall?: number
          rating_relevance?: number | null
          rating_tempo?: string | null
          respondent_function?: string | null
          respondent_name?: string | null
          takeaways?: string[] | null
          training_id?: string
        }
        Relationships: []
      }
      portal_trainings: {
        Row: {
          company_id: string
          created_at: string
          description: string | null
          id: string
          is_active: boolean
          resources: Json | null
          slide_filename: string | null
          slide_storage_path: string | null
          title: string
          training_date: string | null
          training_dates: string[] | null
        }
        Insert: {
          company_id: string
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean
          resources?: Json | null
          slide_filename?: string | null
          slide_storage_path?: string | null
          title: string
          training_date?: string | null
          training_dates?: string[] | null
        }
        Update: {
          company_id?: string
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean
          resources?: Json | null
          slide_filename?: string | null
          slide_storage_path?: string | null
          title?: string
          training_date?: string | null
          training_dates?: string[] | null
        }
        Relationships: []
      }
      workshop_participants: {
        Row: {
          company: string
          created_at: string
          created_by: string | null
          email: string
          id: string
          name: string
          updated_at: string
          workshop_title: string
        }
        Insert: {
          company: string
          created_at?: string
          created_by?: string | null
          email: string
          id?: string
          name: string
          updated_at?: string
          workshop_title: string
        }
        Update: {
          company?: string
          created_at?: string
          created_by?: string | null
          email?: string
          id?: string
          name?: string
          updated_at?: string
          workshop_title?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
      waitlist: {
        Row: {
          course_id: string
          created_at: string
          email: string
          first_name: string
          id: string
          newsletter: boolean
        }
        Insert: {
          course_id: string
          created_at?: string
          email: string
          first_name: string
          id?: string
          newsletter?: boolean
        }
        Update: {
          course_id?: string
          created_at?: string
          email?: string
          first_name?: string
          id?: string
          newsletter?: boolean
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      admin_grant_course_access: {
        Args: {
          _course_id: string
          _email: string
        }
        Returns: {
          course_id: string
          created: boolean
          user_email: string
          user_id: string
        }[]
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      portal_get_trainings: {
        Args: {
          _company_id: string
        }
        Returns: Database["public"]["Tables"]["portal_trainings"]["Row"][]
      }
      portal_set_password: {
        Args: {
          _company_id: string
          _password: string
        }
        Returns: undefined
      }
      portal_submit_feedback: {
        Args: {
          _company_id: string
          _feedback_improve?: string | null
          _feedback_liked?: string | null
          _feedback_other?: string | null
          _rating_applicability?: number | null
          _rating_overall: number
          _rating_relevance?: number | null
          _rating_tempo?: string | null
          _respondent_function?: string | null
          _respondent_name?: string | null
          _takeaways?: string[] | null
          _training_id: string
        }
        Returns: {
          feedback_id: string
          success: boolean
        }[]
      }
      portal_verify_password: {
        Args: {
          _password: string
          _slug: string
        }
        Returns: {
          company_id: string | null
          company_name: string | null
          logo_url: string | null
          success: boolean
        }[]
      }
    }
    Enums: {
      app_role: "admin" | "user"
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
    Enums: {
      app_role: ["admin", "user"],
    },
  },
} as const
