import { redirect } from 'next/navigation'

import { AccountForm } from './AccountForm'

import { getPayload } from 'payload'
import config from '@payload-config'
import { headers as getHeaders } from 'next/headers.js'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { getSommerfreizeitSessionUser } from '@/lib/auth/server'

function formatOptionalDate(value: unknown) {
  if (!value) {
    return 'Keine Angabe'
  }

  const date = new Date(value as string | number | Date)

  if (Number.isNaN(date.getTime())) {
    return 'Keine Angabe'
  }

  return new Intl.DateTimeFormat('de-DE').format(date)
}

export default async function KontoPage() {
  const headers = await getHeaders()
  const payload = await getPayload({ config })
  const user = await getSommerfreizeitSessionUser(payload, headers)

  if (!user) {
    const returnTo = encodeURIComponent('/sommerfreizeit/account')
    redirect(`/sommerfreizeit/login?returnTo=${returnTo}`)
  }

  const registrations = await payload.find({
    collection: 'sommerfreizeitAnmeldung',
    depth: 1,
    where: {
      account: {
        equals: user.id,
      },
    },
    sort: '-createdAt',
    limit: 20,
  })

  const children = await payload.find({
    collection: 'sommerfreizeitChild',
    depth: 0,
    where: {
      and: [
        {
          parent: {
            equals: user.id,
          },
        },
        {
          or: [
            {
              archived: {
                equals: false,
              },
            },
            {
              archived: {
                exists: false,
              },
            },
          ],
        },
      ],
    },
    sort: '-createdAt',
    limit: 100,
    select: {
      id: true,
      firstName: true,
      lastName: true,
      dateOfBirth: true,
      gender: true,
      class: true,
      _status: true,
      createdAt: true,
    },
  })

  const dateFormatter = new Intl.DateTimeFormat('de-DE', {
    dateStyle: 'medium',
    timeStyle: 'short',
  })

  return (
    <div className="container mx-auto max-w-4xl space-y-6 p-6">
      <AccountForm
        initialData={{
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          phone: user.phone ?? '',
          address: user.address ?? '',
          postalCode: user.postalCode ?? '',
          city: user.city ?? '',
        }}
        initialChildren={children.docs.map((child) => ({
          id: child.id,
          firstName: child.firstName,
          lastName: child.lastName,
          dateOfBirth: child.dateOfBirth ?? null,
          gender: child.gender ?? '',
          class: child.class ?? null,
          _status:
            child._status === 'draft' || child._status === 'published' ? child._status : undefined,
          createdAt: child.createdAt,
        }))}
      />

      <Card>
        <CardHeader>
          <CardTitle>Meine Anmeldungen</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {registrations.docs.length === 0 ? (
            <p className="text-muted-foreground text-sm">
              Bisher ist noch keine Anmeldung ueber dein Konto gespeichert.
            </p>
          ) : (
            <div className="space-y-3">
              {registrations.docs.map((registration) => {
                const canEditRegistration =
                  typeof registration.event === 'object' &&
                  registration.event !== null &&
                  new Date(registration.event.startDate).getTime() > Date.now()
                const child =
                  typeof registration.child === 'object' && registration.child !== null
                    ? registration.child
                    : null
                const firstName = child?.firstName ?? 'Unbekannt'
                const lastName = child?.lastName ?? 'Kind'
                const dateOfBirth = child?.dateOfBirth ?? null

                return (
                  <Card key={registration.id}>
                    <CardHeader>
                      <CardTitle>
                        {firstName} {lastName}
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-muted-foreground">
                        Veranstaltung:{' '}
                        {typeof registration.event === 'object' && registration.event !== null
                          ? registration.event.name
                          : 'Unbekanntes Event'}
                      </p>
                      <p className="text-muted-foreground">
                        Geburtsdatum: {formatOptionalDate(dateOfBirth)}
                      </p>
                      <p className="text-muted-foreground">
                        Angelegt am {dateFormatter.format(new Date(registration.createdAt))}
                      </p>
                    </CardContent>
                    {canEditRegistration ? (
                      <CardFooter>
                        <Button variant="outline" size="sm" asChild>
                          <Link href={`/sommerfreizeit/anmeldung/${registration.id}`}>
                            Anmeldung bearbeiten
                          </Link>
                        </Button>
                      </CardFooter>
                    ) : null}
                  </Card>
                )
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
