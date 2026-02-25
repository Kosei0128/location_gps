import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase-admin'

export async function GET(request: Request, { params }: { params: Promise<{ linkId: string }> }) {
    try {
        const { linkId } = await params

        if (!linkId) {
            return NextResponse.json({ error: 'Link ID is required' }, { status: 400 })
        }

        const supabase = createAdminClient()

        const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(linkId)

        // Setup Admin Dashboard
        let query = supabase.from('tracking_links').select('*')
        if (isUuid) {
            query = query.eq('id', linkId)
        } else {
            query = query.eq('short_id', linkId)
        }

        const { data: link, error: linkError } = await query.single()

        if (linkError || !link) {
            return NextResponse.json({ error: 'Invalid link' }, { status: 404 })
        }

        // Get basic stats
        const { data: logs, error: logsError } = await supabase
            .from('tracking_logs')
            .select('*')
            .eq('link_id', link.id)
            .order('created_at', { ascending: false })

        if (logsError) {
            return NextResponse.json({ error: 'Failed to retrieve logs' }, { status: 500 })
        }

        return NextResponse.json({
            success: true,
            link,
            logs
        })

    } catch (err) {
        console.error('Unexpected error:', err)
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}
