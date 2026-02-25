import { Metadata } from 'next'

export const metadata: Metadata = {
    title: 'Victim 🔥',
    description: '相手の情報をみる',
    openGraph: {
        title: 'Victim 🔥',
        description: '相手の情報をみる',
        images: ['/victim.jpg'],
    },
    twitter: {
        title: 'Victim 🔥',
        description: '相手の情報をみる',
        images: ['/victim.jpg'],
        card: 'summary_large_image',
    },
}

export default function ResultLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return <>{children}</>
}
