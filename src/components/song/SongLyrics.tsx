import { RichText } from '@/components/utils/RichText'
import type { MartinsumzugSong } from '@/utilities/songs'

interface SongLyricsProps {
  lyrics: MartinsumzugSong['lyrics']
}

/**
 * Liedtext mit ruhigem Lesemaß.
 *
 * `.song-lyrics` ergänzt `.payload-richtext` um Strophen-Rhythmus und
 * Refrain-Hervorhebung und muss im Stylesheet nach `.payload-richtext` stehen,
 * damit die Abstände dort überschrieben werden.
 */
export function SongLyrics({ lyrics }: SongLyricsProps) {
  return (
    <div className="song-lyrics payload-richtext">
      <RichText data={lyrics} />
    </div>
  )
}
