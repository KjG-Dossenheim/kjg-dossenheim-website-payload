'use server'

import { getPayload } from 'payload'
import config from '@payload-config'
import type { Registration, ExportResult, EventsResult } from './schema'

/**
 * Server action to fetch Knallbonbon registrations for export
 * @param eventId - Optional event ID to filter registrations. Use 'all' for all events.
 * @returns Promise with registration data or error
 */
export async function fetchRegistrationsForExport(
  eventId?: string,
): Promise<ExportResult> {
  try {
    const payload = await getPayload({ config })

    // Build query conditions
    const where: {
      event?: {
        equals: string
      }
    } = {}

    if (eventId && eventId !== 'all') {
      where.event = {
        equals: eventId,
      }
    }

    // Fetch registrations with populated event data
    const result = await payload.find({
      collection: 'knallbonbonRegistration',
      depth: 1,
      limit: 10000,
      where,
      sort: '-createdAt',
    })

    return {
      success: true,
      data: result.docs as unknown as Registration[],
    }
  } catch (error) {
    console.error('Error fetching registrations for export:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Fehler beim Abrufen der Daten',
    }
  }
}

/**
 * Server action to fetch all Knallbonbon events
 * @returns Promise with events data or error
 */
export async function fetchKnallbonbonEvents(): Promise<EventsResult> {
  try {
    const payload = await getPayload({ config })

    const result = await payload.find({
      collection: 'knallbonbonEvents',
      limit: 1000,
      sort: '-date',
    })

    return {
      success: true,
      data: result.docs.map((doc) => ({
        id: doc.id,
        title: doc.title,
        date: doc.date,
      })),
    }
  } catch (error) {
    console.error('Error fetching events:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Fehler beim Abrufen der Veranstaltungen',
    }
  }
}
