import { redirect } from 'next/navigation'
import { getPayload } from 'payload'
import config from '@payload-config'
import { headers as getHeaders } from 'next/headers'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { getSommerfreizeitSessionUser } from '@/lib/auth/server'
import { getOrderFlowView } from '../action'
import { CheckForm } from './CheckForm'
import { normalizeSommerfreizeitEmail } from '@/utilities/sommerfreizeitAccount'

type CheckPageProps = {
  searchParams?: Promise<{
    orderCode?: string | string[]
  }>
}

export default async function SommerfreizeitOrderCheckPage({ searchParams }: CheckPageProps) {
  const resolvedSearchParams = await searchParams
  const orderCodeParam = Array.isArray(resolvedSearchParams?.orderCode)
    ? resolvedSearchParams?.orderCode[0]
    : resolvedSearchParams?.orderCode

  const safeOrderCode = orderCodeParam?.trim() || ''

  if (!safeOrderCode) {
    redirect('/sommerfreizeit/anmeldung')
  }

  const headers = await getHeaders()
  const payload = await getPayload({ config })
  const user = await getSommerfreizeitSessionUser(payload, headers)

  if (!user) {
    const returnTo = encodeURIComponent(
      `/sommerfreizeit/anmeldung/check?orderCode=${encodeURIComponent(safeOrderCode)}`,
    )
    redirect(`/sommerfreizeit/login?returnTo=${returnTo}`)
  }

  const flow = await getOrderFlowView({ orderCode: safeOrderCode })

  if (!flow) {
    redirect('/sommerfreizeit/anmeldung')
  }

  if (normalizeSommerfreizeitEmail(user.email) !== normalizeSommerfreizeitEmail(flow.email)) {
    redirect('/sommerfreizeit/anmeldung')
  }

  return (
    <section className="container mx-auto max-w-4xl p-6">
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Bestellung vervollstaendigen</CardTitle>
          <CardDescription>
            Trage jetzt die fehlenden Daten ein. Wir legen danach alle zugehoerigen Anmeldungen an.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          <p>
            <strong>Bestellcode:</strong> {flow.orderCode}
          </p>
          <p>
            <strong>E-Mail:</strong> {flow.email}
          </p>
          <p>
            <strong>Positionen:</strong> {flow.positionCount}
          </p>
        </CardContent>
      </Card>

      <CheckForm
        accountDefaults={{
          phone: user.phone ?? '',
          address: user.address ?? '',
          postalCode: user.postalCode ?? '',
          city: user.city ?? '',
        }}
        orderCode={flow.orderCode}
        positions={flow.positions}
      />
    </section>
  )
}
