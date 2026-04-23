import Link from 'next/link'
import { redirect } from 'next/navigation'

import { getPayload } from 'payload'
import config from '@payload-config'
import { headers as getHeaders } from 'next/headers.js'

import { ChildCreateForm } from './ChildCreateForm'
import { Button } from '@/components/ui/button'
import { getSommerfreizeitSessionUser } from '@/lib/auth/server'

export default async function NewChildPage() {
  const headers = await getHeaders()
  const payload = await getPayload({ config })
  const user = await getSommerfreizeitSessionUser(payload, headers)

  if (!user) {
    const returnTo = encodeURIComponent('/sommerfreizeit/account/kinder/neu')
    redirect(`/sommerfreizeit/login?returnTo=${returnTo}`)
  }

  return (
    <div className="container mx-auto space-y-6 p-6">
      <ChildCreateForm />
    </div>
  )
}
