import { Html, Tailwind } from '@react-email/components'
import { MailHeader } from './Header'
import { MailFooter } from './Footer'
import React, { ReactNode } from 'react'

export const MailBase = ({ children }: { children: ReactNode }) => (
  <Tailwind>
    <Html lang="de">
      <MailHeader />
      {children}
      <MailFooter />
    </Html>
  </Tailwind>
)
