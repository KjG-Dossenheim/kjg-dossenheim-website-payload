import React from 'react'
import type { BeforeListServerProps } from 'payload'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
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
      <Gutter className="space-y-8 py-6">
        {/* Overview Stats */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          <Card className="transition-all hover:shadow-md">
            <CardHeader>
              <CardTitle className="font-medium">Gesamt Anmeldungen</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{totalRegistrations}</div>
              <p className="mt-1.5">Registrierte Familien</p>
            </CardContent>
          </Card>

          <Card className="transition-all hover:shadow-md">
            <CardHeader>
              <CardTitle className="font-medium">Gesamt Kinder</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{totalChildren}</div>
              <p className="mt-1.5">Angemeldete Kinder</p>
            </CardContent>
          </Card>

          <Card className="transition-all hover:shadow-md">
            <CardHeader>
              <CardTitle className="font-medium">Aktive Termine</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{events.docs.length}</div>
              <p className="mt-1.5">Verfügbare Events</p>
            </CardContent>
          </Card>

          <Card className="transition-all hover:shadow-md">
            <CardHeader>
              <CardTitle className="font-medium">Ø Kinder pro Anmeldung</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">
                {totalRegistrations > 0 ? (totalChildren / totalRegistrations).toFixed(1) : '0'}
              </div>
              <p className="mt-1.5">Durchschnittlich</p>
            </CardContent>
          </Card>
        </div>
      </Gutter>
    )
  } catch (error) {
    console.error('Error loading Knallbonbon statistics:', error)
    return (
      <Gutter className="py-6">
        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle>Fehler beim Laden der Statistiken</CardTitle>
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
