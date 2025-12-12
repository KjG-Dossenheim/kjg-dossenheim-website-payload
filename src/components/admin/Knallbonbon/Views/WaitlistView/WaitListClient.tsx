'use client'

import React, { useState } from 'react'
import { Gutter } from '@payloadcms/ui'
import { useRouter, useSearchParams } from 'next/navigation'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import type { KnallbonbonEvent, KnallbonbonWaitlist } from '@/payload-types'
import { promoteWaitlistEntry, moveWaitlistToRegistration } from './actions'

type Child = NonNullable<KnallbonbonWaitlist['children']>[number] & {
  parentEmail?: string
  parentName?: string
  eventId?: string
  waitlistId?: string
  status?: KnallbonbonWaitlist['status']
}

const genderLabels: Record<string, string> = {
  male: 'Männlich',
  female: 'Weiblich',
  diverse: 'Divers',
  noInfo: 'Keine Angabe',
}

const statusLabels: Record<string, string> = {
  pending: 'Wartend',
  promoted: 'Befördert',
  confirmed: 'Bestätigt',
  expired: 'Abgelaufen',
  cancelled: 'Storniert',
}

export function WaitlistClient({
  registrations = [],
  events = [],
  initialEventId,
}: {
  registrations?: KnallbonbonWaitlist[]
  events?: KnallbonbonEvent[]
  initialEventId?: string
}) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [selectedEventId, setSelectedEventId] = useState<string>(
    initialEventId || searchParams.get('event') || '',
  )
  const [promotingId, setPromotingId] = useState<string | null>(null)
  const [movingId, setMovingId] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)

  const handleEventChange = (eventId: string) => {
    setSelectedEventId(eventId)
    const params = new URLSearchParams(searchParams.toString())
    if (eventId) {
      params.set('event', eventId)
    } else {
      params.delete('event')
    }
    router.push(`?${params.toString()}`)
  }

  const handlePromote = async (waitlistId: string, childName: string) => {
    setPromotingId(waitlistId)
    setError(null)
    setSuccessMessage(null)

    try {
      const result = await promoteWaitlistEntry(waitlistId)

      if (result.success) {
        setSuccessMessage(`${childName} wurde erfolgreich befördert!`)
        // Refresh the page to show updated data
        router.refresh()
      } else {
        setError(result.error || 'Ein Fehler ist aufgetreten')
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ein unbekannter Fehler ist aufgetreten')
    } finally {
      setPromotingId(null)
    }
  }

  const handleMove = async (waitlistId: string, childName: string) => {
    setMovingId(waitlistId)
    setError(null)
    setSuccessMessage(null)

    try {
      const result = await moveWaitlistToRegistration(waitlistId)

      if (result.success) {
        setSuccessMessage(`${childName} wurde erfolgreich zur Anmeldung verschoben!`)
        // Refresh the page to show updated data
        router.refresh()
      } else {
        setError(result.error || 'Ein Fehler ist aufgetreten')
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ein unbekannter Fehler ist aufgetreten')
    } finally {
      setMovingId(null)
    }
  }

  const children: Child[] = registrations.flatMap((reg) =>
    (reg.children ?? []).map((child) => ({
      ...child,
      parentEmail: reg.email,
      parentName: reg.parentName || `${reg.firstName} ${reg.lastName}`,
      eventId: typeof reg.event === 'string' ? reg.event : reg.event?.id,
      waitlistId: reg.id,
      status: reg.status,
    })),
  )

  const selectedEvent = events.find((e) => e.id === selectedEventId)

  return (
    <Gutter className="py-6">
      <div className="mb-6">
        <h1>Warteliste</h1>

        <div className="mb-4">
          <label htmlFor="event-select" className="mb-2 block text-sm font-medium">
            Veranstaltung auswählen
          </label>
          <select
            id="event-select"
            value={selectedEventId}
            onChange={(e) => handleEventChange(e.target.value)}
            className="w-full max-w-md rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:outline-none"
          >
            <option value="">Alle Veranstaltungen</option>
            {events.map((event) => (
              <option key={event.id} value={event.id}>
                {event.title}
              </option>
            ))}
          </select>
        </div>

        {error && (
          <div className="mb-4 rounded-md bg-red-50 p-4 text-red-800 dark:bg-red-900/20 dark:text-red-200">
            <p className="text-sm font-medium">Fehler: {error}</p>
          </div>
        )}

        {successMessage && (
          <div className="mb-4 rounded-md bg-green-50 p-4 text-green-800 dark:bg-green-900/20 dark:text-green-200">
            <p className="text-sm font-medium">{successMessage}</p>
          </div>
        )}

        <p>
          {children.length} {children.length === 1 ? 'Kind' : 'Kinder'} auf der Warteliste
          {selectedEvent && ` für "${selectedEvent.title}"`}
        </p>
      </div>

      {children.length === 0 ? (
        <div className="py-8 text-center text-gray-500">
          {selectedEventId
            ? 'Keine Kinder auf der Warteliste für diese Veranstaltung'
            : 'Keine Kinder auf der Warteliste'}
        </div>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Vorname</TableHead>
              <TableHead>Nachname</TableHead>
              <TableHead>Alter</TableHead>
              <TableHead>Geschlecht</TableHead>
              <TableHead>Eltern</TableHead>
              <TableHead>E-Mail der Eltern</TableHead>
              {!selectedEventId && <TableHead>Veranstaltung</TableHead>}
              <TableHead>Status</TableHead>
              <TableHead>Aktion</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {children.map((child, index) => {
              const event = events.find((e) => e.id === child.eventId)
              const isPromoting = promotingId === child.waitlistId
              const isMoving = movingId === child.waitlistId
              const childFullName = `${child.firstName} ${child.lastName}`

              return (
                <TableRow
                  key={child.id ?? `${child.firstName}-${child.lastName}-${child.eventId}-${index}`}
                >
                  <TableCell>{child.firstName}</TableCell>
                  <TableCell>{child.lastName}</TableCell>
                  <TableCell>{child.age}</TableCell>
                  <TableCell>{genderLabels[child.gender || ''] || child.gender}</TableCell>
                  <TableCell>{child.parentName}</TableCell>
                  <TableCell>{child.parentEmail}</TableCell>
                  {!selectedEventId && (
                    <TableCell>{typeof event === 'object' ? event?.title : event}</TableCell>
                  )}
                  <TableCell>
                    <span
                      className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${
                        child.status === 'pending'
                          ? 'bg-yellow-50 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-200'
                          : child.status === 'promoted'
                            ? 'bg-blue-50 text-blue-800 dark:bg-blue-900/20 dark:text-blue-200'
                            : child.status === 'confirmed'
                              ? 'bg-green-50 text-green-800 dark:bg-green-900/20 dark:text-green-200'
                              : child.status === 'expired'
                                ? 'bg-gray-50 text-gray-800 dark:bg-gray-900/20 dark:text-gray-200'
                                : child.status === 'cancelled'
                                  ? 'bg-red-50 text-red-800 dark:bg-red-900/20 dark:text-red-200'
                                  : 'bg-gray-50 text-gray-800 dark:bg-gray-900/20 dark:text-gray-200'
                      }`}
                    >
                      {statusLabels[child.status || ''] || child.status}
                    </span>
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() =>
                          child.waitlistId && handlePromote(child.waitlistId, childFullName)
                        }
                        disabled={isPromoting || isMoving || !child.waitlistId}
                      >
                        {isPromoting ? 'Wird eingeladen...' : 'Einladen'}
                      </Button>
                      <Button
                        size="sm"
                        onClick={() =>
                          child.waitlistId && handleMove(child.waitlistId, childFullName)
                        }
                        disabled={isPromoting || isMoving || !child.waitlistId}
                      >
                        {isMoving ? 'Wird verschoben...' : 'Direkt anmelden'}
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              )
            })}
          </TableBody>
        </Table>
      )}
    </Gutter>
  )
}

export default WaitlistClient
