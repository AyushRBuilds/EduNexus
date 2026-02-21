"use client"

/**
 * FormattedMarkdown — renders AI-generated markdown text with proper
 * formatting: headings, bold, italic, lists, code blocks, etc.
 *
 * Lightweight renderer — no heavy deps like react-markdown.
 */

import React from "react"
import { cn } from "@/lib/utils"

interface FormattedMarkdownProps {
    text: string
    className?: string
    /** smaller text for chat bubbles */
    compact?: boolean
}

export function FormattedMarkdown({ text, className, compact }: FormattedMarkdownProps) {
    const lines = text.split("\n")
    const elements: React.ReactNode[] = []
    let i = 0

    const base = compact ? "text-xs" : "text-sm"

    while (i < lines.length) {
        const line = lines[i]

        // Code block (``` ... ```)
        if (line.trim().startsWith("```")) {
            const lang = line.trim().slice(3).trim()
            const codeLines: string[] = []
            i++
            while (i < lines.length && !lines[i].trim().startsWith("```")) {
                codeLines.push(lines[i])
                i++
            }
            i++ // skip closing ```
            elements.push(
                <pre
                    key={elements.length}
                    className="my-2 rounded-lg bg-black/30 border border-border/40 p-3 overflow-x-auto"
                >
                    <code className="text-[11px] leading-relaxed text-emerald-300 font-mono">
                        {codeLines.join("\n")}
                    </code>
                    {lang && (
                        <span className="block mt-1 text-[9px] text-muted-foreground/40 uppercase tracking-wider">{lang}</span>
                    )}
                </pre>
            )
            continue
        }

        // Empty line
        if (!line.trim()) {
            elements.push(<div key={elements.length} className="h-2" />)
            i++
            continue
        }

        // Headings (### ## #)
        const headingMatch = line.match(/^(#{1,3})\s+(.+)/)
        if (headingMatch) {
            const level = headingMatch[1].length
            const content = headingMatch[2]
            if (level === 1) {
                elements.push(
                    <h2 key={elements.length} className={cn("font-bold text-foreground mt-4 mb-2", compact ? "text-sm" : "text-base")}>
                        {renderInline(content)}
                    </h2>
                )
            } else if (level === 2) {
                elements.push(
                    <h3 key={elements.length} className={cn("font-bold text-foreground mt-3 mb-1.5", compact ? "text-xs" : "text-[15px]")}>
                        {renderInline(content)}
                    </h3>
                )
            } else {
                elements.push(
                    <h4 key={elements.length} className={cn("font-semibold text-foreground mt-3 mb-1", compact ? "text-xs" : "text-sm")}>
                        {renderInline(content)}
                    </h4>
                )
            }
            i++
            continue
        }

        // Horizontal rule
        if (/^[-*_]{3,}\s*$/.test(line.trim())) {
            elements.push(<hr key={elements.length} className="my-3 border-border/40" />)
            i++
            continue
        }

        // Numbered list items (1. text, 2. text)
        if (/^\d+\.\s+/.test(line)) {
            const listItems: React.ReactNode[] = []
            while (i < lines.length && /^\d+\.\s+/.test(lines[i])) {
                const liContent = lines[i].replace(/^\d+\.\s+/, "")
                listItems.push(
                    <li key={listItems.length} className={cn("mb-1", base)}>
                        {renderInline(liContent)}
                    </li>
                )
                i++
            }
            elements.push(
                <ol key={elements.length} className="list-decimal list-inside my-1.5 space-y-0.5 pl-1">
                    {listItems}
                </ol>
            )
            continue
        }

        // Bullet list items (- text, * text, • text)
        if (/^[-*•]\s+/.test(line)) {
            const listItems: React.ReactNode[] = []
            while (i < lines.length && /^[-*•]\s+/.test(lines[i])) {
                const liContent = lines[i].replace(/^[-*•]\s+/, "")
                listItems.push(
                    <li key={listItems.length} className={cn("mb-1", base)}>
                        {renderInline(liContent)}
                    </li>
                )
                i++
            }
            elements.push(
                <ul key={elements.length} className="list-disc list-inside my-1.5 space-y-0.5 pl-1">
                    {listItems}
                </ul>
            )
            continue
        }

        // Bold-only line (acts like a sub-heading): **Some Title**
        const boldLineMatch = line.match(/^\*\*(.+)\*\*\s*$/)
        if (boldLineMatch) {
            elements.push(
                <h4 key={elements.length} className={cn("font-semibold text-foreground mt-3 mb-1", compact ? "text-xs" : "text-sm")}>
                    {renderInline(boldLineMatch[1])}
                </h4>
            )
            i++
            continue
        }

        // Regular paragraph
        elements.push(
            <p key={elements.length} className={cn("leading-relaxed mb-1.5", base)}>
                {renderInline(line)}
            </p>
        )
        i++
    }

    return (
        <div className={cn("text-secondary-foreground", className)}>
            {elements}
        </div>
    )
}

/**
 * Render inline markdown: **bold**, *italic*, `code`, [links](url)
 * Uses a tokenizer approach for robust parsing.
 */
function renderInline(text: string): React.ReactNode {
    // Regex to split text by inline patterns
    // Order matters: bold (**) before italic (*), inline code first
    const inlineRegex = /(`[^`]+`|\*\*[^*]+\*\*|\*[^*]+\*|__[^_]+__|_[^_]+_|\[([^\]]+)\]\(([^)]+)\))/g

    const parts: React.ReactNode[] = []
    let lastIndex = 0
    let key = 0
    let match: RegExpExecArray | null

    while ((match = inlineRegex.exec(text)) !== null) {
        // Add text before this match
        if (match.index > lastIndex) {
            parts.push(<React.Fragment key={key++}>{text.slice(lastIndex, match.index)}</React.Fragment>)
        }

        const token = match[0]

        if (token.startsWith("`") && token.endsWith("`")) {
            // Inline code
            parts.push(
                <code
                    key={key++}
                    className="rounded bg-black/20 border border-border/30 px-1.5 py-0.5 text-[11px] font-mono text-emerald-300"
                >
                    {token.slice(1, -1)}
                </code>
            )
        } else if (token.startsWith("**") && token.endsWith("**")) {
            // Bold
            parts.push(
                <strong key={key++} className="font-semibold text-foreground">
                    {token.slice(2, -2)}
                </strong>
            )
        } else if (token.startsWith("__") && token.endsWith("__")) {
            // Bold (underscore)
            parts.push(
                <strong key={key++} className="font-semibold text-foreground">
                    {token.slice(2, -2)}
                </strong>
            )
        } else if (token.startsWith("*") && token.endsWith("*")) {
            // Italic
            parts.push(
                <em key={key++} className="italic text-foreground/90">
                    {token.slice(1, -1)}
                </em>
            )
        } else if (token.startsWith("_") && token.endsWith("_")) {
            // Italic (underscore)
            parts.push(
                <em key={key++} className="italic text-foreground/90">
                    {token.slice(1, -1)}
                </em>
            )
        } else if (token.startsWith("[")) {
            // Link [text](url)
            const linkText = match[2] || token
            const linkUrl = match[3] || "#"
            parts.push(
                <a
                    key={key++}
                    href={linkUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary underline underline-offset-2 hover:text-primary/80"
                >
                    {linkText}
                </a>
            )
        }

        lastIndex = match.index + token.length
    }

    // Add remaining text
    if (lastIndex < text.length) {
        parts.push(<React.Fragment key={key++}>{text.slice(lastIndex)}</React.Fragment>)
    }

    if (parts.length === 0) return text
    if (parts.length === 1) return parts[0]
    return <>{parts}</>
}
