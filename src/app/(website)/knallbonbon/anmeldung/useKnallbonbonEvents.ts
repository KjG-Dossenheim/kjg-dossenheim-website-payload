import { useEffect, useState } from 'react'
import { toast } from 'sonner'
import type { KnallbonbonEvent } from '@/payload-types';

export type EventOption = {
  id: string
  title: string
  dateLabel: string
  isFull: boolean
  freeSpots: number
}

interface KnallbonbonEventResponse {
  docs: KnallbonbonEvent[]
}

/**
 * Custom hook to fetch and format Knallbonbon events
 * Handles loading state, error handling, and data formatting
 */
export function useKnallbonbonEvents() {
  const [eventOptions, setEventOptions] = useState<EventOption[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
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
        const response = await fetch('/api/knallbonbonEvents')
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`)
        }
        const data = await response.json()

        const now = new Date()

        const formattedOptions = (data as KnallbonbonEventResponse).docs
          .filter((event) => {
            // Filter out events without a date
            if (!event.date) return false

            // Filter out events that have already started
            const eventDate = new Date(event.date)
            if (eventDate <= now) return false

            // Filter out events with no spots left
            if (event.isFull == true) return false

            return true
          })
          .map((event) => {
            const eventDate = event.date ? new Date(event.date) : null
            const dateLabel = eventDate ? eventDateFormatter.format(eventDate) : 'Datum unbekannt'

            return {
              id: event.id,
              title: String(event.title || 'Unbekannte Veranstaltung'),
              dateLabel,
              isFull: event.isFull || false,
              freeSpots: event.maxParticipants
                ? Math.max(event.maxParticipants - (event.participantCount || 0), 0)
                : 0,
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
  }, [])

  return { eventOptions, loading, error }
}
