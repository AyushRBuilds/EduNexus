CREATE TABLE IF NOT EXISTS public.faculty_materials (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMPTZ DEFAULT now(),
  faculty_email TEXT NOT NULL,
  faculty_name TEXT,
  subject TEXT NOT NULL,
  type TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  file_url TEXT,
  external_url TEXT,
  file_path TEXT,
  tags TEXT[] DEFAULT '{}'
);

ALTER TABLE public.faculty_materials ENABLE ROW LEVEL SECURITY;
