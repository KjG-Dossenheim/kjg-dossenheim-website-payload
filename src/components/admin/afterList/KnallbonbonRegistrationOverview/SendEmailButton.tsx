'use client'

import React, { useState } from 'react'
import { toast, Button, Modal, useModal } from '@payloadcms/ui'
import { Mail } from 'lucide-react'
import { Field, FieldLabel } from '@/components/ui/field'
import { CardHeader, CardContent, CardFooter } from '@/components/ui/card'
import { sendEmailToAllEventRegistrations } from './actions'

type SendEmailButtonProps = {
  eventId: string
  eventTitle: string
  registrationCount: number
}

export function SendEmailButton({ eventId, eventTitle, registrationCount }: SendEmailButtonProps) {
  const [isSending, setIsSending] = useState(false)
  const { toggleModal } = useModal()
  const [subject, setSubject] = useState('')
  const [message, setMessage] = useState('')

  const modalSlug = `send-email-event-${eventId}`

  const handleOpenModal = () => {
    toggleModal(modalSlug)
  }

  const handleCloseModal = () => {
    toggleModal(modalSlug)
    setSubject('')
    setMessage('')
  }

  const handleSend = async () => {
    if (!subject.trim() || !message.trim()) {
      toast.error('Betreff und Nachricht dürfen nicht leer sein')
      return
    }

    setIsSending(true)
    try {
      const result = await sendEmailToAllEventRegistrations(eventId, subject, message)

      if (!result.success) {
        throw new Error(result.error || 'Fehler beim Senden der E-Mails')
      }

      toast.success(
        `${result.sentCount} E-Mail(s) erfolgreich gesendet${result.failedCount ? `, ${result.failedCount} fehlgeschlagen` : ''}`,
      )

      handleCloseModal()
    } catch (error) {
      console.error('Email send error:', error)
      toast.error(error instanceof Error ? error.message : 'Fehler beim Senden der E-Mails')
    } finally {
      setIsSending(false)
    }
  }

  return (
    <>
      <Button
        buttonStyle="secondary"
        onClick={handleOpenModal}
        disabled={isSending || registrationCount === 0}
        icon={<Mail className="size-4" />}
        className="m-0 w-full"
      >
        {isSending ? (
          <>
            <span className="animate-spin">⏳</span>
            Sende...
          </>
        ) : (
          <>E-Mail</>
        )}
      </Button>
      <Modal slug={modalSlug} className="flex items-center justify-center backdrop-blur-sm">
        <div>
          <CardHeader>
            <h1>E-Mail an alle Anmeldungen senden</h1>
            <p>
              Senden Sie eine E-Mail an alle {registrationCount} Anmeldungen für &ldquo;
              {eventTitle}&rdquo;.
            </p>
          </CardHeader>
          <CardContent className="space-y-6">
            <Field>
              <FieldLabel htmlFor={`${modalSlug}-subject`}>Betreff</FieldLabel>
              <input
                id={`${modalSlug}-subject`}
                type="text"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="Betreff eingeben..."
                className="w-full rounded-md border border-gray-300 px-3 py-2"
                disabled={isSending}
              />
            </Field>
            <Field>
              <FieldLabel htmlFor={`${modalSlug}-message`}>Nachricht</FieldLabel>
              <textarea
                id={`${modalSlug}-message`}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Ihre Nachricht..."
                rows={8}
                className="w-full rounded-md border border-gray-300 px-3 py-2"
                disabled={isSending}
              />
            </Field>
          </CardContent>
          <CardFooter className="flex flex-row gap-2">
            <Button
              buttonStyle="secondary"
              onClick={handleCloseModal}
              className="m-0"
              size="large"
              disabled={isSending}
            >
              Abbrechen
            </Button>
            <Button
              onClick={handleSend}
              disabled={isSending || !subject.trim() || !message.trim()}
              icon={<Mail className="size-4" />}
              className="m-0"
              size="large"
            >
              Senden
            </Button>
          </CardFooter>
        </div>
      </Modal>
    </>
  )
}
