import { NextRequest, NextResponse } from 'next/server';
import path from 'path';
import fs from 'fs/promises';
import { exec } from 'child_process';
import util from 'util';
const execPromise = util.promisify(exec); export async function GET(request: NextRequest) {
    const url = request.nextUrl.searchParams.get('url');

    if (!url) {
        return NextResponse.json({ error: 'Missing url parameter' }, { status: 400 });
    }

    try {
        let buffer: Buffer;
        let fullPath = ''; // Hoisted for child_process

        // Support local:// protocol indicating file is in public folder
        if (url.startsWith('local://')) {
            console.log(`[extract-text] Handling local:// URL: ${url}`);
            fullPath = path.join(process.cwd(), 'public', decodeURIComponent(url.replace('local://', '')));
            console.log(`[extract-text] Resolved fullPath: ${fullPath}`);

            try {
                // Check if file exists first to avoid throwing unhandled buffer errors
                await fs.access(fullPath);
                buffer = await fs.readFile(fullPath);
                console.log(`[extract-text] Successfully read file from disk. Buffer size: ${buffer.length}`);
            } catch (fsError: any) {
                if (fsError.code === 'ENOENT') {
                    throw new Error(`Physical file not found for extraction: ${fullPath}`);
                }
                console.error(`[extract-text] Unexpected fs error:`, fsError);
                throw fsError;
            }
        } else {
            // Remote URL fallback logic (won't be hit for local uploads, but kept for completeness)
            const response = await fetch(url);
            if (!response.ok) {
                throw new Error(`Failed to fetch PDF from URL: ${response.statusText} `);
            }
            const arrayBuffer = await response.arrayBuffer();
            // buffer = Buffer.from(arrayBuffer); // No longer needed as we're not using pdf-parse directly

            // To use the new script for remote files, we'd need to write them to a temp file first.
            // For now, since your specific error is for local uploads, let's focus on the local path.
            throw new Error("Remote URL extraction is currently disabled to prevent memory leaks in dev server.");
        }

        // We use child_process to bypass Next.js turbopack bundling issues that break pdf-parse
        let extractedText = '';
        try {
            if (!fullPath) {
                throw new Error("No local file path resolved for extraction.");
            }
            const scriptPath = path.join(process.cwd(), 'scripts', 'extract-pdf.js');
            console.log(`[extract-text] Spawning Node process for: ${scriptPath}`);
            const { stdout, stderr } = await execPromise(`node "${scriptPath}" "${fullPath}"`, {
                maxBuffer: 1024 * 1024 * 50 // 50MB buffer for large PDFs
            });

            if (stderr) {
                console.warn(`[extract-text] Script stderr warning: ${stderr}`);
            }
            extractedText = stdout;
        } catch (execError: any) {
            console.error('[extract-text] child_process execution failed:', execError);
            throw execError;
        }

        // Optional: Clean up excessive whitespace
        extractedText = extractedText.replace(/\s+/g, ' ').trim();

        return NextResponse.json({ text: extractedText });
    } catch (error) {
        console.error('[extract-text] Error extracting PDF:', error);
        return NextResponse.json({
            error: 'Failed to extract text from PDF',
            details: error instanceof Error ? error.message : String(error)
        }, { status: 500 });
    }
}
