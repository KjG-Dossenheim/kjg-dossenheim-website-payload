// ⬇️ ISR-Zeit (in Sekunden) einstellen
export const revalidate = 60 // 1 Minute

// React and Next.js
import React from 'react'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import type { Metadata } from 'next'

// Icons
import { ArrowLeft, Lock } from 'lucide-react'

// UI Components
import { SongLyrics } from '@/components/song/SongLyrics'

// Utilities
import { getMartinsumzugSongData, getMartinsumzugSongs, getSongBySlug } from '@/utilities/songs'

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
    alternates: {
      canonical: `/martinsumzug/lieder/${song.slug}`,
    },
    openGraph: {
      title: song.title,
      description: song.artist ? `Von ${song.artist}` : undefined,
    },
  }
}

// Create a React component for the song page
export default async function SongPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const [{ isToday }, song] = await Promise.all([getMartinsumzugSongData(), getSongBySlug(slug)])

  // Nur Lieder, die im Martinsumzug-Global ausgewählt sind, haben eine Seite.
  if (!song) return notFound()

  const meta = [song.artist, song.year].filter(Boolean).join(' · ')

  // Bewusst ohne `lyrics.text`: der Liedtext ist urheberrechtlich geschützt und
  // soll nicht zusätzlich in den strukturierten Daten landen.
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'MusicComposition',
    name: song.title,
    composer: song.artist ? { '@type': 'Person', name: song.artist } : undefined,
    datePublished: song.year ? String(song.year) : undefined,
    inLanguage: 'de',
  }

  return (
    <article className="container mx-auto max-w-2xl px-4 py-10">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(jsonLd).replace(/</g, '\\u003c'),
        }}
      />

      <Link
        href="/martinsumzug/lieder"
        className="text-muted-foreground hover:text-foreground inline-flex items-center gap-1.5 text-sm transition-colors"
      >
        <ArrowLeft className="size-4" />
        Alle Lieder
      </Link>

      <header className="mt-6 border-b pb-6">
        <h1 className="text-3xl font-bold tracking-tight md:text-4xl">{song.title}</h1>
        {meta && <p className="text-muted-foreground mt-2">{meta}</p>}
      </header>

      <div className="mt-8">
        {isToday ? (
          <SongLyrics lyrics={song.lyrics} />
        ) : (
          /*
           * Außerhalb des Umzugstags bleibt die Seite erreichbar, nur der Text
           * fehlt — so sind Lied und Angaben schon vorab auffindbar.
           */
          <div className="border-muted-foreground/25 rounded-lg border-2 border-dashed p-12 text-center">
            <div className="bg-muted mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full">
              <Lock className="text-muted-foreground h-6 w-6" />
            </div>
            <h2 className="mb-2 text-lg font-semibold">Liedtext noch nicht verfügbar</h2>
            <p className="text-muted-foreground">Der Liedtext wird am Umzugstag freigeschaltet.</p>
          </div>
        )}
      </div>

      {song.copyright && (
        <footer className="text-muted-foreground mt-10 border-t pt-4 text-xs">
          {song.copyright}
        </footer>
      )}
    </article>
  )
}

export async function generateStaticParams() {
  // Nur Lieder, die im Martinsumzug-Global ausgewählt sind.
  const songs = await getMartinsumzugSongs()

  return songs.map((song) => ({
    slug: song.slug,
  }))
}
