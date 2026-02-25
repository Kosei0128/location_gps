import { GlobeAltIcon, LinkIcon, MapPinIcon, ShieldCheckIcon, HandThumbUpIcon, ArrowRightIcon } from '@heroicons/react/24/outline'
import Link from 'next/link'

export default function HowToUsePage() {
    return (
        <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-4xl mx-auto space-y-12">

                {/* Header Section */}
                <div className="text-center space-y-4">
                    <div className="inline-flex items-center justify-center p-3 bg-blue-100 rounded-full mb-4">
                        <GlobeAltIcon className="w-8 h-8 text-blue-600" />
                    </div>
                    <h1 className="text-4xl font-extrabold text-gray-900 tracking-tight">GeoTrack 使い方ガイド</h1>
                    <p className="text-lg text-gray-500 max-w-2xl mx-auto">
                        たった3ステップで、指定したURLを通じて位置情報やデバイス情報を取得することができます。
                    </p>
                </div>

                {/* Steps Section */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                    <div className="grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-gray-100">

                        {/* Step 1 */}
                        <div className="p-8 space-y-4">
                            <div className="w-10 h-10 bg-blue-600 text-white rounded-xl flex items-center justify-center font-bold text-lg shadow-sm">
                                1
                            </div>
                            <h3 className="text-xl font-bold text-gray-900 flex items-center">
                                <LinkIcon className="w-5 h-5 mr-2 text-gray-400" />
                                リンクを作る
                            </h3>
                            <p className="text-gray-600 text-sm leading-relaxed">
                                管理画面から、最終的に相手に見せたい「本物のURL」（Google Mapsやニュース記事など）を入力し、トラップリンクを生成します。
                            </p>
                        </div>

                        {/* Step 2 */}
                        <div className="p-8 space-y-4">
                            <div className="w-10 h-10 bg-blue-600 text-white rounded-xl flex items-center justify-center font-bold text-lg shadow-sm">
                                2
                            </div>
                            <h3 className="text-xl font-bold text-gray-900 flex items-center">
                                <HandThumbUpIcon className="w-5 h-5 mr-2 text-gray-400" />
                                相手に送付する
                            </h3>
                            <p className="text-gray-600 text-sm leading-relaxed">
                                生成された「トラップリンク（送る用）」をコピーし、ターゲットに送ります。相手がリンクを開くと、見せかけのロード画面が表示されます。
                            </p>
                        </div>

                        {/* Step 3 */}
                        <div className="p-8 space-y-4">
                            <div className="w-10 h-10 bg-blue-600 text-white rounded-xl flex items-center justify-center font-bold text-lg shadow-sm">
                                3
                            </div>
                            <h3 className="text-xl font-bold text-gray-900 flex items-center">
                                <MapPinIcon className="w-5 h-5 mr-2 text-gray-400" />
                                結果を確認する
                            </h3>
                            <p className="text-gray-600 text-sm leading-relaxed">
                                同時に生成された「ダッシュボード（自分用）」にアクセスすると、相手のIPアドレス、機種情報、そしてGPS位置情報（許可された場合）が閲覧できます。
                            </p>
                        </div>

                    </div>
                </div>

                {/* Important Notes */}
                <div className="bg-amber-50 rounded-2xl p-8 border border-amber-100">
                    <h3 className="text-lg font-bold text-amber-900 flex items-center mb-4">
                        <ShieldCheckIcon className="w-6 h-6 mr-2 text-amber-600" />
                        取得できる情報と注意点
                    </h3>

                    <ul className="space-y-3 text-sm text-amber-800">
                        <li className="flex items-start">
                            <span className="mr-2 mt-0.5">•</span>
                            <span><strong>IP・端末情報は100%取得可能：</strong> 相手がリンクを踏んだ時点で、IPアドレス、使用しているスマホ機種、ブラウザの種類、充電残量などは「位置情報許可」の有無に関わらず即座に取得されます。</span>
                        </li>
                        <li className="flex items-start">
                            <span className="mr-2 mt-0.5">•</span>
                            <span><strong>詳細なGPSは「許可」が必要：</strong> マップでピンポイントに場所を特定するためのGPS座標は、相手がブラウザのポップアップダイアログで「許可」を押した場合のみ取得できます。</span>
                        </li>
                        <li className="flex items-start">
                            <span className="mr-2 mt-0.5">•</span>
                            <span><strong>リンクの期限：</strong> 生成されたリンクのデータはデータベースに無期限で保存されます。</span>
                        </li>
                    </ul>
                </div>

                <div className="text-center pt-8 pb-12">
                    <Link href="/admin" className="inline-flex items-center justify-center px-8 py-4 text-base font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-sm transition-all hover:shadow-md hover:-translate-y-0.5">
                        管理画面に戻る
                        <ArrowRightIcon className="w-5 h-5 ml-2" />
                    </Link>
                </div>

            </div>
        </div>
    )
}
