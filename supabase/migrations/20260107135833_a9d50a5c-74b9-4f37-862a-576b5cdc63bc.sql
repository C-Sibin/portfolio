-- Add certification_type column to certifications table
ALTER TABLE public.certifications 
ADD COLUMN certification_type text NOT NULL DEFAULT 'professional' 
CHECK (certification_type IN ('professional', 'ctf'));