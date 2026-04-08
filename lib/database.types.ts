export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string;
          name: string;
          email: string;
          role: 'Analyst' | 'Lead' | 'Manager';
          avatar_initials: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          name: string;
          email: string;
          role?: 'Analyst' | 'Lead' | 'Manager';
          avatar_initials: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          email?: string;
          role?: 'Analyst' | 'Lead' | 'Manager';
          avatar_initials?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      disputes: {
        Row: {
          id: string;
          account_number: string;
          application_number: string;
          customer_name: string;
          first_name: string;
          middle_name: string;
          last_name: string;
          date_of_birth: string;
          ssn: string;
          street: string;
          city: string;
          state: string;
          zipcode: string;
          phone_number: string;
          date_opened: string;
          due_date: string;
          risk_level: 'High' | 'Medium' | 'Low';
          status: 'Pending' | 'In Progress' | 'Completed' | 'Requires Further Investigation' | 'Routed';
          assigned_to: string | null;
          locked_by: string | null;
          locked_at: string | null;
          ai_recommendation: Record<string, unknown> | null;
          created_date: string;
          last_updated: string;
          resolution: 'Unsubstantiated' | 'ID Theft Substantiated' | null;
          created_at: string;
          updated_at: string;
          source: string;
          eoscar_case_id: string | null;
          eoscar_received_at: string | null;
          eoscar_raw_payload: Record<string, unknown> | null;
          queue: 'Baseline' | 'Dispute' | 'FullFraud' | 'LeadershipReview';
          triage_reason: string | null;
        };
        Insert: {
          id: string;
          account_number: string;
          application_number: string;
          customer_name: string;
          first_name: string;
          middle_name?: string;
          last_name: string;
          date_of_birth: string;
          ssn: string;
          street: string;
          city: string;
          state: string;
          zipcode: string;
          phone_number: string;
          date_opened: string;
          due_date: string;
          risk_level?: 'High' | 'Medium' | 'Low';
          status?: 'Pending' | 'In Progress' | 'Completed' | 'Requires Further Investigation' | 'Routed';
          assigned_to?: string | null;
          locked_by?: string | null;
          locked_at?: string | null;
          ai_recommendation?: Record<string, unknown> | null;
          created_date: string;
          last_updated: string;
          resolution?: 'Unsubstantiated' | 'ID Theft Substantiated' | null;
          source?: string;
          eoscar_case_id?: string | null;
          eoscar_received_at?: string | null;
          eoscar_raw_payload?: Record<string, unknown> | null;
          queue?: 'Baseline' | 'Dispute' | 'FullFraud' | 'LeadershipReview';
          triage_reason?: string | null;
        };
        Update: {
          status?: 'Pending' | 'In Progress' | 'Completed' | 'Requires Further Investigation' | 'Routed';
          assigned_to?: string | null;
          locked_by?: string | null;
          locked_at?: string | null;
          last_updated?: string;
          resolution?: 'Unsubstantiated' | 'ID Theft Substantiated' | null;
          source?: string;
          eoscar_case_id?: string | null;
          queue?: 'Baseline' | 'Dispute' | 'FullFraud' | 'LeadershipReview';
          triage_reason?: string | null;
        };
        Relationships: [];
      };
      field_comparisons: {
        Row: {
          id: number;
          dispute_id: string;
          field_name: string;
          acdv_value: string;
          internal_value: string;
          funding_value: string;
          match_status: 'exact' | 'minor' | 'major';
        };
        Insert: {
          dispute_id: string;
          field_name: string;
          acdv_value?: string;
          internal_value?: string;
          funding_value?: string;
          match_status?: 'exact' | 'minor' | 'major';
        };
        Update: {
          acdv_value?: string;
          internal_value?: string;
          funding_value?: string;
          match_status?: 'exact' | 'minor' | 'major';
        };
        Relationships: [];
      };
      dispute_history: {
        Row: {
          id: number;
          dispute_id: string;
          date: string;
          changed_fields: string[];
          outcome: string;
          reviewed_by: string;
          notes: string;
        };
        Insert: {
          dispute_id: string;
          date: string;
          changed_fields?: string[];
          outcome: string;
          reviewed_by?: string;
          notes?: string;
        };
        Update: {
          outcome?: string;
          reviewed_by?: string;
          notes?: string;
        };
        Relationships: [];
      };
      dispute_comments: {
        Row: {
          id: string;
          dispute_id: string;
          author: string;
          text: string;
          timestamp: string;
        };
        Insert: {
          id?: string;
          dispute_id: string;
          author: string;
          text: string;
          timestamp?: string;
        };
        Update: {
          text?: string;
        };
        Relationships: [];
      };
      queue_transfers: {
        Row: {
          id: string;
          dispute_id: string;
          from_queue: 'Baseline' | 'Dispute' | 'FullFraud' | 'LeadershipReview';
          to_queue: 'Baseline' | 'Dispute' | 'FullFraud' | 'LeadershipReview';
          transferred_by: string;
          reason: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          dispute_id: string;
          from_queue: 'Baseline' | 'Dispute' | 'FullFraud' | 'LeadershipReview';
          to_queue: 'Baseline' | 'Dispute' | 'FullFraud' | 'LeadershipReview';
          transferred_by: string;
          reason: string;
          created_at?: string;
        };
        Update: {
          reason?: string;
        };
        Relationships: [];
      };
      dispute_responses: {
        Row: {
          id: string;
          dispute_id: string;
          response_code: string;
          findings_summary: string;
          submitted_by: string | null;
          submitted_at: string | null;
          status: 'Draft' | 'Submitted' | 'Accepted' | 'Rejected';
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          dispute_id: string;
          response_code?: string;
          findings_summary?: string;
          submitted_by?: string | null;
          submitted_at?: string | null;
          status?: 'Draft' | 'Submitted' | 'Accepted' | 'Rejected';
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          response_code?: string;
          findings_summary?: string;
          submitted_by?: string | null;
          submitted_at?: string | null;
          status?: 'Draft' | 'Submitted' | 'Accepted' | 'Rejected';
          updated_at?: string;
        };
        Relationships: [];
      };
      documents: {
        Row: {
          id: string;
          dispute_id: string;
          document_type: string;
          label: string;
          image_path: string;
          pages: string[];
          extracted_data: Record<string, unknown>[];
          source: string;
          onbase_document_id: string | null;
          onbase_retrieved_at: string | null;
        };
        Insert: {
          id: string;
          dispute_id: string;
          document_type: string;
          label: string;
          image_path: string;
          pages?: string[];
          extracted_data?: Record<string, unknown>[];
          source?: string;
          onbase_document_id?: string | null;
          onbase_retrieved_at?: string | null;
        };
        Update: {
          document_type?: string;
          label?: string;
          image_path?: string;
          pages?: string[];
          extracted_data?: Record<string, unknown>[];
          source?: string;
          onbase_document_id?: string | null;
        };
        Relationships: [];
      };
      letter_types: {
        Row: {
          id: string;
          name: string;
          description: string;
        };
        Insert: {
          id: string;
          name: string;
          description?: string;
        };
        Update: {
          name?: string;
          description?: string;
        };
        Relationships: [];
      };
      activity_feed: {
        Row: {
          id: number;
          analyst_id: string | null;
          analyst_name: string;
          action: string;
          dispute_id: string | null;
          created_at: string;
        };
        Insert: {
          analyst_id?: string | null;
          analyst_name: string;
          action: string;
          dispute_id?: string | null;
          created_at?: string;
        };
        Update: {
          action?: string;
        };
        Relationships: [];
      };
      triggered_letters: {
        Row: {
          id: number;
          dispute_id: string;
          letter_type_id: string;
          letter_name: string;
          triggered_by: string;
          triggered_at: string;
          status: string;
        };
        Insert: {
          dispute_id: string;
          letter_type_id: string;
          letter_name: string;
          triggered_by: string;
          triggered_at?: string;
          status?: string;
        };
        Update: {
          status?: string;
        };
        Relationships: [];
      };
      notifications: {
        Row: {
          id: number;
          user_id: string;
          message: string;
          icon: string;
          read: boolean;
          created_at: string;
        };
        Insert: {
          user_id: string;
          message: string;
          icon?: string;
          read?: boolean;
          created_at?: string;
        };
        Update: {
          read?: boolean;
        };
        Relationships: [];
      };
      integration_sync_log: {
        Row: {
          id: number;
          integration: string;
          event_type: string;
          payload: Record<string, unknown>;
          status: string;
          error_message: string | null;
          created_at: string;
        };
        Insert: {
          integration: string;
          event_type: string;
          payload?: Record<string, unknown>;
          status?: string;
          error_message?: string | null;
        };
        Update: {
          status?: string;
          error_message?: string | null;
        };
        Relationships: [];
      };
      acdv_response_fields: {
        Row: {
          id: string;
          dispute_id: string;
          section: 'consumer' | 'account' | 'associated';
          field_key: string;
          request_value: string | null;
          response_value: string | null;
          verification_indicator: string | null;
          updated_at: string;
        };
        Insert: {
          id?: string;
          dispute_id: string;
          section: 'consumer' | 'account' | 'associated';
          field_key: string;
          request_value?: string | null;
          response_value?: string | null;
          verification_indicator?: string | null;
          updated_at?: string;
        };
        Update: {
          response_value?: string | null;
          verification_indicator?: string | null;
          updated_at?: string;
        };
        Relationships: [];
      };
      fraud_review_findings: {
        Row: {
          id: string;
          dispute_id: string;
          reviewer: string;
          reviewer_role: 'Lead' | 'Manager';
          decision: 'Approved' | 'Rejected';
          findings: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          dispute_id: string;
          reviewer: string;
          reviewer_role: 'Lead' | 'Manager';
          decision: 'Approved' | 'Rejected';
          findings: string;
          created_at?: string;
        };
        Update: {
          findings?: string;
        };
        Relationships: [];
      };
      audit_events: {
        Row: {
          id: string;
          dispute_id: string;
          event_type: 'status_change' | 'queue_transfer' | 'assignment' | 'lock' | 'resolution' | 'comment' | 'leadership_decision' | 'acdv_submission' | 'dispute_linked';
          actor: string;
          summary: string;
          details: Record<string, unknown> | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          dispute_id: string;
          event_type: 'status_change' | 'queue_transfer' | 'assignment' | 'lock' | 'resolution' | 'comment' | 'leadership_decision' | 'acdv_submission' | 'dispute_linked';
          actor: string;
          summary: string;
          details?: Record<string, unknown> | null;
          created_at?: string;
        };
        Update: Record<string, never>;
        Relationships: [];
      };
      dispute_links: {
        Row: {
          id: string;
          source_dispute_id: string;
          target_dispute_id: string;
          link_type: 'duplicate' | 'related';
          created_by: string;
          reason: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          source_dispute_id: string;
          target_dispute_id: string;
          link_type: 'duplicate' | 'related';
          created_by: string;
          reason: string;
          created_at?: string;
        };
        Update: Record<string, never>;
        Relationships: [];
      };
      app_settings: {
        Row: {
          id: string;
          value: unknown;
          updated_at: string;
          updated_by: string | null;
        };
        Insert: {
          id: string;
          value: unknown;
          updated_at?: string;
          updated_by?: string | null;
        };
        Update: {
          value?: unknown;
          updated_at?: string;
          updated_by?: string | null;
        };
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: {
      get_user_role: {
        Args: Record<string, never>;
        Returns: string;
      };
      get_user_email: {
        Args: Record<string, never>;
        Returns: string;
      };
      get_dashboard_kpis: {
        Args: Record<string, never>;
        Returns: {
          total_disputes: number;
          open_disputes: number;
          high_risk: number;
          avg_resolution_time: string;
          completed_today: number;
        };
      };
      get_team_stats: {
        Args: { p_period: string };
        Returns: Array<{
          id: string;
          name: string;
          email: string;
          role: string;
          active_disputes: number;
          resolved_disputes: number;
          completion_rate: number;
        }>;
      };
      assign_dispute: {
        Args: { p_dispute_id: string; p_analyst_name: string };
        Returns: void;
      };
      lock_dispute: {
        Args: { p_dispute_id: string };
        Returns: void;
      };
      unlock_dispute: {
        Args: { p_dispute_id: string };
        Returns: void;
      };
      resolve_dispute: {
        Args: {
          p_dispute_id: string;
          p_resolution: 'Unsubstantiated' | 'ID Theft Substantiated';
          p_status?: 'Pending' | 'In Progress' | 'Completed' | 'Requires Further Investigation' | 'Routed';
        };
        Returns: void;
      };
      calculate_avg_resolution_time: {
        Args: Record<string, never>;
        Returns: string;
      };
      auto_unlock_expired_disputes: {
        Args: Record<string, never>;
        Returns: number;
      };
    };
    Enums: {
      risk_level: 'High' | 'Medium' | 'Low';
      dispute_status: 'Pending' | 'In Progress' | 'Completed' | 'Requires Further Investigation' | 'Routed';
      dispute_resolution: 'Unsubstantiated' | 'ID Theft Substantiated';
      match_status: 'exact' | 'minor' | 'major';
      user_role: 'Analyst' | 'Lead' | 'Manager';
      dispute_queue: 'Baseline' | 'Dispute' | 'FullFraud' | 'LeadershipReview';
      response_status: 'Draft' | 'Submitted' | 'Accepted' | 'Rejected';
    };
    CompositeTypes: Record<string, never>;
  };
}
