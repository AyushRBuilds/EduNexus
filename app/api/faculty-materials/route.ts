import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"
import {
  getMaterials as getLocalMaterials,
  deleteMaterial as deleteLocalMaterial,
} from "@/lib/api/local-store"

function getSupabase() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!url || (!serviceKey && !anonKey)) {
    return null // Return null instead of throwing — fallback to in-memory store
  }

  return createClient(url, serviceKey || anonKey!)
}

/**
 * GET /api/faculty-materials
 *
 * Query params:
 *   - subject (optional): filter by subject name
 *   - search  (optional): full-text search on title, description, subject, tags
 *   - type    (optional): filter by type (PDF, VIDEO, LINK)
 *   - limit   (optional): max results (default 50)
 */
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)

    const subject = searchParams.get("subject")
    const search = searchParams.get("search")
    const type = searchParams.get("type")
    const limit = Math.min(Number(searchParams.get("limit") || 50), 200)

    const supabase = getSupabase()

    // ----- Supabase available: query from database -----
    if (supabase) {
      let query = supabase
        .from("faculty_materials")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(limit)

      if (subject) {
        query = query.ilike("subject", `%${subject}%`)
      }

      if (type) {
        query = query.eq("type", type)
      }

      if (search) {
        const searchTerm = `%${search}%`
        query = query.or(
          `title.ilike.${searchTerm},description.ilike.${searchTerm},subject.ilike.${searchTerm}`
        )
      }

      const { data, error } = await query

      if (error) {
        console.error("[faculty-materials] Query error:", error)
        // If table doesn't exist, fall through to in-memory store
        if (error.code === 'PGRST205' || error.message?.includes('faculty_materials')) {
          console.log("[faculty-materials] Table missing — falling back to in-memory store")
        } else {
          return NextResponse.json(
            { error: `Database query failed: ${error.message}` },
            { status: 500 }
          )
        }
      } else {
        return NextResponse.json({ materials: data || [] })
      }
    }

    // ----- Supabase NOT available: use in-memory store -----
    console.log("[faculty-materials] Supabase not configured — using in-memory store")
    const materials = getLocalMaterials({
      search: search || undefined,
      subject: subject || undefined,
      type: type || undefined,
      limit,
    })

    return NextResponse.json({ materials })
  } catch (error) {
    console.error("[faculty-materials] Unexpected error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}

/**
 * DELETE /api/faculty-materials
 *
 * Body: { id: string, filePath?: string }
 */
export async function DELETE(req: NextRequest) {
  try {
    const body = await req.json()
    const { id, filePath } = body

    if (!id) {
      return NextResponse.json({ error: "Missing material id" }, { status: 400 })
    }

    const supabase = getSupabase()

    // ----- Supabase available -----
    if (supabase) {
      if (filePath) {
        const { error: storageError } = await supabase.storage
          .from("faculty-materials")
          .remove([filePath])

        if (storageError) {
          console.error("[faculty-materials] Storage delete error:", storageError)
        }
      }

      const { error: deleteError } = await supabase
        .from("faculty_materials")
        .delete()
        .eq("id", id)

      if (deleteError) {
        console.error("[faculty-materials] Delete error:", deleteError)
        if (deleteError.code === 'PGRST205' || deleteError.message?.includes('faculty_materials')) {
          console.log("[faculty-materials] Table missing for delete — falling back to in-memory")
        } else {
          return NextResponse.json(
            { error: `Delete failed: ${deleteError.message}` },
            { status: 500 }
          )
        }
      } else {
        return NextResponse.json({ success: true })
      }
    }

    // ----- In-memory fallback -----
    const deleted = deleteLocalMaterial(id)
    if (!deleted) {
      return NextResponse.json({ error: "Material not found" }, { status: 404 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("[faculty-materials] Unexpected error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
