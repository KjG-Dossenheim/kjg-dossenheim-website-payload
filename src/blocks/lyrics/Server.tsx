import React from 'react'
import { Song } from '@/payload-types'
import { RichText } from '@payloadcms/richtext-lexical/react'

interface LyricsBlockProps {
  song: Song
  showMetadata?: boolean
}

export default function LyricsBlockServer({ song, showMetadata = true }: LyricsBlockProps) {
  if (!song) {
    return null
  }

  return (
    <div className="mx-auto max-w-4xl py-8">
      <div className="bg-card rounded-lg border p-6 shadow-sm">
        {/* Song Title */}
        <h2 className="mb-4 text-3xl font-bold">{song.title}</h2>

        {/* Metadata */}
        {showMetadata && (
          <div className="text-muted-foreground mb-6 flex flex-wrap gap-4 text-sm">
            {song.artist && (
              <div className="flex items-center gap-2">
                <span className="font-medium">Künstler:</span>
                <span>{song.artist}</span>
              </div>
            )}
            {song.year && (
              <div className="flex items-center gap-2">
                <span className="font-medium">Jahr:</span>
                <span>{song.year}</span>
              </div>
            )}
            {song.theme && (
              <div className="flex items-center gap-2">
                <span className="font-medium">Thema:</span>
                <span className="capitalize">{song.theme}</span>
              </div>
            )}
          </div>
        )}

        {/* Lyrics */}
        <div className="prose prose-sm md:prose-base dark:prose-invert max-w-none">
          {song.lyrics ? <RichText data={song.lyrics} /> : <p>Keine Liedtexte verfügbar</p>}
        </div>

        {/* Copyright */}
        {showMetadata && song.copyright && (
          <div className="text-muted-foreground mt-6 border-t pt-4 text-xs">
            © {song.copyright}
          </div>
        )}
      </div>
    </div>
  )
}
