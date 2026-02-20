import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

// Configuration
const MAX_FILE_SIZE = 100 * 1024 * 1024 // 100MB
const ALLOWED_FILE_TYPES = [
  "application/pdf",
  "video/mp4",
  "video/mpeg",
  "text/plain",
  "application/vnd.ms-powerpoint",
  "application/vnd.openxmlformats-officedocument.presentationml.presentation",
  "document/pdf",
]

interface UploadError {
  code: string
  userMessage: string
  details: string
  status: number
}

function getSupabaseAdmin() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!url || (!serviceKey && !anonKey)) {
    throw new Error("Missing Supabase environment variables")
  }

  return createClient(url, serviceKey || anonKey!)
}

/**
 * Validate file before upload
 */
function validateFile(
  file: File | null
): { valid: boolean; error?: UploadError } {
  if (!file) {
    return { valid: true } // File is optional
  }

  // Check file size
  if (file.size > MAX_FILE_SIZE) {
    return {
      valid: false,
      error: {
        code: "FILE_TOO_LARGE",
        userMessage: "File size exceeds 100MB limit",
        details: `Your file is ${(file.size / 1024 / 1024).toFixed(2)}MB`,
        status: 413,
      },
    }
  }

  // Check file type
  if (!ALLOWED_FILE_TYPES.includes(file.type)) {
    return {
      valid: false,
      error: {
        code: "INVALID_FILE_TYPE",
        userMessage: "File type not supported. Allowed: PDF, MP4, PPT, TXT",
        details: `Received file type: ${file.type || "unknown"}`,
        status: 415,
      },
    }
  }

  // Check file name length
  if (file.name.length > 255) {
    return {
      valid: false,
      error: {
        code: "FILENAME_TOO_LONG",
        userMessage: "File name is too long (max 255 characters)",
        details: `File name length: ${file.name.length}`,
        status: 400,
      },
    }
  }

  return { valid: true }
}

/**
 * Validate form fields
 */
function validateFormFields(data: {
  facultyEmail: string | null
  subject: string | null
  type: string | null
  title: string | null
}): { valid: boolean; error?: UploadError } {
  if (!data.facultyEmail || !data.facultyEmail.trim()) {
    return {
      valid: false,
      error: {
        code: "MISSING_FACULTY_EMAIL",
        userMessage: "Faculty email is required",
        details: "Please provide your email address",
        status: 400,
      },
    }
  }

  if (!data.subject || !data.subject.trim()) {
    return {
      valid: false,
      error: {
        code: "MISSING_SUBJECT",
        userMessage: "Subject is required",
        details: "Please select or enter a subject",
        status: 400,
      },
    }
  }

  if (!data.type || !data.type.trim()) {
    return {
      valid: false,
      error: {
        code: "MISSING_TYPE",
        userMessage: "Material type is required",
        details: "Please select a type (PDF, Video, Link, etc.)",
        status: 400,
      },
    }
  }

  if (!data.title || !data.title.trim()) {
    return {
      valid: false,
      error: {
        code: "MISSING_TITLE",
        userMessage: "Title is required",
        details: "Please provide a title for the material",
        status: 400,
      },
    }
  }

  if (data.title.length > 255) {
    return {
      valid: false,
      error: {
        code: "TITLE_TOO_LONG",
        userMessage: "Title is too long (max 255 characters)",
        details: `Title length: ${data.title.length}`,
        status: 400,
      },
    }
  }

  return { valid: true }
}

