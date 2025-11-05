import { useEffect, useState } from 'react'
import { toast } from 'sonner'

export type EventOption = {
    id: string
    title: string
    dateLabel: string
}

interface KnallbonbonEvent {
    id: string
    title?: string
    name?: string
    date?: string
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

                const formattedOptions = (data as KnallbonbonEventResponse).docs.map((event) => {
                    const eventDate = event.date ? new Date(event.date) : null
                    const dateLabel = eventDate ? eventDateFormatter.format(eventDate) : 'Datum unbekannt'

                    return {
                        id: event.id,
                        title: String(event.title || event.name || 'Unbekannte Veranstaltung'),
                        dateLabel,
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
