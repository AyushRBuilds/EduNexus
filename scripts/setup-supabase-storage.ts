import { createClient } from '@supabase/supabase-js'

/**
 * Script to set up Supabase Storage bucket for faculty materials
 * Run this once to create the bucket and set proper policies
 */

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function setupStorageBucket() {
  try {
    console.log('Setting up Supabase Storage bucket...')

    // Check if bucket exists
    const { data: buckets, error: listError } = await supabase.storage.listBuckets()

    if (listError) {
      console.error('Error listing buckets:', listError)
      return
    }

    const bucketExists = buckets.some((b) => b.name === 'faculty-materials')

    if (bucketExists) {
      console.log('✓ faculty-materials bucket already exists')
    } else {
      console.log('Creating faculty-materials bucket...')

      const { data, error } = await supabase.storage.createBucket('faculty-materials', {
        public: true,
        allowedMimeTypes: [
          'application/pdf',
          'video/mp4',
          'video/mpeg',
          'text/plain',
          'application/vnd.ms-powerpoint',
          'application/vnd.openxmlformats-officedocument.presentationml.presentation',
          'image/png',
          'image/jpeg',
          'application/msword',
          'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        ],
        fileSizeLimit: 104857600, // 100MB
      })

      if (error) {
        console.error('Error creating bucket:', error)
        return
      }

      console.log('✓ faculty-materials bucket created successfully')
    }

    console.log('\n✓ Supabase Storage setup complete!')
    console.log('Faculty materials can now be uploaded at: faculty-materials/')
  } catch (error) {
    console.error('Setup failed:', error)
    process.exit(1)
  }
}

setupStorageBucket()
