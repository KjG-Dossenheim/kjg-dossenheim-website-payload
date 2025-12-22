import { headers as getHeaders } from 'next/headers.js'
import Link from 'next/link'
import { getPayload } from 'payload'
import React from 'react'

import config from '@payload-config'
import { LogoutPage } from './LogoutPage'
import { Gutter } from '@payloadcms/ui'

export default async function Logout() {
  const headers = await getHeaders()
  const payload = await getPayload({ config })
  const { user } = await payload.auth({ headers })

  if (!user) {
    return (
      <div>
        <h1>You are already logged out.</h1>
        <p>
          {'What would you like to do next? '}
          <Link href="/">Click here</Link>
          {` to go to the home page. To log back in, `}
          <Link href="/sommerfreizeit/login">click here</Link>.
        </p>
      </div>
    )
  }

  return (
    <Gutter>
      <LogoutPage />
    </Gutter>
  )
}
