'use client'

import React, { useState } from 'react'
import { RefreshCw } from 'lucide-react'
import { Button, toast } from '@payloadcms/ui'

import { queueImportPretixOrders } from './actions'

export const ImportPretixOrdersAction: React.FC = () => {
  const [isStarting, setIsStarting] = useState(false)

  const handleStartImport = async () => {
    setIsStarting(true)

    try {
      const enteredPretixEventId = window.prompt(
        'Optional: Pretix Event-ID eingeben (leer lassen fuer alle Events).',
      )

      const result = await queueImportPretixOrders({
        pretixEventId: enteredPretixEventId,
      })

      if (!result.success) {
        toast.error(result.message)
        return
      }

      toast.success(
        result.jobId
          ? `Pretix-Bestellimport gestartet (Job: ${result.jobId}).`
          : 'Pretix-Bestellimport gestartet.',
      )
    } catch (error) {
      toast.error(
        error instanceof Error
          ? `Pretix-Bestellimport konnte nicht gestartet werden: ${error.message}`
          : 'Pretix-Bestellimport konnte nicht gestartet werden.',
      )
    } finally {
      setIsStarting(false)
    }
  }

  return (
    <Button
      buttonStyle="secondary"
      onClick={handleStartImport}
      disabled={isStarting}
      icon={<RefreshCw className={`size-4 ${isStarting ? 'animate-spin' : ''}`} />}
    >
      {isStarting ? 'Startet...' : 'Pretix Import'}
    </Button>
  )
}

export default ImportPretixOrdersAction
