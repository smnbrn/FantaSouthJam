/**
 * Tipi TypeScript che rispecchiano lo schema Supabase definito in
 * supabase/migrations/0001_init.sql. La forma di ogni tabella (Row / Insert /
 * Update / Relationships) rispecchia deliberatamente `GenericTable` di
 * @supabase/postgrest-js, così `createClient<Database>()` inferisce i tipi
 * corretti su `.from().select()/.insert()/.update()`.
 *
 * Quando lo schema cambia, questo file può essere rigenerato automaticamente
 * con la Supabase CLI:
 *
 *   npx supabase gen types typescript --project-id <PROJECT_ID> > src/types/database.types.ts
 *
 * Fino a quel momento, questo file scritto a mano è la fonte di verità e resta
 * sincronizzato manualmente con la migration.
 */

export type UserRole = "user" | "admin";
export type MatchdayStatus = "upcoming" | "open" | "closed";
export type TransactionType = "acquisto" | "vendita";

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          username: string;
          full_name: string | null;
          avatar_url: string | null;
          role: UserRole;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          username: string;
          full_name?: string | null;
          avatar_url?: string | null;
          role?: UserRole;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["profiles"]["Insert"]>;
        Relationships: [];
      };
      players: {
        Row: {
          id: string;
          full_name: string;
          real_team: string;
          role: string;
          cost: number;
          photo_url: string | null;
          total_points: number;
          is_active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          full_name: string;
          real_team: string;
          role?: string;
          cost: number;
          photo_url?: string | null;
          total_points?: number;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["players"]["Insert"]>;
        Relationships: [];
      };
      fantasy_teams: {
        Row: {
          id: string;
          user_id: string;
          team_name: string;
          budget_initial: number;
          budget_remaining: number;
          total_points: number;
          is_locked: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          team_name: string;
          budget_initial?: number;
          budget_remaining?: number;
          total_points?: number;
          is_locked?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["fantasy_teams"]["Insert"]>;
        Relationships: [];
      };
      fantasy_team_players: {
        Row: {
          id: string;
          fantasy_team_id: string;
          player_id: string;
          purchase_price: number;
          is_starter: boolean;
          purchased_at: string;
        };
        Insert: {
          id?: string;
          fantasy_team_id: string;
          player_id: string;
          purchase_price: number;
          is_starter?: boolean;
          purchased_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["fantasy_team_players"]["Insert"]>;
        Relationships: [];
      };
      matchdays: {
        Row: {
          id: string;
          number: number;
          title: string;
          match_date: string | null;
          status: MatchdayStatus;
          results_summary: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          number: number;
          title: string;
          match_date?: string | null;
          status?: MatchdayStatus;
          results_summary?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["matchdays"]["Insert"]>;
        Relationships: [];
      };
      bonus_types: {
        Row: {
          id: string;
          code: string;
          label: string;
          points: number;
          sort_order: number;
          is_active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          code: string;
          label: string;
          points: number;
          sort_order?: number;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["bonus_types"]["Insert"]>;
        Relationships: [];
      };
      player_score_events: {
        Row: {
          id: string;
          matchday_id: string;
          player_id: string;
          bonus_type_id: string;
          quantity: number;
          created_by: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          matchday_id: string;
          player_id: string;
          bonus_type_id: string;
          quantity?: number;
          created_by?: string | null;
          created_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["player_score_events"]["Insert"]>;
        Relationships: [];
      };
      player_scores: {
        Row: {
          id: string;
          matchday_id: string;
          player_id: string;
          points: number;
          updated_at: string;
        };
        Insert: {
          id?: string;
          matchday_id: string;
          player_id: string;
          points?: number;
          updated_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["player_scores"]["Insert"]>;
        Relationships: [];
      };
      rankings: {
        Row: {
          id: string;
          fantasy_team_id: string;
          matchday_id: string;
          points_matchday: number;
          points_total: number;
          position: number;
          previous_position: number | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          fantasy_team_id: string;
          matchday_id: string;
          points_matchday?: number;
          points_total?: number;
          position: number;
          previous_position?: number | null;
          created_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["rankings"]["Insert"]>;
        Relationships: [];
      };
      transactions: {
        Row: {
          id: string;
          fantasy_team_id: string;
          player_id: string | null;
          type: TransactionType;
          amount: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          fantasy_team_id: string;
          player_id?: string | null;
          type: TransactionType;
          amount: number;
          created_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["transactions"]["Insert"]>;
        Relationships: [];
      };
      settings: {
        Row: {
          key: string;
          value: unknown;
          updated_at: string;
          updated_by: string | null;
        };
        Insert: {
          key: string;
          value: unknown;
          updated_at?: string;
          updated_by?: string | null;
        };
        Update: Partial<Database["public"]["Tables"]["settings"]["Insert"]>;
        Relationships: [];
      };
      admin_logs: {
        Row: {
          id: string;
          admin_id: string | null;
          action: string;
          entity_type: string | null;
          entity_id: string | null;
          details: unknown;
          created_at: string;
        };
        Insert: {
          id?: string;
          admin_id?: string | null;
          action: string;
          entity_type?: string | null;
          entity_id?: string | null;
          details?: unknown;
          created_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["admin_logs"]["Insert"]>;
        Relationships: [];
      };
    };
    Views: {
      current_rankings: {
        Row: {
          fantasy_team_id: string;
          matchday_id: string;
          matchday_number: number;
          points_matchday: number;
          points_total: number;
          position: number;
          previous_position: number | null;
          created_at: string;
        };
        Relationships: [];
      };
    };
    Functions: {
      purchase_player: {
        Args: { p_fantasy_team_id: string; p_player_id: string };
        Returns: Database["public"]["Tables"]["fantasy_team_players"]["Row"];
      };
      sell_player: {
        Args: { p_fantasy_team_id: string; p_player_id: string };
        Returns: undefined;
      };
      set_starters: {
        Args: { p_fantasy_team_id: string; p_player_ids: string[] };
        Returns: undefined;
      };
      is_admin: {
        Args: Record<PropertyKey, never>;
        Returns: boolean;
      };
    };
    Enums: {
      user_role: UserRole;
      matchday_status: MatchdayStatus;
      transaction_type: TransactionType;
    };
  };
}
