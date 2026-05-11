'use client'

import React, { useEffect, useState } from 'react'
import { toast, Button, useDocumentInfo } from '@payloadcms/ui'
import { Loader2, ShieldCheck } from 'lucide-react'
import { approvePretixOrder } from './actions'

export const ApprovePretixOrder: React.FC = () => {
  const { data } = useDocumentInfo()
  const pretixOrderCode = data?.pretixOrderCode as string | undefined
  const payloadEventID =
    typeof data?.event === 'object' && data?.event && 'id' in data.event
      ? (data.event.id as string)
      : (data?.event as string | undefined)
  const [pretixEventID, setPretixEventID] = useState<string | undefined>()
  const [isLoadingPretixEventID, setIsLoadingPretixEventID] = useState(false)
  const [isApproving, setIsApproving] = useState(false)
  const [isApproved, setIsApproved] = useState(false)

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

  const handleApprovePretixOrder = async () => {
    if (!pretixOrderCode) {
      toast.error('Keine Pretix Bestellnummer vorhanden')
      return
    }

    if (!pretixEventID) {
      toast.error('Event-Information nicht verfügbar')
      return
    }

    setIsApproving(true)

    try {
      const result = await approvePretixOrder({
        pretixEventID,
        pretixOrderCode,
      })

      if (!result.success) {
        throw new Error(result.message)
      }

      setIsApproved(true)
      toast.success(result.message)
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : 'Die Bestellung konnte nicht freigegeben werden.',
      )
    } finally {
      setIsApproving(false)
    }
  }

  const isDisabled =
    !pretixOrderCode || !pretixEventID || isLoadingPretixEventID || isApproving || isApproved

  return (
    <Button
      buttonStyle="secondary"
      onClick={handleApprovePretixOrder}
      disabled={isDisabled}
      icon={
        isLoadingPretixEventID || isApproving ? (
          <Loader2 className="size-4 animate-spin" />
        ) : (
          <ShieldCheck className="size-4" />
        )
      }
    >
      {isLoadingPretixEventID
        ? 'Wird geladen...'
        : isApproving
          ? 'Wird freigegeben...'
          : isApproved
            ? 'Freigegeben'
            : 'Bestellung freigeben'}
    </Button>
  )
}

export default ApprovePretixOrder
