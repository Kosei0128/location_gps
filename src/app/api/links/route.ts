import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase-admin'

export async function POST(request: Request) {
    try {
        const { targetUrl } = await request.json()

        if (!targetUrl) {
            return NextResponse.json({ error: 'Target URL is required' }, { status: 400 })
        }

        const supabase = createAdminClient()

        const { data: link, error } = await supabase
            .from('tracking_links')
            .insert({ target_url: targetUrl })
            .select('id')
            .single()

        if (error || !link) {
            console.error('Database error:', error)
            return NextResponse.json({ error: 'Failed to create tracking link' }, { status: 500 })
        }

        // Return the generated UUID, which we use for both the tracking link and the result page
        return NextResponse.json({
            trackingId: link.id,
            trackUrl: `/track/${link.id}`,
            resultUrl: `/result/${link.id}`
        })

    } catch (err) {
        console.error('Unexpected error:', err)
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}
