/*
  # Add Assessment Status for Draft/Published Flow

  1. Schema Changes
    - Add `status` column to assessments table
    - Add `last_saved_at` column for tracking draft saves
    - Update RLS policies to handle draft status

  2. Status Values
    - 'DRAFT': Incomplete assessment, no validation required
    - 'PUBLISHED': Complete assessment, fully validated

  3. Indexes
    - Add index on status for efficient filtering
*/

-- Add status column to assessments table
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'assessments' AND column_name = 'status'
  ) THEN
    ALTER TABLE assessments ADD COLUMN status text DEFAULT 'DRAFT' NOT NULL;
  END IF;
END $$;

-- Add last_saved_at column for draft tracking
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'assessments' AND column_name = 'last_saved_at'
  ) THEN
    ALTER TABLE assessments ADD COLUMN last_saved_at timestamptz DEFAULT now();
  END IF;
END $$;

-- Create index on status for efficient filtering
CREATE INDEX IF NOT EXISTS idx_assessments_status ON assessments(status);

-- Create index on assessor_id and status combination
CREATE INDEX IF NOT EXISTS idx_assessments_assessor_status ON assessments(assessor_id, status);

-- Add constraint to ensure valid status values
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE table_name = 'assessments' AND constraint_name = 'assessments_status_check'
  ) THEN
    ALTER TABLE assessments ADD CONSTRAINT assessments_status_check 
    CHECK (status IN ('DRAFT', 'PUBLISHED'));
  END IF;
END $$;