-- Add profile_url column
ALTER TABLE IF EXISTS public.faculty 
ADD COLUMN IF NOT EXISTS profile_url TEXT; 