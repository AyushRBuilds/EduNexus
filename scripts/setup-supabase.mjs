// Supabase table setup script
// Run with: node scripts/setup-supabase.mjs

const SUPABASE_URL = 'https://onccsdnuontpwzileddo.supabase.co'
const SERVICE_ROLE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9uY2NzZG51b250cHd6aWxlZGRvIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MTUxMTk4OCwiZXhwIjoyMDg3MDg3OTg4fQ.VLcnDVeYAcEja1e7GYEGWNBWaMmK_k5VfAxKCdhEabI'

const headers = {
    'apikey': SERVICE_ROLE_KEY,
    'Authorization': `Bearer ${SERVICE_ROLE_KEY}`,
    'Content-Type': 'application/json',
    'Prefer': 'return=minimal',
}

async function checkTable(tableName) {
    try {
        const res = await fetch(`${SUPABASE_URL}/rest/v1/${tableName}?limit=0`, { headers })
        return res.ok
    } catch {
        return false
    }
}

async function runSQL(sql) {
    // Use the Supabase Management API to run SQL
    const res = await fetch(`${SUPABASE_URL}/rest/v1/rpc/`, {
        method: 'POST',
        headers,
        body: JSON.stringify({ query: sql })
    })
    return res
}

async function main() {
    console.log('Checking Supabase tables...\n')

    // Check profiles table
    const hasProfiles = await checkTable('profiles')
    console.log(`  profiles table: ${hasProfiles ? '✅ exists' : '❌ missing'}`)

    // Check faculty_materials table
    const hasFacultyMaterials = await checkTable('faculty_materials')
    console.log(`  faculty_materials table: ${hasFacultyMaterials ? '✅ exists' : '❌ missing'}`)

    // Check storage bucket
    try {
        const bucketRes = await fetch(`${SUPABASE_URL}/storage/v1/bucket/faculty-materials`, { headers })
        const hasBucket = bucketRes.ok
        console.log(`  faculty-materials bucket: ${hasBucket ? '✅ exists' : '❌ missing'}`)

        if (!hasBucket) {
            console.log('\n  Creating storage bucket...')
            const createRes = await fetch(`${SUPABASE_URL}/storage/v1/bucket`, {
                method: 'POST',
                headers,
                body: JSON.stringify({
                    id: 'faculty-materials',
                    name: 'faculty-materials',
                    public: true,
                    allowedMimeTypes: ['application/pdf', 'video/mp4', 'video/webm', 'image/png', 'image/jpeg'],
                    fileSizeLimit: 104857600 // 100MB
                })
            })
            if (createRes.ok) {
                console.log('  ✅ Storage bucket created!')
            } else {
                const err = await createRes.text()
                console.log(`  ⚠ Bucket creation: ${err}`)
            }
        }
    } catch (e) {
        console.log(`  ⚠ Could not check bucket: ${e.message}`)
    }

    if (!hasProfiles || !hasFacultyMaterials) {
        console.log('\n⚠ Missing tables! Please create them in Supabase SQL Editor:')

        if (!hasProfiles) {
            console.log(`
-- Run this in Supabase SQL Editor (https://supabase.com/dashboard/project/onccsdnuontpwzileddo/sql)
CREATE TABLE IF NOT EXISTS profiles (
  id uuid REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
  name text NOT NULL,
  role text NOT NULL DEFAULT 'student',
  department text,
  semester integer,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own profile" ON profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id);

-- Auto-create profile on signup
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, name, role, department, semester)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1)),
    COALESCE(NEW.raw_user_meta_data->>'role', 'student'),
    NEW.raw_user_meta_data->>'department',
    (NEW.raw_user_meta_data->>'semester')::integer
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();
`)
        }

        if (!hasFacultyMaterials) {
            console.log(`
-- Faculty materials table
CREATE TABLE IF NOT EXISTS faculty_materials (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at timestamptz DEFAULT now(),
  faculty_email text NOT NULL,
  faculty_name text,
  subject text NOT NULL,
  type text NOT NULL DEFAULT 'PDF',
  title text NOT NULL,
  description text,
  file_url text,
  external_url text,
  file_path text,
  tags text[] DEFAULT '{}',
  video_url text,
  youtube_url text
);

ALTER TABLE faculty_materials ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read faculty materials" ON faculty_materials
  FOR SELECT TO authenticated, anon USING (true);

CREATE POLICY "Faculty can insert materials" ON faculty_materials
  FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "Faculty can delete own materials" ON faculty_materials
  FOR DELETE TO authenticated USING (faculty_email = auth.jwt()->>'email');
`)
        }
    } else {
        console.log('\n✅ All tables exist!')
    }
}

main().catch(console.error)
