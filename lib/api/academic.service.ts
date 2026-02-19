import { apiClient } from "./client"
import type {
  BackendSubject,
  BackendMaterial,
  MaterialRequest,
} from "./types"

/**
 * GET /academic/subjects?email=...
 * Returns subjects visible to this user (students see department-scoped, teachers/admins see all).
 */
export async function getSubjects(email: string): Promise<BackendSubject[]> {
  return apiClient<BackendSubject[]>(
    `/academic/subjects?email=${encodeURIComponent(email)}`
  )
}

/**
 * GET /academic/materials/{subjectId}
 * Returns all materials for a given subject.
 */
export async function getMaterials(
  subjectId: number
): Promise<BackendMaterial[]> {
  return apiClient<BackendMaterial[]>(`/academic/materials/${subjectId}`)
}

/**
 * POST /admin/material
 * Adds a new material (text-based content).
 */
export async function addMaterial(
  request: MaterialRequest
): Promise<BackendMaterial> {
  return apiClient<BackendMaterial>("/admin/material", {
    method: "POST",
    body: request,
  })
}

/**
 * POST /admin/upload (multipart/form-data)
 * Uploads a PDF file, extracts text, and indexes it.
 */
export async function uploadMaterial(
  subjectId: number,
  type: "PDF" | "LINK" | "VIDEO",
  file: File,
  description?: string
): Promise<BackendMaterial> {
  const formData = new FormData()
  formData.append("subjectId", String(subjectId))
  formData.append("type", type)
  formData.append("file", file)
  if (description) {
    formData.append("description", description)
  }

  return apiClient<BackendMaterial>("/admin/upload", {
    method: "POST",
    body: formData,
  })
}
