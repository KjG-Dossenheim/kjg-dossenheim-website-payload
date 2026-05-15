'use client'

import React, { useState } from 'react'
import { RefreshCw } from 'lucide-react'
import { Button, toast } from '@payloadcms/ui'

import { queueImportPretixCustomers } from './actions'

export const ImportPretixCustomersAction: React.FC = () => {
  const [isStarting, setIsStarting] = useState(false)

  const handleStartImport = async () => {
    setIsStarting(true)

    try {
      const result = await queueImportPretixCustomers()

      if (!result.success) {
        toast.error(result.message)
        return
      }

      toast.success(
        result.jobId
          ? `Pretix-Import gestartet (Job: ${result.jobId}).`
          : 'Pretix-Import gestartet.',
      )
    } catch (error) {
      toast.error(
        error instanceof Error
          ? `Pretix-Import konnte nicht gestartet werden: ${error.message}`
          : 'Pretix-Import konnte nicht gestartet werden.',
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
      {isStarting ? 'Startet...' : 'Pretix Import starten'}
    </Button>
  )
}

export default ImportPretixCustomersAction
