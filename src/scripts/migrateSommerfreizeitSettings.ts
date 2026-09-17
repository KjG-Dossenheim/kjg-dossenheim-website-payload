/**
 * One-off migration: `sommerfreizeitLandingPage` -> `sommerfreizeitSettings`.
 *
 * The Sommerfreizeit content model moved out of the `sommerfreizeitLandingPage` global into
 * `sommerfreizeitSettings`. Since the source global no longer exists in the config, the script reads
 * the raw `globals` documents that Payload leaves untouched in MongoDB.
 *
 * Run it once, e.g.:
 *
 *   DRY_RUN=1 pnpm payload run src/scripts/migrateSommerfreizeitSettings.ts
 *   pnpm payload run src/scripts/migrateSommerfreizeitSettings.ts
 *
 * `alter`, `eigenschaften` and `meta` fall back to the older `sommerfreizeit` document, in case the
 * earlier migration into `sommerfreizeitLandingPage` was never executed.
 */
import { getPayload } from 'payload'
import type { Payload } from 'payload'

import config from '@payload-config'
import type { SommerfreizeitSetting } from '@/payload-types'

const SOURCE_SLUG = 'sommerfreizeitLandingPage'
const LEGACY_SLUG = 'sommerfreizeit'
const TARGET_SLUG = 'sommerfreizeitSettings'

type RawDoc = Record<string, unknown>
type RawGlobalsCollection = {
  findOne: (filter: RawDoc) => Promise<RawDoc | null>
}

type RawSource = {
  freizeit?: unknown
  headline?: string | null
  subline?: string | null
  heroImage?: unknown
  description?: string | null
  alter?: string | null
  eigenschaften?: SommerfreizeitSetting['eigenschaften']
  meta?: { title?: string | null; description?: string | null } | null
}

type RawLegacy = {
  alter?: string | null
  allgemein?: { eigenschaften?: SommerfreizeitSetting['eigenschaften'] } | null
  meta?: { title?: string | null; description?: string | null } | null
}

const isDryRun = process.env.DRY_RUN === '1' || process.env.DRY_RUN === 'true'

async function readDoc(payload: Payload, globalType: string): Promise<RawDoc | null> {
  const connection = (
    payload.db as { connection?: { collection: (name: string) => RawGlobalsCollection } }
  ).connection

  if (!connection) {
    console.error('Keine MongoDB-Verbindung verfuegbar.')
    return null
  }

  return connection.collection('globals').findOne({ globalType })
}

/** ObjectIds aus dem Rohdokument in Strings umwandeln, wie Payload sie erwartet. */
function toId(value: unknown): string | null {
  if (typeof value === 'string' && value.length > 0) {
    return value
  }

  if (value && typeof value === 'object' && 'toString' in value) {
    return String(value)
  }

  return null
}

async function main() {
  const payload = await getPayload({ config })

  const source = (await readDoc(payload, SOURCE_SLUG)) as RawSource | null
  const legacy = (await readDoc(payload, LEGACY_SLUG)) as RawLegacy | null

  if (!source) {
    console.error(`Kein Quelldokument "${SOURCE_SLUG}" gefunden. Es wurde nichts geaendert.`)
    await payload.destroy()
    process.exitCode = 1
    return
  }

  const freizeitId = toId(source.freizeit)

  if (!freizeitId) {
    console.error('Im Quelldokument ist keine Freizeit verknuepft. Es wurde nichts geaendert.')
    await payload.destroy()
    process.exitCode = 1
    return
  }

  const data: Partial<SommerfreizeitSetting> = {
    freizeit: freizeitId,
    headline: source.headline ?? null,
    subline: source.subline ?? null,
    description: source.description ?? null,
    alter: source.alter ?? legacy?.alter ?? null,
    eigenschaften: source.eigenschaften ?? legacy?.allgemein?.eigenschaften ?? null,
    meta: {
      title: source.meta?.title ?? legacy?.meta?.title ?? null,
      description: source.meta?.description ?? legacy?.meta?.description ?? null,
    },
  }

  const heroImageId = toId(source.heroImage)

  if (heroImageId) {
    data.heroImage = heroImageId
  }

  const current = await payload.findGlobal({
    slug: TARGET_SLUG,
    depth: 0,
    overrideAccess: true,
  })

  if (current.freizeit) {
    console.warn(`"${TARGET_SLUG}" ist bereits verknuepft und wird ueberschrieben.`)
  }

  console.log(`Quelle: MongoDB-Dokument "globals" (globalType: "${SOURCE_SLUG}")`)
  console.log('Zu uebertragen:')
  console.log('  freizeit:', data.freizeit)
  console.log('  headline:', data.headline)
  console.log('  subline:', data.subline)
  console.log('  heroImage:', data.heroImage ?? '-')
  console.log('  description:', data.description)
  console.log('  alter:', data.alter)
  console.log('  eigenschaften:', data.eigenschaften?.length ?? 0, 'Eintraege')
  console.log('  meta.title:', data.meta?.title)
  console.log('  meta.description:', data.meta?.description)

  if (isDryRun) {
    console.log('Dry-Run: es wurde nichts geschrieben.')
  } else {
    await payload.updateGlobal({
      slug: TARGET_SLUG,
      data,
      depth: 0,
      overrideAccess: true,
    })

    console.log(`Migration abgeschlossen: "${SOURCE_SLUG}" -> "${TARGET_SLUG}".`)
  }

  await payload.destroy()
}

try {
  // Top-Level-Await: `payload run` importiert dieses Modul und beendet den Prozess danach.
  await main()
} catch (error) {
  console.error('Migration fehlgeschlagen:', error)
  process.exitCode = 1
}
