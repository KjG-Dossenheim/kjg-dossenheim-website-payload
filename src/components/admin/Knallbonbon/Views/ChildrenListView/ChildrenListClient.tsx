'use client'

import React from 'react'
import { Gutter } from '@payloadcms/ui'
import { Calendar } from 'lucide-react'
import type { KnallbonbonRegistration, KnallbonbonEvent } from '@/payload-types'
import { DataTable } from './DataTable'
import { columns, type ChildData } from './columns'

type EventWithChildren = {
  eventId: string
  eventTitle: string
  eventDate: string
  children: ChildData[]
}

type ChildrenListClientProps = {
  registrations: Array<KnallbonbonRegistration & { event: KnallbonbonEvent | string }>
  events: KnallbonbonEvent[]
}

export function ChildrenListClient({ registrations, events }: ChildrenListClientProps) {
  // Group children by event
  const eventGroups: EventWithChildren[] = events.map((event) => {
    const eventRegistrations = registrations.filter((reg) => {
      const eventId = typeof reg.event === 'string' ? reg.event : reg.event?.id
      return eventId === event.id
    })

    const children: ChildData[] = []
    eventRegistrations.forEach((reg) => {
      if (Array.isArray(reg.child)) {
        reg.child.forEach((child) => {
          children.push({
            registrationId: reg.id,
            firstName: child.firstName || '',
            lastName: child.lastName || '',
            age: child.age || null,
            gender: child.gender,
            dateOfBirth: child.dateOfBirth || '',
            healthInfo: child.healthInfo || null,
            pickupInfo: child.pickupInfo,
            photoConsent: child.photoConsent || null,
            parentName: `${reg.firstName} ${reg.lastName}`,
            parentEmail: reg.email || '',
            parentPhone: reg.phone || '',
            isWaitlist: reg.isWaitlist || false,
          })
        })
      }
    })

    // Sort children by last name
    children.sort((a, b) => a.lastName.localeCompare(b.lastName))

    return {
      eventId: event.id,
      eventTitle: event.title || '',
      eventDate: event.date || '',
      children,
    }
  })

  // Filter out events with no children
  const eventsWithChildren = eventGroups.filter((group) => group.children.length > 0)

  if (eventsWithChildren.length === 0) {
    return (
      <Gutter>
        <div
          style={{
            textAlign: 'center',
            padding: 'calc(var(--base) * 3)',
            color: 'var(--theme-elevation-500)',
          }}
        >
          <p>Keine Kinder gefunden.</p>
        </div>
      </Gutter>
    )
  }

  return (
    <Gutter>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 'calc(var(--base) * 2)' }}>
        {eventsWithChildren.map((eventGroup) => (
          <div
            key={eventGroup.eventId}
            style={{ display: 'flex', flexDirection: 'column', gap: 'var(--base)' }}
          >
            {/* Event Header */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 'calc(var(--base) / 2)',
                flexWrap: 'wrap',
              }}
            >
              <h2 style={{ fontSize: '1.25rem', fontWeight: 600, margin: 0 }}>
                {eventGroup.eventTitle}
              </h2>
              <span
                style={{
                  fontSize: '0.875rem',
                  color: 'var(--theme-elevation-500)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 'calc(var(--base) / 4)',
                }}
              >
                <Calendar style={{ width: '14px', height: '14px' }} />
                {new Date(eventGroup.eventDate).toLocaleDateString('de-DE', {
                  day: '2-digit',
                  month: '2-digit',
                  year: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </span>
              <span style={{ fontSize: '0.875rem', color: 'var(--theme-elevation-500)' }}>
                ({eventGroup.children.length} {eventGroup.children.length === 1 ? 'Kind' : 'Kinder'}
                )
              </span>
            </div>

            {/* Data Table */}
            <DataTable columns={columns} data={eventGroup.children} />
          </div>
        ))}
      </div>
    </Gutter>
  )
}

export default ChildrenListClient
