import { redirect } from 'next/navigation'
import Link from 'next/link'
import type { Metadata } from 'next'

import { getPayload } from 'payload'
import config from '@payload-config'
import { headers as getHeaders } from 'next/headers.js'
import { getSommerfreizeitSessionUser } from '@/lib/auth/server'
import { buttonVariants } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'

import { EditForm } from './EditForm'

export const revalidate = 60

type EditPageProps = {
  params: Promise<{
    id: string
  }>
}

export const metadata: Metadata = {
  title: 'Anmeldung bearbeiten',
  description: 'Bearbeite die Daten einer Sommerfreizeit-Anmeldung.',
}

export default async function EditAnmeldungPage({ params }: EditPageProps) {
  const { id } = await params

  const headers = await getHeaders()
  const payload = await getPayload({ config })
  const user = await getSommerfreizeitSessionUser(payload, headers)

  if (!user) {
    const returnTo = encodeURIComponent(
      `/sommerfreizeit/account/sommerfreizeitAnmeldung/${id}/edit`,
    )
    redirect(`/sommerfreizeit/login?returnTo=${returnTo}`)
  }

  const anmeldung = await payload.findByID({
    collection: 'sommerfreizeitAnmeldung',
    id,
    depth: 0,
  })

  const accountId =
    typeof anmeldung.account === 'string' ? anmeldung.account : anmeldung.account?.id

  if (process.env.NODE_ENV !== 'development') {
    if (!accountId || accountId !== user.id) {
      redirect('/sommerfreizeit/account')
    }
  }

  // Fetch child data for display context
  const childId = typeof anmeldung.child === 'string' ? anmeldung.child : anmeldung.child?.id
  const child = childId
    ? await payload.findByID({
        collection: 'sommerfreizeitChild',
        id: childId,
        depth: 0,
        select: {
          id: true,
          firstName: true,
          lastName: true,
          dateOfBirth: true,
        },
      })
    : null

  // Fetch event name for display
  const eventId = typeof anmeldung.event === 'string' ? anmeldung.event : anmeldung.event?.id
  const event = eventId
    ? await payload.findByID({
        collection: 'sommerfreizeitEvents',
        id: eventId,
        depth: 0,
        select: { id: true, name: true },
      })
    : null

  const classLabels: Record<string, string> = {
    '3': '3. Klasse',
    '4': '4. Klasse',
    '5': '5. Klasse',
    '6': '6. Klasse',
    '7': '7. Klasse',
    '8': '8. Klasse',
    '9': '9. Klasse',
    '10': '10. Klasse',
  }

  const dateFormatter = new Intl.DateTimeFormat('de-DE', { dateStyle: 'medium' })

  return (
    <div className="container mx-auto max-w-4xl space-y-6 p-6">
      <div className="flex items-center gap-4">
        <Link
          href="/sommerfreizeit/account"
          className={buttonVariants({ variant: 'outline', size: 'sm' })}
        >
          ← Zurück zum Konto
        </Link>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Anmeldung bearbeiten</CardTitle>
          <CardDescription>
            Aktualisiere die Gesundheitsdaten, Ernährungswünsche und Zimmerwünsche für diese
            Anmeldung.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {/* Read-only summary of child + event */}
          <div className="bg-muted/30 mb-6 grid grid-cols-1 gap-3 rounded-lg border p-4 text-sm sm:grid-cols-2">
            <div>
              <span className="font-medium">Kind:</span>{' '}
              {child
                ? `${child.firstName} ${child.lastName}`
                : anmeldung.firstName + ' ' + anmeldung.lastName}
            </div>
            {child?.dateOfBirth && (
              <div>
                <span className="font-medium">Geburtsdatum:</span>{' '}
                {dateFormatter.format(new Date(child.dateOfBirth))}
              </div>
            )}
            {anmeldung.class && (
              <div>
                <span className="font-medium">Klasse:</span>{' '}
                {classLabels[anmeldung.class] ?? anmeldung.class}
              </div>
            )}
            {event?.name && (
              <div>
                <span className="font-medium">Veranstaltung:</span> {event.name}
              </div>
            )}
          </div>

          <EditForm anmeldung={anmeldung} anmeldungId={id} childName={anmeldung.firstName} />
        </CardContent>
      </Card>
    </div>
  )
}
