import * as React from 'react'
import { Text, Heading, Hr, Container } from '@react-email/components'
import MailBase from '@/components/email/Base'

interface EmailTemplateProps {
  firstName: string
  lastName: string
  subject: string
  message: string
}

export function emailTemplate(props: EmailTemplateProps) {
  return (
    <MailBase>
      <Container className="p-4">
        {/* Header */}
        <Heading className="text-center text-3xl font-bold text-gray-900">{props.subject}</Heading>

        <Hr className="my-6 border-gray-200" />

        {/* Main Content */}
        <Container>
          <Text className="text-lg font-medium text-gray-800" style={{ marginBottom: '20px' }}>
            Hallo {props.firstName} {props.lastName},
          </Text>

          <Text
            className="text-base leading-relaxed text-gray-700"
            style={{ marginBottom: '20px', whiteSpace: 'pre-wrap' }}
          >
            {props.message}
          </Text>

          <Hr className="my-6 border-gray-200" />

          {/* Footer */}
          <Container>
            <Text className="mb-1 text-base text-gray-700">Mit freundlichen Grüßen,</Text>
            <Text className="mb-0 text-base font-semibold text-gray-900">
              Deine evangelische Jugend Dossenheim
            </Text>
          </Container>
        </Container>
      </Container>
    </MailBase>
  )
}
