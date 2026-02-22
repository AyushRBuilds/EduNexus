import { NextRequest, NextResponse } from 'next/server'
import { YoutubeTranscript } from 'youtube-transcript'

export async function POST(request: NextRequest) {
    try {
        const { videoId, instructor } = await request.json()

        if (!videoId) {
            return NextResponse.json({ error: 'Missing videoId. A valid YouTube URL is required.' }, { status: 400 })
        }

        console.log(`[transcript] Fetching real transcript for YouTube ID: ${videoId}`)

        try {
            const transcript = await YoutubeTranscript.fetchTranscript(videoId)

            if (!transcript || transcript.length === 0) {
                throw new Error('No captions found for this video')
            }

            // Map to expected format
            const formatted = transcript.map((item, index) => ({
                id: index + 1,
                start: item.offset,
                end: item.offset + item.duration,
                speaker: instructor || 'Speaker',
                text: item.text,
            }))

            console.log(`[transcript] Success: Fetched ${formatted.length} segments`)
            return NextResponse.json({ transcript: formatted })

        } catch (ytError: any) {
            console.error('[transcript] Failed to fetch real YouTube transcript:', ytError.message)
            return NextResponse.json({ error: `Failed to fetch transcript: ${ytError.message}` }, { status: 500 })
        }

    } catch (error) {
        console.error('[transcript] Error:', error)
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}
