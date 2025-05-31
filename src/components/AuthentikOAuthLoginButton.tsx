'use client'

import { Button } from '@payloadcms/ui'
import Link from 'next/link'

export const AuthentikOAuthLoginButton: React.FC = () => (
  <Link href="/api/users/oauth/authorize">
    <Button className="w-full">KjG ID</Button>
  </Link>
)
