"use client"

/**
 * FormattedMarkdown — renders AI-generated markdown text with proper
 * formatting: headings, bold, italic, lists, code blocks, etc.
 *
 * This is a lightweight renderer (no heavy deps like react-markdown)
 * that handles the patterns Gemini / LLM typically produce.
 */

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
            const lang = line.trim().replace("```", "").trim()
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

        // Headings
        if (line.startsWith("### ")) {
            elements.push(
                <h4 key={elements.length} className={cn("font-semibold text-foreground mt-3 mb-1", compact ? "text-xs" : "text-sm")}>
                    {renderInline(line.slice(4))}
                </h4>
            )
            i++
            continue
        }
        if (line.startsWith("## ")) {
            elements.push(
                <h3 key={elements.length} className={cn("font-bold text-foreground mt-4 mb-1.5", compact ? "text-xs" : "text-[15px]")}>
                    {renderInline(line.slice(3))}
                </h3>
            )
            i++
            continue
        }
        if (line.startsWith("# ")) {
            elements.push(
                <h2 key={elements.length} className={cn("font-bold text-foreground mt-4 mb-2", compact ? "text-sm" : "text-base")}>
                    {renderInline(line.slice(2))}
                </h2>
            )
            i++
            continue
        }

        // Horizontal rule
        if (/^---+$/.test(line.trim()) || /^\*\*\*+$/.test(line.trim())) {
            elements.push(<hr key={elements.length} className="my-3 border-border/40" />)
            i++
            continue
        }

        // Numbered list items
        const numberedMatch = line.match(/^(\d+)\.\s+(.*)/)
        if (numberedMatch) {
            const listItems: React.ReactNode[] = []
            while (i < lines.length) {
                const liMatch = lines[i].match(/^(\d+)\.\s+(.*)/)
                if (!liMatch) break
                listItems.push(
                    <li key={listItems.length} className={cn("ml-1 mb-1", base)}>
                        {renderInline(liMatch[2])}
                    </li>
                )
                i++
            }
            elements.push(
                <ol key={elements.length} className="list-decimal list-inside my-1.5 space-y-0.5">
                    {listItems}
                </ol>
            )
            continue
        }

        // Bullet list items (-, *, •)
        if (/^[-*•]\s+/.test(line)) {
            const listItems: React.ReactNode[] = []
            while (i < lines.length && /^[-*•]\s+/.test(lines[i])) {
                listItems.push(
                    <li key={listItems.length} className={cn("ml-1 mb-1", base)}>
                        {renderInline(lines[i].replace(/^[-*•]\s+/, ""))}
                    </li>
                )
                i++
            }
            elements.push(
                <ul key={elements.length} className="list-disc list-inside my-1.5 space-y-0.5">
                    {listItems}
                </ul>
            )
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
 */
function renderInline(text: string): React.ReactNode {
    // Split by markdown patterns and build inline elements
    const parts: React.ReactNode[] = []
    let remaining = text
    let key = 0

    while (remaining.length > 0) {
        // Bold: **text** or __text__
        let match = remaining.match(/^(.*?)\*\*(.+?)\*\*/)
        if (!match) match = remaining.match(/^(.*?)__(.+?)__/)
        if (match) {
            if (match[1]) parts.push(<span key={key++}>{match[1]}</span>)
            parts.push(<strong key={key++} className="font-semibold text-foreground">{match[2]}</strong>)
            remaining = remaining.slice(match[0].length)
            continue
        }

        // Italic: *text* or _text_
        match = remaining.match(/^(.*?)\*(.+?)\*/)
        if (!match) match = remaining.match(/^(.*?)_(.+?)_/)
        if (match && !match[1].endsWith("\\")) {
            if (match[1]) parts.push(<span key={key++}>{match[1]}</span>)
            parts.push(<em key={key++} className="italic text-foreground/90">{match[2]}</em>)
            remaining = remaining.slice(match[0].length)
            continue
        }

        // Inline code: `code`
        match = remaining.match(/^(.*?)`(.+?)`/)
        if (match) {
            if (match[1]) parts.push(<span key={key++}>{match[1]}</span>)
            parts.push(
                <code
                    key={key++}
                    className="rounded bg-black/20 border border-border/30 px-1.5 py-0.5 text-[11px] font-mono text-emerald-300"
                >
                    {match[2]}
                </code>
            )
            remaining = remaining.slice(match[0].length)
            continue
        }

        // Link: [text](url)
        match = remaining.match(/^(.*?)\[(.+?)\]\((.+?)\)/)
        if (match) {
            if (match[1]) parts.push(<span key={key++}>{match[1]}</span>)
            parts.push(
                <a
                    key={key++}
                    href={match[3]}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary underline underline-offset-2 hover:text-primary/80"
                >
                    {match[2]}
                </a>
            )
            remaining = remaining.slice(match[0].length)
            continue
        }

        // No pattern matched — consume all remaining text
        parts.push(<span key={key++}>{remaining}</span>)
        break
    }

    return parts.length === 1 ? parts[0] : <>{parts}</>
}
