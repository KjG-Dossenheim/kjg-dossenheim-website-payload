// ⬇️ ISR-Zeit (in Sekunden) einstellen
export const revalidate = 60 // 1 Minute

// React and Next.js
import React from 'react'
import { notFound } from 'next/navigation'
import type { Metadata } from 'next'

// Payload CMS
import { getPayload } from 'payload'
import config from '@payload-config'
import { RichText } from '@payloadcms/richtext-lexical/react'

// UI Components
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

// Helper function to get Martinsumzug song IDs
async function getMartinsumzugSongIds() {
  const payload = await getPayload({ config })
  const martinsumzugGlobal = await payload.findGlobal({
    slug: 'martinsumzug',
    depth: 0, // Only get IDs, not full objects
  })

  // Extract song IDs from the relationship
  const songIds = (martinsumzugGlobal.songs || [])
    .map((song) => {
      if (typeof song === 'string') return song
      if (typeof song === 'object' && song !== null && 'id' in song) return song.id
      return null
    })
    .filter((id): id is string => id !== null)

  return songIds
}

// Helper function to fetch song by slug (used by both page and metadata)
async function getSongBySlug(slug: string) {
  const payload = await getPayload({ config })

  // First, get the allowed song IDs from Martinsumzug global
  const allowedSongIds = await getMartinsumzugSongIds()

  // Query songs collection with both slug and ID constraints
  const result = await payload.find({
    collection: 'songs',
    where: {
      and: [
        {
          slug: {
            equals: slug,
          },
        },
        {
          id: {
            in: allowedSongIds,
          },
        },
      ],
    },
    limit: 1,
    // Only fetch the fields we need
    select: {
      title: true,
      slug: true,
      artist: true,
      year: true,
      copyright: true,
      lyrics: true,
    },
  })

  return result.docs[0] || null
}

// Generate metadata for SEO
export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>
}): Promise<Metadata> {
  const { slug } = await params
  const song = await getSongBySlug(slug)

  if (!song) {
    return {
      title: 'Lied nicht gefunden',
    }
  }

  return {
    title: `${song.title} - Martinsumzug Lieder | ${process.env.NEXT_PUBLIC_SITE_NAME}`,
    description: song.artist
      ? `${song.title} von ${song.artist} - Liedtext für den Martinsumzug`
      : `${song.title} - Liedtext für den Martinsumzug`,
    openGraph: {
      title: song.title,
      description: song.artist ? `Von ${song.artist}` : undefined,
    },
  }
}

// Create a React component for the song page
export default async function SongPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const song = await getSongBySlug(slug)

  if (!song) return notFound()

  return (
    <div className="container mx-auto p-6">
      <Card className="w-fit">
        <CardHeader>
          <CardTitle className="space-x-2">{song.title}</CardTitle>
          {song.year && <CardDescription>Jahr: {song.year}</CardDescription>}
          {song.artist && <CardDescription>Interpret: {song.artist}</CardDescription>}
          {song.copyright && <CardDescription>Copyright: {song.copyright}</CardDescription>}
        </CardHeader>
        <CardContent>
          <RichText data={song.lyrics} />
        </CardContent>
      </Card>
    </div>
  )
}

export async function generateStaticParams() {
  const payload = await getPayload({ config })

  // Get the allowed song IDs from Martinsumzug global
  const allowedSongIds = await getMartinsumzugSongIds()

  if (allowedSongIds.length === 0) {
    return []
  }

  // Query only songs that are in the Martinsumzug collection
  const result = await payload.find({
    collection: 'songs',
    where: {
      id: {
        in: allowedSongIds,
      },
    },
    limit: 1000,
    pagination: false,
    // Only fetch the slug field for static params
    select: {
      slug: true,
    },
  })

  return result.docs.map((song) => ({
    slug: song.slug,
  }))
}
