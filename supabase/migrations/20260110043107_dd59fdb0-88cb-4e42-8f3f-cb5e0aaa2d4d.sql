-- Add pdf_generated_at column to blueprints table
ALTER TABLE blueprints 
ADD COLUMN IF NOT EXISTS pdf_generated_at timestamp with time zone;