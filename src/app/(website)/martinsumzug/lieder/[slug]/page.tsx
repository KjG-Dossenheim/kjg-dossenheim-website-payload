// ⬇️ ISR-Zeit (in Sekunden) einstellen
export const revalidate = 60 // 1 Minute

// React and Next.js
import React from 'react'
import { notFound } from 'next/navigation'

// Third-party libraries

// Payload CMS
import { getPayload } from 'payload'
import config from '@payload-config'
import type { Song } from '@/payload-types'
import { RichText } from '@payloadcms/richtext-lexical/react'

// UI Components
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

// Custom Components

// Create a React component for the blog post page
export default async function BlogPostPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const payload = await getPayload({ config })
  try {
    // Fetch the Martinsumzug global entry
    const martinsumzugGlobal = await payload.findGlobal({
      slug: 'martinsumzug',
      depth: 2, // fetch relationships deeply
    })
    console.log(martinsumzugGlobal)
    const songs = (martinsumzugGlobal.songs || []).filter(
      (s): s is Song => typeof s === 'object' && s !== null && 'slug' in s,
    )
    console.log(songs)
    // Find the song with the matching slug
    const song = songs.find((s) => s.slug === slug)
    console.log(song)
    if (!song) return notFound()

    return (
      <div>
        <Card className="w-fit">
          <CardHeader>
            <CardTitle>Lied: {song.title} 🎵</CardTitle>
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
  } catch (error) {
    console.error('Error fetching Martinsumzug global:', error)
    return notFound()
  }
}

export async function generateStaticParams() {
  const payload = await getPayload({ config })
  const martinsumzugGlobal = await payload.findGlobal({
    slug: 'martinsumzug',
    depth: 2,
  })
  const songs = (martinsumzugGlobal.songs || []).filter(
    (s): s is Song => typeof s === 'object' && s !== null && 'slug' in s,
  )
  return songs.map((song) => ({
    slug: song.slug,
  }))
}
