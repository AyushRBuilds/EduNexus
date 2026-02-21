"use client"

import { useState } from "react"
import {
  FileText,
  Download,
  X,
  ExternalLink,
  Copy,
  Check,
  Maximize2,
  Minimize2,
  Video,
  Link as LinkIcon,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { cn } from "@/lib/utils"
import type { BackendMaterial, SupabaseMaterial } from "@/lib/api/types"

interface MaterialViewerProps {
  material?: BackendMaterial | null
  supabaseMaterial?: SupabaseMaterial | null
  open: boolean
  onClose: () => void
}

/**
 * In-app viewer for materials uploaded by faculty.
 * Supports both BackendMaterial and SupabaseMaterial.
 * - PDF: Shows content inline or embeds via iframe
 * - LINK: Shows the URL with open-in-new-tab
 * - VIDEO: Embeds YouTube/Vimeo or shows link
 */
export function MaterialViewer({ material, supabaseMaterial, open, onClose }: MaterialViewerProps) {
  const [copied, setCopied] = useState(false)
  const [fullscreen, setFullscreen] = useState(false)

  if (!open || (!material && !supabaseMaterial)) return null

  // Normalise fields across both types
  const title = material
    ? (material.description || material.filePath || `Material #${material.id}`)
    : (supabaseMaterial!.title || "Untitled")

  const type = material ? material.type : (supabaseMaterial!.type || "PDF")
  const subjectName = material ? material.subject.name : (supabaseMaterial!.subject || "General")
  const authorName = material ? undefined : (supabaseMaterial!.faculty_name || "Faculty")
  const content = material?.content || null
  const fileUrl = material
    ? material.filePath
    : (supabaseMaterial!.file_url || supabaseMaterial!.external_url || null)
  const description = material?.description || supabaseMaterial?.description || null

  const isLink = type === "LINK"
  const isVideo = type === "VIDEO"
  const isPDF = type === "PDF"
  const hasContent = !!content

  // Try to get a video embed URL
  const videoEmbedUrl = isVideo && fileUrl ? getVideoEmbedUrl(fileUrl) : null

  // Is the file URL a direct file we can embed (PDF, image, etc.)?
  const canEmbedPDF = isPDF && fileUrl && (
    fileUrl.endsWith(".pdf") ||
    fileUrl.includes("supabase") ||
    fileUrl.includes("storage")
  )

  const handleCopy = () => {
    const textToCopy = content || fileUrl || ""
    if (textToCopy) {
      navigator.clipboard.writeText(textToCopy)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  const handleDownload = () => {
    if (content) {
      // Download text content
      const filename =
        title.replace(/[^a-zA-Z0-9 ]/g, "").trim().replace(/\s+/g, "_") || "material"
      const blob = new Blob([content], { type: "text/plain;charset=utf-8" })
      const url = URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = `${filename}.txt`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
    } else if (fileUrl) {
      // For Supabase files: trigger download via anchor link
      const a = document.createElement("a")
      a.href = fileUrl
      a.download = title.replace(/[^a-zA-Z0-9._-]/g, "_") || "download"
      a.target = "_blank"
      a.rel = "noopener noreferrer"
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
    }
  }

  const handleOpenExternal = () => {
    if (fileUrl) {
      window.open(
        fileUrl.startsWith("http") ? fileUrl : `https://${fileUrl}`,
        "_blank",
        "noopener,noreferrer"
      )
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />

      {/* Viewer Panel */}
      <div
        className={cn(
          "relative z-10 flex flex-col rounded-2xl border border-border bg-background shadow-2xl transition-all duration-300",
          fullscreen
            ? "h-[95vh] w-[95vw]"
            : "h-[80vh] w-[90vw] max-w-4xl"
        )}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border px-6 py-4">
          <div className="flex items-center gap-3 min-w-0">
            <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
              {isVideo ? (
                <Video className="h-5 w-5 text-primary" />
              ) : isLink ? (
                <LinkIcon className="h-5 w-5 text-primary" />
              ) : (
                <FileText className="h-5 w-5 text-primary" />
              )}
            </div>
            <div className="min-w-0">
              <h2 className="text-sm font-semibold text-foreground truncate">
                {title}
              </h2>
              <div className="flex items-center gap-2 mt-0.5">
                <Badge
                  variant="outline"
                  className="text-[10px] bg-sky-500/10 text-sky-400 border-sky-500/20"
                >
                  {type}
                </Badge>
                <span className="text-[11px] text-muted-foreground">
                  {subjectName}
                </span>
                {authorName && (
                  <span className="text-[11px] text-muted-foreground">
                    · {authorName}
                  </span>
                )}
              </div>
              {description && (
                <p className="text-[11px] text-muted-foreground/70 mt-0.5 truncate max-w-md">
                  {description}
                </p>
              )}
            </div>
          </div>

          <div className="flex items-center gap-1">
            <Button
              size="sm"
              variant="ghost"
              className="h-8 w-8 p-0 text-muted-foreground hover:text-foreground"
              onClick={handleCopy}
              title="Copy content/URL"
            >
              {copied ? <Check className="h-4 w-4 text-emerald-400" /> : <Copy className="h-4 w-4" />}
            </Button>
            {fileUrl && (
              <Button
                size="sm"
                variant="ghost"
                className="h-8 w-8 p-0 text-muted-foreground hover:text-foreground"
                onClick={handleOpenExternal}
                title="Open in new tab"
              >
                <ExternalLink className="h-4 w-4" />
              </Button>
            )}
            <Button
              size="sm"
              variant="ghost"
              className="h-8 w-8 p-0 text-muted-foreground hover:text-foreground"
              onClick={handleDownload}
              title="Download"
            >
              <Download className="h-4 w-4" />
            </Button>
            <Button
              size="sm"
              variant="ghost"
              className="h-8 w-8 p-0 text-muted-foreground hover:text-foreground"
              onClick={() => setFullscreen(!fullscreen)}
              title={fullscreen ? "Exit fullscreen" : "Fullscreen"}
            >
              {fullscreen ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
            </Button>
            <Button
              size="sm"
              variant="ghost"
              className="h-8 w-8 p-0 text-muted-foreground hover:text-foreground"
              onClick={onClose}
              title="Close"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-hidden">
          {/* Video embed */}
          {isVideo && videoEmbedUrl && (
            <div className="h-full flex items-center justify-center bg-black p-4">
              <iframe
                src={videoEmbedUrl}
                className="h-full w-full rounded-lg"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                title={title}
              />
            </div>
          )}

          {/* Video without embed */}
          {isVideo && !videoEmbedUrl && (
            <div className="flex h-full flex-col items-center justify-center gap-4 p-8 text-center">
              <div className="h-16 w-16 rounded-2xl bg-primary/10 flex items-center justify-center">
                <Video className="h-8 w-8 text-primary" />
              </div>
              <p className="text-sm text-muted-foreground">
                This video can be viewed externally
              </p>
              {fileUrl && (
                <Button onClick={handleOpenExternal} className="gap-2">
                  <ExternalLink className="h-4 w-4" />
                  Open Video
                </Button>
              )}
            </div>
          )}

          {/* Link material */}
          {isLink && (
            <div className="h-full flex flex-col">
              <div className="flex items-center gap-2 border-b border-border bg-secondary/30 px-4 py-2">
                <ExternalLink className="h-3.5 w-3.5 text-muted-foreground" />
                <span className="text-xs text-muted-foreground truncate flex-1">
                  {fileUrl}
                </span>
                <Button
                  size="sm"
                  variant="ghost"
                  className="h-6 text-[11px] text-primary"
                  onClick={handleOpenExternal}
                >
                  Open in new tab
                </Button>
              </div>
              <div className="flex-1 flex items-center justify-center p-8">
                <div className="text-center space-y-4">
                  <div className="h-16 w-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto">
                    <ExternalLink className="h-8 w-8 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-foreground">External Link</p>
                    <p className="text-xs text-muted-foreground mt-1 max-w-sm">
                      {fileUrl}
                    </p>
                  </div>
                  <Button onClick={handleOpenExternal} className="gap-2">
                    <ExternalLink className="h-4 w-4" />
                    Visit Link
                  </Button>
                </div>
              </div>
            </div>
          )}

          {/* PDF embedded viewer (for Supabase files with direct URL) */}
          {isPDF && canEmbedPDF && fileUrl && (
            <div className="h-full flex flex-col">
              <div className="flex items-center gap-2 border-b border-border bg-secondary/30 px-4 py-2">
                <FileText className="h-3.5 w-3.5 text-muted-foreground" />
                <span className="text-xs text-muted-foreground truncate flex-1">
                  {title}
                </span>
                <div className="flex items-center gap-1">
                  <Button
                    size="sm"
                    variant="ghost"
                    className="h-6 text-[11px] text-primary gap-1"
                    onClick={handleDownload}
                  >
                    <Download className="h-3 w-3" />
                    Download
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="h-6 text-[11px] text-primary"
                    onClick={handleOpenExternal}
                  >
                    Open in new tab
                  </Button>
                </div>
              </div>
              <div className="flex-1">
                <iframe
                  src={`${fileUrl}#toolbar=1&navpanes=1`}
                  className="h-full w-full"
                  title={title}
                />
              </div>
            </div>
          )}

          {/* Text content viewer (PDF extracted text, notes, etc.) */}
          {!isLink && !isVideo && !(isPDF && canEmbedPDF) && hasContent && (
            <ScrollArea className="h-full">
              <div className="p-6 md:p-8">
                <article className="prose prose-sm prose-invert max-w-none">
                  {content!.split("\n").map((paragraph, i) => {
                    const trimmed = paragraph.trim()
                    if (!trimmed) return <br key={i} />
                    const isHeading =
                      trimmed.length < 80 &&
                      (trimmed === trimmed.toUpperCase() || trimmed.endsWith(":"))
                    if (isHeading) {
                      return (
                        <h3 key={i} className="mt-6 mb-2 text-sm font-semibold text-foreground">
                          {trimmed}
                        </h3>
                      )
                    }
                    return (
                      <p key={i} className="text-sm leading-relaxed text-muted-foreground mb-2">
                        {trimmed}
                      </p>
                    )
                  })}
                </article>
              </div>
            </ScrollArea>
          )}

          {/* No content / file available — show download prompt */}
          {!isLink && !isVideo && !(isPDF && canEmbedPDF) && !hasContent && (
            <div className="flex h-full flex-col items-center justify-center gap-4 p-8 text-center">
              <div className="h-16 w-16 rounded-2xl bg-muted/20 flex items-center justify-center">
                <FileText className="h-8 w-8 text-muted-foreground/50" />
              </div>
              <div>
                <p className="text-sm font-medium text-foreground">
                  {fileUrl ? "File available for download" : "Content not available for preview"}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  {fileUrl
                    ? "Click download to save this file to your device"
                    : "No content or file associated with this material"}
                </p>
              </div>
              {fileUrl && (
                <div className="flex gap-2">
                  <Button onClick={handleDownload} className="gap-2">
                    <Download className="h-4 w-4" />
                    Download File
                  </Button>
                  <Button onClick={handleOpenExternal} variant="outline" className="gap-2">
                    <ExternalLink className="h-4 w-4" />
                    Open in New Tab
                  </Button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

/** Extracts a YouTube/Vimeo embed URL from a video link */
function getVideoEmbedUrl(url: string): string | null {
  // YouTube
  const ytMatch = url.match(
    /(?:youtube\.com\/(?:watch\?v=|embed\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/
  )
  if (ytMatch) return `https://www.youtube.com/embed/${ytMatch[1]}`

  // Vimeo
  const vimeoMatch = url.match(/vimeo\.com\/(\d+)/)
  if (vimeoMatch) return `https://player.vimeo.com/video/${vimeoMatch[1]}`

  return null
}
