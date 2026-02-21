/**
 * In-memory store for faculty materials.
 * Used as a fallback when Supabase is not configured.
 * This enables the full demo flow (upload → search → AI overview) without any external services.
 *
 * Uses globalThis to persist data across Next.js dev-mode hot reloads.
 * Data is lost only when the dev server fully restarts.
 */

export interface InMemoryMaterial {
    id: string
    created_at: string
    faculty_email: string
    faculty_name: string | null
    subject: string
    type: string
    title: string
    description: string | null
    file_url: string | null
    external_url: string | null
    file_path: string | null
    tags: string[]
}

// Extend globalThis to hold our store across hot reloads
const globalStore = globalThis as typeof globalThis & {
    __facultyMaterials?: InMemoryMaterial[]
    __facultyMaterialsNextId?: number
}

// Initialize if not already present (survives hot-reload)
if (!globalStore.__facultyMaterials) {
    globalStore.__facultyMaterials = []
}
if (!globalStore.__facultyMaterialsNextId) {
    globalStore.__facultyMaterialsNextId = 1
}

function getStore(): InMemoryMaterial[] {
    return globalStore.__facultyMaterials!
}

function getNextId(): number {
    const id = globalStore.__facultyMaterialsNextId!
    globalStore.__facultyMaterialsNextId = id + 1
    return id
}

export function addMaterial(data: Omit<InMemoryMaterial, "id" | "created_at">): InMemoryMaterial {
    const material: InMemoryMaterial = {
        ...data,
        id: `local-${getNextId()}`,
        created_at: new Date().toISOString(),
    }
    getStore().push(material)
    console.log(`[local-store] Added material: "${material.title}" (${material.type}) — total: ${getStore().length}`)
    return material
}

export function getMaterials(filters?: {
    search?: string
    subject?: string
    type?: string
    limit?: number
    facultyEmail?: string
}): InMemoryMaterial[] {
    let result = [...getStore()]

    console.log(`[local-store] Querying ${result.length} materials, filters:`, JSON.stringify(filters))

    if (filters?.facultyEmail) {
        result = result.filter((m) => m.faculty_email === filters.facultyEmail)
    }

    if (filters?.subject) {
        result = result.filter((m) =>
            m.subject.toLowerCase().includes(filters.subject!.toLowerCase())
        )
    }

    if (filters?.type) {
        result = result.filter((m) => m.type === filters.type)
    }

    if (filters?.search) {
        const q = filters.search.toLowerCase()
        const tokens = q.split(/\s+/).filter(Boolean)

        result = result.filter((m) => {
            const title = m.title.toLowerCase()
            const desc = (m.description || "").toLowerCase()
            const subject = m.subject.toLowerCase()
            const tagsStr = (m.tags || []).join(" ").toLowerCase()

            // Full query match
            if (title.includes(q) || desc.includes(q) || subject.includes(q) || tagsStr.includes(q)) {
                return true
            }

            // Token-level matching: if any token matches, include it
            for (const token of tokens) {
                if (token.length < 2) continue
                if (title.includes(token) || desc.includes(token) || subject.includes(token) || tagsStr.includes(token)) {
                    return true
                }
            }

            return false
        })
    }

    // Sort by newest first
    result.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())

    if (filters?.limit) {
        result = result.slice(0, filters.limit)
    }

    console.log(`[local-store] Returning ${result.length} results`)
    return result
}

export function deleteMaterial(id: string): boolean {
    const store = getStore()
    const index = store.findIndex((m) => m.id === id)
    if (index === -1) return false
    store.splice(index, 1)
    return true
}

export function getAllMaterials(): InMemoryMaterial[] {
    return [...getStore()]
}
