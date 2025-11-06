import { Html, Tailwind, Container, Section } from '@react-email/components'
import { MailHeader } from './Header'
import { MailFooter } from './Footer'
import React, { ReactNode } from 'react'

export const MailBase = ({ children }: { children: ReactNode }) => (
  <Tailwind
    config={{
      theme: {
        extend: {
          colors: {
            primary: 'hsl(190, 100%, 25.9%)',
            secondary: 'hsl(183, 100%, 37%)',
            background: '#F9FAFB',
            text: '#111827',
          },
        },
      },
    }}
  >
    <Html lang="de">
      <Container>
        <MailHeader />
        <Section>{children}</Section>
        <MailFooter />
      </Container>
    </Html>
  </Tailwind>
)
