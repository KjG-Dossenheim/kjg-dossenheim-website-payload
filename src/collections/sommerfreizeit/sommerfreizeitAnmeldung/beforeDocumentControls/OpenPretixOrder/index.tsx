'use client'

import React, { useEffect, useState } from 'react'
import { Button, useDocumentInfo } from '@payloadcms/ui'
import { ExternalLink } from 'lucide-react'
import Link from 'next/link'
import type { SommerfreizeitEvent, SommerfreizeitAnmeldung } from '@/payload-types'

export const OpenPretixOrder: React.FC = () => {
  const { data } = useDocumentInfo()
  const pretixOrderCode = data?.pretixOrderCode as SommerfreizeitAnmeldung['pretixOrderCode']
  const payloadEventID =
    typeof data?.event === 'object' && data?.event && 'id' in data.event
      ? (data.event.id as string)
      : (data?.event as SommerfreizeitEvent['id'] | undefined)
  const [pretixEventID, setPretixEventID] = useState<SommerfreizeitEvent['id'] | null>(null)

  useEffect(() => {
    if (!payloadEventID) {
      setPretixEventID(null)
      return
    }

    const controller = new AbortController()

    const loadPretixEventID = async () => {
      try {
        const response = await fetch(`/api/sommerfreizeitEvents/${payloadEventID}`, {
          signal: controller.signal,
          credentials: 'include',
        })

        if (!response.ok) {
          throw new Error('Event konnte nicht geladen werden')
        }

        const event = (await response.json()) as { pretixEventId?: string }
        setPretixEventID(event.pretixEventId ?? null)
      } catch (error) {
        if (error instanceof DOMException && error.name === 'AbortError') {
          return
        }

        setPretixEventID(null)
        console.error('Failed to load Pretix event ID:', error)
      }
    }

    void loadPretixEventID()

    return () => {
      controller.abort()
    }
  }, [payloadEventID])

  return (
    <Link
      href={`${process.env.NEXT_PUBLIC_PRETIX_URL}/control/event/${process.env.NEXT_PUBLIC_PRETIX_ORGANIZER}/${pretixEventID}/orders/${pretixOrderCode}/`}
      target="_blank"
      className="ml-4"
    >
      <Button buttonStyle="secondary" icon={<ExternalLink className="size-4" />}>
        Pretix
      </Button>
    </Link>
  )
}

export default OpenPretixOrder
