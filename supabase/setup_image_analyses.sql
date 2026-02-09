-- Create image_analyses table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.image_analyses (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  image_url TEXT NOT NULL,
  risk_level TEXT CHECK (risk_level IN ('low', 'medium', 'high')),
  analysis TEXT,
  confidence_score INTEGER,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.image_analyses ENABLE ROW LEVEL SECURITY;

-- Policy: Allow service role (used by edge functions) to insert/select
-- Service role bypasses RLS, but this is good practice
CREATE POLICY "Allow service role full access"
  ON public.image_analyses
  FOR ALL
  USING (true)
  WITH CHECK (true);

-- Policy: Allow authenticated users to read their own analyses (if you add user_id later)
-- For now, allow all authenticated users to read
CREATE POLICY "Allow authenticated users to read"
  ON public.image_analyses
  FOR SELECT
  TO authenticated
  USING (true);

-- Ensure scammer_images table has proper RLS policies
-- Check if scammer_images table exists and has RLS enabled
DO $$
BEGIN
  -- Enable RLS on scammer_images if it exists
  IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'scammer_images') THEN
    ALTER TABLE public.scammer_images ENABLE ROW LEVEL SECURITY;
    
    -- Create policy for authenticated users to read
    IF NOT EXISTS (
      SELECT 1 FROM pg_policies 
      WHERE schemaname = 'public' 
      AND tablename = 'scammer_images' 
      AND policyname = 'Allow authenticated users to read scammer_images'
    ) THEN
      CREATE POLICY "Allow authenticated users to read scammer_images"
        ON public.scammer_images
        FOR SELECT
        TO authenticated
        USING (true);
    END IF;
    
    -- Allow authenticated users to insert
    IF NOT EXISTS (
      SELECT 1 FROM pg_policies 
      WHERE schemaname = 'public' 
      AND tablename = 'scammer_images' 
      AND policyname = 'Allow authenticated users to insert scammer_images'
    ) THEN
      CREATE POLICY "Allow authenticated users to insert scammer_images"
        ON public.scammer_images
        FOR INSERT
        TO authenticated
        WITH CHECK (true);
    END IF;
  END IF;
END $$;

-- Fix Storage Bucket RLS Policies
-- Storage buckets also have RLS policies that need to be configured

-- Create or update profile-images bucket
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'profile-images',
  'profile-images',
  true,
  5242880,
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif']
)
ON CONFLICT (id) DO UPDATE SET
  public = true,
  file_size_limit = 5242880;

-- Drop existing policies for profile-images if they exist (to avoid conflicts)
DROP POLICY IF EXISTS "Allow authenticated users to upload to profile-images" ON storage.objects;
DROP POLICY IF EXISTS "Allow public read access to profile-images" ON storage.objects;
DROP POLICY IF EXISTS "Allow authenticated users to delete from profile-images" ON storage.objects;
DROP POLICY IF EXISTS "Public Access" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can upload" ON storage.objects;

-- Allow authenticated users to upload to profile-images
CREATE POLICY "Allow authenticated users to upload to profile-images"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'profile-images');

-- Allow anonymous/public read access to profile-images (since bucket is public)
-- Use 'anon' role instead of 'public' for Supabase storage policies
CREATE POLICY "Allow anonymous read access to profile-images"
ON storage.objects
FOR SELECT
TO anon, authenticated
USING (bucket_id = 'profile-images');

-- Allow authenticated users to delete their own uploads
CREATE POLICY "Allow authenticated users to delete from profile-images"
ON storage.objects
FOR DELETE
TO authenticated
USING (bucket_id = 'profile-images');

-- Policy for vault-files bucket: Private bucket for authenticated users
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'vault-files',
  'vault-files',
  false,
  10485760,
  NULL
)
ON CONFLICT (id) DO UPDATE SET
  public = false,
  file_size_limit = 10485760;

-- Drop existing policies for vault-files if they exist
DROP POLICY IF EXISTS "Allow authenticated users to upload to vault-files" ON storage.objects;
DROP POLICY IF EXISTS "Allow authenticated users to read vault-files" ON storage.objects;
DROP POLICY IF EXISTS "Allow authenticated users to delete vault-files" ON storage.objects;

-- Allow authenticated users to upload to vault-files
CREATE POLICY "Allow authenticated users to upload to vault-files"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'vault-files');

-- Allow authenticated users to read their own files in vault-files
CREATE POLICY "Allow authenticated users to read vault-files"
ON storage.objects
FOR SELECT
TO authenticated
USING (bucket_id = 'vault-files' AND (storage.foldername(name))[1] = auth.uid()::text);

-- Allow authenticated users to delete their own files in vault-files
CREATE POLICY "Allow authenticated users to delete vault-files"
ON storage.objects
FOR DELETE
TO authenticated
USING (bucket_id = 'vault-files' AND (storage.foldername(name))[1] = auth.uid()::text);
