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
      faculty: {
        Row: {
          id: string
          name: string
          profile_url: string
          gender: string | null
          department: string | null
          institution: string | null
          photo_url: string | null
          orcid_id: string | null
          scopus_id: string | null
          researcher_id: string | null
          google_scholar_id: string | null
          vidwan_id: string | null
          expertise: string[] | null
          experience: Json | null
          education: Json | null
          research_projects: Json | null
          citations: number | null
          h_index: number | null
          i10_index: number | null
          website_url: string | null
          linkedin_url: string | null
          google_scholar_url: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          profile_url: string
          gender?: string | null
          department?: string | null
          institution?: string | null
          photo_url?: string | null
          orcid_id?: string | null
          scopus_id?: string | null
          researcher_id?: string | null
          google_scholar_id?: string | null
          vidwan_id?: string | null
          expertise?: string[] | null
          experience?: Json | null
          education?: Json | null
          research_projects?: Json | null
          citations?: number | null
          h_index?: number | null
          i10_index?: number | null
          website_url?: string | null
          linkedin_url?: string | null
          google_scholar_url?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          profile_url?: string
          gender?: string | null
          department?: string | null
          institution?: string | null
          photo_url?: string | null
          orcid_id?: string | null
          scopus_id?: string | null
          researcher_id?: string | null
          google_scholar_id?: string | null
          vidwan_id?: string | null
          expertise?: string[] | null
          experience?: Json | null
          education?: Json | null
          research_projects?: Json | null
          citations?: number | null
          h_index?: number | null
          i10_index?: number | null
          website_url?: string | null
          linkedin_url?: string | null
          google_scholar_url?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      faculty_publications: {
        Row: {
          id: string
          faculty_id: string | null
          publication_id: string | null
          author_position: number | null
          is_corresponding: boolean | null
          created_at: string
        }
        Insert: {
          id?: string
          faculty_id?: string | null
          publication_id?: string | null
          author_position?: number | null
          is_corresponding?: boolean | null
          created_at?: string
        }
        Update: {
          id?: string
          faculty_id?: string | null
          publication_id?: string | null
          author_position?: number | null
          is_corresponding?: boolean | null
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "faculty_publications_faculty_id_fkey"
            columns: ["faculty_id"]
            isOneToOne: false
            referencedRelation: "faculty"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "faculty_publications_publication_id_fkey"
            columns: ["publication_id"]
            isOneToOne: false
            referencedRelation: "publications"
            referencedColumns: ["id"]
          }
        ]
      }
      publications: {
        Row: {
          id: string
          title: string
          year: number | null
          publication_type: string | null
          doi: string | null
          abstract: string | null
          venue: string | null
          publisher: string | null
          volume: string | null
          issue: string | null
          pages: string | null
          citation_count: number | null
          impact_factor: number | null
          paper_url: string | null
          pdf_url: string | null
          published_date: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          title: string
          year?: number | null
          publication_type?: string | null
          doi?: string | null
          abstract?: string | null
          venue?: string | null
          publisher?: string | null
          volume?: string | null
          issue?: string | null
          pages?: string | null
          citation_count?: number | null
          impact_factor?: number | null
          paper_url?: string | null
          pdf_url?: string | null
          published_date?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          title?: string
          year?: number | null
          publication_type?: string | null
          doi?: string | null
          abstract?: string | null
          venue?: string | null
          publisher?: string | null
          volume?: string | null
          issue?: string | null
          pages?: string | null
          citation_count?: number | null
          impact_factor?: number | null
          paper_url?: string | null
          pdf_url?: string | null
          published_date?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      profiles: {
        Row: {
          id: string
          full_name: string | null
          institution: string | null
          department: string | null
          position: string | null
          research_interests: string[] | null
          bio: string | null
          avatar_url: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          full_name?: string | null
          institution?: string | null
          department?: string | null
          position?: string | null
          research_interests?: string[] | null
          bio?: string | null
          avatar_url?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          full_name?: string | null
          institution?: string | null
          department?: string | null
          position?: string | null
          research_interests?: string[] | null
          bio?: string | null
          avatar_url?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      research_trends: {
        Row: {
          id: string
          topic: string
          category: string | null
          year: number
          quarter: number
          publication_count: number | null
          citation_count: number | null
          faculty_count: number | null
          growth_rate: number | null
          trending_score: number | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          topic: string
          category?: string | null
          year: number
          quarter: number
          publication_count?: number | null
          citation_count?: number | null
          faculty_count?: number | null
          growth_rate?: number | null
          trending_score?: number | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          topic?: string
          category?: string | null
          year?: number
          quarter?: number
          publication_count?: number | null
          citation_count?: number | null
          faculty_count?: number | null
          growth_rate?: number | null
          trending_score?: number | null
          created_at?: string
          updated_at?: string
        }
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
