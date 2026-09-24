import Link from 'next/link'
import { Music } from 'lucide-react'

import { cn } from '@/lib/utils'
import { buttonVariants } from '@/components/ui/button'
import type { MartinsumzugSongListItem } from '@/utilities/songs'

interface SongListItemProps {
  song: MartinsumzugSongListItem
}

/**
 * Eine Zeile der Liederübersicht. Führt immer auf die Liedseite — die ist
 * ganzjährig erreichbar und zeigt den Text erst am Umzugstag.
 */
export function SongListItem({ song }: SongListItemProps) {
  const rowClass = cn(
    buttonVariants({ variant: 'ghost', size: 'lg' }),
    'border-border/60 hover:border-primary/40 h-auto w-full justify-start gap-3 border px-4 py-3 text-left whitespace-normal',
  )

  const meta = [song.artist, song.year].filter(Boolean).join(' · ')

  const content = (
    <>
      <Music className="text-primary size-4 shrink-0" />
      <span className="flex min-w-0 flex-col gap-0.5">
        <span className="leading-snug font-medium">{song.title}</span>
        {meta && <span className="text-muted-foreground text-xs font-normal">{meta}</span>}
      </span>
    </>
  )

  return (
    <Link href={`/martinsumzug/lieder/${song.slug}`} className={rowClass}>
      {content}
    </Link>
  )
}
