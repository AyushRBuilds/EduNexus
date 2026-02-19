-- Faculty Materials table for Supabase-powered uploads
-- This table stores metadata about faculty-uploaded content (PDFs, links, videos)

CREATE TABLE IF NOT EXISTS public.faculty_materials (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMPTZ DEFAULT now(),
  faculty_email TEXT NOT NULL,
  faculty_name TEXT,
  subject TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('PDF', 'LINK', 'VIDEO')),
  title TEXT NOT NULL,
  description TEXT,
  file_url TEXT,
  external_url TEXT,
  file_path TEXT,
  tags TEXT[] DEFAULT '{}'
);

-- Enable RLS
ALTER TABLE public.faculty_materials ENABLE ROW LEVEL SECURITY;

-- Policy: anyone can read (for search)
CREATE POLICY "faculty_materials_select_all"
  ON public.faculty_materials
  FOR SELECT
  USING (true);

-- Policy: authenticated users can insert
CREATE POLICY "faculty_materials_insert_authenticated"
  ON public.faculty_materials
  FOR INSERT
  WITH CHECK (true);

-- Policy: users can delete their own materials
CREATE POLICY "faculty_materials_delete_own"
  ON public.faculty_materials
  FOR DELETE
  USING (faculty_email = current_setting('request.jwt.claims', true)::json->>'email');

-- Full-text search index for fast querying
CREATE INDEX IF NOT EXISTS idx_faculty_materials_search
  ON public.faculty_materials
  USING GIN (to_tsvector('english', coalesce(subject, '') || ' ' || coalesce(title, '') || ' ' || coalesce(description, '')));

-- Index on subject for autocomplete
CREATE INDEX IF NOT EXISTS idx_faculty_materials_subject
  ON public.faculty_materials (subject);

-- Index on created_at for sorting
CREATE INDEX IF NOT EXISTS idx_faculty_materials_created
  ON public.faculty_materials (created_at DESC);