export async function POST(req: NextRequest) {
  let supabase: ReturnType<typeof getSupabaseAdmin>

  try {
    console.log("[faculty-upload] Request received")

    supabase = getSupabaseAdmin()
    const formData = await req.formData()

    const facultyEmail = (formData.get("facultyEmail") as string) || null
    const facultyName = (formData.get("facultyName") as string) || null
    const subject = (formData.get("subject") as string) || null
    const type = (formData.get("type") as string) || null
    const title = (formData.get("title") as string) || null
    const description = (formData.get("description") as string) || ""
    const externalUrl = (formData.get("externalUrl") as string) || ""
    const tagsRaw = (formData.get("tags") as string) || ""
    const file = formData.get("file") as File | null

    // Validate form fields
    const fieldValidation = validateFormFields({
      facultyEmail,
      subject,
      type,
      title,
    })
    if (!fieldValidation.valid && fieldValidation.error) {
      const err = fieldValidation.error
      console.warn(
        `[faculty-upload] Validation error: ${err.code} - ${err.details}`
      )
      return NextResponse.json(
        {
          error: err.userMessage,
          code: err.code,
          details: err.details,
        },
        { status: err.status }
      )
    }

    let fileUrl: string | null = null
    let filePath: string | null = null

    // Upload file if present
    if (file && file.size > 0) {
      console.log(`[faculty-upload] File validation: ${file.name} (${file.size} bytes)`)

      // Validate file
      const fileValidation = validateFile(file)
      if (!fileValidation.valid && fileValidation.error) {
        const err = fileValidation.error
        console.warn(
          `[faculty-upload] File validation error: ${err.code} - ${err.details}`
        )
        return NextResponse.json(
          {
            error: err.userMessage,
            code: err.code,
            details: err.details,
          },
          { status: err.status }
        )
      }

      const timestamp = Date.now()
      const safeName = file.name
        .replace(/[^a-zA-Z0-9._-]/g, "_")
        .substring(0, 200)
      const storagePath = `${subject!.replace(/\s+/g, "_")}/${timestamp}_${safeName}`

      console.log(`[faculty-upload] Uploading file to ${storagePath}`)

      const { data: uploadData, error: uploadError } = await supabase.storage
        .from("faculty-materials")
        .upload(storagePath, file, {
          contentType: file.type,
          upsert: false,
        })

      if (uploadError) {
        console.error("[faculty-upload] Storage error:", uploadError)

        // Provide specific error messages
        let userMessage = "File upload failed"
        let statusCode = 500

        if (uploadError.message.includes("quota")) {
          userMessage = "Storage quota exceeded. Please contact administrator."
          statusCode = 507
        } else if (uploadError.message.includes("permission")) {
          userMessage = "Permission denied for upload. Check folder settings."
          statusCode = 403
        } else if (uploadError.message.includes("duplicate")) {
          userMessage = "File already exists. Try renaming your file."
          statusCode = 409
        }

        return NextResponse.json(
          {
            error: userMessage,
            code: "STORAGE_ERROR",
            details: uploadError.message,
          },
          { status: statusCode }
        )
      }

      filePath = uploadData.path
      const { data: publicUrlData } = supabase.storage
        .from("faculty-materials")
        .getPublicUrl(uploadData.path)

      fileUrl = publicUrlData.publicUrl
      console.log(`[faculty-upload] File uploaded successfully: ${fileUrl}`)
    }

    // Parse tags
    const tags = tagsRaw
      ? tagsRaw
          .split(",")
          .map((t) => t.trim())
          .filter(Boolean)
      : []

    console.log(
      `[faculty-upload] Inserting record for: ${title} (${type}) under ${subject}`
    )

    // Insert record
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
      console.error("[faculty-upload] Database error:", insertError)

      // Provide specific error messages
      let userMessage = "Failed to save material"
      let statusCode = 500

      if (insertError.message.includes("duplicate")) {
        userMessage = "Material already exists"
        statusCode = 409
      } else if (insertError.message.includes("permission")) {
        userMessage = "Permission denied for database operation"
        statusCode = 403
      }

      return NextResponse.json(
        {
          error: userMessage,
          code: "DATABASE_ERROR",
          details: insertError.message,
        },
        { status: statusCode }
      )
    }

    console.log(
      `[faculty-upload] Success! Material ID: ${material?.id || "unknown"}`
    )

    return NextResponse.json(
      {
        success: true,
        material,
        message: "Material uploaded successfully!",
      },
      { status: 201 }
    )
  } catch (error) {
    console.error("[faculty-upload] Unexpected error:", error)

    const errorMessage =
      error instanceof Error ? error.message : "Unknown error occurred"

    return NextResponse.json(
      {
        error: "An unexpected error occurred during upload",
        code: "INTERNAL_ERROR",
        details: errorMessage,
      },
      { status: 500 }
    )
  }
}
