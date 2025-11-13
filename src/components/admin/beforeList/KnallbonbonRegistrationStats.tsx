import React from 'react'
import type { BeforeListServerProps } from 'payload'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Gutter } from '@payloadcms/ui'

export async function KnallbonbonRegistrationStats(props: BeforeListServerProps) {
  const { payload } = props

  try {
    // Fetch all registrations
    const registrations = await payload.find({
      collection: 'knallbonbonRegistration',
      limit: 1000,
      depth: 1,
    })

    // Fetch all events
    const events = await payload.find({
      collection: 'knallbonbonEvents',
      limit: 100,
      depth: 0,
    })

    // Calculate statistics
    const totalRegistrations = registrations.docs.length
    const totalChildren = registrations.docs.reduce((sum, reg) => sum + (reg.child?.length || 0), 0)

    // Registrations per event
    const registrationsByEvent = new Map<string, number>()
    const childrenByEvent = new Map<string, number>()

    registrations.docs.forEach((reg) => {
      const eventId = typeof reg.event === 'string' ? reg.event : reg.event?.id
      if (eventId) {
        registrationsByEvent.set(eventId, (registrationsByEvent.get(eventId) || 0) + 1)
        childrenByEvent.set(eventId, (childrenByEvent.get(eventId) || 0) + (reg.child?.length || 0))
      }
    })

    return (
      <Gutter className="grid gap-6 py-6 pb-6 md:grid-cols-2 lg:grid-cols-4">
        {/* Overview Stats */}
        <Card>
          <CardHeader>
            <h3>Gesamt Anmeldungen</h3>
          </CardHeader>
          <CardContent>
            <h1 className="text-primary font-bold">{totalRegistrations}</h1>
            <p className="mt-1.5">Registrierte Familien</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <h3>Gesamt Kinder</h3>
          </CardHeader>
          <CardContent>
            <h1 className="text-primary font-bold">{totalChildren}</h1>
            <p className="mt-1.5">Angemeldete Kinder</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <h3>Aktive Termine</h3>
          </CardHeader>
          <CardContent>
            <h1 className="text-primary font-bold">{events.docs.length}</h1>
            <p className="mt-1.5">Verfügbare Events</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <h3>Ø Kinder pro Anmeldung</h3>
          </CardHeader>
          <CardContent>
            <h1 className="text-primary font-bold">
              {totalRegistrations > 0 ? (totalChildren / totalRegistrations).toFixed(1) : '0'}
            </h1>
            <p className="mt-1.5">Durchschnittlich</p>
          </CardContent>
        </Card>
      </Gutter>
    )
  } catch (error) {
    console.error('Error loading Knallbonbon statistics:', error)
    return (
      <Gutter className="py-6">
        <Card className="shadow-sm">
          <CardHeader>
            <h3>Fehler beim Laden der Statistiken</h3>
          </CardHeader>
          <CardContent>
            <p className="text-yellow-700">
              {error instanceof Error ? error.message : 'Unbekannter Fehler'}
            </p>
          </CardContent>
        </Card>
      </Gutter>
    )
  }
}

export default KnallbonbonRegistrationStats
