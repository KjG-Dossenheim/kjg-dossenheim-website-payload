import { redirect } from 'next/navigation'
import { getPayload } from 'payload'
import config from '@payload-config'
import { headers as getHeaders } from 'next/headers.js'
import { getSommerfreizeitSessionUser } from '@/lib/auth/server'

import { LoginForm } from './LoginForm'

type LoginPageProps = {
  searchParams?: Promise<{
    returnTo?: string | string[]
  }>
}

const defaultReturnTo = '/sommerfreizeit/account'

const sanitizeReturnTo = (returnTo?: string) => {
  if (!returnTo || !returnTo.startsWith('/') || returnTo.startsWith('//')) {
    return defaultReturnTo
  }

  if (returnTo.startsWith('/sommerfreizeit/login')) {
    return defaultReturnTo
  }

  return returnTo
}

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const resolvedSearchParams = await searchParams
  const returnToParam = Array.isArray(resolvedSearchParams?.returnTo)
    ? resolvedSearchParams?.returnTo[0]
    : resolvedSearchParams?.returnTo
  const sanitizedReturnTo = sanitizeReturnTo(returnToParam)

  const headers = await getHeaders()
  const payload = await getPayload({ config })
  const user = await getSommerfreizeitSessionUser(payload, headers)

  if (user) {
    redirect(sanitizedReturnTo)
  }

  return <LoginForm returnTo={sanitizedReturnTo} />
}
