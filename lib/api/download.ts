import type { BackendMaterial } from "./types"

/**
 * Triggers a browser download for a backend material.
 *
 * Strategy:
 *  - LINK / VIDEO  → open the URL in a new tab
 *  - PDF with content → download the extracted text as a .txt file
 *  - PDF with filePath → attempt to fetch the file through the proxy and download it
 */
export function downloadMaterial(material: BackendMaterial) {
  // For LINKs and VIDEOs, open in new tab
  if (material.type === "LINK" || material.type === "VIDEO") {
    const url = material.filePath || material.content
    if (url) {
      window.open(url.startsWith("http") ? url : `https://${url}`, "_blank", "noopener")
    }
    return
  }

  // For PDFs: if there is extracted text content, download it as a text file
  if (material.content) {
    const filename =
      material.description?.replace(/[^a-zA-Z0-9 ]/g, "").trim().replace(/\s+/g, "_") ||
      `material_${material.id}`

    const blob = new Blob([material.content], { type: "text/plain;charset=utf-8" })
    triggerDownload(blob, `${filename}.txt`)
    return
  }

  // Fallback: if there's a filePath, try to fetch through the proxy
  if (material.filePath) {
    const proxyUrl = `/api/proxy/uploads/${encodeURIComponent(material.filePath)}`
    window.open(proxyUrl, "_blank", "noopener")
  }
}

/**
 * Downloads all materials from an array as a single batch.
 * Opens each one sequentially with a small delay to avoid popup blockers.
 */
export async function downloadAllMaterials(materials: BackendMaterial[]) {
  for (let i = 0; i < materials.length; i++) {
    downloadMaterial(materials[i])
    // Small delay between downloads to avoid browser blocking
    if (i < materials.length - 1) {
      await new Promise((r) => setTimeout(r, 300))
    }
  }
}

/** Helper to trigger a file download in the browser */
function triggerDownload(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob)
  const a = document.createElement("a")
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}
