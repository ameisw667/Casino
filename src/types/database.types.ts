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
    PostgrestVersion: "14.5"
  }
  graphql_public: {
    Tables: {
      [_ in never]: never
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      graphql: {
        Args: {
          extensions?: Json
          operationName?: string
          query?: string
          variables?: Json
        }
        Returns: Json
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
  public: {
    Tables: {
      achievement_configs: {
        Row: {
          conditions: Json
          created_at: string | null
          description: string
          icon: string
          id: string
          is_active: boolean
          progress_stat: string
          sort_order: number
          title: string
          total: number
        }
        Insert: {
          conditions: Json
          created_at?: string | null
          description: string
          icon: string
          id: string
          is_active?: boolean
          progress_stat: string
          sort_order?: number
          title: string
          total: number
        }
        Update: {
          conditions?: Json
          created_at?: string | null
          description?: string
          icon?: string
          id?: string
          is_active?: boolean
          progress_stat?: string
          sort_order?: number
          title?: string
          total?: number
        }
        Relationships: []
      }
      admin_analytics_snapshots: {
        Row: {
          created_at: string
          generated_at: string
          id: number
          payload: Json
        }
        Insert: {
          created_at?: string
          generated_at: string
          id?: number
          payload: Json
        }
        Update: {
          created_at?: string
          generated_at?: string
          id?: number
          payload?: Json
        }
        Relationships: []
      }
      admin_roles: {
        Row: {
          created_at: string
          granted_by: string | null
          role: string
          user_id: string
        }
        Insert: {
          created_at?: string
          granted_by?: string | null
          role: string
          user_id: string
        }
        Update: {
          created_at?: string
          granted_by?: string | null
          role?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "admin_roles_granted_by_fkey"
            columns: ["granted_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "admin_roles_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      anonymous_sessions: {
        Row: {
          created_at: string | null
          data: Json | null
          id: string
          last_active_at: string | null
          level: number | null
          migrated_to_user_id: string | null
          rakeback_pool: number | null
          rank: string | null
          xp: number | null
        }
        Insert: {
          created_at?: string | null
          data?: Json | null
          id: string
          last_active_at?: string | null
          level?: number | null
          migrated_to_user_id?: string | null
          rakeback_pool?: number | null
          rank?: string | null
          xp?: number | null
        }
        Update: {
          created_at?: string | null
          data?: Json | null
          id?: string
          last_active_at?: string | null
          level?: number | null
          migrated_to_user_id?: string | null
          rakeback_pool?: number | null
          rank?: string | null
          xp?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "anonymous_sessions_migrated_to_user_id_fkey"
            columns: ["migrated_to_user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      bet_network_fingerprints: {
        Row: {
          first_seen_at: string
          hit_count: number
          id: string
          ip_hash: string
          last_seen_at: string
          seen_date: string
          user_id: string
        }
        Insert: {
          first_seen_at?: string
          hit_count?: number
          id?: string
          ip_hash: string
          last_seen_at?: string
          seen_date?: string
          user_id: string
        }
        Update: {
          first_seen_at?: string
          hit_count?: number
          id?: string
          ip_hash?: string
          last_seen_at?: string
          seen_date?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "bet_network_fingerprints_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      chat_messages: {
        Row: {
          created_at: string
          id: string
          is_system: boolean
          is_win: boolean
          message: string
          rank: string
          user_id: string
          username: string
        }
        Insert: {
          created_at?: string
          id?: string
          is_system?: boolean
          is_win?: boolean
          message: string
          rank?: string
          user_id: string
          username: string
        }
        Update: {
          created_at?: string
          id?: string
          is_system?: boolean
          is_win?: boolean
          message?: string
          rank?: string
          user_id?: string
          username?: string
        }
        Relationships: [
          {
            foreignKeyName: "chat_messages_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      crash_rounds: {
        Row: {
          betting_ends_at: string
          crash_point: number | null
          crashed_at: string | null
          created_at: string
          id: string
          server_seed: string
          server_seed_hash: string
          started_at: string | null
          status: string
        }
        Insert: {
          betting_ends_at: string
          crash_point?: number | null
          crashed_at?: string | null
          created_at?: string
          id?: string
          server_seed: string
          server_seed_hash: string
          started_at?: string | null
          status?: string
        }
        Update: {
          betting_ends_at?: string
          crash_point?: number | null
          crashed_at?: string | null
          created_at?: string
          id?: string
          server_seed?: string
          server_seed_hash?: string
          started_at?: string | null
          status?: string
        }
        Relationships: []
      }
      daily_race_winners: {
        Row: {
          prize: number
          race_date: string
          rank: number
          user_id: string
          wagered: number
        }
        Insert: {
          prize: number
          race_date: string
          rank: number
          user_id: string
          wagered: number
        }
        Update: {
          prize?: number
          race_date?: string
          rank?: number
          user_id?: string
          wagered?: number
        }
        Relationships: [
          {
            foreignKeyName: "daily_race_winners_race_date_fkey"
            columns: ["race_date"]
            isOneToOne: false
            referencedRelation: "daily_races"
            referencedColumns: ["race_date"]
          },
          {
            foreignKeyName: "daily_race_winners_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      daily_races: {
        Row: {
          participant_count: number
          race_date: string
          settled_at: string
          total_wagered: number
        }
        Insert: {
          participant_count?: number
          race_date: string
          settled_at?: string
          total_wagered?: number
        }
        Update: {
          participant_count?: number
          race_date?: string
          settled_at?: string
          total_wagered?: number
        }
        Relationships: []
      }
      fraud_scan_lock: {
        Row: {
          id: boolean
          locked_at: string | null
          locked_by: string | null
        }
        Insert: {
          id?: boolean
          locked_at?: string | null
          locked_by?: string | null
        }
        Update: {
          id?: boolean
          locked_at?: string | null
          locked_by?: string | null
        }
        Relationships: []
      }
      game_configs: {
        Row: {
          category: string
          config_key: string
          description: string | null
          id: number
          is_active: boolean | null
          updated_at: string | null
          value: Json
        }
        Insert: {
          category: string
          config_key: string
          description?: string | null
          id?: number
          is_active?: boolean | null
          updated_at?: string | null
          value: Json
        }
        Update: {
          category?: string
          config_key?: string
          description?: string | null
          id?: number
          is_active?: boolean | null
          updated_at?: string | null
          value?: Json
        }
        Relationships: []
      }
      game_rounds: {
        Row: {
          bet_amount: number
          crash_round_id: string | null
          created_at: string
          game: string
          id: string
          payout: number
          request_id: string
          state: Json
          status: string
          updated_at: string
          user_id: string
          version: number
        }
        Insert: {
          bet_amount: number
          crash_round_id?: string | null
          created_at?: string
          game: string
          id?: string
          payout?: number
          request_id: string
          state?: Json
          status?: string
          updated_at?: string
          user_id: string
          version?: number
        }
        Update: {
          bet_amount?: number
          crash_round_id?: string | null
          created_at?: string
          game?: string
          id?: string
          payout?: number
          request_id?: string
          state?: Json
          status?: string
          updated_at?: string
          user_id?: string
          version?: number
        }
        Relationships: [
          {
            foreignKeyName: "game_rounds_crash_round_id_fkey"
            columns: ["crash_round_id"]
            isOneToOne: false
            referencedRelation: "crash_rounds"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "game_rounds_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      game_sessions: {
        Row: {
          ended_at: string | null
          game: string
          hands_played: number | null
          id: string
          started_at: string | null
          total_bet: number | null
          total_won: number | null
          user_id: string
        }
        Insert: {
          ended_at?: string | null
          game: string
          hands_played?: number | null
          id?: string
          started_at?: string | null
          total_bet?: number | null
          total_won?: number | null
          user_id: string
        }
        Update: {
          ended_at?: string | null
          game?: string
          hands_played?: number | null
          id?: string
          started_at?: string | null
          total_bet?: number | null
          total_won?: number | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "game_sessions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      guide_documents: {
        Row: {
          content: string
          created_at: string
          embedding: string | null
          id: string
          is_active: boolean
          slug: string
          tags: string[]
          title: string
          topic: string
          updated_at: string
          version: string
        }
        Insert: {
          content: string
          created_at?: string
          embedding?: string | null
          id: string
          is_active?: boolean
          slug: string
          tags?: string[]
          title: string
          topic: string
          updated_at?: string
          version?: string
        }
        Update: {
          content?: string
          created_at?: string
          embedding?: string | null
          id?: string
          is_active?: boolean
          slug?: string
          tags?: string[]
          title?: string
          topic?: string
          updated_at?: string
          version?: string
        }
        Relationships: []
      }
      guide_feedback: {
        Row: {
          category: string | null
          comment: string | null
          created_at: string
          id: string
          message_id: string | null
          rating: number
          user_id: string | null
        }
        Insert: {
          category?: string | null
          comment?: string | null
          created_at?: string
          id?: string
          message_id?: string | null
          rating: number
          user_id?: string | null
        }
        Update: {
          category?: string | null
          comment?: string | null
          created_at?: string
          id?: string
          message_id?: string | null
          rating?: number
          user_id?: string | null
        }
        Relationships: []
      }
      guide_telemetry_events: {
        Row: {
          actor_hash: string
          actor_hash_version: number
          cached_input_tokens: number | null
          estimated_cost_microusd: number | null
          id: string
          input_tokens: number | null
          latency_ms: number
          model: string | null
          occurred_at: string
          outcome: string
          output_tokens: number | null
          pricing_version: string | null
          rate_limit_window_started_at: string | null
          reasoning_tokens: number | null
          total_tokens: number | null
        }
        Insert: {
          actor_hash: string
          actor_hash_version: number
          cached_input_tokens?: number | null
          estimated_cost_microusd?: number | null
          id?: string
          input_tokens?: number | null
          latency_ms: number
          model?: string | null
          occurred_at?: string
          outcome: string
          output_tokens?: number | null
          pricing_version?: string | null
          rate_limit_window_started_at?: string | null
          reasoning_tokens?: number | null
          total_tokens?: number | null
        }
        Update: {
          actor_hash?: string
          actor_hash_version?: number
          cached_input_tokens?: number | null
          estimated_cost_microusd?: number | null
          id?: string
          input_tokens?: number | null
          latency_ms?: number
          model?: string | null
          occurred_at?: string
          outcome?: string
          output_tokens?: number | null
          pricing_version?: string | null
          rate_limit_window_started_at?: string | null
          reasoning_tokens?: number | null
          total_tokens?: number | null
        }
        Relationships: []
      }
      identity_link_quarantine: {
        Row: {
          detected_at: string
          provider: string
          provider_user_id: string
          reason: string
          resolved_at: string | null
          resolved_user_id: string | null
        }
        Insert: {
          detected_at?: string
          provider: string
          provider_user_id: string
          reason: string
          resolved_at?: string | null
          resolved_user_id?: string | null
        }
        Update: {
          detected_at?: string
          provider?: string
          provider_user_id?: string
          reason?: string
          resolved_at?: string | null
          resolved_user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "identity_link_quarantine_resolved_user_id_fkey"
            columns: ["resolved_user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      jackpot_pool: {
        Row: {
          contribution_rate: number
          current_amount: number
          id: number
          last_winner_id: string | null
          last_won_at: string | null
          seed_amount: number
          updated_at: string
          win_probability: number
        }
        Insert: {
          contribution_rate: number
          current_amount: number
          id?: number
          last_winner_id?: string | null
          last_won_at?: string | null
          seed_amount: number
          updated_at?: string
          win_probability: number
        }
        Update: {
          contribution_rate?: number
          current_amount?: number
          id?: number
          last_winner_id?: string | null
          last_won_at?: string | null
          seed_amount?: number
          updated_at?: string
          win_probability?: number
        }
        Relationships: [
          {
            foreignKeyName: "jackpot_pool_last_winner_id_fkey"
            columns: ["last_winner_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      promo_code_redemptions: {
        Row: {
          amount: number
          code: string
          created_at: string
          id: string
          request_id: string
          response: Json
          transaction_id: string
          user_id: string
        }
        Insert: {
          amount: number
          code: string
          created_at?: string
          id?: string
          request_id: string
          response: Json
          transaction_id: string
          user_id: string
        }
        Update: {
          amount?: number
          code?: string
          created_at?: string
          id?: string
          request_id?: string
          response?: Json
          transaction_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "promo_code_redemptions_code_fkey"
            columns: ["code"]
            isOneToOne: false
            referencedRelation: "promo_codes"
            referencedColumns: ["code"]
          },
          {
            foreignKeyName: "promo_code_redemptions_transaction_id_fkey"
            columns: ["transaction_id"]
            isOneToOne: false
            referencedRelation: "wallet_transactions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "promo_code_redemptions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      promo_codes: {
        Row: {
          active: boolean
          amount: number
          code: string
          created_at: string
          created_by: string | null
          expires_at: string | null
          max_uses: number
          used_count: number
        }
        Insert: {
          active?: boolean
          amount: number
          code: string
          created_at?: string
          created_by?: string | null
          expires_at?: string | null
          max_uses: number
          used_count?: number
        }
        Update: {
          active?: boolean
          amount?: number
          code?: string
          created_at?: string
          created_by?: string | null
          expires_at?: string | null
          max_uses?: number
          used_count?: number
        }
        Relationships: []
      }
      ranks: {
        Row: {
          color: string
          created_at: string | null
          id: number
          is_active: boolean | null
          min_level: number
          name: string
          perks: string[]
          rakeback: number
          sort_order: number
        }
        Insert: {
          color: string
          created_at?: string | null
          id?: number
          is_active?: boolean | null
          min_level: number
          name: string
          perks?: string[]
          rakeback: number
          sort_order?: number
        }
        Update: {
          color?: string
          created_at?: string | null
          id?: number
          is_active?: boolean | null
          min_level?: number
          name?: string
          perks?: string[]
          rakeback?: number
          sort_order?: number
        }
        Relationships: []
      }
      risk_events: {
        Row: {
          created_at: string
          evidence: Json
          fingerprint: string
          id: string
          last_seen_at: string
          occurrences: number
          review_reason: string | null
          reviewed_at: string | null
          reviewed_by: string | null
          severity: string
          signal_type: string
          status: string
          subject_user_id: string
          window_start: string
        }
        Insert: {
          created_at?: string
          evidence?: Json
          fingerprint: string
          id?: string
          last_seen_at?: string
          occurrences?: number
          review_reason?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          severity: string
          signal_type: string
          status?: string
          subject_user_id: string
          window_start: string
        }
        Update: {
          created_at?: string
          evidence?: Json
          fingerprint?: string
          id?: string
          last_seen_at?: string
          occurrences?: number
          review_reason?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          severity?: string
          signal_type?: string
          status?: string
          subject_user_id?: string
          window_start?: string
        }
        Relationships: [
          {
            foreignKeyName: "risk_events_subject_user_id_fkey"
            columns: ["subject_user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      seed_consumptions: {
        Row: {
          consumed_at: string
          nonce: number
          request_id: string
          server_seed_hash: string
          user_id: string
        }
        Insert: {
          consumed_at?: string
          nonce: number
          request_id: string
          server_seed_hash: string
          user_id: string
        }
        Update: {
          consumed_at?: string
          nonce?: number
          request_id?: string
          server_seed_hash?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "seed_consumptions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      seed_history: {
        Row: {
          client_seed: string
          id: string
          nonce_at_rotation: number
          rotated_at: string
          server_seed: string
          server_seed_hash: string
          user_id: string
        }
        Insert: {
          client_seed: string
          id?: string
          nonce_at_rotation: number
          rotated_at?: string
          server_seed: string
          server_seed_hash: string
          user_id: string
        }
        Update: {
          client_seed?: string
          id?: string
          nonce_at_rotation?: number
          rotated_at?: string
          server_seed?: string
          server_seed_hash?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "seed_history_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      seeds: {
        Row: {
          client_seed: string
          created_at: string | null
          is_active: boolean | null
          nonce: number | null
          server_seed: string
          server_seed_hash: string
          user_id: string
        }
        Insert: {
          client_seed: string
          created_at?: string | null
          is_active?: boolean | null
          nonce?: number | null
          server_seed: string
          server_seed_hash: string
          user_id: string
        }
        Update: {
          client_seed?: string
          created_at?: string | null
          is_active?: boolean | null
          nonce?: number | null
          server_seed?: string
          server_seed_hash?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "seeds_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      telegram_link_tokens: {
        Row: {
          consumed_at: string | null
          created_at: string
          expires_at: string
          token: string
          user_id: string
        }
        Insert: {
          consumed_at?: string | null
          created_at?: string
          expires_at?: string
          token?: string
          user_id: string
        }
        Update: {
          consumed_at?: string | null
          created_at?: string
          expires_at?: string
          token?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "telegram_link_tokens_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      telegram_links: {
        Row: {
          chat_id: number
          linked_at: string
          notifications_enabled: boolean
          telegram_username: string | null
          user_id: string
        }
        Insert: {
          chat_id: number
          linked_at?: string
          notifications_enabled?: boolean
          telegram_username?: string | null
          user_id: string
        }
        Update: {
          chat_id?: number
          linked_at?: string
          notifications_enabled?: boolean
          telegram_username?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "telegram_links_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      user_achievements: {
        Row: {
          achievement_id: string
          progress: number
          unlocked: boolean
          updated_at: string
          user_id: string
        }
        Insert: {
          achievement_id: string
          progress?: number
          unlocked?: boolean
          updated_at?: string
          user_id: string
        }
        Update: {
          achievement_id?: string
          progress?: number
          unlocked?: boolean
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_achievements_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      user_identities: {
        Row: {
          created_at: string
          id: string
          provider: string
          provider_user_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          provider: string
          provider_user_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          provider?: string
          provider_user_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_identities_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      user_notifications: {
        Row: {
          body: string
          created_at: string
          id: string
          kind: string
          metadata: Json
          read_at: string | null
          source_key: string
          title: string
          user_id: string
        }
        Insert: {
          body: string
          created_at?: string
          id?: string
          kind: string
          metadata?: Json
          read_at?: string | null
          source_key: string
          title: string
          user_id: string
        }
        Update: {
          body?: string
          created_at?: string
          id?: string
          kind?: string
          metadata?: Json
          read_at?: string | null
          source_key?: string
          title?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_notifications_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      users: {
        Row: {
          avatar_url: string | null
          balance: number | null
          created_at: string | null
          email: string | null
          id: string
          level: number | null
          rakeback_pool: number | null
          rank: string | null
          updated_at: string | null
          username: string
          xp: number | null
        }
        Insert: {
          avatar_url?: string | null
          balance?: number | null
          created_at?: string | null
          email?: string | null
          id: string
          level?: number | null
          rakeback_pool?: number | null
          rank?: string | null
          updated_at?: string | null
          username: string
          xp?: number | null
        }
        Update: {
          avatar_url?: string | null
          balance?: number | null
          created_at?: string | null
          email?: string | null
          id?: string
          level?: number | null
          rakeback_pool?: number | null
          rank?: string | null
          updated_at?: string | null
          username?: string
          xp?: number | null
        }
        Relationships: []
      }
      vip_tiers: {
        Row: {
          color: string
          created_at: string | null
          id: number
          is_active: boolean | null
          min_xp: number
          name: string
          rakeback: number
          sort_order: number
        }
        Insert: {
          color: string
          created_at?: string | null
          id?: number
          is_active?: boolean | null
          min_xp: number
          name: string
          rakeback: number
          sort_order?: number
        }
        Update: {
          color?: string
          created_at?: string | null
          id?: number
          is_active?: boolean | null
          min_xp?: number
          name?: string
          rakeback?: number
          sort_order?: number
        }
        Relationships: []
      }
      wallet_events: {
        Row: {
          attempts: number
          created_at: string
          event_payload: Json | null
          event_type: string
          id: string
          last_error: string | null
          processed_at: string | null
          request_id: string
          user_id: string
          xp_gain: number
        }
        Insert: {
          attempts?: number
          created_at?: string
          event_payload?: Json | null
          event_type?: string
          id?: string
          last_error?: string | null
          processed_at?: string | null
          request_id: string
          user_id: string
          xp_gain: number
        }
        Update: {
          attempts?: number
          created_at?: string
          event_payload?: Json | null
          event_type?: string
          id?: string
          last_error?: string | null
          processed_at?: string | null
          request_id?: string
          user_id?: string
          xp_gain?: number
        }
        Relationships: [
          {
            foreignKeyName: "wallet_events_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      wallet_invariant_events: {
        Row: {
          delta: number
          expected_balance: number
          fingerprint: string
          first_seen_at: string
          id: string
          last_seen_at: string
          observed_balance: number
          occurrences: number
          status: string
          user_id: string
        }
        Insert: {
          delta: number
          expected_balance: number
          fingerprint: string
          first_seen_at?: string
          id?: string
          last_seen_at?: string
          observed_balance: number
          occurrences?: number
          status?: string
          user_id: string
        }
        Update: {
          delta?: number
          expected_balance?: number
          fingerprint?: string
          first_seen_at?: string
          id?: string
          last_seen_at?: string
          observed_balance?: number
          occurrences?: number
          status?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "wallet_invariant_events_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      wallet_ledger_baselines: {
        Row: {
          created_at: string
          opening_balance: number
          source: string
          user_id: string
        }
        Insert: {
          created_at?: string
          opening_balance: number
          source?: string
          user_id: string
        }
        Update: {
          created_at?: string
          opening_balance?: number
          source?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "wallet_ledger_baselines_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      wallet_transactions: {
        Row: {
          actor_id: string | null
          amount: number
          balance_after: number
          before_balance: number | null
          created_at: string | null
          game: string | null
          id: string
          metadata: Json | null
          nonce: number | null
          reason: string | null
          request_id: string | null
          result_id: string | null
          server_seed_hash: string | null
          type: string
          user_id: string
        }
        Insert: {
          actor_id?: string | null
          amount: number
          balance_after: number
          before_balance?: number | null
          created_at?: string | null
          game?: string | null
          id?: string
          metadata?: Json | null
          nonce?: number | null
          reason?: string | null
          request_id?: string | null
          result_id?: string | null
          server_seed_hash?: string | null
          type: string
          user_id: string
        }
        Update: {
          actor_id?: string | null
          amount?: number
          balance_after?: number
          before_balance?: number | null
          created_at?: string | null
          game?: string | null
          id?: string
          metadata?: Json | null
          nonce?: number | null
          reason?: string | null
          request_id?: string | null
          result_id?: string | null
          server_seed_hash?: string | null
          type?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "wallet_transactions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      ack_big_win_notify_event: { Args: { p_event_id: string }; Returns: Json }
      admin_update_user: {
        Args: {
          p_actor_id: string
          p_balance?: number
          p_level?: number
          p_rank?: string
          p_reason: string
          p_request_id: string
          p_target_user_id: string
          p_xp?: number
        }
        Returns: Json
      }
      advance_blackjack_round: {
        Args: {
          p_additional_bet: number
          p_expected_version: number
          p_new_state: Json
          p_payout: number
          p_request_id: string
          p_result: Json
          p_result_id: string
          p_round_id: string
          p_settled: boolean
          p_user_id: string
          p_xp_gain: number
        }
        Returns: Json
      }
      apply_xp_gain: { Args: { p_event_id: string }; Returns: Json }
      casino_rank_for_level: { Args: { p_level: number }; Returns: string }
      casino_xp_level_divisor: { Args: never; Returns: number }
      claim_big_win_notify_event: {
        Args: { p_event_id: string }
        Returns: Json
      }
      compute_cohort_win_rates: {
        Args: { p_game: string; p_min_bets?: number; p_window_hours?: number }
        Returns: {
          bet_count: number
          cohort_mean: number
          cohort_stddev: number
          user_id: string
          user_rtp: number
        }[]
      }
      compute_fraud_ml_features: {
        Args: { p_min_bets?: number; p_window_days?: number }
        Returns: {
          amount_cv: number
          avg_abs_amount: number
          bet_count: number
          inter_bet_seconds_cv: number
          net_result: number
          unique_games: number
          user_id: string
          win_rate: number
        }[]
      }
      consume_active_seed: {
        Args: { p_request_id: string; p_user_id: string }
        Returns: Json
      }
      custom_access_token_hook: { Args: { event: Json }; Returns: Json }
      delete_guide_telemetry_events_for_actor: {
        Args: { p_actor_hash: string; p_actor_hash_version: number }
        Returns: number
      }
      detect_bet_velocity_outliers: {
        Args: { p_min_bets?: number; p_window_minutes?: number }
        Returns: {
          bet_count: number
          user_id: string
        }[]
      }
      detect_multi_account_clusters: {
        Args: { p_min_cluster?: number; p_window_hours?: number }
        Returns: {
          cluster_size: number
          ip_hash: string
          user_ids: string[]
        }[]
      }
      emit_big_win_notify_event: {
        Args: {
          p_game: string
          p_multiplier: number
          p_payout: number
          p_request_id: string
          p_user_id: string
        }
        Returns: Json
      }
      get_active_game_round: {
        Args: { p_game: string; p_user_id: string }
        Returns: Json
      }
      get_community_stats: { Args: never; Returns: Json }
      get_daily_race_standings: {
        Args: never
        Returns: {
          prize: number
          rank: number
          username: string
          wagered: number
        }[]
      }
      get_guide_feedback_summary: { Args: { p_as_of: string }; Returns: Json }
      get_guide_observability: { Args: { p_as_of: string }; Returns: Json }
      get_jackpot_pool_public: { Args: never; Returns: Json }
      get_leaderboard: {
        Args: never
        Returns: {
          biggest_win: number
          level: number
          rank: string
          total_wagered: number
          username: string
        }[]
      }
      get_or_create_user_seed: { Args: { p_user_id: string }; Returns: Json }
      get_recent_chat_messages: { Args: { p_limit?: number }; Returns: Json }
      get_user_stats: { Args: { p_user_id: string }; Returns: Json }
      jackpot_pool_settle: {
        Args: {
          p_bet_amount: number
          p_jackpot_roll: number
          p_user_id: string
        }
        Returns: number
      }
      link_user_identity: {
        Args: {
          p_provider: string
          p_provider_user_id: string
          p_user_id: string
        }
        Returns: string
      }
      match_guide_documents: {
        Args: {
          match_count?: number
          match_threshold?: number
          query_embedding: string
        }
        Returns: {
          content: string
          id: string
          similarity: number
          slug: string
          tags: string[]
          title: string
          topic: string
          version: string
        }[]
      }
      migrate_anonymous_session: {
        Args: { p_session_id: string; p_user_id: string }
        Returns: {
          balance: number
          level: number
          rakeback_pool: number
          rank: string
          xp: number
        }[]
      }
      place_bet: {
        Args: { p_amount: number; p_game: string; p_user_id: string }
        Returns: number
      }
      post_chat_message: {
        Args: { p_message: string; p_user_id: string }
        Returns: Json
      }
      purge_bet_network_fingerprints: { Args: never; Returns: undefined }
      purge_expired_telegram_link_tokens: { Args: never; Returns: number }
      purge_guide_telemetry_events: { Args: never; Returns: number }
      reconcile_wallet_ledger: { Args: { p_user_id: string }; Returns: Json }
      record_bet_network_fingerprint: {
        Args: { p_ip_hash: string; p_user_id: string }
        Returns: undefined
      }
      record_risk_event: {
        Args: {
          p_evidence?: Json
          p_fingerprint: string
          p_severity: string
          p_signal_type: string
          p_subject_user_id: string
          p_window_start: string
        }
        Returns: Json
      }
      redeem_promo_code: {
        Args: { p_code: string; p_request_id: string; p_user_id: string }
        Returns: Json
      }
      release_fraud_scan_lock: { Args: never; Returns: undefined }
      retry_stale_big_win_events: { Args: never; Returns: undefined }
      retry_stale_wallet_events: { Args: never; Returns: undefined }
      review_risk_event: {
        Args: {
          p_event_id: string
          p_reason: string
          p_reviewer_id: string
          p_status: string
        }
        Returns: Json
      }
      rotate_user_seed: {
        Args: { p_client_seed: string; p_user_id: string }
        Returns: Json
      }
      run_bet_fingerprint_purge_job: { Args: never; Returns: undefined }
      run_daily_race_settlement_job: { Args: never; Returns: undefined }
      run_guide_telemetry_purge_job: { Args: never; Returns: undefined }
      set_crash_round_point: {
        Args: { p_crash_point: number; p_round_id: string }
        Returns: Json
      }
      settle_bet: {
        Args: {
          p_game: string
          p_payout: number
          p_user_id: string
          p_xp_gain: number
        }
        Returns: {
          balance: number
          level: number
          xp: number
        }[]
      }
      settle_daily_race: { Args: never; Returns: Json }
      settle_game_bet:
        | {
            Args: {
              p_amount: number
              p_game: string
              p_payout: number
              p_request_id: string
              p_result: Json
              p_result_id: string
              p_user_id: string
              p_xp_gain: number
            }
            Returns: Json
          }
        | {
            Args: {
              p_amount: number
              p_game: string
              p_nonce?: number
              p_payout: number
              p_request_id: string
              p_result: Json
              p_result_id: string
              p_server_seed_hash?: string
              p_user_id: string
              p_xp_gain: number
            }
            Returns: Json
          }
      settle_game_round: {
        Args: {
          p_payout: number
          p_request_id: string
          p_result: Json
          p_result_id: string
          p_round_id: string
          p_user_id: string
          p_xp_gain: number
        }
        Returns: Json
      }
      start_game_round: {
        Args: {
          p_amount: number
          p_game: string
          p_request_id: string
          p_state: Json
          p_user_id: string
        }
        Returns: Json
      }
      sync_crash_round: {
        Args: {
          p_betting_window_ms: number
          p_crashed_at?: string
          p_post_crash_pause_ms: number
        }
        Returns: Json
      }
      sync_user_achievement: {
        Args: {
          p_achievement_id: string
          p_progress: number
          p_unlocked: boolean
          p_user_id: string
        }
        Returns: Json
      }
      try_acquire_fraud_scan_lock: {
        Args: { p_locked_by: string; p_stale_after_minutes?: number }
        Returns: boolean
      }
      upsert_anonymous_session: {
        Args: {
          p_level: number
          p_rakeback_pool: number
          p_rank: string
          p_session_id: string
          p_xp: number
        }
        Returns: undefined
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
  graphql_public: {
    Enums: {},
  },
  public: {
    Enums: {},
  },
} as const
