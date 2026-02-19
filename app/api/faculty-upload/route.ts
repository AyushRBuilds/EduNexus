import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

// Use service-role key for server-side storage operations
function getSupabaseAdmin() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!url || (!serviceKey && !anonKey)) {
    throw new Error("Missing Supabase environment variables")
  }

  return createClient(url, serviceKey || anonKey!)
}

export async function POST(req: NextRequest) {
  try {
    const supabase = getSupabaseAdmin()
    const formData = await req.formData()

    const facultyEmail = formData.get("facultyEmail") as string
    const facultyName = formData.get("facultyName") as string | null
    const subject = formData.get("subject") as string
    const type = formData.get("type") as string
    const title = formData.get("title") as string
    const description = (formData.get("description") as string) || ""
    const externalUrl = (formData.get("externalUrl") as string) || ""
    const tagsRaw = (formData.get("tags") as string) || ""
    const file = formData.get("file") as File | null

    if (!facultyEmail || !subject || !type || !title) {
      return NextResponse.json(
        { error: "Missing required fields: facultyEmail, subject, type, title" },
        { status: 400 }
      )
    }

    let fileUrl: string | null = null
    let filePath: string | null = null

    // Upload file to Supabase Storage if present
    if (file && file.size > 0) {
      const timestamp = Date.now()
      const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, "_")
      const storagePath = `${subject.replace(/\s+/g, "_")}/${timestamp}_${safeName}`

      const { data: uploadData, error: uploadError } = await supabase.storage
        .from("faculty-materials")
        .upload(storagePath, file, {
          contentType: file.type,
          upsert: false,
        })

      if (uploadError) {
        console.error("[faculty-upload] Storage upload error:", uploadError)
        return NextResponse.json(
          { error: `File upload failed: ${uploadError.message}` },
          { status: 500 }
        )
      }

      filePath = uploadData.path
      const { data: publicUrlData } = supabase.storage
        .from("faculty-materials")
        .getPublicUrl(uploadData.path)

      fileUrl = publicUrlData.publicUrl
    }

    // Parse tags
    const tags = tagsRaw
      ? tagsRaw.split(",").map((t) => t.trim()).filter(Boolean)
      : []

    // Insert record into faculty_materials table
    const { data: material, error: insertError } = await supabase
      .from("faculty_materials")
      .insert({
        faculty_email: facultyEmail,
        faculty_name: facultyName || null,
        subject,
        type,
        title,
        description,
        file_url: fileUrl,
        external_url: externalUrl || null,
        file_path: filePath,
        tags,
      })
      .select()
      .single()

    if (insertError) {
      console.error("[faculty-upload] Insert error:", insertError)
      return NextResponse.json(
        { error: `Database insert failed: ${insertError.message}` },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true, material })
  } catch (error) {
    console.error("[faculty-upload] Unexpected error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
