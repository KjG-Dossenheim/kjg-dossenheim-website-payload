'use client'

import React from 'react'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
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

type ChildrenListViewProps = {
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

export function ChildrenListView({ registrations, events }: ChildrenListViewProps) {
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
    return <div className="py-6 text-center text-gray-500">Keine Kinder gefunden.</div>
  }

  return (
    <div className="space-y-8 py-6">
      {eventsWithChildren.map((eventGroup) => (
        <div key={eventGroup.eventId} className="space-y-4">
          <div className="flex items-center gap-3">
            <h2 className="text-xl font-semibold">{eventGroup.eventTitle}</h2>
            <span className="text-muted-foreground flex items-center gap-1.5 text-sm">
              <Calendar className="h-3.5 w-3.5" />
              {new Date(eventGroup.eventDate).toLocaleDateString('de-DE', {
                day: '2-digit',
                month: '2-digit',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
              })}
            </span>
            <span className="text-muted-foreground text-sm">
              ({eventGroup.children.length} {eventGroup.children.length === 1 ? 'Kind' : 'Kinder'})
            </span>
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
            {eventGroup.children.map((child, index) => (
              <Card
                key={`${child.firstName}-${child.lastName}-${index}`}
                className={`transition-all hover:shadow-md ${child.isWaitlist ? 'border-orange-300 bg-orange-50/50' : ''}`}
              >
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="space-y-1">
                      <h3 className="flex items-center gap-2 font-semibold">
                        <Baby className="h-4 w-4" />
                        {child.firstName} {child.lastName}
                      </h3>
                      {child.isWaitlist && (
                        <span className="inline-block rounded-full bg-orange-200 px-2 py-0.5 text-xs font-medium text-orange-800">
                          Warteliste
                        </span>
                      )}
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3 text-sm">
                  {/* Child Info */}
                  <div className="border-muted space-y-1 border-b pb-3">
                    {child.age !== undefined && (
                      <div>
                        <span className="text-muted-foreground">Alter:</span>{' '}
                        <span className="font-medium">{child.age} Jahre</span>
                      </div>
                    )}
                    {child.gender && (
                      <div>
                        <span className="text-muted-foreground">Geschlecht:</span>{' '}
                        <span className="font-medium">{GENDER_LABELS[child.gender]}</span>
                      </div>
                    )}
                    {child.dateOfBirth && (
                      <div>
                        <span className="text-muted-foreground">Geburtsdatum:</span>{' '}
                        <span className="font-medium">
                          {new Date(child.dateOfBirth).toLocaleDateString('de-DE')}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Additional Info */}
                  <div className="space-y-1">
                    {child.pickupInfo && (
                      <div>
                        <span className="text-muted-foreground">Abholung:</span>{' '}
                        <span className="font-medium">{PICKUP_LABELS[child.pickupInfo]}</span>
                      </div>
                    )}
                    {child.photoConsent !== undefined && (
                      <div>
                        <span className="text-muted-foreground">Fotoeinwilligung:</span>{' '}
                        <span className="font-medium">{child.photoConsent ? 'Ja' : 'Nein'}</span>
                      </div>
                    )}
                    {child.healthInfo && (
                      <div>
                        <span className="text-muted-foreground">Gesundheitsinfo:</span>{' '}
                        <span className="font-medium">{child.healthInfo}</span>
                      </div>
                    )}
                  </div>

                  {/* Parent Info */}
                  <div className="border-muted space-y-1 border-t pt-3">
                    <div className="flex items-center gap-1.5">
                      <User className="text-muted-foreground h-3.5 w-3.5" />
                      <span className="text-muted-foreground text-xs font-medium">Elternteil</span>
                    </div>
                    <div className="text-xs">
                      <div className="font-medium">{child.parentName}</div>
                      <div className="text-muted-foreground">{child.parentEmail}</div>
                      <div className="text-muted-foreground">{child.parentPhone}</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}
