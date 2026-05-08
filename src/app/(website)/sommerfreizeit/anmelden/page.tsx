import { redirect } from 'next/navigation'
import { getPayload } from 'payload'
import config from '@payload-config'
import { headers as getHeaders } from 'next/headers'
import { getSommerfreizeitSessionUser } from '@/lib/auth/server'
import { OrderLookupForm } from './OrderLookupForm'

export default async function AnmeldungPage() {
  const headers = await getHeaders()
  const payload = await getPayload({ config })
  const user = await getSommerfreizeitSessionUser(payload, headers)

  if (!user) {
    const returnTo = encodeURIComponent('/sommerfreizeit/anmelden')
    redirect(`/sommerfreizeit/login?returnTo=${returnTo}`)
  }

  return (
    <section className="container mx-auto max-w-4xl p-6">
      <OrderLookupForm />
    </section>
  )
}
