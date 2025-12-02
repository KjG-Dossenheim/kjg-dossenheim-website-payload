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
import type { KnallbonbonEvent, KnallbonbonRegistration } from '@/payload-types'

type Child = NonNullable<KnallbonbonRegistration['child']>[number] & {
  parentEmail?: string
  parentName?: string
  eventId?: string
}

const genderLabels: Record<string, string> = {
  male: 'Männlich',
  female: 'Weiblich',
  diverse: 'Divers',
  noInfo: 'Keine Angabe',
}

export function WaitlistClient({
  registrations = [],
  events = [],
  initialEventId,
}: {
  registrations?: KnallbonbonRegistration[]
  events?: KnallbonbonEvent[]
  initialEventId?: string
}) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [selectedEventId, setSelectedEventId] = useState<string>(
    initialEventId || searchParams.get('event') || '',
  )

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

  const children: Child[] = registrations.flatMap((reg) =>
    (reg.child ?? []).map((child) => ({
      ...child,
      parentEmail: reg.email,
      parentName: `${reg.firstName} ${reg.lastName}`,
      eventId: typeof reg.event === 'string' ? reg.event : reg.event?.id,
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
            </TableRow>
          </TableHeader>
          <TableBody>
            {children.map((child, index) => {
              const event = events.find((e) => e.id === child.eventId)
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
