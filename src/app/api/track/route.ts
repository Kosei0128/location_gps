import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase-admin'
import { UAParser } from 'ua-parser-js'

export async function POST(request: Request) {
    try {
        const data = await request.json()
        const { linkId, ...trackingData } = data

        if (!linkId) {
            return NextResponse.json({ error: 'Link ID is required' }, { status: 400 })
        }

        const supabase = createAdminClient()

        // Verify link exists
        const { data: link, error: linkError } = await supabase
            .from('tracking_links')
            .select('*')
            .eq('id', linkId)
            .single()

        if (linkError || !link) {
            return NextResponse.json({ error: 'Invalid link' }, { status: 404 })
        }

        // Parse User Agent
        const parser = new UAParser(trackingData.user_agent || '')
        const result = parser.getResult()

        // Insert Log
        const { error: insertError } = await supabase
            .from('tracking_logs')
            .insert({
                link_id: linkId,

                ip_address: trackingData.ip_address,
                user_agent: trackingData.user_agent,

                latitude: trackingData.latitude,
                longitude: trackingData.longitude,
                gps_accuracy: trackingData.gps_accuracy,
                gps_permission: trackingData.gps_permission,

                battery_level: trackingData.battery_level,
                battery_charging: trackingData.battery_charging,
                network_type: trackingData.network_type,
                network_speed: trackingData.network_speed,

                screen_width: trackingData.screen_width,
                screen_height: trackingData.screen_height,
                window_width: trackingData.window_width,
                window_height: trackingData.window_height,
                timezone: trackingData.timezone,
                language: trackingData.language,
                logical_cores: trackingData.logical_cores,
                device_memory: trackingData.device_memory,

                os_name: result.os.name,
                os_version: result.os.version,
                browser_name: result.browser.name,
                device_type: result.device.type || 'desktop',
                device_vendor: result.device.vendor
            })

        if (insertError) {
            console.error('Failed to save tracking info:', insertError)
            return NextResponse.json({ error: 'Failed to save tracking info' }, { status: 500 })
        }

        return NextResponse.json({ success: true, targetUrl: link.target_url })

    } catch (err) {
        console.error('Unexpected error:', err)
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}
