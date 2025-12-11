'use client'

import React, { useState } from 'react'
import { toast, Button, Modal, useModal, useDocumentInfo } from '@payloadcms/ui'
import { ListX } from 'lucide-react'
import { CardHeader, CardContent, CardFooter } from '@/components/ui/card'
import { moveRegistrationToWaitlist } from './actions'
import { useRouter } from 'next/navigation'

export const MovetoWaillist: React.FC = () => {
  const [isMoving, setIsMoving] = useState(false)
  const { toggleModal } = useModal()
  const { id } = useDocumentInfo()
  const router = useRouter()

  const handleOpenModal = () => {
    toggleModal('move-to-waitlist-modal')
  }

  const handleCloseModal = () => {
    toggleModal('move-to-waitlist-modal')
  }

  const handleMove = async () => {
    if (!id) {
      toast.error('Keine Anmeldung ausgewählt')
      return
    }

    setIsMoving(true)
    try {
      const result = await moveRegistrationToWaitlist(id as string)

      if (!result.success) {
        throw new Error(result.error || 'Fehler beim Verschieben auf die Warteliste')
      }

      toast.success('Anmeldung erfolgreich auf die Warteliste verschoben')
      handleCloseModal()

      // Navigate to the waitlist collection
      router.push('/admin/collections/knallbonbonWaitlist')
    } catch (error) {
      console.error('Move to waitlist error:', error)
      toast.error(error instanceof Error ? error.message : 'Fehler beim Verschieben auf die Warteliste')
    } finally {
      setIsMoving(false)
    }
  }

  return (
    <>
      <Button
        buttonStyle="secondary"
        onClick={handleOpenModal}
        disabled={isMoving || !id}
        icon={<ListX className="size-4" />}
      >
        {isMoving ? (
          <>
            <span className="animate-spin">⏳</span>
            Verschiebe...
          </>
        ) : (
          <>Auf Warteliste verschieben</>
        )}
      </Button>
      <Modal slug="move-to-waitlist-modal" className="flex items-center justify-center backdrop-blur-sm">
        <div>
          <CardHeader>
            <h1>Auf Warteliste verschieben</h1>
            <p>Möchten Sie diese Anmeldung wirklich auf die Warteliste verschieben?</p>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="rounded-md bg-yellow-50 p-4 text-sm text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-200">
              <strong>Achtung:</strong> Diese Aktion wird die Anmeldung aus der Registrierung löschen und auf die Warteliste verschieben.
              Die Teilnehmerzahl der Veranstaltung wird automatisch aktualisiert.
            </div>
            <div className="space-y-2 text-sm">
              <p><strong>Was passiert:</strong></p>
              <ul className="list-disc space-y-1 pl-5">
                <li>Die Anmeldung wird gelöscht</li>
                <li>Ein neuer Wartelisten-Eintrag wird erstellt</li>
                <li>Die Position in der Warteschlange wird automatisch zugewiesen</li>
                <li>Die Teilnehmerzahl wird reduziert</li>
              </ul>
            </div>
          </CardContent>
          <CardFooter className="flex flex-row gap-2">
            <Button
              buttonStyle="secondary"
              onClick={handleCloseModal}
              className="m-0"
              size="large"
              disabled={isMoving}
            >
              Abbrechen
            </Button>
            <Button
              onClick={handleMove}
              disabled={isMoving}
              icon={<ListX className="size-4" />}
              className="m-0"
              size="large"
            >
              Auf Warteliste verschieben
            </Button>
          </CardFooter>
        </div>
      </Modal>
    </>
  )
}

export default MovetoWaillist
