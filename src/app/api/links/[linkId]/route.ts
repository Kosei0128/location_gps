import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase-admin'

export async function GET(request: Request, { params }: { params: Promise<{ linkId: string }> }) {
    try {
        const { linkId } = await params

        if (!linkId) {
            return NextResponse.json({ error: 'Link ID is required' }, { status: 400 })
        }

        const supabase = createAdminClient()

        // Setup Admin Dashboard
        const { data: link, error: linkError } = await supabase
            .from('tracking_links')
            .select('*')
            .eq('id', linkId)
            .single()

        if (linkError || !link) {
            return NextResponse.json({ error: 'Invalid link' }, { status: 404 })
        }

        // Get basic stats
        const { data: logs, error: logsError } = await supabase
            .from('tracking_logs')
            .select('*')
            .eq('link_id', linkId)
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
