// EduNexus API Layer - Barrel Export
// All backend service functions and types in one place

export { apiClient, ApiError, getApiBaseUrl } from "./client"
export { loginUser } from "./auth.service"
export {
  getSubjects,
  getMaterials,
  addMaterial,
  uploadMaterial,
} from "./academic.service"
export { aiExplain, n8nChat } from "./ai.service"
export type { N8nChatResponse } from "./ai.service"
export { downloadMaterial, downloadAllMaterials } from "./download"
export type {
  BackendUser,
  BackendSubject,
  BackendMaterial,
  LoginRequest,
  MaterialRequest,
  AIRequest,
  AIExplainResponse,
  FrontendUser,
  FrontendUserRole,
} from "./types"
export { mapBackendRoleToFrontend, mapBackendUserToFrontend } from "./types"
