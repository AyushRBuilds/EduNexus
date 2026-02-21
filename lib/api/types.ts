// ===== Backend Entity Types (matching Java entities) =====

export interface BackendUser {
  id: number
  name: string
  email: string
  role: "STUDENT" | "TEACHER" | "ADMIN"
  department: string
  semester: number | null
}

export interface BackendSubject {
  id: number
  name: string
  department: string
  semester: number
}

export interface BackendMaterial {
  id: number
  subject: BackendSubject
  type: "PDF" | "LINK" | "VIDEO"
  filePath: string
  description: string
  content: string
}

// ===== Request DTOs =====

export interface LoginRequest {
  email: string
}

export interface MaterialRequest {
  subjectId: number
  type: "PDF" | "LINK" | "VIDEO"
  filePath: string
  description: string
  content: string
}

export interface AIRequest {
  question: string
  subjectId: number
}

// ===== AI Response Types =====

export interface AIExplainResponse {
  answer?: string
  message?: string
  scholarLink?: string
  error?: string
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  [key: string]: any
}

// ===== Frontend Mapped Types =====

export type FrontendUserRole = "student" | "faculty" | "admin"

export interface FrontendUser {
  id: string
  name: string
  email: string
  role: FrontendUserRole
  department: string
  avatar: string
  semester?: number | null
}

// ===== Mappers =====

export function mapBackendRoleToFrontend(
  role: BackendUser["role"]
): FrontendUserRole {
  switch (role) {
    case "STUDENT":
      return "student"
    case "TEACHER":
      return "faculty"
    case "ADMIN":
      return "admin"
    default:
      return "student"
  }
}

export function mapBackendUserToFrontend(user: BackendUser): FrontendUser {
  const initials = user.name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2)

  return {
    id: String(user.id),
    name: user.name,
    email: user.email,
    role: mapBackendRoleToFrontend(user.role),
    department: user.department,
    avatar: initials,
    semester: user.semester,
  }
}

// ===== Supabase Types =====

export interface SupabaseMaterial {
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
