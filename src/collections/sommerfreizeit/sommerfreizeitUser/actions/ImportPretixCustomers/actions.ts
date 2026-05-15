'use server'

import { getPayload } from 'payload'

import config from '@payload-config'

type QueueImportPretixCustomersResult = {
  success: boolean
  message: string
  jobId?: string
}

export async function queueImportPretixCustomers(): Promise<QueueImportPretixCustomersResult> {
  try {
    const payload = await getPayload({ config })

    const queuedJob = await payload.jobs.queue({
      task: 'importPretixCustomers',
      input: {
        updateExisting: true,
      },
      waitUntil: new Date(),
    })

    return {
      success: true,
      message: 'Pretix-Import wurde gestartet.',
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
