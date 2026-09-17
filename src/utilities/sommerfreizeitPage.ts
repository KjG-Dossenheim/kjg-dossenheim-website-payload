import { cache } from 'react'

import { getPayload } from 'payload'
import config from '@payload-config'
import { formatDateLocale } from '@/components/common/formatDateLocale'
import type { SommerfreizeitEvent, SommerfreizeitSetting } from '@/payload-types'

type SommerfreizeitPageBase = {
  /** Das Global mit allen allgemeinen Inhalten und dem Verweis auf die Freizeit. */
  settings: SommerfreizeitSetting
  alter: SommerfreizeitSetting['alter']
  eigenschaften: SommerfreizeitSetting['eigenschaften']
  meta: SommerfreizeitSetting['meta']
}

export type SommerfreizeitPageData =
  | (SommerfreizeitPageBase & { mode: 'event'; event: SommerfreizeitEvent })
  | (SommerfreizeitPageBase & {
      mode: 'universal'
      event: null
      /** Jahr der Freizeit, die auf die vergangene folgt. `null`, wenn kein Jahr bekannt ist. */
      nextYear: number | null
    })

/** Ist die Freizeit vorbei? Ohne Enddatum wird das Startdatum verwendet. */
function isFreizeitOver(endDate: string | null | undefined, now = new Date()): boolean {
  if (!endDate) {
    return true
  }

  return new Date(endDate).getTime() < now.getTime()
}

/**
 * Jahr der Freizeit, die auf die vergangene folgt. Grundlage ist das Startjahr der
 * vergangenen Freizeit, damit die allgemeine Ansicht nicht jedes Jahr im CMS gepflegt
 * werden muss. Ohne vergangene Freizeit gibt es kein Jahr.
 */
function resolveNextYear(finishedEvent: SommerfreizeitEvent | null): number | null {
  if (!finishedEvent) {
    return null
  }

  const startYear = Number(formatDateLocale(finishedEvent.startDate, 'yyyy'))

  return Number.isFinite(startYear) ? startYear + 1 : null
}

/**
 * Ermittelt, welche Landing Page ausgespielt wird:
 * - `event`: die verknuepfte Freizeit laeuft noch oder steht bevor
 * - `universal`: die Freizeit ist vorbei oder ihr Datensatz existiert nicht mehr
 *
 * In der allgemeinen Ansicht wird zusaetzlich das Jahr der Freizeit mitgeliefert, die auf die
 * vergangene folgt (`nextYear`), damit die Ueberschrift ohne CMS-Pflege aktuell bleibt.
 *
 * Faengt fehlende oder geloeschte Verknuepfungen ab, damit die Seite nicht mit einem
 * Serverfehler antwortet. Innerhalb eines Requests wird das Ergebnis geteilt.
 */
export const getSommerfreizeitPage = cache(async (): Promise<SommerfreizeitPageData> => {
  const payload = await getPayload({ config })

  const settings = await payload.findGlobal({
    slug: 'sommerfreizeitSettings',
    depth: 2,
    overrideAccess: true,
  })

  const base: SommerfreizeitPageBase = {
    settings,
    alter: settings.alter,
    eigenschaften: settings.eigenschaften,
    meta: settings.meta,
  }

  const eventId =
    typeof settings.freizeit === 'string' ? settings.freizeit : settings.freizeit?.id

  let activeEvent: SommerfreizeitEvent | null = null
  let finishedEvent: SommerfreizeitEvent | null = null

  if (eventId) {
    try {
      const event = (await payload.findByID({
        collection: 'sommerfreizeitEvents',
        id: eventId,
        depth: 2,
      })) as SommerfreizeitEvent | null

      if (event) {
        if (isFreizeitOver(event.endDate ?? event.startDate)) {
          finishedEvent = event
        } else {
          activeEvent = event
        }
      }
    } catch {
      // Verknuepfte Freizeit existiert nicht mehr -> allgemeine Landing Page
    }
  }

  if (activeEvent) {
    return { ...base, mode: 'event', event: activeEvent }
  }

  return { ...base, mode: 'universal', event: null, nextYear: resolveNextYear(finishedEvent) }
})
