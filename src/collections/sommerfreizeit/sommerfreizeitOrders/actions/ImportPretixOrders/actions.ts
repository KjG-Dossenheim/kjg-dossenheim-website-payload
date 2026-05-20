'use server'

import { getPayload } from 'payload'

import config from '@payload-config'

type QueueImportPretixOrdersResult = {
  success: boolean
  message: string
  jobId?: string
}

function toOptionalNonEmpty(value: string | null | undefined) {
  if (typeof value !== 'string') {
    return undefined
  }

  const trimmed = value.trim()
  return trimmed.length > 0 ? trimmed : undefined
}

export async function queueImportPretixOrders(args?: {
  pretixEventId?: string | null
}): Promise<QueueImportPretixOrdersResult> {
  try {
    const payload = await getPayload({ config })
    const pretixEventId = toOptionalNonEmpty(args?.pretixEventId)

    const queuedJob = await payload.jobs.queue({
      task: 'importPretixOrders',
      input: {
        pretixEventId,
        updateExisting: true,
      },
    })

    return {
      success: true,
      message: 'Pretix Import wurde gestartet.',
      jobId: queuedJob.id,
    }
  } catch (error) {
    return {
      success: false,
      message:
        error instanceof Error
          ? `Pretix-Import konnte nicht gestartet werden: ${error.message}`
          : 'Pretix-Import konnte nicht gestartet werden.',
    }
  }
}
