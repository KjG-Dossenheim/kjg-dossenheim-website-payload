'use client'

import React from 'react'
import { Gutter } from '@payloadcms/ui'
import { Calendar, User, Baby } from 'lucide-react'
import type { KnallbonbonRegistration, KnallbonbonEvent } from '@/payload-types'

type ChildData = {
  firstName: string
  lastName: string
  age?: number
  gender?: 'male' | 'female' | 'diverse' | 'noInfo'
  dateOfBirth: string
  healthInfo?: string
  pickupInfo?: 'pickedUp' | 'goesAlone'
  photoConsent?: boolean
  parentName: string
  parentEmail: string
  parentPhone: string
  isWaitlist: boolean
}

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

const GENDER_LABELS = {
  male: 'Männlich',
  female: 'Weiblich',
  diverse: 'Divers',
  noInfo: 'Keine Angabe',
}

const PICKUP_LABELS = {
  pickedUp: 'Wird abgeholt',
  goesAlone: 'Geht alleine nach Hause',
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
            firstName: child.firstName || '',
            lastName: child.lastName || '',
            age: child.age,
            gender: child.gender,
            dateOfBirth: child.dateOfBirth || '',
            healthInfo: child.healthInfo,
            pickupInfo: child.pickupInfo,
            photoConsent: child.photoConsent,
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
          <div key={eventGroup.eventId} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--base)' }}>
            {/* Event Header */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 'calc(var(--base) / 2)', flexWrap: 'wrap' }}>
              <h2 style={{ fontSize: '1.25rem', fontWeight: 600, margin: 0 }}>{eventGroup.eventTitle}</h2>
              <span style={{ fontSize: '0.875rem', color: 'var(--theme-elevation-500)', display: 'flex', alignItems: 'center', gap: 'calc(var(--base) / 4)' }}>
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
                ({eventGroup.children.length} {eventGroup.children.length === 1 ? 'Kind' : 'Kinder'})
              </span>
            </div>

            {/* Children Grid */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
                gap: 'var(--base)',
              }}
            >
              {eventGroup.children.map((child, index) => (
                <div
                  key={`${child.firstName}-${child.lastName}-${index}`}
                  style={{
                    border: child.isWaitlist
                      ? '2px solid var(--theme-warning-500)'
                      : '1px solid var(--theme-elevation-150)',
                    borderRadius: 'var(--border-radius-m)',
                    padding: 'var(--base)',
                    backgroundColor: child.isWaitlist
                      ? 'var(--theme-warning-50)'
                      : 'var(--theme-elevation-0)',
                    transition: 'box-shadow 0.2s',
                  }}
                >
                  {/* Child Header */}
                  <div style={{ marginBottom: 'var(--base)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 'calc(var(--base) / 2)', marginBottom: 'calc(var(--base) / 4)' }}>
                      <Baby style={{ width: '16px', height: '16px', color: 'var(--theme-elevation-500)' }} />
                      <h3 style={{ fontSize: '1rem', fontWeight: 600, margin: 0 }}>
                        {child.firstName} {child.lastName}
                      </h3>
                    </div>
                    {child.isWaitlist && (
                      <span
                        style={{
                          display: 'inline-block',
                          padding: 'calc(var(--base) / 4) calc(var(--base) / 2)',
                          backgroundColor: 'var(--theme-warning-500)',
                          color: 'white',
                          fontSize: '0.75rem',
                          fontWeight: 500,
                          borderRadius: 'var(--border-radius-s)',
                        }}
                      >
                        Warteliste
                      </span>
                    )}
                  </div>

                  {/* Child Info */}
                  <div
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      gap: 'calc(var(--base) / 2)',
                      paddingBottom: 'var(--base)',
                      borderBottom: '1px solid var(--theme-elevation-150)',
                      marginBottom: 'var(--base)',
                      fontSize: '0.875rem',
                    }}
                  >
                    {child.age !== undefined && (
                      <div>
                        <span style={{ color: 'var(--theme-elevation-500)' }}>Alter:</span>{' '}
                        <span style={{ fontWeight: 500 }}>{child.age} Jahre</span>
                      </div>
                    )}
                    {child.gender && (
                      <div>
                        <span style={{ color: 'var(--theme-elevation-500)' }}>Geschlecht:</span>{' '}
                        <span style={{ fontWeight: 500 }}>{GENDER_LABELS[child.gender]}</span>
                      </div>
                    )}
                    {child.dateOfBirth && (
                      <div>
                        <span style={{ color: 'var(--theme-elevation-500)' }}>Geburtsdatum:</span>{' '}
                        <span style={{ fontWeight: 500 }}>
                          {new Date(child.dateOfBirth).toLocaleDateString('de-DE')}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Additional Info */}
                  <div
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      gap: 'calc(var(--base) / 2)',
                      paddingBottom: 'var(--base)',
                      borderBottom: '1px solid var(--theme-elevation-150)',
                      marginBottom: 'var(--base)',
                      fontSize: '0.875rem',
                    }}
                  >
                    {child.pickupInfo && (
                      <div>
                        <span style={{ color: 'var(--theme-elevation-500)' }}>Abholung:</span>{' '}
                        <span style={{ fontWeight: 500 }}>{PICKUP_LABELS[child.pickupInfo]}</span>
                      </div>
                    )}
                    {child.photoConsent !== undefined && (
                      <div>
                        <span style={{ color: 'var(--theme-elevation-500)' }}>Fotoeinwilligung:</span>{' '}
                        <span style={{ fontWeight: 500 }}>{child.photoConsent ? 'Ja' : 'Nein'}</span>
                      </div>
                    )}
                    {child.healthInfo && (
                      <div>
                        <span style={{ color: 'var(--theme-elevation-500)' }}>Gesundheitsinfo:</span>{' '}
                        <div
                          style={{
                            marginTop: 'calc(var(--base) / 4)',
                            padding: 'calc(var(--base) / 2)',
                            backgroundColor: 'var(--theme-warning-100)',
                            border: '1px solid var(--theme-warning-300)',
                            borderRadius: 'var(--border-radius-s)',
                            fontWeight: 500,
                          }}
                        >
                          {child.healthInfo}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Parent Info */}
                  <div style={{ fontSize: '0.875rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 'calc(var(--base) / 4)', marginBottom: 'calc(var(--base) / 4)' }}>
                      <User style={{ width: '14px', height: '14px', color: 'var(--theme-elevation-500)' }} />
                      <span style={{ color: 'var(--theme-elevation-500)', fontSize: '0.75rem', fontWeight: 500 }}>
                        Elternteil
                      </span>
                    </div>
                    <div style={{ fontSize: '0.75rem' }}>
                      <div style={{ fontWeight: 500, marginBottom: 'calc(var(--base) / 8)' }}>
                        {child.parentName}
                      </div>
                      <div style={{ color: 'var(--theme-elevation-500)' }}>{child.parentEmail}</div>
                      <div style={{ color: 'var(--theme-elevation-500)' }}>{child.parentPhone}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </Gutter>
  )
}

export default ChildrenListClient
