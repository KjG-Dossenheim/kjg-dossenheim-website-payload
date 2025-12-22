import { redirect } from 'next/navigation'

import { AccountForm } from './AccountForm'

import { getPayload } from 'payload'
import config from '@payload-config'
import { headers as getHeaders } from 'next/headers.js'

export default async function KontoPage() {
  const headers = await getHeaders()
  const payload = await getPayload({ config })
  const { user } = await payload.auth({ headers })

  if (!user || user.collection !== 'sommerfreizeitUser') {
    redirect(`/sommerfreizeit/login`)
  }

  return (
    <div className="container mx-auto p-6">
      <AccountForm />
    </div>
  )
}
