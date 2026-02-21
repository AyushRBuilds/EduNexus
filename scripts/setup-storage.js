import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase environment variables')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

async function setupStorage() {
  try {
    console.log('Creating faculty-materials bucket...')
    
    const { data, error } = await supabase
      .storage
      .createBucket('faculty-materials', {
        public: true,
        allowedMimeTypes: ['application/pdf', 'video/mp4', 'text/plain', 'application/vnd.ms-powerpoint', 'application/vnd.openxmlformats-officedocument.presentationml.presentation'],
        fileSizeLimit: 104857600
      })

    if (error) {
      if (error.message.includes('already exists')) {
        console.log('Bucket already exists')
        return true
      }
      throw error
    }

    console.log('Successfully created faculty-materials bucket')
    return true
  } catch (err) {
    console.error('Error:', err.message)
    process.exit(1)
  }
}

setupStorage()
