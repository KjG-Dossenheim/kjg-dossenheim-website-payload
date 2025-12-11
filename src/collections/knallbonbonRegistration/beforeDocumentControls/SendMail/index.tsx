'use client'

import React, { useState } from 'react'
import { toast, Button, Modal, useModal, useDocumentInfo } from '@payloadcms/ui'
import { Mail } from 'lucide-react'
import { Field, FieldLabel } from '@/components/ui/field'
import { CardHeader, CardContent, CardFooter } from '@/components/ui/card'
import { sendEmailToRegistration } from './actions'

export const SendMail: React.FC = () => {
  const [isSending, setIsSending] = useState(false)
  const { toggleModal } = useModal()
  const { id } = useDocumentInfo()
  const [subject, setSubject] = useState('')
  const [message, setMessage] = useState('')

  const handleOpenModal = () => {
    toggleModal('send-mail-modal')
  }

  const handleCloseModal = () => {
    toggleModal('send-mail-modal')
    setSubject('')
    setMessage('')
  }

  const handleSend = async () => {
    if (!subject.trim() || !message.trim()) {
      toast.error('Betreff und Nachricht dürfen nicht leer sein')
      return
    }

    if (!id) {
      toast.error('Keine Anmeldung ausgewählt')
      return
    }

    setIsSending(true)
    try {
      const result = await sendEmailToRegistration(id as string, subject, message)

      if (!result.success) {
        throw new Error(result.error || 'Fehler beim Senden der E-Mail')
      }

      toast.success(`E-Mail erfolgreich an ${result.email} gesendet`)
      handleCloseModal()
    } catch (error) {
      console.error('Email send error:', error)
      toast.error(error instanceof Error ? error.message : 'Fehler beim Senden der E-Mail')
    } finally {
      setIsSending(false)
    }
  }

  return (
    <>
      <Button
        buttonStyle="secondary"
        onClick={handleOpenModal}
        disabled={isSending || !id}
        icon={<Mail className="size-4" />}
      >
        {isSending ? (
          <>
            <span className="animate-spin">⏳</span>
            Sende...
          </>
        ) : (
          <>E-Mail senden</>
        )}
      </Button>
      <Modal slug="send-mail-modal" className="flex items-center justify-center backdrop-blur-sm">
        <div>
          <CardHeader>
            <h1>E-Mail senden</h1>
            <p>Senden Sie eine E-Mail an diese Anmeldung</p>
          </CardHeader>
          <CardContent className="space-y-6">
            <Field>
              <FieldLabel htmlFor="subject">Betreff</FieldLabel>
              <input
                id="subject"
                type="text"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="Betreff eingeben..."
                className="w-full rounded-md border border-gray-300 px-3 py-2"
              />
            </Field>
            <Field>
              <FieldLabel htmlFor="message">Nachricht</FieldLabel>
              <textarea
                id="message"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Ihre Nachricht..."
                rows={8}
                className="w-full rounded-md border border-gray-300 px-3 py-2"
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

export default SendMail
