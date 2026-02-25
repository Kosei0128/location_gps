import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase-admin'

function generateShortId(length = 17) {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
    let result = ''
    for (let i = 0; i < length; i++) {
        result += chars.charAt(Math.floor(Math.random() * chars.length))
    }
    return result
}

export async function POST(request: Request) {
    try {
        const { targetUrl } = await request.json()

        if (!targetUrl) {
            return NextResponse.json({ error: 'Target URL is required' }, { status: 400 })
        }

        const supabase = createAdminClient()
        const shortId = generateShortId()

        const { data: link, error } = await supabase
            .from('tracking_links')
            .insert({ target_url: targetUrl, short_id: shortId })
            .select('id, short_id')
            .single()

        if (error || !link) {
            console.error('Database error:', error)
            return NextResponse.json({ error: 'Failed to create tracking link' }, { status: 500 })
        }

        const trackingId = link.short_id || link.id

        // Return the generated UUID or shortId, which we use for both the tracking link and the result page
        return NextResponse.json({
            trackingId: trackingId,
            trackUrl: `/track/${trackingId}`,
            resultUrl: `/result/${trackingId}`
        })

    } catch (err) {
        console.error('Unexpected error:', err)
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}
