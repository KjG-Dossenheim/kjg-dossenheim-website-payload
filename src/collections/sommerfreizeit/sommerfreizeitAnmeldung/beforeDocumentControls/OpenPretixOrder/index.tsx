'use client'

import React, { useEffect, useState } from 'react'
import { toast, Button, useDocumentInfo } from '@payloadcms/ui'
import { ExternalLink } from 'lucide-react'

export const OpenPretixOrder: React.FC = () => {
  const { data } = useDocumentInfo()
  const pretixOrderCode = data?.pretixOrderCode as string | undefined
  const payloadEventID =
    typeof data?.event === 'object' && data?.event && 'id' in data.event
      ? (data.event.id as string)
      : (data?.event as string | undefined)
  const [pretixEventID, setPretixEventID] = useState<string | undefined>()
  const [isLoadingPretixEventID, setIsLoadingPretixEventID] = useState(false)

  useEffect(() => {
    if (!payloadEventID) {
      setPretixEventID(undefined)
      return
    }

    const controller = new AbortController()

    const loadPretixEventID = async () => {
      setIsLoadingPretixEventID(true)

      try {
        const response = await fetch(`/api/sommerfreizeitEvents/${payloadEventID}`, {
          signal: controller.signal,
          credentials: 'include',
        })

        if (!response.ok) {
          throw new Error('Event konnte nicht geladen werden')
        }

        const event = (await response.json()) as { pretixEventId?: string }
        setPretixEventID(event.pretixEventId)
      } catch (error) {
        if (error instanceof DOMException && error.name === 'AbortError') {
          return
        }

        setPretixEventID(undefined)
        console.error('Failed to load Pretix event ID:', error)
      } finally {
        setIsLoadingPretixEventID(false)
      }
    }

    loadPretixEventID()

    return () => {
      controller.abort()
    }
  }, [payloadEventID])

  const handleOpenPretixOrder = () => {
    if (!pretixOrderCode) {
      toast.error('Keine Pretix Bestellnummer vorhanden')
      return
    }

    if (!pretixEventID) {
      toast.error('Event-Information nicht verfügbar')
      return
    }

    const pretixUrl = process.env.NEXT_PUBLIC_PRETIX_URL
    const pretixOrganizer = process.env.NEXT_PUBLIC_PRETIX_ORGANIZER

    if (!pretixUrl || !pretixOrganizer) {
      toast.error('Pretix-Konfiguration nicht verfügbar')
      return
    }

    const adminOrderUrl = `${pretixUrl}/control/event/${pretixOrganizer}/${pretixEventID}/orders/${pretixOrderCode}/`

    window.open(adminOrderUrl, '_blank', 'noopener,noreferrer')
  }

  const isDisabled = !pretixOrderCode || !pretixEventID || isLoadingPretixEventID

  return (
    <Button
      buttonStyle="secondary"
      onClick={handleOpenPretixOrder}
      disabled={isDisabled}
      icon={<ExternalLink className="size-4" />}
    >
      {isLoadingPretixEventID ? 'Wird geladen...' : `Pretix`}
    </Button>
  )
}

export default OpenPretixOrder
