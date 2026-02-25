import { Metadata, ResolvingMetadata } from 'next'
import { createAdminClient } from '@/lib/supabase-admin'

type Props = {
    children: React.ReactNode
    params: Promise<{ track_id: string }>
}

export async function generateMetadata(
    { params }: Props,
    parent: ResolvingMetadata
): Promise<Metadata> {
    const trackId = (await params).track_id
    const supabase = createAdminClient()
    const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(trackId)

    let query = supabase.from('tracking_links').select('*')
    if (isUuid) {
        query = query.eq('id', trackId)
    } else {
        query = query.eq('short_id', trackId)
    }

    const { data: link } = await query.single()

    if (link && link.og_title) {
        return {
            title: link.og_title,
            description: link.og_description || undefined,
            openGraph: {
                title: link.og_title,
                description: link.og_description || undefined,
                images: link.og_image ? [link.og_image] : [],
            },
            twitter: {
                title: link.og_title,
                description: link.og_description || undefined,
                images: link.og_image ? [link.og_image] : [],
                card: 'summary_large_image'
            }
        }
    }

    return {}
}

export default function TrackLayout({ children }: Props) {
    return <>{children}</>
}
