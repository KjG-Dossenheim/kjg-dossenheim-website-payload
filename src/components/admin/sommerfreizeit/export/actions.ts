'use server'

import { getPayload } from 'payload'
import config from '@payload-config'
import type {
  SommerfreizeitAnmeldung,
  SommerfreizeitEvent,
  SommerfreizeitUser,
  Team,
} from '@/payload-types'
import { splitStreetAndHouseNumber } from '@/utilities/address'
import { generateCSV } from './csvGenerator'
import type { ExportPeriod, ExportRow } from './types'

export type ExportResult =
  | { success: true; csv: string; rowCount: number }
  | { success: false; error: string }

const NAME_COLLATOR = new Intl.Collator('de', { sensitivity: 'base' })

function sortByName(rows: ExportRow[]): ExportRow[] {
  return [...rows].sort(
    (a, b) =>
      NAME_COLLATOR.compare(a.lastName, b.lastName) ||
      NAME_COLLATOR.compare(a.firstName, b.firstName),
  )
}

/** Returns the populated account document, if the relationship was populated. */
function resolveAccount(
  account: SommerfreizeitAnmeldung['account'],
): SommerfreizeitUser | null {
  if (!account || typeof account === 'string') {
    return null
  }

  return account as SommerfreizeitUser
}

/**
 * Collects all export rows (Teilnehmer + Mitarbeiter) for the given event and
 * returns the generated CSV content.
 */
export async function fetchExportCsv(eventId: string): Promise<ExportResult> {
  if (!eventId) {
    return { success: false, error: 'Keine Freizeit ausgewählt.' }
  }

  const payload = await getPayload({ config })

  let event: SommerfreizeitEvent

  try {
    event = (await payload.findByID({
      collection: 'sommerfreizeitEvents',
      id: eventId,
      depth: 0,
      overrideAccess: true,
    })) as SommerfreizeitEvent
  } catch {
    return { success: false, error: 'Freizeit nicht gefunden.' }
  }

  // ── Teilnehmer (tn) ────────────────────────────────────────────────
  const anmeldungenResult = await payload.find({
    collection: 'sommerfreizeitAnmeldung',
    where: {
      event: {
        equals: eventId,
      },
    },
    depth: 1, // populate account for PLZ/Ort
    limit: 0,
    pagination: false,
    overrideAccess: true,
  })

  const tnRows: ExportRow[] = anmeldungenResult.docs.map((doc) => {
    const anmeldung = doc as SommerfreizeitAnmeldung
    const account = resolveAccount(anmeldung.account)

    // Prefer the structured street/house number; fall back to splitting the
    // legacy free-text `address` line (e.g. "Haeberlinstr. 1-3").
    const fallback = splitStreetAndHouseNumber(account?.address)

    return {
      firstName: anmeldung.firstName ?? '',
      lastName: anmeldung.lastName ?? '',
      street: account?.street?.trim() || fallback.street,
      houseNumber: account?.houseNumber?.trim() || fallback.houseNumber,
      postalCode: account?.postalCode ?? '',
      city: account?.city ?? '',
      country: account?.country ?? '',
      gender: anmeldung.gender,
      dateOfBirth: anmeldung.dateOfBirth,
      personType: 'tn',
      juleica: '',
    }
  })

  // ── Mitarbeiter (ma) ───────────────────────────────────────────────
  const teamIds = (event.team ?? [])
    .map((member) => (typeof member === 'string' ? member : member?.id))
    .filter((id): id is string => Boolean(id))

  const maRows: ExportRow[] = []

  if (teamIds.length > 0) {
    const teamResult = await payload.find({
      collection: 'team',
      where: {
        id: {
          in: teamIds,
        },
      },
      depth: 0,
      limit: 0,
      pagination: false,
      overrideAccess: true,
    })

    for (const memberDoc of teamResult.docs) {
      const member = memberDoc as Team

      maRows.push({
        firstName: member.firstName ?? '',
        lastName: member.lastName ?? '',
        street: member.street ?? '',
        houseNumber: member.houseNumber ?? '',
        postalCode: member.postalCode ?? '',
        city: member.city ?? '',
        country: member.country ?? '',
        gender: member.gender,
        dateOfBirth: member.dateOfBirth,
        personType: 'ma',
        juleica: member.juleica ?? '',
      })
    }
  }

  const rows = [...sortByName(tnRows), ...sortByName(maRows)]
  const period: ExportPeriod = { from: event.startDate, until: event.endDate }
  const csv = generateCSV(rows, period)

  return { success: true, csv, rowCount: rows.length }
}
