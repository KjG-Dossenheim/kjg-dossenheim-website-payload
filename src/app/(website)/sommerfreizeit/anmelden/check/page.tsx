import { redirect } from 'next/navigation'
import { getPayload } from 'payload'
import config from '@payload-config'
import { headers as getHeaders } from 'next/headers'
import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { getSommerfreizeitSessionUser } from '@/lib/auth/server'
import { getOrderFlowView } from '../action'
import { CheckForm } from './CheckForm'
import { normalizeSommerfreizeitEmail } from '@/utilities/sommerfreizeitAccount'

type CheckPageProps = {
  searchParams?: Promise<{
    orderCode?: string | string[]
    createdAccount?: string | string[]
  }>
}

export default async function SommerfreizeitOrderCheckPage({ searchParams }: CheckPageProps) {
  const resolvedSearchParams = await searchParams
  const orderCodeParam = Array.isArray(resolvedSearchParams?.orderCode)
    ? resolvedSearchParams?.orderCode[0]
    : resolvedSearchParams?.orderCode
  const createdAccountParam = Array.isArray(resolvedSearchParams?.createdAccount)
    ? resolvedSearchParams?.createdAccount[0]
    : resolvedSearchParams?.createdAccount

  const safeOrderCode = orderCodeParam?.trim() || ''
  const showAccountCreatedMessage = createdAccountParam === '1'

  if (!safeOrderCode) {
    redirect('/sommerfreizeit/anmeldung')
  }

  const headers = await getHeaders()
  const payload = await getPayload({ config })
  const user = await getSommerfreizeitSessionUser(payload, headers)

  if (!user) {
    const returnTo = encodeURIComponent(
      `/sommerfreizeit/anmelden/check?orderCode=${encodeURIComponent(safeOrderCode)}`,
    )
    redirect(`/sommerfreizeit/login?returnTo=${returnTo}`)
  }

  const flow = await getOrderFlowView({ orderCode: safeOrderCode })

  if (!flow) {
    redirect('/sommerfreizeit/anmelden')
  }

  if (normalizeSommerfreizeitEmail(user.email) !== normalizeSommerfreizeitEmail(flow.email)) {
    redirect('/sommerfreizeit/anmelden')
  }

  return (
    <section className="container mx-auto max-w-4xl p-6">
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Anmeldung abschließen</CardTitle>
          <CardDescription>
            Trage jetzt die fehlenden Daten ein. Wir legen danach alle zugehoerigen Anmeldungen an.
          </CardDescription>
        </CardHeader>
      </Card>

      <CheckForm
        accountDefaults={{
          phone: flow.phone,
          address: flow.address,
          postalCode: flow.postalCode,
          city: flow.city,
        }}
        orderCode={flow.orderCode}
        pretixEvent={flow.pretixEvent}
        pretixOrderID={flow.pretixOrderID}
        pretixSecret={flow.pretixSecret}
        positions={flow.positions}
        showAccountCreatedMessage={showAccountCreatedMessage}
      />
    </section>
  )
}
