import React from 'react'
import type { AfterListServerProps } from 'payload'
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card'
import { Calendar, Activity } from 'lucide-react'
import { Gutter } from '@payloadcms/ui'
import { GenderStackedBar } from './GenderStackedBar'
import { AgeStackedBar } from './AgeStackedBar'

export async function KnallbonbonRegistrationOverview(props: AfterListServerProps) {
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

    // Registrations per event
    const registrationsByEvent = new Map<string, number>()
    const childrenByEvent = new Map<string, number>()
    type GenderCounts = { male: number; female: number; diverse: number; noInfo: number }
    const genderByEvent = new Map<string, GenderCounts>()
    type AgeCounts = { [age: number]: number }
    const ageByEvent = new Map<string, AgeCounts>()

    registrations.docs.forEach((reg) => {
      const eventId = typeof reg.event === 'string' ? reg.event : reg.event?.id
      if (eventId) {
        registrationsByEvent.set(eventId, (registrationsByEvent.get(eventId) || 0) + 1)
        childrenByEvent.set(eventId, (childrenByEvent.get(eventId) || 0) + (reg.child?.length || 0))
        // Aggregate gender distribution
        const counts: GenderCounts = genderByEvent.get(eventId) || {
          male: 0,
          female: 0,
          diverse: 0,
          noInfo: 0,
        }
        // Aggregate age distribution
        const ageCounts: AgeCounts = ageByEvent.get(eventId) || {}

        if (Array.isArray(reg.child)) {
          for (const c of reg.child) {
            // Gender
            switch (c?.gender) {
              case 'male':
                counts.male += 1
                break
              case 'female':
                counts.female += 1
                break
              case 'diverse':
                counts.diverse += 1
                break
              case 'noInfo':
              default:
                counts.noInfo += 1
                break
            }
            // Age
            if (c?.age) {
              ageCounts[c.age] = (ageCounts[c.age] || 0) + 1
            }
          }
        }
        genderByEvent.set(eventId, counts)
        ageByEvent.set(eventId, ageCounts)
      }
    })

    return (
      <Gutter className="space-y-8 py-6">
        {/* Event-specific Stats */}
        {events.docs.length > 0 && (
          <div className="space-y-6">
            <h2>Anmeldungen pro Termin</h2>
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
              {events.docs.map((event) => {
                const eventId = event.id
                const registrationCount = registrationsByEvent.get(eventId) || 0
                const childrenCount = childrenByEvent.get(eventId) || 0
                const genderCounts =
                  genderByEvent.get(eventId) ||
                  ({ male: 0, female: 0, diverse: 0, noInfo: 0 } as GenderCounts)
                const ageCounts = ageByEvent.get(eventId) || {}
                const ageData = Object.entries(ageCounts)
                  .map(([age, value]) => ({ age: parseInt(age), value }))
                  .sort((a, b) => a.age - b.age)
                return (
                  <Card key={eventId} className="transition-all hover:shadow-md">
                    <CardHeader>
                      <h3>{event.title}</h3>
                      <p className="flex items-center gap-1.5">
                        <Calendar className="h-3.5 w-3.5" />
                        {new Date(event.date).toLocaleDateString('de-DE', {
                          day: '2-digit',
                          month: '2-digit',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </p>
                    </CardHeader>
                    <CardContent className="flex flex-row gap-2">
                      <div className="bg-muted flex w-full flex-col items-center justify-center gap-1 rounded-lg px-2 py-3.5">
                        <h1 className="text-primary font-bold">{registrationCount}</h1>
                        <h4 className="text-accent-foreground">Anmeldungen</h4>
                      </div>
                      <div className="bg-muted flex w-full flex-col items-center justify-center gap-1 rounded-lg px-2 py-3.5">
                        <h1 className="text-primary font-bold">{childrenCount}</h1>
                        <h4 className="text-accent-foreground">Kinder</h4>
                      </div>
                    </CardContent>
                    <CardFooter className="flex-col gap-6">
                      <div className="w-full space-y-2">
                        <h4>Geschlechterverteilung</h4>
                        <GenderStackedBar counts={genderCounts} />
                      </div>
                      {ageData.length > 0 && (
                        <div className="w-full space-y-2">
                          <h4>Altersverteilung</h4>
                          <AgeStackedBar data={ageData} />
                        </div>
                      )}
                    </CardFooter>
                  </Card>
                )
              })}
            </div>
          </div>
        )}
      </Gutter>
    )
  } catch (error) {
    console.error('Error loading Knallbonbon statistics:', error)
    return (
      <Gutter className="py-6">
        <Card className="border-yellow-300 bg-linear-to-br from-yellow-50 to-white shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-3 text-yellow-800">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-yellow-100">
                <Activity className="h-5 w-5 text-yellow-600" />
              </div>
              <span>Fehler beim Laden der Statistiken</span>
            </CardTitle>
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

export default KnallbonbonRegistrationOverview
