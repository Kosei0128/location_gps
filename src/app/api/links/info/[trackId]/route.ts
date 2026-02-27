import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase-admin'

export async function GET(request: Request, { params }: { params: Promise<{ trackId: string }> }) {
    try {
        const { trackId } = await params

        if (!trackId) {
            return NextResponse.json({ error: 'Track ID is required' }, { status: 400 })
        }

        const supabase = createAdminClient()
        const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(trackId)

        let query = supabase.from('tracking_links').select('features')
        if (isUuid) {
            query = query.eq('id', trackId)
        } else {
            query = query.eq('short_id', trackId)
        }

        const { data: link, error } = await query.single()

        if (error || !link) {
            return NextResponse.json({ features: { gps: true, camera: false, pushNotification: false, snsPhishing: false } })
        }

        return NextResponse.json({ features: link.features })

    } catch (err) {
        return NextResponse.json({ features: { gps: true, camera: false, pushNotification: false, snsPhishing: false } })
    }
}
