-- Restore missing fields from earlier migrations (0001)
-- These fields are important for feature functionality

-- Add missing fields to profiles
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS tone_profile text;

-- Add missing fields to jobs
ALTER TABLE jobs ADD COLUMN IF NOT EXISTS jd_parsed jsonb DEFAULT '[]'::jsonb;

-- Add missing fields to applications
ALTER TABLE applications ADD COLUMN IF NOT EXISTS nudge_sent_at timestamptz;
ALTER TABLE applications ADD COLUMN IF NOT EXISTS nudge_dismissed boolean DEFAULT false;

-- Add missing fields to materials
ALTER TABLE materials ADD COLUMN IF NOT EXISTS version int DEFAULT 1;

-- Add indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_applications_nudge_sent_at ON applications(nudge_sent_at);
CREATE INDEX IF NOT EXISTS idx_materials_user_job ON materials(user_id, job_id);
