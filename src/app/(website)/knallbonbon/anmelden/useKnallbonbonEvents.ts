import { useEffect, useState } from 'react'
import { toast } from 'sonner'
import { PayloadSDK } from '@payloadcms/sdk'
import type { Config } from '@/payload-types'
import type { EventOption } from './schema'

/**
 * Custom hook to provide Knallbonbon event options to the registration form.
 *
 * When `initialEvents` is provided (server-side pre-fetched via ISR), the hook
 * returns them immediately with `loading: false`, eliminating the client-side
 * REST API waterfall. The client-side fetch is only used as a fallback when no
 * initial data is available.
 *
 * @param initialEvents - Pre-fetched event options from the server component
 */
export function useKnallbonbonEvents(initialEvents?: EventOption[]) {
  const [eventOptions, setEventOptions] = useState<EventOption[]>(initialEvents ?? [])
  const [loading, setLoading] = useState(!initialEvents)
  const [error, setError] = useState<Error | null>(null)
  const hasInitialData = typeof initialEvents !== 'undefined' && initialEvents.length > 0

  useEffect(() => {
    // Skip the client fetch when server already provided event data
    if (hasInitialData) return

    const eventDateFormatter = new Intl.DateTimeFormat('de-DE', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })

    async function fetchEvents() {
      setLoading(true)
      setError(null)

      try {
        // Initialize Payload SDK client with proper typing
        const sdk = new PayloadSDK<Config>({
          baseURL: `${process.env.NEXT_PUBLIC_SITE_URL}/api`,
          fetch: fetch.bind(window),
        })

        // Fetch events using the SDK
        const data = await sdk.find({
          collection: 'knallbonbonEvents',
          sort: '-date',
          depth: 0, // Prevent join field resolution — only scalar fields needed
          limit: 100,
        })

        const now = new Date()

        const formattedOptions = data.docs
          .filter((event) => {
            // Filter out events without a date
            if (!event.date) return false

            // Filter out events that have already started
            const eventDate = new Date(event.date)
            if (eventDate <= now) return false

            return true
          })
          .map((event) => {
            const eventDate = event.date ? new Date(event.date) : null
            const dateLabel = eventDate ? eventDateFormatter.format(eventDate) : 'Datum unbekannt'

            return {
              id: event.id,
              title: String(event.title || 'Unbekannte Veranstaltung'),
              dateLabel,
              date: event.date ?? undefined,
              isFull: event.isFull || false,
              freeSpots: event.maxParticipants
                ? Math.max(event.maxParticipants - (event.participantCount || 0), 0)
                : 0,
              maxParticipants: event.maxParticipants ?? undefined,
              minAge: event.minAge ?? undefined,
              maxAge: event.maxAge ?? undefined,
            }
          })

        setEventOptions(formattedOptions)
      } catch (err) {
        const error = err instanceof Error ? err : new Error('Unknown error')
        console.error('Failed to fetch events:', error)
        setError(error)
        toast.error('Veranstaltungen konnten nicht geladen werden.')
        setEventOptions([])
      } finally {
        setLoading(false)
      }
    }

    void fetchEvents()
  }, [hasInitialData])

  return { eventOptions, loading, error }
}
