import { unstable_cache } from 'next/cache'
import { getPayload } from 'payload'

import config from '@payload-config'
import type { Song } from '@/payload-types'
import { isMartinsumzugToday } from '@/utilities/martinsumzug'

/** Felder der Liederübersicht — bewusst ohne `lyrics`, die Übersicht ist nur eine Liste. */
export type MartinsumzugSongListItem = Pick<Song, 'title' | 'slug' | 'artist' | 'year'>

/** Felder der Liedseite inklusive Text. */
export type MartinsumzugSong = Pick<
  Song,
  'title' | 'slug' | 'artist' | 'year' | 'copyright' | 'lyrics'
>

interface MartinsumzugSongData {
  /** IDs der im Global ausgewählten Lieder, in der dort gepflegten Reihenfolge. */
  songIds: string[]
  /** Startdatum des Umzugs (ISO) — für die Überschrift der Übersicht. */
  startDate: string | null
  /** True, wenn heute der Umzugstag ist; nur dann sind die Liedtexte freigeschaltet. */
  isToday: boolean
}

/**
 * Lied-IDs und Terminlage des Martinsumzugs, gecacht.
 *
 * Grundlage ist bewusst die Beziehung im Global und nicht das `theme`-Feld der Lieder:
 * nur diese Auswahl entscheidet, welche Lieder öffentlich erreichbar sind.
 */
export const getMartinsumzugSongData = unstable_cache(
  async (): Promise<MartinsumzugSongData> => {
    const payload = await getPayload({ config })
    const martinsumzug = await payload.findGlobal({
      slug: 'martinsumzug',
      depth: 0,
      select: {
        songs: true,
        startDate: true,
      },
    })

    // Die Beziehung kommt je nach `depth` als ID oder als (unvollständiges) Dokument an.
    const songIds = (martinsumzug.songs || [])
      .map((song) => {
        if (typeof song === 'string') return song
        if (typeof song === 'object' && song !== null && 'id' in song) return song.id
        return null
      })
      .filter((id): id is string => id !== null)

    return {
      songIds,
      startDate: martinsumzug.startDate ?? null,
      isToday: isMartinsumzugToday(martinsumzug.startDate),
    }
  },
  ['martinsumzug-data'],
  {
    revalidate: 60,
    tags: ['martinsumzug'],
  },
)

/**
 * Alle Lieder des Martinsumzugs, alphabetisch nach Titel.
 *
 * Bewusst nicht an den Umzugstag gekoppelt: die Übersicht bleibt ganzjährig sichtbar,
 * gesperrt sind außerhalb des Umzugstags nur die Liedtexte selbst.
 */
export async function getMartinsumzugSongs(): Promise<MartinsumzugSongListItem[]> {
  const { songIds } = await getMartinsumzugSongData()

  if (songIds.length === 0) return []

  const payload = await getPayload({ config })
  const { docs } = await payload.find({
    collection: 'songs',
    where: {
      id: {
        in: songIds,
      },
    },
    sort: 'title',
    pagination: false,
    select: {
      title: true,
      slug: true,
      artist: true,
      year: true,
    },
  })

  return docs
}

/**
 * Einzelnes Lied anhand seines Slugs — ganzjährig erreichbar, aber nur, wenn es
 * im Global ausgewählt ist.
 *
 * Ob der Liedtext gezeigt werden darf, hängt am Umzugstag und wird von der Seite
 * über `isToday` entschieden: die Liedseite bleibt außerhalb des Umzugstags
 * erreichbar, zeigt dann aber nur die Angaben zum Lied.
 */
export async function getSongBySlug(slug: string): Promise<MartinsumzugSong | null> {
  const { songIds } = await getMartinsumzugSongData()

  if (songIds.length === 0) return null

  const payload = await getPayload({ config })
  const { docs } = await payload.find({
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
            in: songIds,
          },
        },
      ],
    },
    limit: 1,
    select: {
      title: true,
      slug: true,
      artist: true,
      year: true,
      copyright: true,
      lyrics: true,
    },
  })

  return docs[0] ?? null
}
