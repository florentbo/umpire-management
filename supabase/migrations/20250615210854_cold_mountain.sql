/*
  # Assessment System Database Schema

  1. New Tables
    - `assessments`
      - `id` (uuid, primary key)
      - `match_id` (text, not null)
      - `assessor_id` (text, not null)
      - `umpire_a_data` (jsonb, not null) - Contains umpire assessment data
      - `umpire_b_data` (jsonb, not null) - Contains umpire assessment data
      - `created_at` (timestamptz, default now())
      - `updated_at` (timestamptz, nullable)

    - `match_reports`
      - `id` (uuid, primary key)
      - `match_id` (text, not null)
      - `match_info` (jsonb, not null) - Contains match details
      - `assessment_id` (uuid, foreign key to assessments)
      - `submitted_at` (timestamptz, default now())

  2. Security
    - Enable RLS on both tables
    - Add policies for authenticated users to manage their own data

  3. Indexes
    - Add indexes for efficient querying by match_id and assessor_id
*/

-- Create assessments table
CREATE TABLE IF NOT EXISTS assessments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  match_id text NOT NULL,
  assessor_id text NOT NULL,
  umpire_a_data jsonb NOT NULL,
  umpire_b_data jsonb NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz
);

-- Create match_reports table
CREATE TABLE IF NOT EXISTS match_reports (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  match_id text NOT NULL,
  match_info jsonb NOT NULL,
  assessment_id uuid NOT NULL REFERENCES assessments(id) ON DELETE CASCADE,
  submitted_at timestamptz DEFAULT now()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_assessments_match_id ON assessments(match_id);
CREATE INDEX IF NOT EXISTS idx_assessments_assessor_id ON assessments(assessor_id);
CREATE INDEX IF NOT EXISTS idx_match_reports_match_id ON match_reports(match_id);
CREATE INDEX IF NOT EXISTS idx_match_reports_assessment_id ON match_reports(assessment_id);

-- Enable Row Level Security
ALTER TABLE assessments ENABLE ROW LEVEL SECURITY;
ALTER TABLE match_reports ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for assessments
CREATE POLICY "Users can create assessments"
  ON assessments
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Users can read their own assessments"
  ON assessments
  FOR SELECT
  TO authenticated
  USING (assessor_id = auth.jwt() ->> 'email' OR assessor_id = auth.uid()::text);

CREATE POLICY "Users can update their own assessments"
  ON assessments
  FOR UPDATE
  TO authenticated
  USING (assessor_id = auth.jwt() ->> 'email' OR assessor_id = auth.uid()::text);

CREATE POLICY "Users can delete their own assessments"
  ON assessments
  FOR DELETE
  TO authenticated
  USING (assessor_id = auth.jwt() ->> 'email' OR assessor_id = auth.uid()::text);

-- Create RLS policies for match_reports
CREATE POLICY "Users can create match reports"
  ON match_reports
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Users can read match reports for their assessments"
  ON match_reports
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM assessments 
      WHERE assessments.id = match_reports.assessment_id 
      AND (assessments.assessor_id = auth.jwt() ->> 'email' OR assessments.assessor_id = auth.uid()::text)
    )
  );

CREATE POLICY "Users can update match reports for their assessments"
  ON match_reports
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM assessments 
      WHERE assessments.id = match_reports.assessment_id 
      AND (assessments.assessor_id = auth.jwt() ->> 'email' OR assessments.assessor_id = auth.uid()::text)
    )
  );

CREATE POLICY "Users can delete match reports for their assessments"
  ON match_reports
  FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM assessments 
      WHERE assessments.id = match_reports.assessment_id 
      AND (assessments.assessor_id = auth.jwt() ->> 'email' OR assessments.assessor_id = auth.uid()::text)
    )
  );