import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseServiceKey = import.meta.env.VITE_SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  throw new Error('Missing Supabase environment variables');
}

// Use service role key to bypass RLS since we handle auth at app level
export const supabase = createClient(supabaseUrl, supabaseServiceKey);

export type Database = {
  public: {
    Tables: {
      assessments: {
        Row: {
          id: string;
          match_id: string;
          assessor_id: string;
          umpire_a_data: any;
          umpire_b_data: any;
          created_at: string;
          updated_at: string | null;
        };
        Insert: {
          id?: string;
          match_id: string;
          assessor_id: string;
          umpire_a_data: any;
          umpire_b_data: any;
          created_at?: string;
          updated_at?: string | null;
        };
        Update: {
          id?: string;
          match_id?: string;
          assessor_id?: string;
          umpire_a_data?: any;
          umpire_b_data?: any;
          created_at?: string;
          updated_at?: string | null;
        };
      };
      match_reports: {
        Row: {
          id: string;
          match_id: string;
          match_info: any;
          assessment_id: string;
          submitted_at: string;
        };
        Insert: {
          id?: string;
          match_id: string;
          match_info: any;
          assessment_id: string;
          submitted_at?: string;
        };
        Update: {
          id?: string;
          match_id?: string;
          match_info?: any;
          assessment_id?: string;
          submitted_at?: string;
        };
      };
    };
  };
};