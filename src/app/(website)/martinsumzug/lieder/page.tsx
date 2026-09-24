// ⬇️ ISR-Zeit (in Sekunden) einstellen
export const revalidate = 60 // 1 Minute

// React and Next.js
import React from 'react'
import type { Metadata } from 'next'

// Icons
import { Music } from 'lucide-react'

// UI Components
import { SongListItem } from '@/components/song/SongListItem'

// Utilities
import { formatDateLocale } from '@/components/common/formatDateLocale'
import { getMartinsumzugSongData, getMartinsumzugSongs } from '@/utilities/songs'

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: `Lieder zum Martinsumzug | ${process.env.NEXT_PUBLIC_SITE_NAME}`,
    description: `Alle Lieder zum Martinsumzug der ${process.env.NEXT_PUBLIC_SITE_NAME} auf einen Blick. Die Liedtexte sind am Umzugstag verfügbar.`,
    alternates: {
      canonical: '/martinsumzug/lieder',
    },
  }
}

/**
 * Übersicht aller Martinsumzug-Lieder.
 *
 * Bewusst ganzjährig erreichbar: Titel und Interpreten dürfen vorab sichtbar sein,
 * gesperrt sind außerhalb des Umzugstags nur die Liedtexte auf der Liedseite.
 */
export default async function LiederPage() {
  const [{ isToday, startDate }, songs] = await Promise.all([
    getMartinsumzugSongData(),
    getMartinsumzugSongs(),
  ])

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: 'Lieder zum Martinsumzug',
    numberOfItems: songs.length,
    itemListElement: songs.map((song, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: song.title,
      url: `${process.env.NEXT_PUBLIC_SITE_URL}/martinsumzug/lieder/${song.slug}`,
    })),
  }

  return (
    <div className="container mx-auto max-w-3xl px-4 py-12">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(jsonLd).replace(/</g, '\\u003c'),
        }}
      />

      <header className="mb-10">
        <h1 className="text-3xl font-bold tracking-tight md:text-4xl">Lieder zum Martinsumzug</h1>
        {startDate && (
          <p className="text-muted-foreground mt-2">
            {formatDateLocale(startDate, 'EEEE, d. MMMM yyyy')}
          </p>
        )}
      </header>

      {songs.length === 0 ? (
        <div className="border-muted-foreground/25 rounded-lg border-2 border-dashed p-12 text-center">
          <div className="bg-muted mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full">
            <Music className="text-muted-foreground h-6 w-6" />
          </div>
          <h2 className="mb-2 text-lg font-semibold">Noch keine Lieder</h2>
          <p className="text-muted-foreground">
            Es wurden noch keine Lieder für den Martinsumzug hinterlegt.
          </p>
        </div>
      ) : (
        <>
          <ul className="flex flex-col gap-2">
            {songs.map((song) => (
              <li key={song.slug}>
                <SongListItem song={song} />
              </li>
            ))}
          </ul>
          {!isToday && (
            <p className="text-muted-foreground mt-6 text-sm">
              Die Liedertexte sind am Umzugstag verfügbar.
            </p>
          )}
        </>
      )}
    </div>
  )
}
